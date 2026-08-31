// Lightweight particles. Phones get almost none.
class ParticleSystem {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.particles = [];
        this.animationId = null;
        this.config = Object.assign({
            count: 8,
            minSize: 2,
            maxSize: 6,
            minOpacity: 0.15,
            maxOpacity: 0.4
        }, config || {});
        if (this.container) this.init();
    }
    init() {
        var mobile = window.matchMedia('(max-width: 1024px)').matches;
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (mobile || reduce) return;
        var n = Math.min(this.config.count, 16);
        for (var i = 0; i < n; i++) this.createParticle();
        this.animate();
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    }
    createParticle() {
        var size = Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize;
        var particle = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: size,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6
        };
        var el = document.createElement('div');
        el.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;border-radius:50%;pointer-events:none;background:rgba(99,102,241,.28);will-change:transform;';
        particle.element = el;
        this.container.appendChild(el);
        this.particles.push(particle);
    }
    animate() {
        var w = window.innerWidth, h = window.innerHeight;
        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
            p.element.style.transform = 'translate3d(' + p.x + 'px,' + p.y + 'px,0)';
        }
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    handleResize() {}
    pause() { if (this.animationId) cancelAnimationFrame(this.animationId); this.animationId = null; }
    resume() { if (!this.animationId) this.animate(); }
    destroy() {
        this.pause();
        this.particles.forEach(function (p) { if (p.element && p.element.remove) p.element.remove(); });
        this.particles = [];
    }
}
let particleSystem;
document.addEventListener('DOMContentLoaded', function () {
    if (window.matchMedia('(max-width: 1024px)').matches) return;
    if (!document.getElementById('particlesContainer')) return;
    particleSystem = new ParticleSystem('particlesContainer', { count: 12 });
    window.particleSystem = particleSystem;
});
