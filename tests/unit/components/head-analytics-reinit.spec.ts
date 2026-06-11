// @vitest-environment jsdom
/**
 * Task ID: TSK-015
 * Unit tests for analytics re-initialization handler logic in Head.astro.
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Head Analytics Re-initialization', () => {
  let handlerCode: string;
  let trackConversionEventMock: any;
  let swapListeners: any[] = [];
  const originalAddEventListener = document.addEventListener;
  const originalRemoveEventListener = document.removeEventListener;
  const originalDispatchEvent = document.dispatchEvent;

  beforeAll(() => {
    // Intercept document.addEventListener/removeEventListener/dispatchEvent specifically for astro:after-swap
    document.addEventListener = function (type: string, listener: any, options?: any) {
      if (type === 'astro:after-swap') {
        swapListeners.push(listener);
      } else {
        return originalAddEventListener.call(this, type, listener, options);
      }
    };

    document.removeEventListener = function (type: string, listener: any, options?: any) {
      if (type === 'astro:after-swap') {
        swapListeners = swapListeners.filter(l => l !== listener);
      } else {
        return originalRemoveEventListener.call(this, type, listener, options);
      }
    };

    document.dispatchEvent = function (event: Event) {
      if (event.type === 'astro:after-swap') {
        for (const listener of swapListeners) {
          if (typeof listener === 'function') {
            listener();
          } else if (listener && typeof (listener as any).handleEvent === 'function') {
            (listener as any).handleEvent();
          }
        }
        return true;
      }
      return originalDispatchEvent.call(this, event);
    };

    // Read the Head.astro file and extract the astro:after-swap listener logic
    const headPath = path.resolve(__dirname, '../../../src/components/Head.astro');
    const headContent = fs.readFileSync(headPath, 'utf8');

    // Extract the listener block
    const comment = '// Re-attach event listeners for phone and email tracking';
    const commentIndex = headContent.indexOf(comment);
    if (commentIndex === -1) {
      throw new Error('Could not find the re-attach comment in Head.astro');
    }

    const openTag = "document.addEventListener('astro:after-swap'";
    const openIndex = headContent.lastIndexOf(openTag, commentIndex);
    if (openIndex === -1) {
      throw new Error('Could not find the opening addEventListener before the comment');
    }

    let braceCount = 0;
    let closedIndex = -1;
    const startSearching = headContent.indexOf('{', openIndex);
    if (startSearching === -1) {
      throw new Error('Could not find opening brace of the event listener');
    }

    for (let i = startSearching; i < headContent.length; i++) {
      if (headContent[i] === '{') {
        braceCount++;
      } else if (headContent[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          if (headContent.substring(i, i + 2) === '})' || headContent.substring(i, i + 3) === '});') {
            closedIndex = i + (headContent[i + 2] === ';' ? 3 : 2);
            break;
          }
        }
      }
    }

    if (closedIndex === -1) {
      throw new Error('Could not find matching closing brace for the event listener');
    }

    handlerCode = headContent.substring(openIndex, closedIndex);
  });

  afterAll(() => {
    // Restore original functions
    document.addEventListener = originalAddEventListener;
    document.removeEventListener = originalRemoveEventListener;
    document.dispatchEvent = originalDispatchEvent;
  });

  beforeEach(() => {
    // Set up mock DOM
    document.body.innerHTML = `
      <div id="container">
        <a id="tel-link" href="tel:+911234567890">Call</a>
        <a id="mailto-link" href="mailto:test@test.com">Email</a>
      </div>
    `;

    // Prevent default navigation for all mock anchor links to avoid JSDOM navigation warnings
    document.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => e.preventDefault());
    });

    // Mock trackConversionEvent on window and global
    trackConversionEventMock = vi.fn();
    (window as any).trackConversionEvent = trackConversionEventMock;
    (global as any).trackConversionEvent = trackConversionEventMock;

    // Evaluate the handler code to register the 'astro:after-swap' listener
    eval(handlerCode);
  });

  afterEach(() => {
    // Clean up DOM and mocks
    document.body.innerHTML = '';
    swapListeners = [];

    delete (window as any).trackConversionEvent;
    delete (global as any).trackConversionEvent;
    vi.clearAllMocks();
  });

  it('should extract the handler code correctly', () => {
    expect(handlerCode).toContain("document.addEventListener('astro:after-swap'");
    expect(handlerCode).toContain("phone_click");
    expect(handlerCode).toContain("email_click");
  });

  it('should not track clicks before astro:after-swap is dispatched', () => {
    const telLink = document.getElementById('tel-link') as HTMLAnchorElement;
    const mailtoLink = document.getElementById('mailto-link') as HTMLAnchorElement;

    telLink.click();
    expect(trackConversionEventMock).not.toHaveBeenCalled();

    mailtoLink.click();
    expect(trackConversionEventMock).not.toHaveBeenCalled();
  });

  it('should track clicks after astro:after-swap is dispatched', () => {
    // Dispatch the astro:after-swap event
    document.dispatchEvent(new Event('astro:after-swap'));

    const telLink = document.getElementById('tel-link') as HTMLAnchorElement;
    const mailtoLink = document.getElementById('mailto-link') as HTMLAnchorElement;

    // Click tel link
    telLink.click();
    expect(trackConversionEventMock).toHaveBeenCalledTimes(1);
    expect(trackConversionEventMock).toHaveBeenLastCalledWith('phone_click', {
      conversion_type: 'phone_contact',
      phone_number: '+911234567890',
      value: 10
    });

    // Click mailto link
    mailtoLink.click();
    expect(trackConversionEventMock).toHaveBeenCalledTimes(2);
    expect(trackConversionEventMock).toHaveBeenLastCalledWith('email_click', {
      conversion_type: 'email_contact',
      email_address: 'test@test.com',
      value: 8
    });
  });

  it('should handle mailto and tel links with query parameters or special characters', () => {
    document.body.innerHTML = `
      <div id="container">
        <a id="tel-link" href="tel:+1-800-555-0199?extension=123">Call Support</a>
        <a id="mailto-link" href="mailto:support@test.com?subject=Help">Email Support</a>
      </div>
    `;

    document.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => e.preventDefault());
    });

    document.dispatchEvent(new Event('astro:after-swap'));

    const telLink = document.getElementById('tel-link') as HTMLAnchorElement;
    const mailtoLink = document.getElementById('mailto-link') as HTMLAnchorElement;

    telLink.click();
    expect(trackConversionEventMock).toHaveBeenLastCalledWith('phone_click', {
      conversion_type: 'phone_contact',
      phone_number: '+1-800-555-0199?extension=123',
      value: 10
    });

    mailtoLink.click();
    expect(trackConversionEventMock).toHaveBeenLastCalledWith('email_click', {
      conversion_type: 'email_contact',
      email_address: 'support@test.com?subject=Help',
      value: 8
    });
  });

  it('should re-attach event listeners to new DOM elements when astro:after-swap is dispatched again', () => {
    // 1. Dispatch first time to bind to initial DOM
    document.dispatchEvent(new Event('astro:after-swap'));

    const telLink = document.getElementById('tel-link') as HTMLAnchorElement;
    telLink.click();
    expect(trackConversionEventMock).toHaveBeenCalledTimes(1);
    expect(trackConversionEventMock).toHaveBeenLastCalledWith('phone_click', expect.objectContaining({
      phone_number: '+911234567890'
    }));

    // Reset mocks for the next stage
    trackConversionEventMock.mockClear();

    // 2. Simulate page swap by replacing elements with new ones
    const container = document.getElementById('container')!;
    container.innerHTML = `
      <a id="new-tel-link" href="tel:+19876543210">Call New</a>
      <a id="new-mailto-link" href="mailto:new@test.com">Email New</a>
    `;

    container.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => e.preventDefault());
    });

    const newTelLink = document.getElementById('new-tel-link') as HTMLAnchorElement;
    const newMailtoLink = document.getElementById('new-mailto-link') as HTMLAnchorElement;

    // Clicking before dispatching astro:after-swap should not trigger mock
    newTelLink.click();
    newMailtoLink.click();
    expect(trackConversionEventMock).not.toHaveBeenCalled();

    // 3. Dispatch astro:after-swap again to attach listeners to the new elements
    document.dispatchEvent(new Event('astro:after-swap'));

    newTelLink.click();
    expect(trackConversionEventMock).toHaveBeenCalledTimes(1);
    expect(trackConversionEventMock).toHaveBeenLastCalledWith('phone_click', {
      conversion_type: 'phone_contact',
      phone_number: '+19876543210',
      value: 10
    });

    newMailtoLink.click();
    expect(trackConversionEventMock).toHaveBeenCalledTimes(2);
    expect(trackConversionEventMock).toHaveBeenLastCalledWith('email_click', {
      conversion_type: 'email_contact',
      email_address: 'new@test.com',
      value: 8
    });
  });
});
