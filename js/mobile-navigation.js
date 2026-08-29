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
