/**
 * Task ID: TSK-025
 * Description: Unit tests validating the Astro Content Collections configuration
 */

import { describe, it, expect } from 'vitest';
import { collections } from '../../src/content/config';
import { z } from 'astro/zod';

describe('Astro Content Collections Schema', () => {
  it('has exactly 8 collections defined', () => {
    const keys = Object.keys(collections);
    expect(keys).toHaveLength(8);
    expect(keys).toEqual(
      expect.arrayContaining([
        'articles',
        'notes',
        'works',
        'illustrations',
        'bibliophilediaries',
        'faqs',
        'saasguide',
        'albums',
      ])
    );
  });

  const contentCollections = [
    'articles',
    'notes',
    'works',
    'illustrations',
    'bibliophilediaries',
    'saasguide',
    'faqs',
  ];

  contentCollections.forEach((name) => {
    describe(`Collection: ${name}`, () => {
      const collection = (collections as any)[name];

      it('is defined with type "content"', () => {
        expect(collection.type).toBe('content');
      });

      it('validates a correct minimal entry', () => {
        const isFaq = name === 'faqs';
        const minimalData: Record<string, any> = {
          title: 'Test Entry',
          path: '/test-path',
          date: '2024-01-01',
          last_modified_at: '2024-01-02',
        };

        if (isFaq) {
          minimalData.order = 1;
        } else {
          minimalData.excerpt = 'This is a test excerpt of sufficient length.';
        }

        const result = collection.schema.safeParse(minimalData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.date).toBeInstanceOf(Date);
          expect(result.data.last_modified_at).toBeInstanceOf(Date);
        }
      });

      it('fails validation when required fields are missing', () => {
        const result = (collection.schema as any).safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
          const missingFields = result.error.issues.map((i: any) => i.path[0]);
          expect(missingFields).toContain('title');
          expect(missingFields).toContain('path');
          expect(missingFields).toContain('date');
          expect(missingFields).toContain('last_modified_at');
        }
      });
    });
  });

  describe('Specific Collection Field Constraints', () => {
    it('requires excerpt for articles but makes it optional for faqs', () => {
      const articlesData = {
        title: 'Article Title',
        path: '/path',
        date: '2024-01-01',
        last_modified_at: '2024-01-01',
      };
      expect((collections.articles.schema as any).safeParse(articlesData).success).toBe(false);

      const faqsData = {
        title: 'FAQ Title',
        path: '/path',
        order: 1,
        date: '2024-01-01',
        last_modified_at: '2024-01-01',
      };
      expect((collections.faqs.schema as any).safeParse(faqsData).success).toBe(true);
    });

    it('requires order number for faqs', () => {
      const faqsData = {
        title: 'FAQ Title',
        path: '/path',
        date: '2024-01-01',
        last_modified_at: '2024-01-01',
      };
      const result = (collections.faqs.schema as any).safeParse(faqsData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.map((i: any) => i.path[0])).toContain('order');
      }
    });

    it('allows optional output boolean on works', () => {
      const worksData = {
        title: 'Work Title',
        path: '/path',
        date: '2024-01-01',
        last_modified_at: '2024-01-01',
        excerpt: 'Test excerpt',
        output: true,
      };
      const result = (collections.works.schema as any).safeParse(worksData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.output).toBe(true);
      }
    });
  });

  describe('Collection: albums', () => {
    it('is defined with type "data"', () => {
      expect(collections.albums.type).toBe('data');
    });

    it('validates album schema with cover image helper', () => {
      // Call the schema function using a stubbed image() function returning a ZodString
      const mockImage = () => z.string();
      const albumSchema = (collections.albums.schema as any)({ image: mockImage });

      const validAlbum = {
        title: 'Photo Album',
        description: 'A collection of photos',
        cover: '/src/images/cover.jpg',
      };

      const result = albumSchema.safeParse(validAlbum);
      expect(result.success).toBe(true);

      const invalidAlbum = {
        title: 'Photo Album',
        // missing description
        cover: '/src/images/cover.jpg',
      };
      expect(albumSchema.safeParse(invalidAlbum).success).toBe(false);
    });
  });
});
