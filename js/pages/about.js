/**
 * About page renderer for HSHS World (thin-shell pattern).
 * Populates #hshsAboutRoot with the About content.
 */

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, function (ch) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
  });
}

function aboutMarkup() {
  return `
    <div class="container" style="padding: 2rem; position: relative; z-index: 10; margin-top: 60px;">
      <div style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 20px; padding: 4rem 2rem; color: white; margin-bottom: 3rem; text-align: center;">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem;">About HSHS World</h1>
        <p style="font-size: 1.1rem; opacity: 0.95;">Your premier platform for capturing and celebrating school memories</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; align-items: center;">
        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); padding: 2rem; box-shadow: var(--shadow-md);">
          <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary);">
            <i class="fas fa-eye"></i> Our Vision
          </h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 1rem;">
            To create a vibrant digital community where every student's achievement, creativity, and personality shine through beautifully curated content and meaningful engagement.
          </p>
          <p style="color: var(--text-secondary); line-height: 1.8;">
            We believe in celebrating every moment, no matter how small, because every memory contributes to the rich tapestry of school life.
          </p>
        </div>
        <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=70" alt="Vision" style="border-radius: 15px; width: 100%; box-shadow: var(--shadow-lg);">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; align-items: center;">
        <img src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=70" alt="Mission" style="border-radius: 15px; width: 100%; box-shadow: var(--shadow-lg);">
        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); padding: 2rem; box-shadow: var(--shadow-md);">
          <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary);">
            <i class="fas fa-bullseye"></i> Our Mission
          </h2>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 1rem;">
            To empower students and staff with a cutting-edge platform that seamlessly blends social media features with educational value, making it easy to share achievements, celebrate milestones, and strengthen school community bonds.
          </p>
          <p style="color: var(--text-secondary); line-height: 1.8;">
            Every post, comment, and share strengthens the fabric of our school community.
          </p>
        </div>
      </div>

      <div style="margin-bottom: 3rem;">
        <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 2rem; text-align: center; color: var(--text-primary);">Why Choose Us?</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
          <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); padding: 2rem; text-align: center; box-shadow: var(--shadow-md);">
            <div style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"><i class="fas fa-smartphone"></i></div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">Mobile-First Design</h3>
            <p style="color: var(--text-secondary);">Optimized for all devices, ensuring a seamless experience whether on phone, tablet, or desktop.</p>
          </div>
          <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); padding: 2rem; text-align: center; box-shadow: var(--shadow-md);">
            <div style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 1rem;"><i class="fas fa-shield-alt"></i></div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">Secure & Safe</h3>
            <p style="color: var(--text-secondary);">Built with security in mind, protecting student privacy while enabling safe community engagement.</p>
          </div>
          <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); padding: 2rem; text-align: center; box-shadow: var(--shadow-md);">
            <div style="font-size: 3rem; color: var(--accent-color, #f59e0b); margin-bottom: 1rem;"><i class="fas fa-rocket"></i></div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">Lightning Fast</h3>
            <p style="color: var(--text-secondary);">Optimized performance ensures smooth browsing and instant content loading every time.</p>
          </div>
          <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); padding: 2rem; text-align: center; box-shadow: var(--shadow-md);">
            <div style="font-size: 3rem; color: var(--success-color, #10b981); margin-bottom: 1rem;"><i class="fas fa-users"></i></div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">Community Focused</h3>
            <p style="color: var(--text-secondary);">Built to foster connections, celebrate achievements, and strengthen school bonds.</p>
          </div>
          <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); padding: 2rem; text-align: center; box-shadow: var(--shadow-md);">
            <div style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"><i class="fas fa-palette"></i></div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">Customizable</h3>
            <p style="color: var(--text-secondary);">Personalize your experience with themes, layouts, and notification preferences.</p>
          </div>
          <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); padding: 2rem; text-align: center; box-shadow: var(--shadow-md);">
            <div style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 1rem;"><i class="fas fa-chart-line"></i></div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-primary);">Analytics & Insights</h3>
            <p style="color: var(--text-secondary);">Track engagement, understand trends, and measure impact with detailed analytics.</p>
          </div>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 20px; padding: 3rem 2rem; color: white; text-align: center; margin-bottom: 3rem;">
        <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 2rem;">By The Numbers</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 2rem;">
          <div><div style="font-size: 2.5rem; font-weight: 800;">10,000+</div><div style="font-size: 1rem; opacity: 0.9;">Posts Shared</div></div>
          <div><div style="font-size: 2.5rem; font-weight: 800;">50,000+</div><div style="font-size: 1rem; opacity: 0.9;">Likes & Reactions</div></div>
          <div><div style="font-size: 2.5rem; font-weight: 800;">1,500+</div><div style="font-size: 1rem; opacity: 0.9;">Active Students</div></div>
          <div><div style="font-size: 2.5rem; font-weight: 800;">100%</div><div style="font-size: 1rem; opacity: 0.9;">Free & Open</div></div>
        </div>
      </div>

      <div style="text-align: center; padding: 2rem; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 15px; backdrop-filter: blur(10px); box-shadow: var(--shadow-md);">
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary);">Ready to Join?</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Start sharing your school memories today and be part of our growing community!</p>
        <a href="gallery.html" style="display: inline-block; padding: 1rem 2rem; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border-radius: 50px; text-decoration: none; font-weight: 600; transition: all 0.3s ease;">
          <i class="fas fa-play"></i> Explore Gallery Now
        </a>
      </div>
    </div>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>HSHS World</h4>
            <p>The ultimate platform for school memories and community engagement.</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <a href="../index.html">Home</a>
            <a href="about.html">About</a>
            <a href="gallery.html">Gallery</a>
            <a href="contat.html">Contact</a>
          </div>
          <div class="footer-section">
            <h4>Resources</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">FAQ</a>
            <a href="#">Support</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 HSHS World. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

export async function render() {
  return aboutMarkup();
}

export function init({ root } = {}) {
  const target = root || document.getElementById('hshsAboutRoot');
  if (!target) return;
  target.innerHTML = aboutMarkup();
}

// Auto-boot when loaded as a page script
(function boot() {
  function run() {
    const root = document.getElementById('hshsAboutRoot');
    if (root) {
      root.innerHTML = aboutMarkup();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
