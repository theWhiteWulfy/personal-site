/**
 * Task ID: TSK-006
 * Unit tests for albums utility function.
 */

import { describe, it, expect } from 'vitest';
import { getAlbumImages } from '@lib/albums';

describe('getAlbumImages', () => {
  it('verifies getAlbumImages returns filtered images for sketches', async () => {
    const result = await getAlbumImages('sketches');
    expect(result.length).toBeGreaterThan(0);
    
    // Each image should either be a string (Vite node asset loader) or an ImageMetadata object (Astro asset compiler)
    for (const img of result) {
      expect(img).toBeDefined();
      if (typeof img === 'string') {
        expect(img).toContain('sketches');
      } else {
        expect(img).toHaveProperty('src');
        expect(typeof img.src).toBe('string');
        expect(img.src).toContain('sketches');
      }
    }
  });

  it('verifies nonexistent returns empty', async () => {
    const result = await getAlbumImages('nonexistent');
    expect(result).toHaveLength(0);
  });

  it('verifies getAlbumImages shuffles/randomizes order', async () => {
    const result1 = await getAlbumImages('sketches');
    if (result1.length > 1) {
      const getSrc = (img: any) => typeof img === 'string' ? img : img.src;
      const src1 = result1.map(getSrc);
      
      // Call multiple times to check if we get a different order (probabilistic check)
      let foundDifferentOrder = false;
      for (let i = 0; i < 20; i++) {
        const result2 = await getAlbumImages('sketches');
        const src2 = result2.map(getSrc);
        
        // Assert that the items are the same
        expect([...src2].sort()).toEqual([...src1].sort());
        
        if (src2[0] !== src1[0]) {
          foundDifferentOrder = true;
          break;
        }
      }
      
      // Since sketches has 2 items, the chance of not getting a different order in 20 tries is 1 in 2^20 (extremely low)
      expect(foundDifferentOrder).toBe(true);
    }
  });
});
