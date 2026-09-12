# Campaign Implementation Guide

This document provides a guide to the implementation of the campaign pages in this project. It covers the component tree, a reference for the documented functions, and a discussion of technical debt.

## High-Level Overview

The campaign pages are built using a modular and component-based architecture. The main entry point for a campaign page is `src/pages/offers/[...slug].astro`. This page is responsible for fetching the campaign data and rendering the overall layout and components for the campaign.

The component tree for a campaign page is as follows:

- **`src/pages/offers/[...slug].astro`**: The main page for a campaign. It uses the `Layout` component to provide the overall page structure.
    - **`src/layouts/Layout.astro`**: The main layout for all pages. It includes the `Head`, `Header`, and `Footer` components.
        - **`src/components/Head.astro`**: This component is responsible for rendering the `<head>` section of the page, including all meta tags, links to stylesheets, and analytics scripts.
        - **`src/components/Header.astro`**: The site header.
        - **`src/components/Footer.astro`**: The site footer.
    - **`src/components/CampaignHero.astro`**: The hero section for a campaign page. It displays the main title, description, offer details, and a countdown timer.
    - **`src/components/CampaignCTA.astro`**: The call-to-action section for a campaign page. It includes a form for users to sign up for the campaign.

This structure allows for a clear separation of concerns, with each component responsible for a specific part of the page. The use of a single layout ensures a consistent look and feel across all pages.

## Function and Class Reference

This section provides a reference for the functions, classes, and interfaces that have been documented as part of this effort.

### `src/pages/offers/[...slug].astro`

- **`getStaticPaths({ paginate })`**: Generates static paths for all active campaigns at build time.
- **`initCampaignAnalytics()`**: Initializes the analytics for the campaign page.
- **`trackScrollDepth()`**: Tracks the user's scroll depth on the page.

### `src/layouts/Layout.astro`

- **`Props`**: The props for the Layout component.

### `src/components/CampaignHero.astro`

- **`Props`**: The props for the CampaignHero component.
- **`initCountdownTimer()`**: Initializes the countdown timer.
- **`updateTimer()`**: Updates the countdown timer display.

### `src/components/CampaignCTA.astro`

- **`Props`**: The props for the CampaignCTA component.
- **`initCampaignCTA()`**: Initializes the Campaign CTA component.
- **`trackEvent(eventName, parameters)`**: Helper function to safely call the gtag function for analytics tracking.

### `src/lib/schema-generators.ts`

- **`LocalBusinessData`**: Interface for Local Business schema data.
- **`ServiceData`**: Interface for Service schema data.
- **`CampaignData`**: Interface for Campaign schema data.
- **`FAQData`**: Interface for FAQ schema data.
- **`BreadcrumbItem`**: Interface for Breadcrumb item schema data.
- **`PersonData`**: Interface for Person schema data.
- **`ResourceData`**: Interface for Resource schema data.
- **`PageSchemaOptions`**: Interface for the options object passed to the `generatePageSchema` function.
- **`generateLocalBusinessSchema(data)`**: Generates a LocalBusiness schema object.
- **`generateServiceSchema(serviceData)`**: Generates a Service schema object.
- **`generateFAQPageSchema(faqs)`**: Generates a FAQPage schema object.
- **`generateBreadcrumbListSchema(breadcrumbs)`**: Generates a BreadcrumbList schema object.
- **`generateBreadcrumbsFromPath(path, baseUrl)`**: Generates an array of breadcrumb items from a given path.
- **`generatePersonSchema(personData)`**: Generates a Person schema object.
- **`safeSchemaGeneration(generator, fallback)`**: A utility function that wraps a schema generation function in a try/catch block.
- **`generateResourceSchema(resourceData)`**: Generates a DigitalDocument schema object for a resource.
- **`generateCampaignSchema(campaignData)`**: Generates an Event schema object for a campaign.
- **`generatePageSchema(options)`**: Generates an array of schema objects for a page.

### `src/lib/campaign-utils.ts`

- **`Campaign`**: Interface for a campaign object.
- **`CampaignValidationResult`**: Interface for the result of a campaign validation check.
- **`validateCampaignStatus(DB, campaignSlug)`**: Checks if a campaign is expired and updates its status in the database if necessary.
- **`getExpiredCampaigns(DB)`**: Retrieves all active campaigns that have expired but have not yet been updated in the database.
- **`updateExpiredCampaigns(DB)`**: Bulk updates the status of all expired campaigns to "expired".
- **`getCampaignSummary(DB, campaignSlug)`**: Retrieves a summary of analytics for a given campaign.
- **`generateCampaignRedirects(DB)`**: Generates an array of redirect rules for all expired campaigns.
- **`validateCampaignData(data)`**: Validates campaign data for creation or updates.
- **`formatCampaignResponse(campaign)`**: Formats a campaign object for an API response.
- **`getCampaignUrgency(daysRemaining)`**: Determines the urgency level of a campaign based on the number of days remaining.
- **`generateTrackingParams(campaignSlug, source)`**: Generates a record of UTM tracking parameters for a campaign.

### `src/components/Head.astro`

- **`Props`**: The props for the Head component.
- **`checkAnalyticsConsent()`**: Checks if the user has given consent for analytics tracking.
- **`hasOptedOut()`**: Checks if the user has opted out of analytics tracking.
- **`setAnalyticsConsent(consent)`**: Sets the user's consent for analytics tracking.
- **`setOptOutPreference(optOut)`**: Sets the user's preference for opting out of analytics tracking.
- **`trackEngagementEvent(eventName, parameters)`**: Tracks an engagement event with Google Analytics and Microsoft Clarity.
- **`trackConversionEvent(eventName, parameters)`**: Tracks a conversion event with Google Analytics and Microsoft Clarity.
- **`addCopyCodeButtons()`**: Adds a "copy" button to all code blocks on the page.
- **`copyCode(codeBlock, copyButton)`**: Copies the code from a code block to the clipboard.
- **`AnalyticsDebugger`**: A class for debugging analytics integration in development mode.

### `src/components/Header.astro`

- **`Props`**: The props for the Header component.

### `src/components/Footer.astro`

- **`MenuItem`**: Interface for a menu item.

### `src/components/menu.astro`

- **`Props`**: The props for the Menu component.
- **`MenuItem`**: Interface for a menu item.

### `src/config/site.js`

- **`site`**: The main configuration object for the site.

### `src/config/system.js`

- **`SCHEMA_CONFIG`**: Configuration for schema generation.
- **`ANALYTICS_CONFIG`**: Configuration for analytics.
- **`API_CONFIG`**: Configuration for the API.
- **`VALIDATION`**: Configuration for validation.
- **`PERFORMANCE_CONFIG`**: Configuration for performance.
- **`ERROR_MESSAGES`**: A collection of error messages.
- **`SUCCESS_MESSAGES`**: A collection of success messages.

### `src/lib/analytics.ts`

- **`GA4Config`**: Interface for Google Analytics 4 configuration.
- **`ClarityConfig`**: Interface for Microsoft Clarity configuration.
- **`PrivacyConfig`**: Interface for privacy configuration.
- **`AnalyticsEvent`**: Base interface for an analytics event.
- **`PhoneClickEvent`**: Interface for a phone click event.
- **`FormSubmissionEvent`**: Interface for a form submission event.
- **`ResourceDownloadEvent`**: Interface for a resource download event.
- **`ConversionEvent`**: Interface for a conversion event.
- **`PageViewEvent`**: Interface for a page view event.
- **`EmailClickEvent`**: Interface for an email click event.
- **`TrackingEvent`**: A union type for all possible tracking events.
- **`AnalyticsProvider`**: Interface for an analytics provider.
- **`AnalyticsConfiguration`**: Interface for the combined analytics configuration.
- **`ConsentStatus`**: Interface for the consent status.
- **`AnalyticsError`**: Interface for an analytics error.
- **`EventQueue`**: Interface for an event queue for offline support.
- **`GA4Analytics`**: A class for interacting with Google Analytics 4.
- **`ClarityAnalytics`**: A class for interacting with Microsoft Clarity.
- **`AnalyticsManager`**: A class for managing multiple analytics providers.
- **`PrivacyManager`**: A class for managing user privacy and consent.
- **`ConsentBanner`**: A class for managing the cookie consent banner.
- **`FormTracker`**: An object that provides form tracking utilities for client-side use.
- **`NewsletterTracker`**: An object that provides newsletter form tracking utilities.
- **`ContactTracker`**: An object that provides contact form tracking utilities.
- **`ResourceTracker`**: An object that provides resource download form tracking utilities.
- **`initializeAnalyticsConfig(siteConfig)`**: Initializes the analytics configuration from the site configuration.
- **`getAnalyticsInstance()`**: Gets the global analytics manager instance.
- **`initializeGlobalAnalytics(config)`**: Initializes the global analytics manager instance.
- **`getPrivacyManager()`**: Gets the global privacy manager instance.
- **`getConsentBanner()`**: Gets the global consent banner instance.
- **`initializePrivacyCompliantAnalytics(siteConfig)`**: Initializes privacy-compliant analytics.

### `src/components/menu.astro`

- **`onChangeTheme()`**: Toggles the theme between light and dark.
- **`updateMenuStyles()`**: Updates the styles of the menu items to indicate the active page.

## Technical Debt

This section outlines areas of the codebase that could be improved in the future to reduce complexity and improve maintainability.

### 1. Overly Complex Analytics

The current analytics implementation, spread across `src/components/Head.astro` and `src/lib/analytics.ts`, is highly complex and tightly integrated with the components. This presents several challenges:

- **High Coupling**: The components are directly responsible for analytics tracking, which makes them harder to test and reuse.
- **Difficult to Maintain**: The large number of functions and classes related to analytics makes the code difficult to understand and maintain.
- **Potential for Bugs**: The complexity of the implementation increases the risk of bugs and makes it harder to debug issues.

**Recommendation**: Consider refactoring the analytics implementation to use a more dedicated analytics library or a simpler, more centralized approach. This would decouple the components from the analytics logic and make the code easier to manage.

### 2. Hardcoded Campaign Data

The campaign data in `src/pages/offers/[...slug].astro` is currently hardcoded within the file. This is not ideal for a production application, as it requires a developer to make changes to the code to update the campaign data.

**Recommendation**: Move the campaign data to a database or a headless CMS. This would allow non-developers to manage the campaign data and would make the application more flexible and scalable.

### 3. Lack of a State Management Solution

The theme switching logic in `src/components/menu.astro` uses direct DOM manipulation and local storage to manage the theme state. While this works for a simple application, it can become difficult to manage as the application grows in complexity.

**Recommendation**: Introduce a proper state management solution, such as Zustand, Pinia, or even a simple custom store. This would provide a centralized way to manage the application state and would make the code more robust and easier to reason about.

### 4. Inline Scripts

The use of inline scripts in the Astro components, while a valid feature of the framework, can make the code harder to read and maintain. Some of the scripts, particularly the larger ones in `src/pages/offers/[...slug].astro` and `src/components/Head.astro`, could be moved to separate `.js` or `.ts` files.

**Recommendation**: For larger scripts, consider moving them to separate files and importing them into the components. This would improve the readability of the components and would make the scripts easier to test and reuse.
