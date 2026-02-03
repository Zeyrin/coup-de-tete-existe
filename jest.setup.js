// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for Web APIs (Request, Response, Headers, etc.)
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Web APIs for Next.js API routes
class MockHeaders {
  constructor(init = {}) {
    this._headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this._headers.set(key.toLowerCase(), value);
      });
    }
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }

  has(name) {
    return this._headers.has(name.toLowerCase());
  }

  entries() {
    return this._headers.entries();
  }

  forEach(callback) {
    this._headers.forEach((value, key) => callback(value, key));
  }
}

class MockRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input?.url || '';
    this.method = init.method || 'GET';
    this.headers = new MockHeaders(init.headers || {});
    this._body = init.body;
  }

  async json() {
    return JSON.parse(this._body || '{}');
  }

  async text() {
    return this._body || '';
  }
}

class MockResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new MockHeaders(init.headers || {});
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body;
  }

  async text() {
    if (typeof this._body === 'string') {
      return this._body;
    }
    return JSON.stringify(this._body);
  }

  static json(data, init = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
  }
}

global.Request = MockRequest;
global.Response = MockResponse;
global.Headers = MockHeaders;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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
