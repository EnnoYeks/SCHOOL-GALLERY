// ============================================
// PARTICLE ANIMATION SYSTEM
// ============================================

class ParticleSystem {
    constructor(containerId = 'particlesContainer', config = {}) {
        this.container = document.getElementById(containerId);
        this.particles = [];
        this.animationId = null;
        
        this.config = {
            count: 50,
            minSize: 2,
            maxSize: 10,
            minOpacity: 0.3,
            maxOpacity: 0.8,
            minDuration: 10,
            maxDuration: 30,
            ...config
        };

        if (this.container) {
            this.init();
        }
    }

    init() {
        // Create particles
        for (let i = 0; i < this.config.count; i++) {
            this.createParticle();
        }

        // Start animation
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    createParticle() {
        const size = Math.random() * (this.config.maxSize - this.config.minSize) + this.config.minSize;
        const duration = Math.random() * (this.config.maxDuration - this.config.minDuration) + this.config.minDuration;
        const opacity = Math.random() * (this.config.maxOpacity - this.config.minOpacity) + this.config.minOpacity;

        const colors = [
    "99,102,241",   // Purple
    "168,85,247",    // Violet
    "59,130,246",    // Blue
    "14,165,233",    // Cyan
    "236,72,153"     // Pink
];
      box-shadow: 0 0 15px rgba(${color}, ${opacity});  

const color = colors[Math.floor(Math.random() * colors.length)];

const particle = {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size,
    opacity,
    color,
    duration,
    startTime: Date.now(),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
};

        // Create DOM element
        const element = document.createElement('div');
        element.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(99, 102, 241, ${opacity}), transparent);
            border-radius: 50%;
            pointer-events: none;
            left: ${particle.x}px;
            top: ${particle.y}px;
        `;
        
        particle.element = element;
        this.container.appendChild(element);
        this.particles.push(particle);
    }

    animate() {
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;

            // Update opacity based on time
            const elapsed = (Date.now() - particle.startTime) / 1000;
            const cycle = (elapsed % particle.duration) / particle.duration;
            const oscillation = Math.sin(cycle * Math.PI * 2);
            const newOpacity = this.config.minOpacity + (this.config.maxOpacity - this.config.minOpacity) * (oscillation * 0.5 + 0.5);

            // Update element
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            particle.element.style.opacity = newOpacity;
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        // Particles stay within new window size
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) particle.x = window.innerWidth;
            if (particle.y > window.innerHeight) particle.y = window.innerHeight;
        });
    }

    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    resume() {
        this.animate();
    }

    destroy() {
        this.pause();
        this.particles.forEach(particle => {
            particle.element.remove();
        });
        this.particles = [];
    }

    addParticles(count) {
        for (let i = 0; i < count; i++) {
            this.createParticle();
        }
    }

    // Emit particles from a point
    emit(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;

            const particle = {
                x,
                y,
                size: Math.random() * 5 + 2,
                opacity: 0.8,
                duration: 1,
                startTime: Date.now(),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.1,
                life: 1
            };

            const element = document.createElement('div');
            element.style.cssText = `
                position: absolute;
                width: ${particle.size}px;
                height: ${particle.size}px;
                background: radial-gradient(circle, rgba(236, 72, 153, 0.8), transparent);
                border-radius: 50%;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
            `;

            particle.element = element;
            this.container.appendChild(element);
            this.particles.push(particle);
        }
    }
}

// Initialize particle system
let particleSystem;

document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('particlesContainer');

    if (!container) return;

    const particleCount = 
        (typeof CONFIG !== "undefined" && CONFIG.theme)
        ? CONFIG.theme.particleCount
        : 80;

    const enabled =
        (typeof CONFIG !== "undefined" && CONFIG.theme)
        ? CONFIG.theme.enableParticles
        : true;

    if (enabled) {
        particleSystem = new ParticleSystem('particlesContainer', {
            count: particleCount
        });
    }

});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}
