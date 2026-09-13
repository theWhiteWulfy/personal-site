/**
 * Page Events Lifecycle Helper
 *
 * Centralizes lifecycle event listener registration (specifically `astro:after-swap`
 * for Astro's ClientRouter) across page transitions and initial loads.
 */

export interface PageSwapOptions {
  /**
   * If true, runs the handler immediately on the current page.
   * If the DOM is still loading, attaches to DOMContentLoaded once.
   * If the DOM is already ready (interactive/complete), executes synchronously.
   * @default false
   */
  runImmediately?: boolean;
}

/**
 * Registers a callback to execute after Astro client-side page swaps (`astro:after-swap`).
 * Optionally executes the callback immediately on initial page load if `runImmediately` is set.
 *
 * @param handler - The callback function to execute.
 * @param options - Options object or boolean shorthand for `runImmediately`.
 * @returns An unsubscribe function that removes all registered listeners.
 */
export function onPageSwap(
  handler: () => void,
  options?: boolean | PageSwapOptions
): () => void {
  // SSR guard: do nothing in non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  if (typeof window !== 'undefined' && !window.onPageSwap) {
    window.onPageSwap = onPageSwap;
  }

  const runImmediately =
    typeof options === 'boolean' ? options : Boolean(options?.runImmediately);

  let domLoadedHandler: (() => void) | null = null;

  // Safe wrapper to prevent one failing handler from breaking other listeners
  const safeExecute = (context: string) => {
    try {
      handler();
    } catch (error) {
      console.error(`Error in onPageSwap handler (${context}):`, error);
    }
  };

  const swapHandler = () => safeExecute('astro:after-swap');

  if (runImmediately) {
    if (document.readyState === 'loading') {
      domLoadedHandler = () => {
        safeExecute('DOMContentLoaded');
        domLoadedHandler = null;
      };
      document.addEventListener('DOMContentLoaded', domLoadedHandler, { once: true });
    } else {
      safeExecute('immediate');
    }
  }

  document.addEventListener('astro:after-swap', swapHandler);

  return () => {
    document.removeEventListener('astro:after-swap', swapHandler);
    if (domLoadedHandler) {
      document.removeEventListener('DOMContentLoaded', domLoadedHandler);
      domLoadedHandler = null;
    }
  };
}

// Augment Window interface for TypeScript
declare global {
  interface Window {
    onPageSwap?: typeof onPageSwap;
  }
}

// Expose on global window for inline scripts and Astro define:vars scripts
if (typeof window !== 'undefined') {
  window.onPageSwap = onPageSwap;
}

export default onPageSwap;
