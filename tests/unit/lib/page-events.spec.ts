// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onPageSwap } from '@lib/page-events';

describe('page-events: onPageSwap', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (window as any).onPageSwap = onPageSwap;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('attaches listener to astro:after-swap event', () => {
    const handler = vi.fn();
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    onPageSwap(handler);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'astro:after-swap',
      expect.any(Function)
    );

    // Dispatch astro:after-swap
    document.dispatchEvent(new Event('astro:after-swap'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('runs immediately when runImmediately is true and readyState is complete', () => {
    const handler = vi.fn();
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      configurable: true,
    });

    onPageSwap(handler, { runImmediately: true });

    expect(handler).toHaveBeenCalledTimes(1);

    // Also fires on after-swap
    document.dispatchEvent(new Event('astro:after-swap'));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('accepts boolean true shorthand for runImmediately', () => {
    const handler = vi.fn();
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      configurable: true,
    });

    onPageSwap(handler, true);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('waits for DOMContentLoaded when readyState is loading and runImmediately is true', () => {
    const handler = vi.fn();
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      configurable: true,
    });

    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    onPageSwap(handler, { runImmediately: true });

    // Should not have run synchronously
    expect(handler).not.toHaveBeenCalled();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function),
      { once: true }
    );

    // Dispatch DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not run immediately when runImmediately is false or omitted', () => {
    const handler = vi.fn();
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      configurable: true,
    });

    onPageSwap(handler);
    expect(handler).not.toHaveBeenCalled();

    onPageSwap(handler, { runImmediately: false });
    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up listeners when unsubscribe function is invoked', () => {
    const handler = vi.fn();
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const unsubscribe = onPageSwap(handler);

    unsubscribe();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'astro:after-swap',
      expect.any(Function)
    );

    // Dispatched event should no longer trigger handler
    document.dispatchEvent(new Event('astro:after-swap'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up DOMContentLoaded listener on unsubscribe if still loading', () => {
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      configurable: true,
    });
    const handler = vi.fn();
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const unsubscribe = onPageSwap(handler, { runImmediately: true });
    unsubscribe();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function)
    );

    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('catches and logs errors without crashing other listeners', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const faultyHandler = vi.fn(() => {
      throw new Error('Handler failure');
    });
    const goodHandler = vi.fn();

    onPageSwap(faultyHandler);
    onPageSwap(goodHandler);

    expect(() => {
      document.dispatchEvent(new Event('astro:after-swap'));
    }).not.toThrow();

    expect(faultyHandler).toHaveBeenCalledTimes(1);
    expect(goodHandler).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('registers onPageSwap on window object', () => {
    expect(window.onPageSwap).toBe(onPageSwap);
  });
});
