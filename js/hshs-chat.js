import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    limit,
    serverTimestamp,
    updateDoc,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

(function () {
    if (window.__hshsChatBoot) return;
    window.__hshsChatBoot = true;

    var EMOJI_SETS = {
        smile: {
            icon: '😊',
            list: [
                '😀','😃','😄','😁','😆','😅','😂','🤣',
                '😊','😇','🙂','🙃','😉','😌','😍','🥰',
                '😘','😗','😙','😚','😋','😛','😝','😜',
                '🤪','🤨','🧐','🤓','😎','🤩','🥳','😏',
                '😒','😞','😔','😟','😕','🙁','😣','😖',
                '😫','😩','🥺','😢','😭','😤','😠','😡',
                '🤬','🤯','😳','🥵','🥶','😱','😨','😰',
                '😥','😓','🤗','🤔','🤭','🤫','🤥','😶',
                '😐','😑','😬','🙄','😯','😦','😧','😮',
                '😲','🥱','😴','🤤','😪','😵','🤐','🥴',
                '🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠'
            ]
        },
        gesture: {
            icon: '👍',
            list: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','💪','✍️']
        },
        heart: {
            icon: '❤️',
            list: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','✨']
        },
        party: {
            icon: '🎉',
            list: ['🎉','🎊','🎈','🎁','🎀','🏆','🥇','🥈','🥉','⚽','🏀','🏈','⚾','🎾','🏐','🎯','🎮','🎲','🎵','🎤']
        },
        school: {
            icon: '🎓',
            list: ['🎓','📚','📖','✏️','📝','📎','📌','🔬','🔭','🧪','💻','📱','💡','🏫','🚌','📅','✅','🔥','⭐','🌟']
        },
        nature: {
            icon: '🌟',
            list: ['⭐','🌟','✨','⚡','🔥','💥','☀️','⛅','☁️','🌧️','⛈️','❄️','🌈','🌸','🌹','🌺','🌻','🌷','🍀','🌙']
        }
    };

    var PREVIEW_SEED = {
        'u-prefect': { text: 'Assembly at 8 sharp 📋', time: '11:39', unread: 2 },
        'u-maya': { text: 'New campus shots 📸', time: '11:25', unread: 0 },
        'u-brian': { text: 'Match day vibes ⚽', time: '10:12', unread: 5 },
        'u-sports': { text: 'Training moved to field B', time: '09:40', unread: 1 },
        'u-choir': { text: 'Sticker', time: 'Yesterday', unread: 0, sticker: true },
        'u-lab': { text: 'Lab report due Friday 🔬', time: '09:05', unread: 0 },
        'u-house': { text: 'House points updated 🏆', time: '08:50', unread: 3 }
    };

    var state = {
        me: null, contacts: [], activeId: null, unsub: null, live: false,
        emojiOpen: false, emojiTab: 'smile', pendingImage: null,
        recording: false, mediaRecorder: null, chunks: [],
        recStart: 0, recTimer: null, recCancelled: false,
        recPointerId: null, recStartX: 0,
        wired: false,
        previews: {}
    };

    function db() { return window.firestore || null; }
    function me() {
        if (state.me) return state.me;
        var user = window.HshsStore && window.HshsStore.currentUser ? window.HshsStore.currentUser() : null;
        var id = user && user.id ? user.id : (localStorage.getItem('hshsChatUid') || '');
        if (!id) { id = 'guest-' + Math.random().toString(36).slice(2, 10); localStorage.setItem('hshsChatUid', id); }
        state.me = {
            id: id,
            name: user && user.name ? user.name : (localStorage.getItem('hshsChatName') || 'HSHS Student'),
            username: user && user.username ? user.username : 'you',
            chatTheme: (user && user.chatTheme) || localStorage.getItem('hshsChatTheme') || 'ocean',
            bubbleStyle: (user && user.bubbleStyle) || localStorage.getItem('hshsBubbleStyle') || 'rounded'
        };
        return state.me;
    }
    function chatIdFor(a, b) { return [a, b].sort().join('__'); }
    function initials(name) { return String(name || '?').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase(); }
    function fmtTime(ts) {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date(ts);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    }
    function fmtDay(ts) {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date(ts);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
    }
    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[ch];
        });
    }
    function isEmojiOnly(text) {
        var t = String(text || '').trim();
        if (!t || t.length > 24) return false;
        var cleaned = t.replace(/\s/g, '');
        try { return /^(\p{Extended_Pictographic}|\uFE0F|\u200D)+$/u.test(cleaned); }
        catch (e) { return false; }
    }
    function setStatus(text, isError) {
        var banner = document.getElementById('hshsChatBanner');
        if (banner) {
            banner.className = 'hshs-chat-banner' + (isError ? ' error' : '');
            banner.textContent = text || '';
            banner.hidden = !text || !isError;
        }
    }
    function applyTheme() {
        var page = document.getElementById('hshsChatPage');
        if (!page) return;
        var m = me();
        page.setAttribute('data-theme', m.chatTheme || 'ocean');
        page.setAttribute('data-bubbles', m.bubbleStyle || 'rounded');
    }
    function rulesHint(err) {
        var msg = (err && err.message) ? err.message : String(err || 'Chat error');
        if (/permission|insufficient|Missing or insufficient/i.test(msg)) {
            return 'Firestore blocked chat writes. Update rules for chats/messages.';
        }
        return msg;
    }
    function ticks(status) {
        if (status === 'read') return '<span class="hshs-ticks read">✓✓</span>';
        if (status === 'delivered') return '<span class="hshs-ticks">✓✓</span>';
        return '<span class="hshs-ticks">✓</span>';
    }
    function hideAttach() {
        state.pendingImage = null;
        var prev = document.getElementById('hshsAttachPreview');
        if (prev) {
            prev.classList.remove('is-on');
            prev.hidden = true;
            var img = prev.querySelector('img');
            if (img) img.removeAttribute('src');
        }
        syncFab();
    }
    function showAttach(url) {
        state.pendingImage = url;
        var prev = document.getElementById('hshsAttachPreview');
        if (!prev) return;
        prev.hidden = false;
        prev.classList.add('is-on');
        var img = prev.querySelector('img');
        if (img) img.src = url;
        syncFab();
    }
    function composerHasDraft() {
        var input = document.getElementById('hshsThreadInput');
        var text = input ? String(input.value || '').trim() : '';
        return !!(text || state.pendingImage);
    }
    function syncFab() {
        var voice = document.getElementById('hshsVoiceBtn');
        var send = document.getElementById('hshsSendBtn');
        if (!voice || !send) return;
        if (state.recording) {
            voice.hidden = false;
            send.hidden = true;
            voice.innerHTML = '<i class="fas fa-paper-plane"></i>';
            voice.classList.add('is-rec');
            voice.setAttribute('aria-label', 'Send voice note');
            return;
        }
        voice.classList.remove('is-rec');
        voice.innerHTML = '<i class="fas fa-microphone"></i>';
        voice.setAttribute('aria-label', 'Voice note');
        var draft = composerHasDraft();
        voice.hidden = draft;
        send.hidden = !draft;
    }

    function buildContacts() {
        var list = [];
        if (window.HshsStore && window.HshsStore.listUsers) {
            window.HshsStore.listUsers().forEach(function (u) {
                if (!u || !u.id || u.id === me().id) return;
                list.push({
                    id: u.id, name: u.name, username: u.username || '',
                    role: u.role || 'Student', classYear: u.classYear || '', avatar: u.avatar || ''
                });
            });
        }
        if (!list.length) {
            list = [
                { id: 'u-prefect', name: 'Joel Wambede', username: 'joel_pref', role: 'Prefect', classYear: 'S6' },
                { id: 'u-maya', name: 'Maya Okello', username: 'maya_lens', role: 'Student', classYear: 'S5' },
                { id: 'u-brian', name: 'Brian Kato', username: 'brian_k', role: 'Student', classYear: 'S3' }
            ];
        }
        state.contacts = list;
        return list;
    }
    function filteredContacts() {
        var q = (document.getElementById('hshsChatSearch') || {}).value || '';
        q = String(q).toLowerCase().trim().replace(/^@/, '');
        return state.contacts.filter(function (c) {
            if (!q) return true;
            return (c.name + ' @' + (c.username || '') + ' ' + c.role).toLowerCase().indexOf(q) !== -1;
        });
    }
    function previewFor(c) {
        var live = state.previews[c.id];
        if (live) return live;
        var seed = PREVIEW_SEED[c.id];
        if (seed) return seed;
        return { text: 'Tap to say hi 👋', time: '', unread: 0 };
    }

    function renderList() {
        var box = document.getElementById('hshsChatList');
        if (!box) return;
        var rows = filteredContacts();
        if (!rows.length) {
            box.innerHTML = '<div class="hshs-chat-empty">No chats found</div>';
            return;
        }
        var s = window.HshsStore;
        box.innerHTML = rows.map(function (c) {
            var online = s && s.isOnline ? s.isOnline(c.id) : false;
            var prev = previewFor(c);
            var av = c.avatar
                ? '<img src="' + escapeHtml(c.avatar) + '" alt="">'
                : initials(c.name);
            var previewLine = prev.sticker
                ? '<i class="fas fa-sticky-note" style="opacity:.7"></i> Sticker'
                : escapeHtml(prev.text || '');
            var badge = prev.unread ? '<span class="hshs-badge">' + prev.unread + '</span>' : '';
            return (
                '<button type="button" class="hshs-contact' + (state.activeId === c.id ? ' active' : '') + '" data-uid="' + c.id + '">' +
                '<span class="hshs-contact-avatar">' + av +
                '<i class="hshs-online-dot' + (online ? '' : ' off') + '"></i></span>' +
                '<span class="hshs-contact-body">' +
                '<strong>' + escapeHtml(c.name) + '</strong>' +
                '<small>' + previewLine + '</small></span>' +
                '<span class="hshs-contact-meta">' +
                '<span class="time' + (prev.unread ? ' unread' : '') + '">' + escapeHtml(prev.time || '') + '</span>' +
                badge +
                '</span></button>'
            );
        }).join('');
        box.querySelectorAll('[data-uid]').forEach(function (btn) {
            btn.onclick = function () { openThread(btn.getAttribute('data-uid')); };
        });
    }

    async function ensureChatDoc(peer) {
        var firestore = db();
        if (!firestore) throw new Error('Firestore not ready');
        var id = chatIdFor(me().id, peer.id);
        var names = {}; names[me().id] = me().name; names[peer.id] = peer.name;
        await setDoc(doc(firestore, 'chats', id), {
            members: [me().id, peer.id], memberNames: names, updatedAt: serverTimestamp()
        }, { merge: true });
        return id;
    }
    function stopListen() { if (state.unsub) { state.unsub(); state.unsub = null; } }

    function renderMessages(msgs) {
        var box = document.getElementById('hshsThreadMsgs');
        if (!box) return;
        if (!msgs.length) {
            box.innerHTML = '<div class="hshs-chat-empty">Say hi 👋</div>';
            return;
        }
        var myId = me().id;
        var lastDay = '';
        box.innerHTML = msgs.map(function (m) {
            var day = fmtDay(m.createdAt);
            var chip = '';
            if (day && day !== lastDay) {
                lastDay = day;
                chip = '<div class="hshs-date-chip">' + escapeHtml(day) + '</div>';
            }
            var mine = m.senderId === myId;
            var media = '';
            if (m.imageUrl) media = '<img class="hshs-bubble-img" src="' + escapeHtml(m.imageUrl) + '" alt="">';
            if (m.audioUrl) {
                media = '<div class="hshs-voice">' +
                    '<button type="button" aria-label="Play"><i class="fas fa-play"></i></button>' +
                    '<span class="hshs-voice-wave" aria-hidden="true"></span>' +
                    '<span>0:07</span><audio preload="metadata" src="' + escapeHtml(m.audioUrl) + '"></audio></div>';
            }
            var emojiOnly = !m.imageUrl && !m.audioUrl && isEmojiOnly(m.text);
            var text = m.text ? '<div class="hshs-bubble-text">' + escapeHtml(m.text) + '</div>' : '';
            return chip + '<div class="hshs-bubble ' + (mine ? 'mine' : 'theirs') + (emojiOnly ? ' is-emoji-only' : '') + '">' +
                media + text +
                '<time>' + escapeHtml(fmtTime(m.createdAt)) + (mine ? ticks(m.status || 'sent') : '') + '</time></div>';
        }).join('');
        box.querySelectorAll('.hshs-voice').forEach(function (row) {
            var btn = row.querySelector('button');
            var audio = row.querySelector('audio');
            if (!btn || !audio) return;
            btn.onclick = function () {
                if (audio.paused) { audio.play(); btn.innerHTML = '<i class="fas fa-pause"></i>'; }
                else { audio.pause(); btn.innerHTML = '<i class="fas fa-play"></i>'; }
                audio.onended = function () { btn.innerHTML = '<i class="fas fa-play"></i>'; };
            };
        });
        box.scrollTop = box.scrollHeight;
        if (state.activeId && msgs.length) {
            var last = msgs[msgs.length - 1];
            state.previews[state.activeId] = {
                text: last.audioUrl ? 'Voice note' : (last.imageUrl ? 'Photo' : (last.text || '')),
                time: fmtTime(last.createdAt) || 'now',
                unread: 0
            };
            renderList();
        }
    }

    async function markIncomingRead(cid, docs) {
        var firestore = db();
        if (!firestore) return;
        var batch = writeBatch(firestore);
        var n = 0;
        docs.forEach(function (d) {
            var data = d.data() || {};
            if (data.senderId && data.senderId !== me().id && data.status !== 'read') {
                batch.update(d.ref, { status: 'read', readAt: serverTimestamp() });
                n += 1;
            }
        });
        if (n) { try { await batch.commit(); } catch (e) {} }
    }

    async function openThread(uid) {
        var peer = state.contacts.find(function (c) { return c.id === uid; });
        if (!peer && window.HshsStore) peer = window.HshsStore.getUser(uid);
        if (!peer) return;
        if (!state.contacts.some(function (c) { return c.id === peer.id; })) {
            state.contacts.unshift({
                id: peer.id, name: peer.name, username: peer.username || '',
                role: peer.role || 'Student', classYear: peer.classYear || '', avatar: peer.avatar || ''
            });
        }
        state.activeId = peer.id;
        state.emojiOpen = false;
        hideAttach();
        abortRecording(true);
        renderList();
        applyTheme();
        var page = document.getElementById('hshsChatPage');
        if (page) page.classList.add('is-open');
        document.getElementById('hshsChatEmptyMain').hidden = true;
        document.getElementById('hshsThread').hidden = false;
        document.getElementById('hshsThreadName').textContent = peer.name;
        var presence = window.HshsStore && window.HshsStore.presenceLabel ? window.HshsStore.presenceLabel(peer.id) : '';
        document.getElementById('hshsThreadMeta').textContent = presence || ('@' + (peer.username || 'user'));
        var av = document.getElementById('hshsThreadAvatar');
        if (av) {
            av.innerHTML = peer.avatar
                ? '<img src="' + escapeHtml(peer.avatar) + '" alt="">'
                : initials(peer.name);
        }
        closeEmojiPanel();
        syncFab();
        if (state.previews[peer.id]) state.previews[peer.id].unread = 0;
        else if (PREVIEW_SEED[peer.id]) state.previews[peer.id] = Object.assign({}, PREVIEW_SEED[peer.id], { unread: 0 });
        stopListen();
        var firestore = db();
        if (!firestore) { setStatus('Firestore not loaded.', true); renderMessages([]); return; }
        try {
            var cid = await ensureChatDoc(peer);
            var q = query(collection(firestore, 'chats', cid, 'messages'), orderBy('createdAt', 'asc'), limit(150));
            state.unsub = onSnapshot(q, function (snap) {
                state.live = true;
                markIncomingRead(cid, snap.docs);
                var msgs = snap.docs.map(function (d) {
                    var data = d.data() || {};
                    return {
                        id: d.id, text: data.text || '', imageUrl: data.imageUrl || '', audioUrl: data.audioUrl || '',
                        senderId: data.senderId || '', status: data.status || 'sent', createdAt: data.createdAt || null
                    };
                });
                renderMessages(msgs);
            }, function (err) {
                state.live = false;
                setStatus(rulesHint(err), true);
                renderMessages([]);
            });
        } catch (err) {
            setStatus(rulesHint(err), true);
            renderMessages([]);
        }
    }

    function compressImage(file) {
        return new Promise(function (resolve, reject) {
            createImageBitmap(file).then(function (bitmap) {
                var scale = Math.min(1, 960 / Math.max(bitmap.width, bitmap.height));
                var canvas = document.createElement('canvas');
                canvas.width = Math.round(bitmap.width * scale);
                canvas.height = Math.round(bitmap.height * scale);
                canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.72));
            }).catch(reject);
        });
    }

    async function sendPayload(payload) {
        var peer = state.contacts.find(function (c) { return c.id === state.activeId; });
        if (!peer) return;
        var firestore = db();
        if (!firestore) return;
        try {
            var cid = await ensureChatDoc(peer);
            payload.senderId = me().id;
            payload.senderName = me().name;
            payload.status = 'delivered';
            payload.createdAt = serverTimestamp();
            await addDoc(collection(firestore, 'chats', cid, 'messages'), payload);
            await updateDoc(doc(firestore, 'chats', cid), {
                lastMessage: payload.text ? String(payload.text).slice(0, 120) : (payload.audioUrl ? 'Voice note' : 'Photo'),
                lastSenderId: me().id,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            setStatus(rulesHint(err), true);
        }
    }

    async function sendMessage(text) {
        text = String(text || '').trim();
        if ((!text && !state.pendingImage) || !state.activeId) return;
        var payload = { text: text.slice(0, 800) };
        if (state.pendingImage) payload.imageUrl = state.pendingImage;
        await sendPayload(payload);
        hideAttach();
        closeEmojiPanel();
        syncFab();
    }

    function setRecUi(on) {
        var wrap = document.getElementById('hshsComposeWrap');
        var bar = document.getElementById('hshsRecBar');
        if (wrap) wrap.classList.toggle('is-recording', !!on);
        if (bar) {
            bar.hidden = !on;
            bar.classList.toggle('is-on', !!on);
            bar.classList.remove('is-cancel');
        }
        var slide = document.getElementById('hshsRecSlide');
        if (slide) slide.style.transform = '';
        syncFab();
    }
    function tickRecTimer() {
        var el = document.getElementById('hshsRecTimer');
        if (!el || !state.recStart) return;
        var s = Math.max(0, Math.floor((Date.now() - state.recStart) / 1000));
        var m = Math.floor(s / 60);
        var r = s % 60;
        el.textContent = m + ':' + String(r).padStart(2, '0');
    }
    function abortRecording(silent) {
        state.recCancelled = true;
        if (state.recTimer) { clearInterval(state.recTimer); state.recTimer = null; }
        if (state.mediaRecorder && state.recording) {
            try { state.mediaRecorder.stop(); } catch (e) {}
        }
        state.recording = false;
        state.mediaRecorder = null;
        state.chunks = [];
        setRecUi(false);
        if (!silent) setStatus('');
    }

    async function startRecording() {
        if (state.recording) return;
        try {
            var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            state.chunks = [];
            state.recCancelled = false;
            var rec = new MediaRecorder(stream);
            state.mediaRecorder = rec;
            rec.ondataavailable = function (e) { if (e.data && e.data.size) state.chunks.push(e.data); };
            rec.onstop = function () {
                stream.getTracks().forEach(function (t) { t.stop(); });
                var cancelled = state.recCancelled;
                state.recording = false;
                state.mediaRecorder = null;
                if (state.recTimer) { clearInterval(state.recTimer); state.recTimer = null; }
                setRecUi(false);
                if (cancelled || !state.chunks.length) return;
                var blob = new Blob(state.chunks, { type: rec.mimeType || 'audio/webm' });
                var reader = new FileReader();
                reader.onload = function () { sendPayload({ text: '', audioUrl: String(reader.result) }); };
                reader.readAsDataURL(blob);
            };
            rec.start();
            state.recording = true;
            state.recStart = Date.now();
            var timerEl = document.getElementById('hshsRecTimer');
            if (timerEl) timerEl.textContent = '0:00';
            state.recTimer = setInterval(tickRecTimer, 250);
            setRecUi(true);
        } catch (e) {
            setStatus('Microphone blocked — allow mic for voice notes.', true);
        }
    }
    function finishRecording() {
        if (!state.recording || !state.mediaRecorder) return;
        if (Date.now() - state.recStart < 400) {
            abortRecording(true);
            return;
        }
        state.recCancelled = false;
        try { state.mediaRecorder.stop(); } catch (e) {}
    }

    function closeEmojiPanel() {
        state.emojiOpen = false;
        var panel = document.getElementById('hshsEmojiPanel');
        if (panel) { panel.hidden = true; panel.classList.remove('open'); }
        var btn = document.getElementById('hshsEmojiBtn');
        if (btn) btn.classList.remove('is-on');
    }

    function renderEmojiPanel() {
        var panel = document.getElementById('hshsEmojiPanel');
        if (!panel) return;
        var tabs = Object.keys(EMOJI_SETS).map(function (key) {
            return '<button type="button" class="hshs-emoji-tab' + (state.emojiTab === key ? ' on' : '') + '" data-tab="' + key + '">' +
                EMOJI_SETS[key].icon + '</button>';
        }).join('');
        var list = (EMOJI_SETS[state.emojiTab] || EMOJI_SETS.smile).list;
        var grid = list.map(function (e) {
            return '<button type="button" class="hshs-emoji" data-emoji="' + e + '">' + e + '</button>';
        }).join('');
        panel.innerHTML = '<div class="hshs-emoji-grid">' + grid + '</div><div class="hshs-emoji-tabs">' + tabs + '</div>';
        panel.querySelectorAll('[data-tab]').forEach(function (b) {
            b.onclick = function () { state.emojiTab = b.getAttribute('data-tab'); renderEmojiPanel(); };
        });
        panel.querySelectorAll('[data-emoji]').forEach(function (b) {
            b.onclick = function () {
                var input = document.getElementById('hshsThreadInput');
                input.value += b.getAttribute('data-emoji');
                input.focus();
                syncFab();
            };
        });
    }

    function bindFileInput(input, btn) {
        if (!input || !btn) return;
        btn.onclick = function () { input.click(); };
        input.onchange = function () {
            var file = input.files && input.files[0];
            if (!file) return;
            compressImage(file).then(showAttach).catch(function () {
                setStatus('Could not attach that image.', true);
            });
            input.value = '';
        };
    }

    function wireVoiceGestures() {
        var btn = document.getElementById('hshsVoiceBtn');
        if (!btn) return;
        var cancel = document.getElementById('hshsRecCancel');
        if (cancel) cancel.onclick = function () { abortRecording(false); };
        btn.addEventListener('pointerdown', function (e) {
            if (composerHasDraft()) return;
            if (state.recording) return;
            state.recPointerId = e.pointerId;
            state.recStartX = e.clientX;
            try { btn.setPointerCapture(e.pointerId); } catch (err) {}
            startRecording();
        });
        btn.addEventListener('pointermove', function (e) {
            if (!state.recording || e.pointerId !== state.recPointerId) return;
            var dx = e.clientX - state.recStartX;
            var slide = document.getElementById('hshsRecSlide');
            var bar = document.getElementById('hshsRecBar');
            if (slide) slide.style.transform = 'translateX(' + Math.min(0, dx) + 'px)';
            if (bar) bar.classList.toggle('is-cancel', dx < -72);
        });
        function endPtr(e) {
            if (e.pointerId !== state.recPointerId) return;
            var dx = e.clientX - state.recStartX;
            state.recPointerId = null;
            if (!state.recording) return;
            if (dx < -72) abortRecording(false);
            else finishRecording();
        }
        btn.addEventListener('pointerup', endPtr);
        btn.addEventListener('pointercancel', function () { abortRecording(false); });
        btn.addEventListener('click', function (e) {
            if (state.recording) {
                e.preventDefault();
                finishRecording();
            }
        });
    }

    function wire() {
        if (state.wired) { syncFab(); return; }
        state.wired = true;
        var form = document.getElementById('hshsThreadForm');
        if (form) {
            form.onsubmit = function (e) {
                e.preventDefault();
                var input = document.getElementById('hshsThreadInput');
                var val = input.value; input.value = '';
                sendMessage(val);
                syncFab();
            };
        }
        var input = document.getElementById('hshsThreadInput');
        if (input) input.addEventListener('input', syncFab);
        var search = document.getElementById('hshsChatSearch');
        if (search) search.oninput = renderList;
        var back = document.getElementById('hshsThreadBack');
        if (back) {
            back.onclick = function () {
                stopListen(); state.activeId = null;
                abortRecording(true);
                var page = document.getElementById('hshsChatPage');
                if (page) page.classList.remove('is-open');
                document.getElementById('hshsThread').hidden = true;
                document.getElementById('hshsChatEmptyMain').hidden = false;
                hideAttach();
                closeEmojiPanel();
                renderList();
            };
        }
        var emojiBtn = document.getElementById('hshsEmojiBtn');
        var emojiPanel = document.getElementById('hshsEmojiPanel');
        if (emojiBtn && emojiPanel) {
            emojiBtn.onclick = function () {
                state.emojiOpen = !state.emojiOpen;
                emojiPanel.hidden = !state.emojiOpen;
                emojiPanel.classList.toggle('open', state.emojiOpen);
                emojiBtn.classList.toggle('is-on', state.emojiOpen);
                if (state.emojiOpen) renderEmojiPanel();
            };
        }
        bindFileInput(document.getElementById('hshsAttachInput'), document.getElementById('hshsAttachBtn'));
        bindFileInput(document.getElementById('hshsCameraInput'), document.getElementById('hshsCameraBtn'));
        var clearAttach = document.getElementById('hshsClearAttach');
        if (clearAttach) clearAttach.onclick = hideAttach;
        wireVoiceGestures();
        var themeSel = document.getElementById('hshsThemeSelect');
        if (themeSel) {
            themeSel.value = me().chatTheme || 'ocean';
            themeSel.onchange = function () {
                state.me.chatTheme = themeSel.value;
                localStorage.setItem('hshsChatTheme', themeSel.value);
                if (window.HshsStore && window.HshsStore.currentUser()) window.HshsStore.updateProfile({ chatTheme: themeSel.value });
                applyTheme();
            };
        }
        syncFab();
    }

    async function probeLive() {
        var firestore = db();
        if (!firestore) return;
        try {
            await getDocs(query(collection(firestore, 'chats'), limit(1)));
            state.live = true;
        } catch (err) {
            state.live = false;
            setStatus(rulesHint(err), true);
        }
        renderList();
    }
    function openFromQuery() {
        var withId = new URLSearchParams(location.search).get('with');
        if (withId) openThread(withId);
    }
    function boot() {
        if (!document.getElementById('hshsChatPage')) return;
        hideAttach();
        buildContacts();
        applyTheme();
        wire();
        renderList();
        var tries = 0;
        (function waitDb() {
            if (db() || tries > 20) { probeLive(); openFromQuery(); return; }
            tries += 1;
            setTimeout(waitDb, 150);
        })();
    }
    window.initHshsChat = boot;
    window.__hshsOpenChatWith = openThread;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    document.addEventListener('hshs:page', function () {
        if (document.getElementById('hshsChatPage')) boot();
        else stopListen();
    });
})();
