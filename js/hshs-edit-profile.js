(function () {
  if (window.__hshsEditProfile) return;
  window.__hshsEditProfile = true;

  var INTERESTS = ['STEM','Sports','Music','Art','Debate','Drama','Coding','Photography','Writing','Choir','Dance','Leadership','Environment','Business'];
  var HOUSES = ['—','Eagle','Lion','Falcon','Phoenix','Other'];
  var CLASSES = ['S1','S2','S3','S4','S5','S6','Staff','Alumni'];
  var MAX_DATA_URL = 700000;

  function $(id) { return document.getElementById(id); }
  function val(id) { var el = $(id); return el ? String(el.value || '').trim() : ''; }
  function setVal(id, v) { var el = $(id); if (el) el.value = v == null ? '' : v; }
  function qs(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }

  function msg(text, ok) {
    var el = $('epMsg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'ep-msg' + (text ? (ok ? ' is-ok' : ' is-error') : '');
  }

  function setBusy(busy) {
    document.querySelectorAll('[data-ep-save]').forEach(function (b) {
      b.disabled = !!busy;
      if (b.dataset.epSaveLabel == null) b.dataset.epSaveLabel = b.textContent;
      b.textContent = busy ? 'Saving…' : b.dataset.epSaveLabel;
    });
  }

  function loadLocal() {
    var p = {};
    try { p = JSON.parse(localStorage.getItem('userProfile') || '{}') || {}; } catch (e) {}
    if (window.hshsProfile) p = Object.assign({}, p, window.hshsProfile);
    return p;
  }

  function fillForm(p) {
    p = p || {};
    setVal('epFullName', p.fullName || p.name || '');
    setVal('epUsername', p.username || '');
    setVal('epBio', p.bio || '');
    setVal('epStudentId', p.studentId || '');
    setVal('epClassYear', p.classYear || '');
    setVal('epHouse', p.house || '');
    setVal('epEmail', p.email || (window.hshsAuthUser && window.hshsAuthUser.email) || '');
    setVal('epPhone', p.phone || '');
    setVal('epLocation', p.location || '');
    setVal('epWebsite', p.website || '');
    setVal('epInstagram', p.instagram || '');
    setVal('epTiktok', p.tiktok || '');
    setVal('epWhatsapp', p.whatsapp || '');
    setVal('epPronouns', p.pronouns || '');
    setVal('epHeadline', p.headline || '');
    if ($('epShowEmail')) $('epShowEmail').checked = !!p.showEmail;
    if ($('epShowPhone')) $('epShowPhone').checked = !!p.showPhone;
    if ($('epShowStudentId')) $('epShowStudentId').checked = p.showStudentId !== false;
    if ($('epPrivateAccount')) $('epPrivateAccount').checked = !!p.privateAccount;
    if ($('epAllowMessages')) $('epAllowMessages').checked = p.allowMessages !== false;
    if ($('epShowActivity')) $('epShowActivity').checked = p.showActivity !== false;
    var interests = Array.isArray(p.interests) ? p.interests : [];
    document.querySelectorAll('[data-interest]').forEach(function (btn) {
      btn.classList.toggle('is-on', interests.indexOf(btn.getAttribute('data-interest')) !== -1);
    });
    updatePreview(p);
    updateMedia(p);
  }

  function updateMedia(p) {
    p = p || {};
    var av = $('epAvatarImg'), fall = $('epAvatarFall');
    var photo = p.photoURL || p.avatar || '';
    if (av) {
      if (photo) { av.src = photo; av.hidden = false; if (fall) fall.hidden = true; }
      else { av.hidden = true; if (fall) { fall.hidden = false; fall.textContent = String(p.fullName || p.username || '?').charAt(0).toUpperCase(); } }
    }
    var cover = $('epCover');
    if (cover) {
      var c = p.coverURL || p.cover || '';
      cover.style.backgroundImage = c ? 'url("' + String(c).replace(/"/g, '') + '")' : 'linear-gradient(135deg,#12306b,#1d4ed8 50%,#0ea5e9)';
      cover.style.backgroundSize = 'cover';
      cover.style.backgroundPosition = 'center';
    }
  }

  function updatePreview(p) {
    p = p || collect();
    var name = $('epPrevName'), meta = $('epPrevMeta'), img = $('epPrevImg');
    if (name) name.textContent = p.fullName || 'Your name';
    if (meta) meta.textContent = [p.username ? '@' + p.username : '', p.classYear || '', p.headline || ''].filter(Boolean).join(' · ');
    if (img) { if (p.photoURL || p.avatar) img.src = p.photoURL || p.avatar; else img.removeAttribute('src'); }
    var bioCount = $('epBioCount');
    if (bioCount) bioCount.textContent = String((p.bio || '').length) + '/160';
  }

  function collect() {
    var interests = [];
    document.querySelectorAll('[data-interest].is-on').forEach(function (btn) { interests.push(btn.getAttribute('data-interest')); });
    var prev = loadLocal();
    var user = window.hshsAuthUser;
    return {
      uid: (user && user.uid) || prev.uid || window.hshsUid || '',
      email: (user && user.email) || val('epEmail') || prev.email || '',
      fullName: val('epFullName'), name: val('epFullName'),
      username: val('epUsername').toLowerCase().replace(/[^a-z0-9._]/g, ''),
      bio: val('epBio').slice(0, 160),
      studentId: val('epStudentId'), classYear: val('epClassYear'), house: val('epHouse'),
      phone: val('epPhone'), location: val('epLocation'), website: val('epWebsite'),
      instagram: val('epInstagram').replace(/^@/, ''), tiktok: val('epTiktok').replace(/^@/, ''),
      whatsapp: val('epWhatsapp'), pronouns: val('epPronouns'), headline: val('epHeadline').slice(0, 80),
      interests: interests,
      photoURL: prev.photoURL || prev.avatar || '', avatar: prev.photoURL || prev.avatar || '',
      coverURL: prev.coverURL || prev.cover || '', cover: prev.coverURL || prev.cover || '',
      showEmail: !!($('epShowEmail') && $('epShowEmail').checked),
      showPhone: !!($('epShowPhone') && $('epShowPhone').checked),
      showStudentId: !!($('epShowStudentId') && $('epShowStudentId').checked),
      privateAccount: !!($('epPrivateAccount') && $('epPrivateAccount').checked),
      allowMessages: !!($('epAllowMessages') && $('epAllowMessages').checked),
      showActivity: !!($('epShowActivity') && $('epShowActivity').checked),
      role: prev.role || 'student', isAnonymous: false, updatedAt: Date.now()
    };
  }

  function fileToDataUrl(file, max) {
    max = max || 1200;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image') !== 0) return reject(new Error('Choose an image file'));
      if (file.size > 12 * 1024 * 1024) return reject(new Error('Image must be under 12 MB'));
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width, h = img.height;
          if (w > max || h > max) { var r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r); }
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          var quality = 0.85, url = c.toDataURL('image/jpeg', quality);
          while (url.length > MAX_DATA_URL && quality > 0.45) { quality -= 0.1; url = c.toDataURL('image/jpeg', quality); }
          if (url.length > MAX_DATA_URL) return reject(new Error('Image still too large. Try a smaller photo.'));
          resolve(url);
        };
        img.onerror = function () { reject(new Error('Could not read image')); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error('Could not read file')); };
      reader.readAsDataURL(file);
    });
  }

  function persistLocal(data) {
    try { localStorage.setItem('userProfile', JSON.stringify(data)); } catch (e) {}
    window.hshsProfile = data;
    if (data.uid) { try { localStorage.setItem('hshsUid', data.uid); } catch (e) {} window.hshsUid = data.uid; }
    try {
      if (window.HshsStore) {
        if (typeof window.HshsStore.updateProfile === 'function') {
          window.HshsStore.updateProfile({ name: data.fullName, username: data.username, bio: data.bio, avatar: data.photoURL, classYear: data.classYear });
        }
        if (typeof window.HshsStore.setUser === 'function') window.HshsStore.setUser(data);
      }
    } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('hshs:profile', { detail: { profile: data } })); } catch (e) {}
    if (window.HshsAnalytics && window.HshsAnalytics.events) { try { window.HshsAnalytics.events.profileEdit(); } catch (e) {} }
  }

  async function saveProfile() {
    var data = collect();
    if (data.fullName.length < 2) { msg('Enter your full name.'); return false; }
    if (data.username && !/^[a-z0-9._]{3,24}$/.test(data.username)) {
      msg('Username: 3–24 characters, letters, numbers, . or _ only.'); return false;
    }
    var user = window.hshsAuthUser;
    if (!user || user.isAnonymous) {
      msg('Sign in to save your profile to the school cloud.');
      setTimeout(function () { location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search); }, 900);
      return false;
    }
    setBusy(true); msg('Saving…');
    try {
      if (window.HshsAuthApi && window.HshsAuthApi.lookupUserField) {
        if (data.username) {
          var takenUser = await window.HshsAuthApi.lookupUserField('username', data.username);
          if (takenUser && takenUser.uid && takenUser.uid !== user.uid) { msg('That username is already taken.'); setBusy(false); return false; }
        }
        if (data.studentId) {
          var takenId = await window.HshsAuthApi.lookupUserField('studentId', data.studentId);
          if (takenId && takenId.uid && takenId.uid !== user.uid) { msg('That student ID is linked to another account.'); setBusy(false); return false; }
        }
      }
      if (window.HshsAuthApi && typeof window.HshsAuthApi.saveProfile === 'function') {
        data = await window.HshsAuthApi.saveProfile(user, data);
      }
      persistLocal(data); updateMedia(data); updatePreview(data);
      msg('Profile saved.', true);
      if (qs('welcome') === '1') setTimeout(function () { location.href = 'profile.html?welcome=1'; }, 700);
      return true;
    } catch (err) {
      console.error(err);
      msg((err && err.message) || 'Could not save. Check your connection and try again.');
      return false;
    } finally { setBusy(false); }
  }

  async function loadFromCloud() {
    var user = window.hshsAuthUser;
    if (!user || user.isAnonymous) {
      fillForm(loadLocal());
      if (!user || user.isAnonymous) msg('Sign in to sync your profile with Firestore.');
      return;
    }
    try {
      msg('Loading profile…');
      var p = null;
      if (window.HshsAuthApi && window.HshsAuthApi.loadOrCreateProfile) p = await window.HshsAuthApi.loadOrCreateProfile(user);
      if (!p) p = loadLocal();
      p.email = p.email || user.email || '';
      p.uid = user.uid;
      persistLocal(p); fillForm(p); msg('');
      if (qs('welcome') === '1') msg('Welcome! Add your student ID and username so classmates can find you.', true);
    } catch (e) {
      console.warn(e); fillForm(loadLocal()); msg('Loaded offline copy. Save when online to sync.');
    }
  }

  function wireSelects() {
    var classSel = $('epClassYear');
    if (classSel && !classSel.options.length) {
      CLASSES.forEach(function (c) { var o = document.createElement('option'); o.value = c; o.textContent = c; classSel.appendChild(o); });
    }
    var houseSel = $('epHouse');
    if (houseSel && houseSel.options.length <= 1) {
      houseSel.innerHTML = '';
      HOUSES.forEach(function (h) { var o = document.createElement('option'); o.value = h === '—' ? '' : h; o.textContent = h; houseSel.appendChild(o); });
    }
    var chipBox = $('epInterests');
    if (chipBox && !chipBox.children.length) {
      INTERESTS.forEach(function (name) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'ep-chip'; b.setAttribute('data-interest', name); b.textContent = name;
        b.addEventListener('click', function () { b.classList.toggle('is-on'); updatePreview(collect()); });
        chipBox.appendChild(b);
      });
    }
  }

  function wireLivePreview() {
    ['epFullName','epUsername','epBio','epClassYear','epHeadline','epStudentId'].forEach(function (id) {
      var el = $(id); if (!el) return;
      el.addEventListener('input', function () { updatePreview(collect()); });
      el.addEventListener('change', function () { updatePreview(collect()); });
    });
  }

  function wireButtons() {
    document.querySelectorAll('[data-ep-save]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); saveProfile(); });
    });
    var back = $('epBack');
    if (back) back.addEventListener('click', function (e) { e.preventDefault(); location.href = 'profile.html'; });
    var cancel = $('epCancel') || document.querySelector('.ep-btn-ghost');
    if (cancel) cancel.addEventListener('click', function (e) { e.preventDefault(); location.href = 'profile.html'; });

    var avInput = $('epAvatarFile'), avBtn = $('epChangeAvatar');
    if (avBtn && avInput) {
      avBtn.addEventListener('click', function () { avInput.click(); });
      avInput.addEventListener('change', function () {
        var f = avInput.files && avInput.files[0]; if (!f) return;
        msg('Processing photo…');
        fileToDataUrl(f, 800).then(function (url) {
          var merged = Object.assign(collect(), { photoURL: url, avatar: url });
          persistLocal(merged); updateMedia(merged); updatePreview(merged);
          msg('Photo ready — tap Save to upload to your account.', true);
        }).catch(function (err) { msg(err.message || 'Could not read image'); });
        avInput.value = '';
      });
    }
    var rmAv = $('epRemoveAvatar');
    if (rmAv) rmAv.addEventListener('click', function () {
      var merged = Object.assign(collect(), { photoURL: '', avatar: '' });
      persistLocal(merged); updateMedia(merged); updatePreview(merged);
      msg('Photo removed — tap Save to confirm.', true);
    });

    var covInput = $('epCoverFile'), covBtn = $('epChangeCover');
    if (covBtn && covInput) {
      covBtn.addEventListener('click', function () { covInput.click(); });
      covInput.addEventListener('change', function () {
        var f = covInput.files && covInput.files[0]; if (!f) return;
        msg('Processing cover…');
        fileToDataUrl(f, 1400).then(function (url) {
          var merged = Object.assign(collect(), { coverURL: url, cover: url });
          persistLocal(merged); updateMedia(merged);
          msg('Cover ready — tap Save to keep it.', true);
        }).catch(function (err) { msg(err.message || 'Could not read image'); });
        covInput.value = '';
      });
    }

    var resetBtn = $('epResetPassword');
    if (resetBtn) {
      resetBtn.addEventListener('click', async function () {
        var email = val('epEmail') || (window.hshsAuthUser && window.hshsAuthUser.email);
        if (!email) { msg('No email on this account.'); return; }
        try {
          if (window.HshsAuthApi && window.HshsAuthApi.sendPasswordReset) await window.HshsAuthApi.sendPasswordReset(email);
          else {
            var mod = await import('https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js');
            await mod.sendPasswordResetEmail(window.auth, email);
          }
          msg('Password reset email sent to ' + email, true);
        } catch (err) { msg((err && err.message) || 'Could not send reset email.'); }
      });
    }

    var signOutBtn = $('epSignOut');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', async function () {
        if (!confirm('Sign out of HSHS World on this device?')) return;
        try {
          if (window.HshsAuthApi && window.HshsAuthApi.signOutUser) await window.HshsAuthApi.signOutUser();
          else if (window.auth && window.auth.signOut) await window.auth.signOut();
        } catch (e) {}
        try { localStorage.removeItem('userProfile'); localStorage.removeItem('hshsUid'); } catch (e) {}
        location.href = 'login.html';
      });
    }
  }

  function wire() {
    document.body.classList.add('ep-body');
    wireSelects(); wireLivePreview(); wireButtons();
    fillForm(loadLocal());
    var tries = 0;
    function tryLoad() {
      if (window.hshsAuthUser || tries > 25) { loadFromCloud(); return; }
      tries++; setTimeout(tryLoad, 200);
    }
    document.addEventListener('hshs:auth', function (ev) {
      if (ev.detail && ev.detail.profile) { fillForm(ev.detail.profile); msg(''); }
      else loadFromCloud();
    });
    tryLoad();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire, { once: true });
  else wire();
})();
