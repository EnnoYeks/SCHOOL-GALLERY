const icons = {
  gallery: 'fa-images', photos: 'fa-camera', videos: 'fa-video', trending: 'fa-fire', spotlight: 'fa-star', polls: 'fa-poll', memories: 'fa-clock-rotate-left', profile: 'fa-user', settings: 'fa-gear', admin: 'fa-shield-halved', buzz: 'fa-bolt', saved: 'fa-bookmark', more: 'fa-bars', clips: 'fa-film', notifications: 'fa-bell', about: 'fa-circle-info', contact: 'fa-envelope'
};

const titles = {
  gallery: 'Gallery', photos: 'Photos', videos: 'Videos', trending: 'Trending', spotlight: 'Spotlight', polls: 'Polls', memories: 'Memories', profile: 'Profile', settings: 'Settings', admin: 'Admin Desk', buzz: 'Buzz', saved: 'Saved', more: 'More', clips: 'Clips', notifications: 'Notifications', about: 'About HSHS World', contact: 'Contact Us'
};

const descriptions = {
  gallery: 'Explore the HSHS World collection.', photos: 'School moments captured in photos.', videos: 'Watch the latest HSHS World videos.', trending: 'See what is getting attention across HSHS World.', spotlight: 'Featured students, moments and stories.', polls: 'Share your opinion with the school community.', memories: 'Revisit moments worth remembering.', profile: 'Your HSHS World profile.', settings: 'Manage your HSHS World experience.', admin: 'School administration tools.', buzz: 'Short-form school moments and updates.', saved: 'Posts and moments you saved.', more: 'More HSHS World features.', clips: 'Quick school video clips.', notifications: 'Your latest HSHS World activity.', about: 'The home of HSHS school moments and community.', contact: 'Get in touch with HSHS World.'
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

export function renderPage(type, extra = '') {
  const title = escapeHtml(titles[type] || type);
  const description = escapeHtml(descriptions[type] || 'HSHS World');
  const icon = icons[type] || 'fa-layer-group';
  return `
    <section class="page-container hshs-page hshs-page-${escapeHtml(type)}" data-page="${escapeHtml(type)}">
      <div class="page-header">
        <div class="page-header-icon"><i class="fas ${icon}"></i></div>
        <div><h1 class="page-title">${title}</h1><p class="page-subtitle">${description}</p></div>
      </div>
      ${extra || `
        <div class="content-grid" data-content-grid="${escapeHtml(type)}">
          <div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div>
        </div>
        <div class="empty-state" hidden><i class="fas ${icon}"></i><h2>Nothing here yet</h2><p>New HSHS World content will appear here.</p></div>
      `}
    </section>`;
}

export const pageTitles = titles;
