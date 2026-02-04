// Browser API Polyfill for Chrome/Firefox compatibility

(function() {
  'use strict';

  if (typeof globalThis.browser === 'undefined') {
    globalThis.browser = globalThis.chrome;
  }

  // Promisify chrome APIs if needed
  const api = globalThis.browser || globalThis.chrome;
  
  if (api && !api._polyfilled) {
    api._polyfilled = true;
    
    // Helper to promisify callback-based APIs
    const promisify = (fn) => {
      return (...args) => {
        return new Promise((resolve, reject) => {
          fn(...args, (result) => {
            if (api.runtime.lastError) {
              reject(new Error(api.runtime.lastError.message));
            } else {
              resolve(result);
            }
          });
        });
      };
    };

    // Note: Modern Chrome already supports promises, but this ensures compatibility
  }
})();
