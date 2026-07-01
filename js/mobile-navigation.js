// ============================================
// MOBILE NAVIGATION OPTIMIZATION
// ============================================

class MobileNavigation {
    constructor() {
        this.isMobile = Utils.isMobile();
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
        // Hide desktop-only elements
        const desktopElements = document.querySelectorAll('.hide-mobile');
        desktopElements.forEach(el => {
            el.style.display = 'none';
        });

        // Show mobile-only elements
        const mobileElements = document.querySelectorAll('.show-mobile');
        mobileElements.forEach(el => {
            el.style.display = 'block';
        });

        // Optimize touch targets
        this.enlargeTouchTargets();
    }

    enlargeTouchTargets() {
        // Ensure buttons and links are at least 44x44px
        const buttons = document.querySelectorAll('button, a, .clickable');
        buttons.forEach(btn => {
            const style = window.getComputedStyle(btn);
            const height = parseFloat(style.height);
            const width = parseFloat(style.width);

            if (height < 44 || width < 44) {
                btn.style.padding = '0.75rem 1rem';
                btn.style.minHeight = '44px';
                btn.style.minWidth = '44px';
            }
        });
    }

    setupTouchOptimizations() {
        // Remove hover states on touch devices
        const style = document.createElement('style');
        style.textContent = `
            @media (hover: none) and (pointer: coarse) {
                button:hover,
                a:hover,
                .clickable:hover {
                    transform: none !important;
                }
            }
        `;
        document.head.appendChild(style);

        // Disable double-tap zoom delay
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupResponsiveListeners() {
        let currentBreakpoint = this.getCurrentBreakpoint();

        window.addEventListener('resize', () => {
            const newBreakpoint = this.getCurrentBreakpoint();
            
            if (newBreakpoint !== currentBreakpoint) {
                currentBreakpoint = newBreakpoint;
                this.handleBreakpointChange(newBreakpoint);
            }
        });
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        if (width <= 640) return 'mobile';
        if (width <= 960) return 'tablet';
        return 'desktop';
    }

    handleBreakpointChange(breakpoint) {
        console.log('Breakpoint changed to:', breakpoint);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('breakpointchange', {
            detail: { breakpoint }
        }));

        // Adjust layout if needed
        if (breakpoint === 'mobile') {
            this.optimizeForMobile();
        }
    }

    // Get safe area insets (for notched phones)
    getSafeAreaInsets() {
        const top = CSS.supports('padding: max(0px)') 
            ? 'max(0px, env(safe-area-inset-top))'
            : '0';
        const bottom = CSS.supports('padding: max(0px)') 
            ? 'max(0px, env(safe-area-inset-bottom))'
            : '0';
        
        return { top, bottom };
    }

    // Optimize scrolling
    enableFastScroll() {
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitUserSelect = 'none';
    }
}

// Initialize mobile navigation
const mobileNav = new MobileNavigation();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNavigation;
}
