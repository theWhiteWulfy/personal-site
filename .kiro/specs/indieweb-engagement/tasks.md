# Implementation Plan

- [x] 1. Complete microformats2 markup implementation
  - [x] 1.1 Add comprehensive h-entry microformats to content templates


    - Update content collection templates with proper h-entry, p-name, dt-published markup
    - Add h-card markup for author information across all content types
    - _Requirements: 1.5, 6.5, 7.1_

  - [ ] 1.2 Create microformats validation database table
    - Create SQL migration for microformats_validation table with content_id, validation_result, is_valid fields
    - Add indexes for content_id and content_type for performance
    - _Requirements: 7.1, 7.4_

  - [ ] 1.3 Add missing IndieWeb discovery links to site head
    - Add rel="authorization_endpoint" link to Head.astro component
    - Add rel="token_endpoint" link to Head.astro component
    - Update site.js configuration with authorization and token endpoint URLs
    - _Requirements: 1.3, 7.1_

  - [ ] 1.4 Implement rel="me" links for social verification
    - Add rel="me" links to social media URLs in site header or footer
    - Update existing social media links with proper rel="me" attributes
    - _Requirements: 1.3, 1.5_

  - [ ] 1.5 Add comprehensive h-card to author bio sections
    - Update about page with complete h-card markup including photo, name, url
    - Add h-card to author bio in PageLayout.astro with additional properties
    - _Requirements: 1.5, 6.5_

  - [ ] 1.6 Create microformats validation utility
    - Build utility function to validate microformats markup
    - Implement database storage for validation results
    - _Requirements: 7.1, 7.4_

- [ ] 2. Build comment system with database integration
  - [ ] 2.1 Create comments database table and migration
    - Create SQL migration for comments table with id, content_id, author_name, author_email, content, timestamp, approved, ip_address fields
    - Add indexes for content_id, content_type, and approved status
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 2.2 Build basic comments API endpoint structure
    - Create src/pages/api/comments.ts file with basic POST and GET route handlers
    - Add proper TypeScript interfaces for comment data
    - Implement basic error handling and response formatting
    - _Requirements: 3.1, 7.2_

  - [ ] 2.3 Implement comment submission with validation
    - Add form data validation for name, email, and content fields
    - Implement input sanitization to prevent XSS attacks
    - Add basic spam protection checks (length limits, content filtering)
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 2.4 Add captcha integration for spam protection
    - Integrate hCaptcha or reCAPTCHA service for comment forms
    - Add captcha verification to comment submission endpoint
    - Handle captcha validation errors and user feedback
    - _Requirements: 3.2, 3.5_

  - [ ] 2.5 Implement database operations for comment storage
    - Add database insert operation for new comments with parameter binding
    - Implement comment retrieval with pagination and filtering
    - Add database update operations for comment approval status
    - _Requirements: 3.1, 7.1, 7.4_

  - [ ] 2.6 Create Comments.astro component structure
    - Build basic Comments.astro component with comment form HTML structure
    - Add form fields for name, email, and comment content
    - Implement basic CSS styling for comment form layout
    - _Requirements: 3.1, 3.4_

  - [ ] 2.7 Add comment display functionality
    - Implement comment list display with chronological ordering
    - Add author information display with proper microformats markup
    - Create CSS styling for individual comment items and threading
    - _Requirements: 3.1, 3.4_

  - [ ] 2.8 Integrate Comments component into content pages
    - Add Comments component to article, note, and work page templates
    - Implement conditional comment display based on content configuration
    - Replace existing Giscus component references with new Comments component
    - _Requirements: 3.1, 3.4_

  - [ ] 2.9 Add comment moderation interface basics
    - Create simple admin interface for viewing pending comments
    - Implement approve/reject functionality for individual comments
    - Add bulk moderation actions for multiple comments
    - _Requirements: 3.3, 6.2, 6.3_

- [ ] 3. Implement webmention receiving system
  - [ ] 3.1 Create webmentions database table and migration
    - Create SQL migration for webmentions table with source_url, target_url, content, author_name, mention_type, verified, approved fields
    - Add indexes for target_url, verified status, and mention_type
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 3.2 Build webmention endpoint structure
    - Create src/pages/api/webmention.ts with POST handler for receiving webmentions
    - Add GET handler for retrieving webmentions for a specific target URL
    - Implement basic request validation and error handling
    - _Requirements: 1.4, 7.2_

  - [ ] 3.3 Implement webmention source verification
    - Add utility to fetch source URL and verify it contains link to target
    - Implement HTML parsing to extract webmention content and author information
    - Add verification status tracking in database
    - _Requirements: 1.4, 7.1, 7.4_

  - [ ] 3.4 Add webmention content extraction
    - Extract author name and URL from source page microformats
    - Parse webmention content and determine mention type (like, reply, mention, repost)
    - Store extracted metadata in webmentions database table
    - _Requirements: 1.4, 7.1_

  - [ ] 3.5 Implement webmention database operations
    - Add database insert operations for new webmentions with duplicate prevention
    - Implement webmention retrieval by target URL with filtering options
    - Add update operations for verification and approval status
    - _Requirements: 1.4, 7.1, 7.4_

  - [ ] 3.6 Create webmention processing queue
    - Implement background processing for webmention verification
    - Add retry mechanism for failed verification attempts
    - Create database tracking for processing status and attempts
    - _Requirements: 1.4, 7.2, 7.4_

  - [ ] 3.7 Build WebmentionDisplay component
    - Create component to display webmentions on content pages
    - Implement grouping by mention type (likes, replies, mentions, reposts)
    - Add proper microformats markup for displayed webmentions
    - _Requirements: 1.4, 6.2_

  - [ ] 3.8 Add webmention moderation interface
    - Create admin interface for reviewing pending webmentions
    - Implement approve/reject functionality with bulk actions
    - Add spam filtering and automatic approval rules
    - _Requirements: 6.2, 6.3_

  - [ ] 3.9 Integrate webmention display into content pages
    - Add WebmentionDisplay component to content page templates
    - Implement conditional display based on webmention availability
    - Create CSS styling for webmention display and interaction
    - _Requirements: 1.4, 6.2_

- [ ] 4. Build webmention sending system
  - [ ] 4.1 Create outbound webmentions database table
    - Create SQL migration for outbound_webmentions table with target_url, source_url, status, retry_count, last_attempt fields
    - Add indexes for status, target_url, and retry tracking
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 4.2 Implement webmention endpoint discovery
    - Create utility to discover webmention endpoints from target URLs
    - Add HTTP HEAD/GET request handling to find rel="webmention" links
    - Implement Link header parsing for webmention endpoint discovery
    - _Requirements: 1.4, 7.2_

  - [ ] 4.3 Build webmention sending utility
    - Create function to send webmention POST requests to discovered endpoints
    - Implement proper form data encoding and HTTP headers
    - Add response handling and status code interpretation
    - _Requirements: 1.4, 7.2_

  - [ ] 4.4 Add link extraction from content
    - Create utility to extract external links from published content
    - Filter links to identify potential webmention targets
    - Store discovered links for webmention processing
    - _Requirements: 1.4, 7.1_

  - [ ] 4.5 Implement webmention queue processing
    - Create background job system for processing outbound webmentions
    - Add retry mechanism with exponential backoff for failed sends
    - Implement database tracking for send attempts and results
    - _Requirements: 1.4, 7.2, 7.4_

  - [ ] 4.6 Add webmention sending triggers
    - Integrate webmention sending into content publication workflow
    - Trigger webmention discovery and sending when content is published
    - Handle content updates and send update webmentions
    - _Requirements: 1.4, 7.2_

  - [ ] 4.7 Create webmention sending API endpoint
    - Build API endpoint for manual webmention sending
    - Add authentication and rate limiting for webmention API
    - Implement bulk webmention sending for multiple targets
    - _Requirements: 1.4, 7.2_

  - [ ] 4.8 Add webmention status tracking
    - Create admin interface for monitoring outbound webmention status
    - Display send success/failure rates and retry information
    - Add manual retry functionality for failed webmentions
    - _Requirements: 1.4, 7.4_

- [ ] 5. Create Micropub endpoint with authentication
  - [ ] 5.1 Create micropub posts database table
    - Create SQL migration for micropub_posts table with post_type, content_id, status, properties, created_via fields
    - Add indexes for status, post_type, and content_id
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 5.2 Build basic Micropub endpoint structure
    - Create src/pages/api/micropub.ts with GET and POST handlers
    - Implement Micropub configuration response for GET requests
    - Add basic request parsing for JSON and form-encoded data
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 5.3 Implement IndieAuth token verification
    - Add utility to verify IndieAuth access tokens
    - Implement token introspection and scope validation
    - Create database storage for verified token information
    - _Requirements: 1.2, 1.3, 7.1, 7.4_

  - [ ] 5.4 Add Micropub request validation
    - Implement validation for required Micropub properties
    - Add content type detection and property normalization
    - Create error handling for invalid or malformed requests
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 5.5 Implement content creation from Micropub
    - Create utility to generate Markdown files from Micropub properties
    - Add frontmatter generation with proper metadata mapping
    - Implement file system operations for content creation
    - _Requirements: 1.1, 1.2, 7.1_

  - [ ] 5.6 Add draft post functionality
    - Implement draft status tracking in database
    - Create draft-to-published workflow for Micropub posts
    - Add draft management and editing capabilities
    - _Requirements: 1.2, 7.1, 7.4_

  - [ ] 5.7 Implement Micropub update operations
    - Add support for Micropub update and delete actions
    - Implement content modification and file system updates
    - Create database tracking for content change history
    - _Requirements: 1.2, 7.1, 7.4_

  - [ ] 5.8 Add Micropub media endpoint
    - Create media upload endpoint for Micropub file uploads
    - Implement file validation and storage in public directory
    - Add media URL generation and reference tracking
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 5.9 Create Micropub source query support
    - Implement source query functionality for existing content
    - Add content retrieval and property serialization
    - Create pagination and filtering for source queries
    - _Requirements: 1.2, 7.2_

- [ ] 6. Implement POSSE cross-posting system
  - [ ] 6.1 Create syndication database table
    - Create SQL migration for syndication table with content_id, platform, syndication_url, status, error_message fields
    - Add indexes for content_id, platform, and status tracking
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 6.2 Build Twitter/X API integration
    - Create utility for Twitter API authentication and posting
    - Implement tweet creation with content formatting and link handling
    - Add error handling for API rate limits and failures
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 6.3 Add Threads API integration
    - Implement Threads API authentication and posting functionality
    - Create content formatting for Threads platform requirements
    - Add proper error handling and response processing
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 6.4 Build dev.to API integration
    - Create dev.to API client for article cross-posting
    - Implement content conversion from Markdown to dev.to format
    - Add tag mapping and metadata handling for dev.to posts
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 6.5 Create cross-posting API endpoint
    - Build src/pages/api/syndicate.ts for manual cross-posting
    - Add platform selection and content formatting options
    - Implement database tracking for syndication attempts
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 6.6 Implement automatic cross-posting triggers
    - Add cross-posting integration to content publication workflow
    - Create configuration system for per-content-type cross-posting rules
    - Implement conditional cross-posting based on content metadata
    - _Requirements: 1.1, 1.2, 7.1_

  - [ ] 6.7 Add syndication URL tracking and display
    - Store syndication URLs in database after successful cross-posting
    - Display syndication links on original content with proper microformats
    - Add u-syndication markup for IndieWeb compliance
    - _Requirements: 1.1, 1.2, 6.5, 7.1_

  - [ ] 6.8 Create cross-posting retry mechanism
    - Implement retry logic for failed cross-posting attempts
    - Add exponential backoff and maximum retry limits
    - Create admin interface for monitoring and manual retry
    - _Requirements: 7.2, 7.4_

  - [ ] 6.9 Add cross-posting configuration management
    - Create admin interface for managing API keys and platform settings
    - Implement per-collection cross-posting configuration
    - Add enable/disable toggles for individual platforms
    - _Requirements: 6.1, 7.1_

- [ ] 7. Build backfeed comment aggregation system
  - [ ] 7.1 Create backfeed tracking database table
    - Create SQL migration for backfeed_tracking table with content_id, platform, platform_post_id, last_checked fields
    - Add indexes for content_id, platform, and last_checked timestamp
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 7.2 Implement Twitter/X comment fetching
    - Create Twitter API client for fetching replies to syndicated tweets
    - Add reply parsing and author information extraction
    - Implement rate limiting and API error handling
    - _Requirements: 3.1, 7.2_

  - [ ] 7.3 Add Threads comment fetching
    - Implement Threads API integration for reply aggregation
    - Create comment parsing and metadata extraction
    - Add proper attribution and original post linking
    - _Requirements: 3.1, 7.2_

  - [ ] 7.4 Build dev.to comment fetching
    - Create dev.to API client for comment retrieval
    - Implement comment parsing and author information extraction
    - Add comment threading and reply relationship tracking
    - _Requirements: 3.1, 7.2_

  - [ ] 7.5 Create backfeed processing API endpoint
    - Build src/pages/api/backfeed.ts for manual comment aggregation
    - Add platform selection and content targeting options
    - Implement database storage for backfed comments with source tracking
    - _Requirements: 3.1, 7.2, 7.4_

  - [ ] 7.6 Implement automatic backfeed scheduling
    - Create background job system for periodic comment checking
    - Add configurable check intervals per platform and content
    - Implement deduplication logic for existing comments
    - _Requirements: 3.1, 7.2, 7.4_

  - [ ] 7.7 Add backfeed comment integration
    - Modify Comments component to display backfed comments alongside direct comments
    - Add proper source attribution and platform indicators
    - Implement unified comment threading and chronological ordering
    - _Requirements: 3.1, 3.4, 7.1_

  - [ ] 7.8 Create backfeed moderation interface
    - Add admin interface for reviewing and approving backfed comments
    - Implement bulk moderation actions for social comments
    - Add spam filtering and automatic approval rules for trusted sources
    - _Requirements: 3.3, 6.2, 6.3_

  - [ ] 7.9 Add backfeed configuration management
    - Create settings for enabling/disabling backfeed per platform
    - Implement content-specific backfeed configuration
    - Add monitoring and analytics for backfeed performance
    - _Requirements: 6.1, 7.1, 7.5_

- [ ] 8. Implement WebSub for real-time content distribution
  - [ ] 8.1 Create WebSub subscriptions database table
    - Create SQL migration for websub_subscriptions table with hub_url, topic_url, callback_url, status, expires_at fields
    - Add indexes for hub_url, topic_url, and subscription status
    - _Requirements: 7.1, 7.2_

  - [ ] 8.2 Add WebSub discovery links to feeds
    - Update RSS feed generation to include WebSub hub discovery links
    - Add proper Link headers for WebSub hub and self URLs
    - Implement WebSub-compatible feed formatting
    - _Requirements: 1.4, 6.5, 7.2_

  - [ ] 8.3 Implement WebSub publisher functionality
    - Create utility to notify WebSub hubs of content updates
    - Add HTTP POST requests to hub URLs with proper formatting
    - Implement retry mechanism for failed hub notifications
    - _Requirements: 1.4, 7.2_

  - [ ] 8.4 Build WebSub subscription management
    - Create API endpoint for WebSub subscription verification
    - Implement subscription confirmation and denial handling
    - Add database tracking for subscription lifecycle
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 8.5 Add WebSub content update triggers
    - Integrate WebSub notifications into content publication workflow
    - Trigger hub notifications when content is published or updated
    - Implement conditional notifications based on content type
    - _Requirements: 1.4, 7.2_

  - [ ] 8.6 Create WebSub ping functionality
    - Build utility for manual WebSub hub pinging
    - Add API endpoint for triggering WebSub notifications
    - Implement bulk notification for multiple content updates
    - _Requirements: 1.4, 7.2_

  - [ ] 8.7 Implement WebSub subscription analytics
    - Create admin interface for monitoring WebSub subscription status
    - Add analytics for hub notification success rates
    - Implement subscription renewal and expiration handling
    - _Requirements: 7.1, 7.4, 7.5_

- [ ] 9. Testing and validation of IndieWeb features
  - [ ] 9.1 Create microformats validation tests
    - Build automated tests for microformats markup validation
    - Test h-entry, h-card, and other microformats across all content types
    - Validate microformats parser compatibility and compliance
    - _Requirements: 1.5, 7.1_

  - [ ] 9.2 Test webmention functionality end-to-end
    - Create tests for webmention sending and receiving workflows
    - Test webmention verification and content extraction
    - Validate webmention display and moderation functionality
    - _Requirements: 1.4, 7.2, 7.4_

  - [ ] 9.3 Validate Micropub endpoint compliance
    - Test Micropub endpoint with various clients (Quill, Indigenous)
    - Validate IndieAuth authentication and token verification
    - Test content creation, updates, and media upload functionality
    - _Requirements: 1.1, 1.2, 1.3, 7.2_

  - [ ] 9.4 Test cross-posting and syndication
    - Validate POSSE cross-posting to all configured platforms
    - Test syndication URL tracking and display
    - Verify error handling and retry mechanisms
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 9.5 Test backfeed comment aggregation
    - Validate comment fetching from all social platforms
    - Test comment deduplication and threading
    - Verify backfeed moderation and approval workflows
    - _Requirements: 3.1, 3.3, 7.2_

  - [ ] 9.6 Test database operations and performance
    - Validate all database operations under concurrent load
    - Test data integrity and referential constraints
    - Verify database migration and rollback procedures
    - _Requirements: 7.1, 7.4, 7.5_

  - [ ] 9.7 Test WebSub integration and notifications
    - Validate WebSub hub notifications and subscription management
    - Test feed discovery and real-time update delivery
    - Verify subscription renewal and expiration handling
    - _Requirements: 1.4, 7.2, 7.4_

  - [ ] 9.8 Perform security and spam protection testing
    - Test comment spam protection and captcha integration
    - Validate input sanitization and XSS prevention
    - Test authentication and authorization mechanisms
    - _Requirements: 3.2, 3.5, 7.4_

  - [ ] 9.9 Test error handling and graceful degradation
    - Validate error handling across all IndieWeb features
    - Test graceful degradation when external services are unavailable
    - Verify logging and monitoring for production debugging
    - _Requirements: 7.4, 7.5_

- [ ] 10. Production deployment and documentation
  - [ ] 10.1 Create production database migration scripts
    - Prepare all database migrations for production deployment
    - Create rollback scripts for each migration
    - Test migration procedures in staging environment
    - _Requirements: 7.1, 7.4_

  - [ ] 10.2 Update site configuration for production
    - Update site.js with production IndieWeb endpoint URLs
    - Configure API keys and authentication credentials
    - Set up environment variables for external service integration
    - _Requirements: 1.3, 6.1, 7.1_

  - [ ] 10.3 Deploy IndieWeb API endpoints
    - Deploy all IndieWeb API endpoints to production
    - Configure Cloudflare Pages routing for API endpoints
    - Test endpoint accessibility and authentication
    - _Requirements: 7.2, 7.4_

  - [ ] 10.4 Configure external service integrations
    - Set up Twitter/X API credentials and webhooks
    - Configure Threads and dev.to API integrations
    - Test cross-posting and backfeed functionality in production
    - _Requirements: 1.1, 1.2, 7.2_

  - [ ] 10.5 Set up monitoring and analytics
    - Configure logging for IndieWeb feature usage
    - Set up monitoring for API endpoint performance
    - Create analytics dashboard for IndieWeb engagement metrics
    - _Requirements: 7.4, 7.5_

  - [ ] 10.6 Create user documentation
    - Document IndieWeb features for site visitors
    - Create setup guides for Micropub clients
    - Write troubleshooting guides for common issues
    - _Requirements: 6.3, 6.4_

  - [ ] 10.7 Create admin documentation
    - Document database maintenance procedures
    - Create API configuration and management guides
    - Write monitoring and troubleshooting procedures
    - _Requirements: 6.3, 6.4, 7.5_

  - [ ] 10.8 Perform production validation testing
    - Test all IndieWeb features in production environment
    - Validate external service integrations and webhooks
    - Verify database performance and backup procedures
    - _Requirements: 7.4, 7.5_