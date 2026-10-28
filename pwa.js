// Service workers require HTTPS, except on localhost during development.
(() => {
  if (!('serviceWorker' in navigator)) return;
  const localDevelopment = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (location.protocol !== 'https:' && !localDevelopment) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(() => {
      // The website remains usable when offline support cannot be installed.
    });
  }, { once: true });
})();
