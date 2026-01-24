// Setup environment for Node execution
process.env.NODE_ENV = 'test';
// process.env.VITE_XAI_API_KEY = 'mock-key'; // Commented out to force Grok unavailable

// Block Network Calls
global.fetch = (() => {
  // console.log('🛑 Network request blocked by simulation'); // Too noisy?
  return Promise.reject(new Error('Network disabled in simulation'));
}) as any;

// Mock Browser Environment
if (typeof global.window === 'undefined') {
  (global as any).window = {
    open: () => {},
    history: { pushState: () => {} },
    location: { href: 'http://localhost' }
  };
}

if (typeof global.document === 'undefined') {
  (global as any).document = { title: 'Test' };
}

// Navigator is read-only in newer Node versions
try {
  Object.defineProperty(global, 'navigator', {
    value: { vibrate: () => {} },
    writable: true,
    configurable: true
  });
} catch (e) {
  // If it exists and is read-only, we might be fine or we might crash later
  console.warn('Could not mock navigator:', e);
}

// LocalStorage
if (typeof global.localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}
