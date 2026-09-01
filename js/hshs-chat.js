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
    updateDoc
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

(function () {
    if (window.__hshsChatBoot) return;
    window.__hshsChatBoot = true;

    var EMOJIS = ['\u{1F44B}','\u{1F60A}','\u{1F389}','\u{1F3C6}','\u{26A1}','\u{1F525}','\u{1F4AA}','\u{1F3C3}','\u{1F3B5}','\u{1F393}','\u{1F4BB}','\u{1F52C}','\u{1F3D7}\uFE0F','\u{1F49A}','\u{1F64F}','\u{1F91D}','\u{1F4AF}','\u{2728}','\u{1F31F}','\u{1F680}','\u{1F4F8}','\u{1F3A4}','\u{1F3AE}','\u{2705}'];

    var state = {
        me: null,
        contacts: [],
        activeId: null,
        unsub: null,
        live: false,
        emojiOpen: false,
        pendingImage: null
    };

    function db() { return window.firestore || null; }

    function me() {
        if (state.me) return state.me;
        var user = window.HshsStore && window.HshsStore.currentUser ? window.HshsStore.currentUser() : null;
        var id = user && user.id ? user.id : (localStorage.getItem('hshsChatUid') || '');
        if (!id) {
            id = 'guest-' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem('hshsChatUid', id);
        }
        var name = user && user.name ? user.name : (localStorage.getItem('hshsChatName') || 'HSHS Student');
        state.me = {
            id: id,
            name: name,
            username: user && user.username ? user.username : 'you',
            chatTheme: (user && user.chatTheme) || localStorage.getItem('hshsChatTheme') || 'ocean',
            bubbleStyle: (user && user.bubbleStyle) || localStorage.getItem('hshsBubbleStyle') || 'rounded'
        };
        return state.me;
    }

    function chatIdFor(a, b) { return [a, b].sort().join('__'); }

    function initials(name) {
        return String(name || '?').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
    }

    function fmtTime(ts) {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date(ts);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    function setStatus(text, isError) {
        var el = document.getElementById('hshsChatStatus');
        if (el) el.textContent = text;
        var banner = document.getElementById('hshsChatBanner');
        if (banner) {
            banner.className = 'hshs-chat-banner' + (isError ? ' error' : '');
            banner.textContent = text || '';
            banner.hidden = !text;
        }
    }

    function applyTheme() {
        var page = document.getElementById('hshsChatPage');
        if (!page) return;
        var m = me();
        page.setAttribute('data-theme', m.chatTheme || 'ocean');
        page.setAttribute('data-bubbles', m.bubbleStyle || 'rounded');
    }

    function buildContacts() {
        var list = [];
        if (window.HshsStore && window.HshsStore.listUsers) {
            window.HshsStore.listUsers().forEach(function (u) {
                if (!u || !u.id || u.id === me().id) return;
                list.push({
                    id: u.id,
                    name: u.name,
                    username: u.username || '',
                    role: u.role || 'Student',
                    classYear: u.classYear || '',
                    avatar: u.avatar || ''
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
            return (c.name + ' @' + (c.username || '') + ' ' + c.role + ' ' + (c.classYear || '')).toLowerCase().indexOf(q) !== -1;
        });
    }

    function renderList() {
        var box = document.getElementById('hshsChatList');
        if (!box) return;
        var rows = filteredContacts();
        if (!rows.length) {
            box.innerHTML = '<div class="hshs-chat-empty">No people match. Try @username</div>';
            return;
        }
        box.innerHTML = rows.map(function (c) {
            return (
                '<button type="button" class="hshs-contact' + (state.activeId === c.id ? ' active' : '') + '" data-uid="' + c.id + '">' +
                '<span class="hshs-contact-avatar">' + initials(c.name) + '</span>' +
                '<span class="hshs-contact-body"><strong>' + escapeHtml(c.name) + '</strong>' +
                '<small>@' + escapeHtml(c.username || 'user') + ' · ' + escapeHtml(c.role) + '</small></span>' +
                '<span class="hshs-contact-meta">' + (state.live ? 'Live' : '…') + '</span>' +
                '</button>'
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
        var ref = doc(firestore, 'chats', id);
        await setDoc(ref, {
            members: [me().id, peer.id],
            memberNames: (function () {
                var o = {};
                o[me().id] = me().name;
                o[peer.id] = peer.name;
                return o;
            })(),
            updatedAt: serverTimestamp()
        }, { merge: true });
        return id;
    }

    function stopListen() {
        if (state.unsub) { state.unsub(); state.unsub = null; }
    }

    function renderMessages(msgs) {
        var box = document.getElementById('hshsThreadMsgs');
        if (!box) return;
        if (!msgs.length) {
            box.innerHTML = '<div class="hshs-chat-empty">Say hi — this thread is live. Emojis & photos welcome.</div>';
            return;
        }
        var myId = me().id;
        box.innerHTML = msgs.map(function (m) {
            var mine = m.senderId === myId;
            var media = m.imageUrl
                ? '<img class="hshs-bubble-img" src="' + escapeHtml(m.imageUrl) + '" alt="">'
                : '';
            var text = m.text ? '<div class="hshs-bubble-text">' + escapeHtml(m.text) + '</div>' : '';
            return '<div class="hshs-bubble ' + (mine ? 'mine' : 'theirs') + '">' +
                media + text +
                '<time>' + escapeHtml(fmtTime(m.createdAt)) + '</time></div>';
        }).join('');
        box.scrollTop = box.scrollHeight;
    }

    async function openThread(uid) {
        var peer = state.contacts.find(function (c) { return c.id === uid; });
        if (!peer && window.HshsStore) peer = window.HshsStore.getUser(uid);
        if (!peer) return;
        if (!state.contacts.some(function (c) { return c.id === peer.id; })) {
            state.contacts.unshift({
                id: peer.id,
                name: peer.name,
                username: peer.username || '',
                role: peer.role || 'Student',
                classYear: peer.classYear || ''
            });
        }
        state.activeId = peer.id;
        state.emojiOpen = false;
        state.pendingImage = null;
        renderList();
        applyTheme();

        var page = document.getElementById('hshsChatPage');
        if (page) page.classList.add('is-open');

        document.getElementById('hshsChatEmptyMain').hidden = true;
        var thread = document.getElementById('hshsThread');
        thread.hidden = false;
        document.getElementById('hshsThreadName').textContent = peer.name;
        document.getElementById('hshsThreadMeta').textContent = '@' + (peer.username || 'user') + ' · ' + (peer.role || '');
        document.getElementById('hshsAttachPreview').hidden = true;
        document.getElementById('hshsEmojiPanel').hidden = true;

        stopListen();
        var firestore = db();
        if (!firestore) {
            setStatus('Firestore not loaded. Check config.js.', true);
            renderMessages([]);
            return;
        }

        try {
            var cid = await ensureChatDoc(peer);
            var q = query(
                collection(firestore, 'chats', cid, 'messages'),
                orderBy('createdAt', 'asc'),
                limit(150)
            );
            state.unsub = onSnapshot(q, function (snap) {
                state.live = true;
                setStatus('Live · @' + (peer.username || peer.name));
                var msgs = snap.docs.map(function (d) {
                    var data = d.data() || {};
                    return {
                        id: d.id,
                        text: data.text || '',
                        imageUrl: data.imageUrl || '',
                        senderId: data.senderId || '',
                        senderName: data.senderName || '',
                        createdAt: data.createdAt || null
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

    function rulesHint(err) {
        var msg = (err && err.message) ? err.message : String(err || 'Chat error');
        if (/permission|insufficient|Missing or insufficient/i.test(msg)) {
            return 'Firestore blocked chat writes. Update Firestore rules for chats/messages.';
        }
        return msg;
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

    async function sendMessage(text) {
        text = String(text || '').trim();
        if ((!text && !state.pendingImage) || !state.activeId) return;
        var peer = state.contacts.find(function (c) { return c.id === state.activeId; });
        if (!peer) return;
        var firestore = db();
        if (!firestore) return;

        try {
            var cid = await ensureChatDoc(peer);
            var payload = {
                text: text.slice(0, 800),
                senderId: me().id,
                senderName: me().name,
                createdAt: serverTimestamp()
            };
            if (state.pendingImage) payload.imageUrl = state.pendingImage;
            await addDoc(collection(firestore, 'chats', cid, 'messages'), payload);
            await updateDoc(doc(firestore, 'chats', cid), {
                lastMessage: text ? text.slice(0, 120) : 'Photo',
                lastSenderId: me().id,
                updatedAt: serverTimestamp()
            });
            state.pendingImage = null;
            var prev = document.getElementById('hshsAttachPreview');
            if (prev) prev.hidden = true;
            state.emojiOpen = false;
            var panel = document.getElementById('hshsEmojiPanel');
            if (panel) panel.hidden = true;
        } catch (err) {
            setStatus(rulesHint(err), true);
        }
    }

    function wire() {
        var form = document.getElementById('hshsThreadForm');
        if (form) {
            form.onsubmit = function (e) {
                e.preventDefault();
                var input = document.getElementById('hshsThreadInput');
                var val = input.value;
                input.value = '';
                sendMessage(val);
            };
        }
        var search = document.getElementById('hshsChatSearch');
        if (search) search.oninput = renderList;

        var back = document.getElementById('hshsThreadBack');
        if (back) {
            back.onclick = function () {
                stopListen();
                state.activeId = null;
                var page = document.getElementById('hshsChatPage');
                if (page) page.classList.remove('is-open');
                document.getElementById('hshsThread').hidden = true;
                document.getElementById('hshsChatEmptyMain').hidden = false;
                renderList();
            };
        }

        var emojiBtn = document.getElementById('hshsEmojiBtn');
        var emojiPanel = document.getElementById('hshsEmojiPanel');
        if (emojiBtn && emojiPanel) {
            emojiBtn.onclick = function () {
                state.emojiOpen = !state.emojiOpen;
                emojiPanel.hidden = !state.emojiOpen;
            };
            emojiPanel.innerHTML = EMOJIS.map(function (e) {
                return '<button type="button" class="hshs-emoji" data-emoji="' + e + '">' + e + '</button>';
            }).join('');
            emojiPanel.querySelectorAll('[data-emoji]').forEach(function (b) {
                b.onclick = function () {
                    var input = document.getElementById('hshsThreadInput');
                    input.value += b.getAttribute('data-emoji');
                    input.focus();
                };
            });
        }

        var attachBtn = document.getElementById('hshsAttachBtn');
        var attachInput = document.getElementById('hshsAttachInput');
        var attachPrev = document.getElementById('hshsAttachPreview');
        if (attachBtn && attachInput) {
            attachBtn.onclick = function () { attachInput.click(); };
            attachInput.onchange = function () {
                var file = attachInput.files && attachInput.files[0];
                if (!file) return;
                compressImage(file).then(function (url) {
                    state.pendingImage = url;
                    if (attachPrev) {
                        attachPrev.hidden = false;
                        attachPrev.querySelector('img').src = url;
                    }
                }).catch(function () {
                    setStatus('Could not attach that image.', true);
                });
                attachInput.value = '';
            };
        }
        var clearAttach = document.getElementById('hshsClearAttach');
        if (clearAttach) {
            clearAttach.onclick = function () {
                state.pendingImage = null;
                if (attachPrev) attachPrev.hidden = true;
            };
        }

        var themeSel = document.getElementById('hshsThemeSelect');
        var bubbleSel = document.getElementById('hshsBubbleSelect');
        if (themeSel) {
            themeSel.value = me().chatTheme || 'ocean';
            themeSel.onchange = function () {
                state.me.chatTheme = themeSel.value;
                localStorage.setItem('hshsChatTheme', themeSel.value);
                if (window.HshsStore && window.HshsStore.currentUser()) {
                    window.HshsStore.updateProfile({ chatTheme: themeSel.value });
                }
                applyTheme();
            };
        }
        if (bubbleSel) {
            bubbleSel.value = me().bubbleStyle || 'rounded';
            bubbleSel.onchange = function () {
                state.me.bubbleStyle = bubbleSel.value;
                localStorage.setItem('hshsBubbleStyle', bubbleSel.value);
                if (window.HshsStore && window.HshsStore.currentUser()) {
                    window.HshsStore.updateProfile({ bubbleStyle: bubbleSel.value });
                }
                applyTheme();
            };
        }
    }

    async function probeLive() {
        var firestore = db();
        if (!firestore) {
            setStatus('Waiting for Firebase…', true);
            return;
        }
        try {
            await getDocs(query(collection(firestore, 'chats'), limit(1)));
            state.live = true;
            setStatus('Live on Firestore · search @username');
        } catch (err) {
            state.live = false;
            setStatus(rulesHint(err), true);
        }
        renderList();
    }

    function openFromQuery() {
        var params = new URLSearchParams(location.search);
        var withId = params.get('with');
        if (withId) openThread(withId);
    }

    function boot() {
        if (!document.getElementById('hshsChatPage')) return;

        var meEl = document.getElementById('hshsChatMe');
        if (meEl) meEl.textContent = '@' + (me().username || me().name);

        if (!document.getElementById('hshsChatBanner')) {
            var top = document.querySelector('.hshs-chat-top');
            if (top) {
                var banner = document.createElement('div');
                banner.id = 'hshsChatBanner';
                banner.className = 'hshs-chat-banner';
                banner.hidden = true;
                top.parentNode.insertBefore(banner, top.nextSibling);
            }
        }

        buildContacts();
        applyTheme();
        wire();
        renderList();

        var tries = 0;
        (function waitDb() {
            if (db() || tries > 20) {
                probeLive();
                openFromQuery();
                return;
            }
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
