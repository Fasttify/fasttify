import '@testing-library/jest-dom';

process.env.APP_ENV = 'test';
process.env.DEV_CACHE_ENABLED = 'true';

global.console.warn = jest.fn();

if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = ((fn: (...args: any[]) => void, ...args: any[]) => {
    return setTimeout(fn, 0, ...args) as unknown;
  }) as typeof setImmediate;
}

if (typeof global.clearImmediate === 'undefined') {
  global.clearImmediate = ((id: any) => {
    clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
  }) as typeof clearImmediate;
}

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

global.Request =
  global.Request ||
  class Request {
    constructor(_input: string | Request, _init?: RequestInit) {}
  };

global.Response =
  global.Response ||
  class Response {
    constructor(_body?: BodyInit | null, _init?: ResponseInit) {}
  };

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
