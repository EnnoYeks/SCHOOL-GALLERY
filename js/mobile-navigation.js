// ============================================
// MOBILE NAVIGATION OPTIMIZATION
// ============================================

class MobileNavigation {
    constructor() {
        this.isMobile = typeof Utils !== 'undefined' && Utils.isMobile ? Utils.isMobile() : window.innerWidth <= 768;
        this.init();
    }

    init() {
        if (this.isMobile) {
            this.optimizeForMobile();
            this.setupTouchOptimizations();
        }
        this.setupResponsiveListeners();
        this.loadPageSwipe();
    }

    optimizeForMobile() {
        document.querySelectorAll('.hide-mobile').forEach(function (el) {
            el.style.display = 'none';
        });
        document.querySelectorAll('.show-mobile').forEach(function (el) {
            el.style.display = 'block';
        });
    }

    setupTouchOptimizations() {
        var style = document.createElement('style');
        style.textContent = '@media (hover: none) and (pointer: coarse) { button:hover, a:hover, .clickable:hover { transform: none !important; } }';
        document.head.appendChild(style);
    }

    loadPageSwipe() {
        // Page-to-page swipe is deliberately loaded from the shared mobile
        // navigation so every HSHS page gets the same gesture behavior.
        if (window.__hshsPageSwipe || document.getElementById('hshs-page-swipe-script')) return;

        var style = document.createElement('style');
        style.id = 'hshs-page-swipe-css';
        style.textContent = `
            /* HSHS page swipe: horizontal page movement only. */
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
        script.src = this.getAssetPath('../js/page-swipe.js');
        script.onload = function () {
            document.documentElement.classList.add('hshs-page-swipe-ready');
        };
        document.body.appendChild(script);
    }

    getAssetPath(file) {
        // All current page files live either at / or /index/*.html.
        // Resolve against the current document so Vercel/GitHub Pages paths work.
        try {
            return new URL(file, document.baseURI).href;
        } catch (e) {
            return file;
        }
    }

    setupResponsiveListeners() {
        var self = this;
        var currentBreakpoint = this.getCurrentBreakpoint();
        window.addEventListener('resize', function () {
            var next = self.getCurrentBreakpoint();
            if (next !== currentBreakpoint) {
                currentBreakpoint = next;
                self.handleBreakpointChange(next);
            }
        });
    }

    getCurrentBreakpoint() {
        var width = window.innerWidth;
        if (width <= 640) return 'mobile';
        if (width <= 960) return 'tablet';
        return 'desktop';
    }

    handleBreakpointChange(breakpoint) {
        window.dispatchEvent(new CustomEvent('breakpointchange', { detail: { breakpoint: breakpoint } }));
        if (breakpoint === 'mobile') this.optimizeForMobile();
    }
}

var mobileNav = new MobileNavigation();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNavigation;
}
