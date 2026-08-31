(function () {
    if (window.__hshsDeviceLock) return;
    window.__hshsDeviceLock = true;

    function isPhone() {
        try { return window.matchMedia('(max-width: 1024px)').matches; }
        catch (e) { return window.innerWidth <= 1024; }
    }

    function lockDevice() {
        var phone = isPhone();
        var html = document.documentElement;
        html.classList.toggle('hshs-device-mobile', phone);
        html.classList.toggle('hshs-device-desktop', !phone);
        html.setAttribute('data-hshs-device', phone ? 'mobile' : 'desktop');
        var body = document.body;
        if (body) {
            body.classList.toggle('has-mobile-shell', phone);
            body.classList.toggle('hshs-device-mobile', phone);
            body.classList.toggle('hshs-device-desktop', !phone);
        }
        window.__hshsIsMobile = phone;
        return phone;
    }

    window.__hshsLockDevice = lockDevice;
    window.__hshsIsPhone = isPhone;
    lockDevice();

    var mq;
    try { mq = window.matchMedia('(max-width: 1024px)'); } catch (e) { mq = null; }
    function onBreak() { lockDevice(); }
    if (mq && mq.addEventListener) mq.addEventListener('change', onBreak);
    else if (mq && mq.addListener) mq.addListener(onBreak);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', lockDevice, { once: true });
    }
})();
