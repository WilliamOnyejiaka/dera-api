// app.js (CJS wrapper for ESM)
async function loadApp() {
    try {
        await import('./server.mjs');  // Path to your ESM entry point (adjust if needed)
        console.log('ESM app loaded successfully');
    } catch (error) {
        console.error('Failed to load ESM app:', error);
    }
}
loadApp();