(function (g) {
  'use strict';
  if (g.__hshsDiscoverUi) return;
  g.__hshsDiscoverUi = true;
  function boot() {
    // Real pages render their own empty states. Do not inject stock photos or fake names.
  }
  g.HshsDiscoverUi = { boot: boot };
})(typeof window !== 'undefined' ? window : this);
