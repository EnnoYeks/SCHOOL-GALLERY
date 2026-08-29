(function () {
    function brand() {
        var span = document.querySelector('.logo span');
        if (span && span.textContent !== 'HSHS International') {
            span.textContent = 'HSHS International';
        }
    }
    function start() {
        brand();
        var logo = document.querySelector('.logo');
        if (logo && window.MutationObserver) {
            new MutationObserver(brand).observe(logo, { childList: true, subtree: true, characterData: true });
        }
        document.addEventListener('visibilitychange', brand);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
    setInterval(brand, 1200);
})();
