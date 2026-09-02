(function () {
    if (window.__hshsTt) return;
    function hide() {
        var box = document.getElementById('hshs-tt-overlay');
        if (box && box.parentNode) box.parentNode.removeChild(box);
    }
    window.__hshsTt = { show: function () {}, hide: hide, html: function () { return ''; }, scan: function () {} };
    hide();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hide);
    document.addEventListener('hshs:page', hide);
})();
