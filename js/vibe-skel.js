(function () {
    var row = '<article class="vibe-skel-row"><div class="frame vibe-shine"><span class="play"></span></div><div class="lines"><div class="line vibe-shine"></div><div class="line short vibe-shine"></div></div></article>';
    var feat = '<article class="vibe-skel-feat"><div class="frame vibe-shine"><span class="play"></span></div><div class="line vibe-shine"></div><div class="line short vibe-shine"></div></article>';
    window.__hshsVibeSkel = {
        list: row + row + row + row + row,
        featured: feat + feat
    };
    function paint() {
        var f = document.getElementById('featuredVideo');
        var l = document.getElementById('videosContainer');
        if (f && !f.querySelector('.vibe-feat') && !f.querySelector('.vibe-skel-feat')) f.innerHTML = window.__hshsVibeSkel.featured;
        if (l && !l.querySelector('.vibe-row') && !l.querySelector('.vibe-skel-row')) l.innerHTML = window.__hshsVibeSkel.list;
    }
    function emptyOut() {
        var empty = '<div class="hshs-empty" style="padding:24px;text-align:center;opacity:.8">No videos yet. Upload the first HSHS clip.</div>';
        var f = document.getElementById('featuredVideo');
        var l = document.getElementById('videosContainer');
        if (f && f.querySelector('.vibe-skel-feat') && !f.querySelector('.vibe-feat')) f.innerHTML = empty;
        if (l && l.querySelector('.vibe-skel-row') && !l.querySelector('.vibe-row')) l.innerHTML = empty;
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
    else paint();
    setTimeout(emptyOut, 2200);
})();
