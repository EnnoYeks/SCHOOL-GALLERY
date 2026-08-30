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
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
    else paint();
})();
