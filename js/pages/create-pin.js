/**
 * HSHS Create Pin — clean composer
 */
(function () {
  if (window.__hshsCreatePin) return;
  window.__hshsCreatePin = true;

  function open(previewUrl) {
    if (document.querySelector('.cpin')) return;
    var root = document.createElement('div');
    root.className = 'cpin';
    root.innerHTML =
      '<div class="cpin-head">' +
        '<button type="button" class="cpin-close" aria-label="Close">×</button>' +
        '<h1>Create Pin</h1>' +
        '<span style="width:36px"></span>' +
      '</div>' +
      '<div class="cpin-body">' +
        '<div class="cpin-preview"><img src="' + (previewUrl || '') + '" alt=""></div>' +
        '<div class="cpin-field">' +
          '<label>Title</label>' +
          '<input type="text" maxlength="100" placeholder="Tell everyone what your Pin is about">' +
          '<span class="cpin-count">0/100</span>' +
        '</div>' +
        '<div class="cpin-field">' +
          '<label>Description</label>' +
          '<textarea maxlength="800" placeholder="Describe your Pin"></textarea>' +
          '<span class="cpin-count">0/800</span>' +
        '</div>' +
        '<div class="cpin-field">' +
          '<label>Link</label>' +
          '<input type="url" placeholder="Add your link here">' +
        '</div>' +
        '<button type="button" class="cpin-row"><span>Pick a board</span><span>2 boards ›</span></button>' +
        '<button type="button" class="cpin-row"><span>Tag topics</span><span>Campus ›</span></button>' +
        '<button type="button" class="cpin-row"><span>Sound</span><span>Original ›</span></button>' +
        '<button type="button" class="cpin-row"><span>Filter</span><span>Original ›</span></button>' +
      '</div>' +
      '<div class="cpin-foot">' +
        '<button type="button" class="cpin-draft" aria-label="Save draft">☰</button>' +
        '<button type="button" class="cpin-create">Create</button>' +
      '</div>';

    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';

    root.querySelector('.cpin-close').onclick = close;
    root.querySelector('.cpin-create').onclick = function () {
      close();
    };

    var title = root.querySelector('input[type="text"]');
    var desc = root.querySelector('textarea');
    title.oninput = function () {
      title.parentNode.querySelector('.cpin-count').textContent = title.value.length + '/100';
    };
    desc.oninput = function () {
      desc.parentNode.querySelector('.cpin-count').textContent = desc.value.length + '/800';
    };
  }

  function close() {
    var el = document.querySelector('.cpin');
    if (el) el.remove();
    document.body.style.overflow = '';
  }

  window.__hshsOpenCreatePin = open;
  window.__hshsCloseCreatePin = close;

  // Load CSS
  if (!document.querySelector('link[data-cpin]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = '/css/hshs-create-pin.css?v=261103cpin1';
    l.setAttribute('data-cpin', '1');
    document.head.appendChild(l);
  }
})();
