// ============================================
// HSHS MOBILE / TOUCH ENHANCEMENTS
// ============================================
// Responsive layout is handled by CSS media queries.
// This file must NOT decide whether the device is mobile on every page load.

(function () {
    if (window.__hshsMobileEnhancements) return;
    window.__hshsMobileEnhancements = true;

    function setupTouchOptimizations() {
        if (document.getElementById('hshs-touch-css')) return;

        var style = document.createElement('style');
        style.id = 'hshs-touch-css';
        style.textContent = '@media (hover: none) and (pointer: coarse) { button:hover, a:hover, .clickable:hover { transform: none !important; } }';
        document.head.appendChild(style);
    }

    function loadPageSwipe() {
        // Page-to-page swipe is deliberately shared across HSHS pages.
        if (window.__hshsPageSwipe || document.getElementById('hshs-page-swipe-script')) return;

        var style = document.createElement('style');
        style.id = 'hshs-page-swipe-css';
        style.textContent = `
            #hshs-page,
            body > main,
            body > .page-content,
            body > .content {
                will-change: transform;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            }

            .hshs-swipe-dragging {
                user-select: none !important;
                -webkit-user-select: none !important;
            }

            .hshs-swipe-transition {
                animation: hshsSwipeOutNext 180ms cubic-bezier(.22,.72,0,1) both;
            }

            .hshs-swipe-transition[style*="previous"] {
                animation-name: hshsSwipeOutPrevious;
            }

            @keyframes hshsSwipeOutNext {
                from { opacity: 1; filter: blur(0); }
                to { opacity: .94; filter: blur(.2px); }
            }

            @keyframes hshsSwipeOutPrevious {
                from { opacity: 1; filter: blur(0); }
                to { opacity: .94; filter: blur(.2px); }
            }

            @media (prefers-reduced-motion: reduce) {
                .hshs-swipe-transition { animation: none !important; }
            }
        `;
        document.head.appendChild(style);

        var script = document.createElement('script');
        script.id = 'hshs-page-swipe-script';
        script.src = getAssetPath('../js/page-swipe.js');
        script.onload = function () {
            document.documentElement.classList.add('hshs-page-swipe-ready');
        };
        document.body.appendChild(script);
    }

    function getAssetPath(file) {
        try {
            return new URL(file, document.baseURI).href;
        } catch (e) {
            return file;
        }
    }

    function init() {
        setupTouchOptimizations();
        loadPageSwipe();
    }

    // No device detection and no resize polling here.
    // CSS handles mobile/tablet/desktop layout from the first render.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { init: init };
    }
})();
