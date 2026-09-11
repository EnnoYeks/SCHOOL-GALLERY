/**
 * HSHS Profile · cloud account data + profile picture upload
 */
(function (g) {
  if (g.__hshsProfileCloud) return;
  g.__hshsProfileCloud = true;

  var MAX = 700000;

  function isProfilePage() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    return file === 'profile.html' || document.documentElement.getAttribute('data-hshs-page') === 'profile';
  }

  function cloudProfile() {
    if (g.hshsProfile && g.hshsProfile.uid) return g.hshsProfile;
    try {
      var p = JSON.parse(localStorage.getItem('userProfile') || 'null');
      if (p && p.uid) return p;
    } catch (e) {}
    return null;
  }

  function toUserShape(p) {
    if (!p) return null;
    return {
      id: p.uid || p.id || '',
      uid: p.uid || p.id || '',
      name: p.fullName || p.name || 'HSHS Student',
      fullName: p.fullName || p.name || 'HSHS Student',
      username: p.username || '',
      role: p.role || 'Student',
      classYear: p.classYear || '',
      house: p.house || '',
      bio: p.bio || '',
      headline: p.headline || '',
      avatar: p.photoURL || p.avatar || '',
      photoURL: p.photoURL || p.avatar || '',
      cover: p.coverURL || p.cover || '',
      coverURL: p.coverURL || p.cover || '',
      interests: Array.isArray(p.interests) ? p.interests : [],
      studentId: p.studentId || '',
      email: p.email || '',
      privateAccount: !!p.privateAccount
    };
  }

  function fileToDataUrl(file, maxEdge) {
    maxEdge = maxEdge || 800;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf('image') !== 0) return reject(new Error('Choose an image'));
      if (file.size > 12 * 1024 * 1024) return reject(new Error('Image under 12 MB'));
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width, h = img.height;
          if (w > maxEdge || h > maxEdge) {
            var r = Math.min(maxEdge / w, maxEdge / h);
            w = Math.round(w * r); h = Math.round(h * r);
          }
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          var q = 0.85, url = c.toDataURL('image/jpeg', q);
          while (url.length > MAX && q > 0.45) { q -= 0.1; url = c.toDataURL('image/jpeg', q); }
          if (url.length > MAX) return reject(new Error('Photo still too large'));
          resolve(url);
        };
        img.onerror = function () { reject(new Error('Could not read image')); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error('Could not read file')); };
      reader.readAsDataURL(file);
    });
  }

  function toast(text) {
    var el = document.getElementById('pfCloudToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'pfCloudToast';
      el.className = 'pf-cloud-toast';
      document.body.appendChild(el);
    }
    el.textContent = text || '';
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  function applyAvatar(photo, name) {
    var img = document.getElementById('pfAvaImg');
    var fall = document.getElementById('pfAvaFall');
    if (img) {
      if (photo) { img.src = photo; img.style.display = ''; img.hidden = false; }
      else { img.removeAttribute('src'); img.style.display = 'none'; }
    }
    if (fall) {
      fall.textContent = String(name || '?').charAt(0).toUpperCase();
      fall.style.display = photo ? 'none' : '';
    }
  }

  function applyCover(cover) {
    var el = document.getElementById('pfCover');
    if (!el) return;
    if (cover) {
      el.style.backgroundImage = 'url("' + String(cover).replace(/"/g, '') + '")';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
    }
  }

  function applyProfile(u) {
    if (!u || !isProfilePage()) return;
    var name = u.name || u.fullName || '';
    var user = u.username || '';
    var role = (u.role || 'Student') + (u.classYear ? (' · ' + u.classYear) : '');
    var set = function (id, v) {
      var el = document.getElementById(id);
      if (el) el.textContent = v == null ? '' : v;
    };
    set('pfUser', user ? '@' + user.replace(/^@/, '') : 'profile');
    set('pfName', name);
    set('pfRole', role);
    set('pfBio', u.bio || u.headline || '');
    applyAvatar(u.avatar || u.photoURL || '', name || user);
    applyCover(u.cover || u.coverURL || '');

    var tags = document.getElementById('pfTags');
    if (tags) {
      var bits = [];
      if (u.role) bits.push(u.role);
      if (u.classYear) bits.push(u.classYear);
      if (u.house) bits.push(u.house);
      (u.interests || []).slice(0, 6).forEach(function (x) { bits.push(x); });
      tags.innerHTML = bits.map(function (x) {
        return '<span>' + String(x).replace(/[<>]/g, '') + '</span>';
      }).join('');
    }
    ensurePhotoControls(true);
  }

  function ensurePhotoControls(own) {
    if (!own) return;
    if (!document.getElementById('pfAvaFile')) {
      var input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*'; input.id = 'pfAvaFile';
      input.className = 'pf-hidden-file';
      document.body.appendChild(input);
      input.addEventListener('change', onAvatarPicked);
    }
    if (!document.getElementById('pfCoverFile')) {
      var cInput = document.createElement('input');
      cInput.type = 'file'; cInput.accept = 'image/*'; cInput.id = 'pfCoverFile';
      cInput.className = 'pf-hidden-file';
      document.body.appendChild(cInput);
      cInput.addEventListener('change', onCoverPicked);
    }
    if (!document.getElementById('pfAvaCam')) {
      var btn = document.createElement('button');
      btn.type = 'button'; btn.id = 'pfAvaCam'; btn.className = 'pf-ava-cam';
      btn.setAttribute('aria-label', 'Change profile photo');
      btn.innerHTML = '<i class="fas fa-camera"></i>';
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var f = document.getElementById('pfAvaFile'); if (f) f.click();
      });
      var ava = document.getElementById('pfAva');
      if (ava && ava.parentNode) {
        ava.parentNode.style.position = 'relative';
        ava.parentNode.appendChild(btn);
      }
    }
    var cover = document.getElementById('pfCover');
    if (cover && !document.getElementById('pfCoverCam')) {
      var cbtn = document.createElement('button');
      cbtn.type = 'button'; cbtn.id = 'pfCoverCam'; cbtn.className = 'pf-cover-cam';
      cbtn.innerHTML = '<i class="fas fa-image"></i> Cover';
      cbtn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var f = document.getElementById('pfCoverFile'); if (f) f.click();
      });
      cover.appendChild(cbtn);
    }
  }

  async function savePhotoFields(fields) {
    var user = g.hshsAuthUser;
    if (!user || user.isAnonymous) {
      toast('Sign in to save your photo');
      setTimeout(function () {
        location.href = (location.pathname.indexOf('/index/') !== -1 ? '' : 'index/') + 'login.html';
      }, 800);
      return null;
    }
    var base = cloudProfile() || {};
    var data = Object.assign({}, base, fields, {
      fullName: base.fullName || base.name || user.displayName || 'HSHS Student',
      email: base.email || user.email || ''
    });
    if (g.HshsAuthApi && typeof g.HshsAuthApi.saveProfile === 'function') {
      var saved = await g.HshsAuthApi.saveProfile(user, data);
      g.hshsProfile = saved;
      try { localStorage.setItem('userProfile', JSON.stringify(saved)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('hshs:profile', { detail: { profile: saved } }));
      return saved;
    }
    try { localStorage.setItem('userProfile', JSON.stringify(data)); } catch (e) {}
    g.hshsProfile = data;
    return data;
  }

  function onAvatarPicked(e) {
    var f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    toast('Updating photo…');
    fileToDataUrl(f, 800).then(function (url) {
      applyAvatar(url, (cloudProfile() || {}).fullName);
      return savePhotoFields({ photoURL: url, avatar: url });
    }).then(function (saved) {
      if (saved) { applyProfile(toUserShape(saved)); toast('Profile photo saved'); }
    }).catch(function (err) { toast(err.message || 'Could not save photo'); });
  }

  function onCoverPicked(e) {
    var f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    toast('Updating cover…');
    fileToDataUrl(f, 1400).then(function (url) {
      applyCover(url);
      return savePhotoFields({ coverURL: url, cover: url });
    }).then(function (saved) {
      if (saved) { applyProfile(toUserShape(saved)); toast('Cover photo saved'); }
    }).catch(function (err) { toast(err.message || 'Could not save cover'); });
  }

  async function hydrate() {
    if (!isProfilePage()) return;
    var user = g.hshsAuthUser;
    var p = cloudProfile();
    if (user && !user.isAnonymous && g.HshsAuthApi && g.HshsAuthApi.loadOrCreateProfile) {
      try { p = await g.HshsAuthApi.loadOrCreateProfile(user); } catch (e) { console.warn('[profile-cloud] load', e); }
    }
    var shaped = toUserShape(p);
    if (shaped) {
      applyProfile(shaped);
      var tools = document.getElementById('pfTools');
      if (tools && user && !user.isAnonymous) {
        tools.innerHTML =
          '<button class="pf-btn" type="button" data-pf="edit">Edit profile</button>' +
          '<button class="pf-btn pf-btn-ghost" type="button" id="pfChangePhotoBtn">Photo</button>';
        var pb = document.getElementById('pfChangePhotoBtn');
        if (pb) pb.addEventListener('click', function () {
          var f = document.getElementById('pfAvaFile'); if (f) f.click();
        });
      }
      ensurePhotoControls(!!(user && !user.isAnonymous));
    } else if (!user || user.isAnonymous) {
      ensurePhotoControls(false);
      var tools2 = document.getElementById('pfTools');
      if (tools2) {
        tools2.innerHTML = '<a class="pf-btn" href="login.html" style="text-decoration:none;display:inline-flex;align-items:center">Sign in</a>';
      }
    }
  }

  function boot() {
    if (!isProfilePage()) return;
    var n = 0;
    var iv = setInterval(function () {
      if (document.getElementById('pfAva') || n > 30) { clearInterval(iv); hydrate(); }
      n++;
    }, 120);
  }

  document.addEventListener('hshs:auth', function (ev) {
    if (!isProfilePage()) return;
    if (ev.detail && ev.detail.profile) applyProfile(toUserShape(ev.detail.profile));
    hydrate();
  });
  document.addEventListener('hshs:profile', function (ev) {
    if (!isProfilePage()) return;
    if (ev.detail && ev.detail.profile) applyProfile(toUserShape(ev.detail.profile));
  });
  document.addEventListener('hshs:page', function () { if (isProfilePage()) setTimeout(boot, 50); });
  document.addEventListener('hshs:foundation-ready', function () { setTimeout(boot, 80); }, { once: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 100); });
  else setTimeout(boot, 100);

  g.HshsProfileCloud = { hydrate: hydrate, applyProfile: applyProfile };
})(typeof window !== 'undefined' ? window : globalThis);
