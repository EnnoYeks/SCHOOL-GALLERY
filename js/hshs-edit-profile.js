(function () {
  if (window.__hshsEditProfile) return;
  window.__hshsEditProfile = true;

  var INTERESTS = ['STEM','Sports','Music','Art','Debate','Drama','Coding','Photography','Writing','Choir','Dance','Leadership','Environment','Business'];
  var HOUSES = ['—','Eagle','Lion','Falcon','Phoenix','Other'];
  var CLASSES = ['S1','S2','S3','S4','S5','S6','Staff','Alumni'];

  function $(id) { return document.getElementById(id); }
  function val(id) { var el = $(id); return el ? String(el.value || '').trim() : ''; }
  function setVal(id, v) { var el = $(id); if (el) el.value = v == null ? '' : v; }

  function msg(text, ok) {
    var el = $('epMsg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'ep-msg' + (text ? (ok ? ' is-ok' : ' is-error') : '');
  }

  function loadProfile() {
    var p = {};
    try { p = JSON.parse(localStorage.getItem('userProfile') || '{}') || {}; } catch (e) {}
    if (window.hshsProfile) p = Object.assign({}, p, window.hshsProfile);
    try {
      if (window.HshsStore && window.HshsStore.currentUser) {
        var u = window.HshsStore.currentUser();
        if (u) {
          p.fullName = p.fullName || u.name;
          p.username = p.username || u.username;
          p.bio = p.bio || u.bio;
          p.photoURL = p.photoURL || u.avatar || u.photoURL;
          p.classYear = p.classYear || u.classYear;
        }
      }
    } catch (e) {}
    return p;
  }

  function fillForm(p) {
    setVal('epFullName', p.fullName || p.name || '');
    setVal('epUsername', p.username || '');
    setVal('epBio', p.bio || '');
    setVal('epStudentId', p.studentId || '');
    setVal('epClassYear', p.classYear || '');
    setVal('epHouse', p.house || '');
    setVal('epEmail', p.email || '');
    setVal('epPhone', p.phone || '');
    setVal('epLocation', p.location || 'Bududa Kikholo');
    setVal('epWebsite', p.website || '');
    setVal('epInstagram', p.instagram || '');
    setVal('epTiktok', p.tiktok || '');
    setVal('epWhatsapp', p.whatsapp || '');
    setVal('epPronouns', p.pronouns || '');
    setVal('epHeadline', p.headline || '');
    if ($('epShowEmail')) $('epShowEmail').checked = p.showEmail !== false;
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
    var av = $('epAvatarImg');
    var fall = $('epAvatarFall');
    var photo = p.photoURL || p.avatar || '';
    if (av) {
      if (photo) { av.src = photo; av.hidden = false; if (fall) fall.hidden = true; }
      else { av.hidden = true; if (fall) { fall.hidden = false; fall.textContent = String(p.fullName || p.username || '?').charAt(0).toUpperCase(); } }
    }
    var cover = $('epCover');
    if (cover) {
      var c = p.coverURL || p.cover || '';
      cover.style.backgroundImage = c ? 'url("' + c.replace(/"/g, '') + '")' : 'linear-gradient(135deg,#12306b,#1d4ed8 50%,#0ea5e9)';
    }
  }

  function updatePreview(p) {
    p = p || collect();
    var name = $('epPrevName');
    var meta = $('epPrevMeta');
    var img = $('epPrevImg');
    if (name) name.textContent = p.fullName || 'Your name';
    if (meta) meta.textContent = [p.username ? '@' + p.username : '', p.classYear || '', p.headline || ''].filter(Boolean).join(' · ');
    if (img) { if (p.photoURL) img.src = p.photoURL; else img.removeAttribute('src'); }
    var bioCount = $('epBioCount');
    if (bioCount) bioCount.textContent = String((p.bio || '').length) + '/160';
  }

  function collect() {
    var interests = [];
    document.querySelectorAll('[data-interest].is-on').forEach(function (btn) { interests.push(btn.getAttribute('data-interest')); });
    var p = loadProfile();
    return {
      uid: p.uid || window.hshsUid || '',
      email: val('epEmail') || p.email || '',
      fullName: val('epFullName'),
      name: val('epFullName'),
      username: val('epUsername').toLowerCase().replace(/[^a-z0-9._]/g, ''),
      bio: val('epBio').slice(0, 160),
      studentId: val('epStudentId'),
      classYear: val('epClassYear'),
      house: val('epHouse'),
      phone: val('epPhone'),
      location: val('epLocation'),
      website: val('epWebsite'),
      instagram: val('epInstagram').replace(/^@/, ''),
      tiktok: val('epTiktok').replace(/^@/, ''),
      whatsapp: val('epWhatsapp'),
      pronouns: val('epPronouns'),
      headline: val('epHeadline').slice(0, 80),
      interests: interests,
      photoURL: p.photoURL || p.avatar || '',
      avatar: p.photoURL || p.avatar || '',
      coverURL: p.coverURL || p.cover || '',
      cover: p.coverURL || p.cover || '',
      showEmail: !!( $('epShowEmail') && $('epShowEmail').checked ),
      showPhone: !!( $('epShowPhone') && $('epShowPhone').checked ),
      showStudentId: !!( $('epShowStudentId') && $('epShowStudentId').checked ),
      privateAccount: !!( $('epPrivateAccount') && $('epPrivateAccount').checked ),
      allowMessages: !!( $('epAllowMessages') && $('epAllowMessages').checked ),
      showActivity: !!( $('epShowActivity') && $('epShowActivity').checked ),
      role: p.role || 'student',
      isAnonymous: false,
      updatedAt: Date.now()
    };
  }

  function fileToDataUrl(file, max) {
    max = max || 1200;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image') !== 0) return reject(new Error('Choose an image file'));
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width, h = img.height;
          if (w > max || h > max) { var r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r); }
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function saveProfile() {
    var data = collect();
    if (data.fullName.length < 2) { msg('Enter your full name.'); return false; }
    if (data.username && !/^[a-z0-9._]{3,24}$/.test(data.username)) {
      msg('Username: 3–24 characters, letters, numbers, . or _ only.'); return false;
    }
    msg('');
    var btns = document.querySelectorAll('[data-ep-save]');
    btns.forEach(function (b) { b.disabled = true; });
    try {
      localStorage.setItem('userProfile', JSON.stringify(data));
      window.hshsProfile = data;
      try {
        if (window.HshsStore) {
          if (typeof window.HshsStore.updateProfile === 'function') {
            window.HshsStore.updateProfile({ name: data.fullName, username: data.username, bio: data.bio, avatar: data.photoURL, classYear: data.classYear });
          }
          if (typeof window.HshsStore.setUser === 'function') window.HshsStore.setUser(data);
        }
      } catch (e) {}
      if (window.HshsAuthApi && typeof window.HshsAuthApi.saveProfile === 'function' && window.hshsAuthUser && !window.hshsAuthUser.isAnonymous) {
        await window.HshsAuthApi.saveProfile(window.hshsAuthUser, data);
      }
      document.dispatchEvent(new CustomEvent('hshs:profile', { detail: { profile: data } }));
      msg('Profile saved — looking sharp.', true);
      return true;
    } catch (err) {
      msg((err && err.message) || 'Could not save. Try again.');
      return false;
    } finally {
      btns.forEach(function (b) { b.disabled = false; });
    }
  }

  function wire() {
    document.body.classList.add('ep-body');
    var p = loadProfile();
    var classSel = $('epClassYear');
    if (classSel && !classSel.options.length) {
      CLASSES.forEach(function (c) { var o = document.createElement('option'); o.value = c; o.textContent = c; classSel.appendChild(o); });
    }
    var houseSel = $('epHouse');
    if (houseSel && houseSel.options.length <= 1) {
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
    fillForm(p);
    ['epFullName','epUsername','epBio','epHeadline','epClassYear'].forEach(function (id) {
      var el = $(id); if (el) el.addEventListener('input', function () { updatePreview(collect()); });
    });
    document.querySelectorAll('[data-ep-save]').forEach(function (btn) {
      btn.addEventListener('click', function () { saveProfile(); });
    });
    var back = $('epBack');
    if (back) back.addEventListener('click', function (e) {
      e.preventDefault();
      var dest = location.pathname.indexOf('/index/') !== -1 ? 'profile.html' : 'index/profile.html';
      if (window.__hshsNavigate) window.__hshsNavigate(dest); else location.href = dest;
    });
    var avInput = $('epAvatarFile'), avBtn = $('epChangeAvatar');
    if (avBtn && avInput) {
      avBtn.addEventListener('click', function () { avInput.click(); });
      avInput.addEventListener('change', function () {
        var f = avInput.files && avInput.files[0]; if (!f) return;
        fileToDataUrl(f, 800).then(function (url) {
          localStorage.setItem('userProfile', JSON.stringify(Object.assign(collect(), { photoURL: url, avatar: url })));
          window.hshsProfile = Object.assign(loadProfile(), { photoURL: url, avatar: url });
          updateMedia(window.hshsProfile); updatePreview(collect());
          msg('Photo updated — tap Save to keep it.', true);
        }).catch(function (err) { msg(err.message || 'Could not read image'); });
      });
    }
    var covInput = $('epCoverFile'), covBtn = $('epChangeCover');
    if (covBtn && covInput) {
      covBtn.addEventListener('click', function () { covInput.click(); });
      covInput.addEventListener('change', function () {
        var f = covInput.files && covInput.files[0]; if (!f) return;
        fileToDataUrl(f, 1400).then(function (url) {
          localStorage.setItem('userProfile', JSON.stringify(Object.assign(collect(), { coverURL: url, cover: url })));
          window.hshsProfile = Object.assign(loadProfile(), { coverURL: url, cover: url });
          updateMedia(window.hshsProfile);
          msg('Cover updated — tap Save to keep it.', true);
        }).catch(function (err) { msg(err.message || 'Could not read image'); });
      });
    }
    var rmAv = $('epRemoveAvatar');
    if (rmAv) rmAv.addEventListener('click', function () {
      var merged = Object.assign(collect(), { photoURL: '', avatar: '' });
      localStorage.setItem('userProfile', JSON.stringify(merged));
      window.hshsProfile = Object.assign(loadProfile(), { photoURL: '', avatar: '' });
      updateMedia(window.hshsProfile); updatePreview(merged);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire, { once: true });
  else wire();
})();
