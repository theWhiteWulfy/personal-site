# Implementation Plan

- [ ] 1. Set up database schema and core infrastructure
  - [ ] 1.1 Create D1 database tables for engagement features
    - Create database migration script for reactions, comments, and indieweb_data tables
    - Add proper indexes for performance optimization
    - Update wrangler.toml with database binding configuration
    - _Requirements: 7.1, 7.3_

  - [ ] 1.2 Create database utility functions
    - Build src/lib/database.ts with connection helpers and query functions
    - Implement CRUD operations for reactions, comments, and IndieWeb data
    - Add error handling and connection management utilities
    - _Requirements: 7.1, 7.2, 7.4_

- [ ] 2. Implement analytics integration and performance optimization
  - [ ] 2.1 Create analytics configuration and tracking utilities
    - Create src/lib/analytics.ts with GA4 and Clarity configuration interfaces
    - Implement event tracking functions for engagement interactions (reactions, comments)
    - Build privacy-compliant analytics initialization with opt-out mechanisms
    - Create utility functions for custom event parameters and conversion tracking
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 2.2 Add GA4 and Microsoft Clarity tracking to Head component
    - Add GA4 tracking script with proper configuration in Head.astro
    - Integrate Microsoft Clarity tracking code with privacy considerations
    - Update site.js configuration with new tracking IDs
    - Add conditional loading based on user consent
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 2.3 Implement performance optimization with resource hints
    - Add DNS prefetch for external resources (fonts, analytics, captcha services)
    - Implement preconnect hints for critical third-party resources
    - Add preload hints for critical fonts and assets to prevent layout shifts
    - Monitor and maintain Core Web Vitals scores during implementation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3. Build reactions system
  - [ ] 3.1 Create reactions API endpoints
    - Build src/pages/api/reactions.ts with POST endpoint for adding reactions
    - Implement GET endpoint for fetching reaction counts
    - Add user identification system using IP hashing or session IDs
    - Implement rate limiting and duplicate reaction prevention
    - Add proper validation, error handling, and database integration
    - _Requirements: 2.1, 2.2, 2.5, 7.2, 7.4_

  - [ ] 3.2 Create Reactions component
    - Build src/components/Reactions.astro with three reaction types (like, love, bookmark)
    - Implement client-side JavaScript for reaction button interactions
    - Add real-time count updates and visual feedback
    - Create CSS styling for reaction buttons and animations
    - Add configuration option to disable reactions per content collection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1_

  - [ ] 3.3 Integrate reactions into content collections
    - Update content collection templates to include Reactions component
    - Add collection-level configuration for enabling/disabling reactions
    - Implement analytics tracking for reaction events
    - Test reactions across different content types (articles, notes, works)
    - _Requirements: 2.4, 6.1, 4.3_

- [ ] 4. Build comments system with captcha
  - [ ] 4.1 Create comments API endpoints
    - Build src/pages/api/comments.ts with POST endpoint for comment submission
    - Implement GET endpoint for fetching approved comments
    - Add captcha verification integration (hCaptcha or reCAPTCHA)
    - Implement comment validation, sanitization, and spam protection
    - Add database storage with proper indexing and moderation flags
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 7.2, 7.4_

  - [ ] 4.2 Create Comments component
    - Build src/components/Comments.astro with comment form and display
    - Implement form validation for name, email, and content fields
    - Integrate captcha service for spam protection
    - Add comment display with chronological ordering and author information
    - Create CSS styling for comment form and comment threads
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [ ] 4.3 Add comment moderation and management
    - Create admin interface for comment approval and moderation
    - Implement comment filtering and spam detection
    - Add email notifications for new comments (optional)
    - Build analytics tracking for comment submission events
    - Add collection-level configuration for enabling/disabling comments
    - _Requirements: 3.3, 6.2, 6.3, 4.3_

- [ ] 5. Implement IndieWeb and Micropub integration
  - [ ] 5.1 Create IndieAuth authentication system
    - Build src/pages/api/auth/indieauth.ts for IndieAuth endpoint
    - Implement token verification and scope management
    - Add proper authentication headers and security measures
    - Create utility functions for token validation and user identification
    - _Requirements: 1.3, 7.2, 7.4_

  - [ ] 5.2 Build Micropub endpoint
    - Create src/pages/api/micropub.ts with GET and POST handlers
    - Implement JSON and form-encoded request processing
    - Add content creation functionality for different post types
    - Build content validation and frontmatter generation
    - Integrate with existing content collections and file system
    - _Requirements: 1.1, 1.2, 7.2, 7.4_

  - [ ] 5.3 Add microformats markup to content templates
    - Update content collection templates with h-entry microformats
    - Add proper h-card markup for author information
    - Implement rel attributes for IndieWeb discovery
    - Add microformats to navigation and site structure
    - Validate microformats markup with parser tools
    - _Requirements: 1.5, 6.5_

  - [ ] 5.4 Implement webmention handling
    - Create src/pages/api/webmention.ts for receiving webmentions
    - Build webmention verification and processing logic
    - Add d1 database storage for webmention data
    - Implement webmention display on content pages
    - Add webmention sending for outbound links (optional)
    - _Requirements: 1.4, 7.1, 7.2_

- [ ] 6. Create content collection configuration system
  - [ ] 6.1 Build engagement configuration utilities
    - Create src/lib/engagement-config.ts for collection-level settings
    - Implement configuration schema for reactions and comments per collection
    - Add default settings and override mechanisms
    - Build validation for engagement configuration options
    - _Requirements: 6.1, 6.2_

  - [ ] 6.2 Update content collection schemas
    - Modify src/content/config.ts to include engagement settings
    - Add frontmatter options for disabling reactions/comments per post
    - Implement collection-level defaults with post-level overrides
    - Update existing content collections with engagement configuration
    - _Requirements: 6.1, 6.2, 6.5_

  - [ ] 6.3 Create engagement analytics and insights
    - Build analytics dashboard for engagement metrics
    - Implement popular content tracking based on reactions and comments
    - Add engagement pattern analysis and reporting
    - Create utilities for exporting engagement data
    - _Requirements: 6.4, 4.4_

- [ ] 7. Testing and validation
  - [ ] 7.1 Test IndieWeb compliance and standards
    - Validate Micropub endpoint with various clients (Quill, Indigenous)
    - Test IndieAuth authentication flow with external services
    - Verify microformats markup with microformats parser
    - Test webmention sending and receiving functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 7.2 Test engagement system functionality
    - Test reaction system across different browsers and devices
    - Verify comment form validation, submission, and display
    - Test captcha integration and spam protection
    - Validate database operations and data integrity
    - Test rate limiting and abuse prevention measures
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 3.3, 3.5_

  - [ ] 7.3 Test analytics and performance
    - Verify GA4 and Clarity event tracking for all engagement actions
    - Test performance impact of new features on Core Web Vitals
    - Validate resource hints and loading optimization
    - Monitor database query performance and optimization
    - Test mobile responsiveness and cross-browser compatibility
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 7.4 Security and reliability testing
    - Test API endpoint security and input validation
    - Verify authentication and authorization mechanisms
    - Test error handling and graceful degradation
    - Validate privacy compliance and opt-out mechanisms
    - Test system reliability under load and edge cases
    - _Requirements: 7.2, 7.4, 7.5, 4.5_

- [ ] 8. Integration and deployment
  - [ ] 8.1 Update site configuration and navigation
    - Update site.js configuration with new analytics tracking IDs
    - Add IndieWeb discovery links to site header and meta tags
    - Update navigation and footer with engagement features
    - Implement proper URL structure for IndieWeb endpoints
    - _Requirements: 1.3, 4.1, 6.5_

  - [ ] 8.2 Create documentation and maintenance guides
    - Document IndieWeb setup and configuration
    - Create engagement system administration guide
    - Build troubleshooting guide for common issues
    - Document analytics setup and event tracking
    - Create backup and maintenance procedures for database
    - _Requirements: 6.3, 6.4, 7.5_