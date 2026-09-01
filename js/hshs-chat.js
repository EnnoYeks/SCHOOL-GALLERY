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
    where
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

(function () {
    if (window.__hshsChatBoot) return;
    window.__hshsChatBoot = true;

    var SEED = [
        { id: 'u-prefect', name: 'Joel Wambede', role: 'Prefect', classYear: 'S6' },
        { id: 'u-sports', name: 'Sports Club', role: 'Club', classYear: 'Campus' },
        { id: 'u-choir', name: 'Choir Desk', role: 'Club', classYear: 'Music' },
        { id: 'u-lab', name: 'Science Lab', role: 'Department', classYear: 'STEM' },
        { id: 'u-house', name: 'House Captains', role: 'Leadership', classYear: 'Houses' }
    ];

    var state = {
        me: null,
        contacts: [],
        activeId: null,
        unsub: null,
        live: false,
        error: ''
    };

    function db() {
        return window.firestore || null;
    }

    function me() {
        if (state.me) return state.me;
        var user = window.HshsStore && window.HshsStore.currentUser ? window.HshsStore.currentUser() : null;
        var id = user && user.id ? user.id : (localStorage.getItem('hshsChatUid') || '');
        if (!id) {
            id = 'guest-' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem('hshsChatUid', id);
        }
        var name = user && user.name ? user.name : (localStorage.getItem('hshsChatName') || 'HSHS Student');
        state.me = { id: id, name: name };
        return state.me;
    }

    function chatIdFor(a, b) {
        return [a, b].sort().join('__');
    }

    function initials(name) {
        return String(name || '?').split(/\s+/).map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
    }

    function fmtTime(ts) {
        if (!ts) return '';
        var d = ts.toDate ? ts.toDate() : new Date(ts);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function setStatus(text, isError) {
        var el = document.getElementById('hshsChatStatus');
        if (el) el.textContent = text;
        state.error = isError ? text : '';
        var banner = document.getElementById('hshsChatBanner');
        if (banner) {
            banner.className = 'hshs-chat-banner' + (isError ? ' error' : '');
            banner.textContent = text;
            banner.hidden = !text;
        }
    }

    function buildContacts() {
        var list = SEED.slice();
        try {
            if (window.HshsStore && window.HshsStore.listUsers) {
                window.HshsStore.listUsers().forEach(function (u) {
                    if (!u || !u.id || u.id === me().id) return;
                    if (list.some(function (x) { return x.id === u.id; })) return;
                    list.push({
                        id: u.id,
                        name: u.name,
                        role: u.role || 'Student',
                        classYear: u.classYear || ''
                    });
                });
            }
        } catch (e) {}
        state.contacts = list;
        return list;
    }

    function filteredContacts() {
        var q = (document.getElementById('hshsChatSearch') || {}).value || '';
        q = String(q).toLowerCase().trim();
        return state.contacts.filter(function (c) {
            if (!q) return true;
            return (c.name + ' ' + c.role + ' ' + (c.classYear || '')).toLowerCase().indexOf(q) !== -1;
        });
    }

    function renderList() {
        var box = document.getElementById('hshsChatList');
        if (!box) return;
        var rows = filteredContacts();
        if (!rows.length) {
            box.innerHTML = '<div class="hshs-chat-empty">No contacts match.</div>';
            return;
        }
        box.innerHTML = rows.map(function (c) {
            return (
                '<button type="button" class="hshs-contact' + (state.activeId === c.id ? ' active' : '') + '" data-uid="' + c.id + '">' +
                '<span class="hshs-contact-avatar">' + initials(c.name) + '</span>' +
                '<span class="hshs-contact-body"><strong>' + escapeHtml(c.name) + '</strong>' +
                '<small>' + escapeHtml(c.role + (c.classYear ? ' · ' + c.classYear : '')) + '</small></span>' +
                '<span class="hshs-contact-meta">' + (state.live ? 'Live' : '…') + '</span>' +
                '</button>'
            );
        }).join('');
        box.querySelectorAll('[data-uid]').forEach(function (btn) {
            btn.onclick = function () { openThread(btn.getAttribute('data-uid')); };
        });
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    async function ensureChatDoc(peer) {
        var firestore = db();
        if (!firestore) throw new Error('Firestore not ready');
        var id = chatIdFor(me().id, peer.id);
        var ref = doc(firestore, 'chats', id);
        await setDoc(ref, {
            members: [me().id, peer.id],
            memberNames: {
                [me().id]: me().name,
                [peer.id]: peer.name
            },
            updatedAt: serverTimestamp()
        }, { merge: true });
        return id;
    }

    function stopListen() {
        if (state.unsub) {
            state.unsub();
            state.unsub = null;
        }
    }

    function renderMessages(msgs) {
        var box = document.getElementById('hshsThreadMsgs');
        if (!box) return;
        if (!msgs.length) {
            box.innerHTML = '<div class="hshs-chat-empty">Say hi — this thread is live.</div>';
            return;
        }
        var myId = me().id;
        box.innerHTML = msgs.map(function (m) {
            var mine = m.senderId === myId;
            return '<div class="hshs-bubble ' + (mine ? 'mine' : 'theirs') + '">' +
                escapeHtml(m.text) +
                '<time>' + escapeHtml(fmtTime(m.createdAt)) + '</time></div>';
        }).join('');
        box.scrollTop = box.scrollHeight;
    }

    async function openThread(uid) {
        var peer = state.contacts.find(function (c) { return c.id === uid; });
        if (!peer) return;
        state.activeId = uid;
        renderList();

        var page = document.getElementById('hshsChatPage');
        if (page) page.classList.add('is-open');

        document.getElementById('hshsChatEmptyMain').hidden = true;
        var thread = document.getElementById('hshsThread');
        thread.hidden = false;
        document.getElementById('hshsThreadName').textContent = peer.name;
        document.getElementById('hshsThreadMeta').textContent = peer.role + (peer.classYear ? ' · ' + peer.classYear : '');

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
                limit(120)
            );
            state.unsub = onSnapshot(q, function (snap) {
                state.live = true;
                setStatus('Live · ' + peer.name);
                var msgs = snap.docs.map(function (d) {
                    var data = d.data() || {};
                    return {
                        id: d.id,
                        text: data.text || '',
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
            return 'Firestore blocked chat writes. In Firebase Console → Firestore → Rules, allow chats/messages for this project (see chat rules note).';
        }
        return msg;
    }

    async function sendMessage(text) {
        text = String(text || '').trim();
        if (!text || !state.activeId) return;
        var peer = state.contacts.find(function (c) { return c.id === state.activeId; });
        if (!peer) return;
        var firestore = db();
        if (!firestore) return;

        try {
            var cid = await ensureChatDoc(peer);
            await addDoc(collection(firestore, 'chats', cid, 'messages'), {
                text: text.slice(0, 800),
                senderId: me().id,
                senderName: me().name,
                createdAt: serverTimestamp()
            });
            await updateDoc(doc(firestore, 'chats', cid), {
                lastMessage: text.slice(0, 120),
                lastSenderId: me().id,
                updatedAt: serverTimestamp()
            });
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
    }

    async function probeLive() {
        var firestore = db();
        if (!firestore) {
            setStatus('Waiting for Firebase…', true);
            return;
        }
        try {
            // Lightweight readiness check; empty result is fine
            await getDocs(query(collection(firestore, 'chats'), limit(1)));
            state.live = true;
            setStatus('Live on Firestore');
        } catch (err) {
            state.live = false;
            setStatus(rulesHint(err), true);
        }
        renderList();
    }

    function boot() {
        if (!document.getElementById('hshsChatPage')) return;

        var meEl = document.getElementById('hshsChatMe');
        if (meEl) meEl.textContent = me().name;

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
        wire();
        renderList();

        // config.js is a module; give it a tick to export window.firestore
        var tries = 0;
        (function waitDb() {
            if (db() || tries > 20) {
                probeLive();
                return;
            }
            tries += 1;
            setTimeout(waitDb, 150);
        })();
    }

    window.initHshsChat = boot;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

    document.addEventListener('hshs:page', function () {
        if (document.getElementById('hshsChatPage')) boot();
        else stopListen();
    });
})();
