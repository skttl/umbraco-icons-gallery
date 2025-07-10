// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Check if service worker is already registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        console.log('Found existing service worker registration with scope:', registration.scope);
        await registration.unregister();
        console.log('Unregistered existing service worker to ensure clean state');
      }

      // Register the service worker
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registered successfully with scope:', registration.scope);
      
      // Check if the PWA is installable
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        console.log('PWA is installable! Install prompt available.');
      });
      
      // Log when the PWA is installed
      window.addEventListener('appinstalled', (evt) => {
        console.log('PWA was installed successfully!');
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
} else {
  console.warn('Service workers are not supported in this browser. PWA functionality will be limited.');
}
