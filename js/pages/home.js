/* home page module — original markup, hydrate-first. */
export const pageId = "home";
export const styles = ["css/mobile-shell.css", "css/hshs-theme.css"];
export const scripts = [];
export const rootIds = ["featuredGrid", "exploreBtn"];
export const bodyClass = "light-mode";
export function render() {
  return "<section class=\"hero\">\n        <div class=\"hero-content\">\n            <div class=\"hero-text\">\n                <h1 class=\"hero-title\">HSHS WORLD</h1>\n                <p class=\"hero-subtitle\">Your school. One world. Photos, Vibe, Buzz and memories.</p>\n                <div class=\"hero-description\">The HSHS home for school moments, achievements and community.</div>\n                <div class=\"hero-buttons\">\n                    <button class=\"btn btn-primary\" id=\"exploreBtn\"><i class=\"fas fa-play\"></i> Explore Feed</button>\n                    <button class=\"btn btn-secondary\" id=\"learnMoreBtn\"><i class=\"fas fa-info-circle\"></i> Learn More</button>\n                </div>\n            </div>\n            <div class=\"hero-visual\">\n                <div class=\"hero-image-container\">\n                    <img src=\"https://via.placeholder.com/600x400\" alt=\"HSHS World\" class=\"hero-image\">\n                    <div class=\"hero-overlay\"></div>\n                </div>\n            </div>\n        </div>\n        <div class=\"parallax-shapes\">\n            <div class=\"parallax-item\" style=\"--speed: 0.5\"><i class=\"fas fa-camera\"></i></div>\n            <div class=\"parallax-item\" style=\"--speed: 0.7\"><i class=\"fas fa-video\"></i></div>\n            <div class=\"parallax-item\" style=\"--speed: 0.3\"><i class=\"fas fa-heart\"></i></div>\n            <div class=\"parallax-item\" style=\"--speed: 0.6\"><i class=\"fas fa-share\"></i></div>\n        </div>\n    </section>";
}
export async function init() {
  document.documentElement.classList.remove("hshs-booting");
  document.documentElement.classList.add("hshs-ready");
  document.body.classList.add("has-mobile-shell");
}
