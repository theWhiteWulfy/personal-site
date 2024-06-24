---
title: "A checklist for having a SaaS model"
date: 2020-05-31
path: /saasguide/getting-started/
excerpt: "A checklist for people who want to build a SaaS product"
last_modified_at: 2020-05-31T15:57:33-05:00
categories: [saas-guide]
tags: [Development, Tutorials, Software, Project Management, Planning]
comments: true
support: true

---


## Who is this for?

Anyone who wants to build the SaaS application.

## Checklist

- Before you start building
  - Choose the boring technology
    - Focus on tech that helps you build your product, not keeping up with fads. New tech popularity is fleeting.
  - Have an opinion/a point of view in how you plan to work along with what you plan to work on

- Tools
  - GitHub
  - Pick a Platform as a Service/cloud computing that you are most comfortable with
    - Minimal devops & easy deploy > cost efficency or performance
  - Have a CDN instead for providing assets from your web server
  - Start a wiki (use GitHub for it)
  - Setup Continuous Integration (CI)
    - Require CI to pass for PRs to merge
    - Enforce codestyle as part of CI

- Architecture
  - Pick a lane
    - Server Side Rendering v/s Client Side Rendering
    - Monolith vs Microservices
  - Pick a framework that you are most comfortable with
  - User authorization and policy-based access, enforce authorization checks
    - Sooner or later, you will want to setup MFA/2FA
    - Start with password-based authentication. Eventually you will need to support SSO
  - "Admin" User
  - When setting up data models, think about teams/groups that you will eventually need to support
  - You will likely need to support a change/addition of domain name/subdomain/host in the future
  - Where will your marketing site and company blog run
    - If your marketing site is built within your app, you will become the bottleneck for growth/marketing
    - Having your app running on app.yourdomain.com from day 1 might make it easier to switch later
    - Avoid use of naked domains for hosts. They're inflexible when migrating between services.
  - Eventually you will need to provide an API
  - Set up servers with repeatable code
  - Automate DB backups, and regularly test restores (if self-managed)
  - Maintain a staging environement
  - Setup uptime monitoring early with appropriate notification processes
  - Never restore/run production data to non-production envs

- Code
  - README should describe steps to setup dev environment from scratch, always up-to-date
  - Adapt a style guide from day 1
  - Start adding spec tests from day 1
  - Decide on comments or no comments in code
  - Use linters to help standardize code as well as make code reviews better for everyone
  - Set and document guidelines and best practices for logging
  - Set and document guidelines and best practices for exception handling
  - Set up runtime errors and exception reporting
  - Set up realtime analytics for performance reporting
  - Set up ability to track changes to your records at database level for auditing or versioning
  - Define and document process and expectations for code reviews
  - Early code will likely hit product limitations before performance/scalability becomes an issue; focus accordingly
  - Seed development env databases with code

- Engineering Team
  - Hanlon's razor: Never attribute to malice that which is adequately explained by ignorance/stupidity/lack of knowledge.
  - Always be looking forward and "recruiting"
  - Once you have at least one more engineer, define engineering levels
  - Set up a structure to allow for experimentation
  - QA: You will need QA earlier than you think you do
  - When you are no longer effective managing the team, look for a Manager/Director/VP of Engineering who is 10x better than you
    - Choose to manage or write code. Doing both will result in poor performance of both.
  - Decide whether you will be a setup for remote or not, and if remote, what "type" of remote team you will be
  - Remote teams give you a large talent pool, but have unique management challenges. Hire for skill and autonomy if hiring remotely.

- Day-to-day execution
  - stand-ups, sprints, retros, milestones
  - Use simple "project management" to keep a healthy product development rhythm, no matter how small your "team"
  - A team member's failure likely stems from a decision you made (or didn't make)

- Product
  - Use "feature flags" to release new features and selectively enable them for existing customers.
  - Don't make the thing more awesome, always look for how to make your users more awesome
  - To make a decision, look for answers in analytics and metrics
  - Reporting: Sooner or later, the data you can query from the database will need to be turned into reporting features for your customers
  - Customer suggested solutions are usually wrong. Dig into the "why" before weighing the "how"; the need is usually legitimate
  - Never implement a feature just for one customer; it will hurt you more in the future than help you in the short term
    - Exception of paid/sponsored features, which should take maintenance and support into consideration
  - Ensure existing customers want a feature before you start building it
    - Potential customers always want the moon; rarely will just-one-more-feature! start landing customers. Choose features many leads want, not just a few
  - Have a vision for your product and work towards it. Passing on customers because of features that don't fit your vision will be painful, but will pay off in the long run.
  - Aim for a "simple" product. Simple is not easy, but it's what your customers and users need. The craft of product is doing the hard work of figuring out the complexity to make using it simple for your customers.
  - Support deep links; your users and your support staff will thank you
  
- Support
  - Have an Admin interface from day-1
  - To ensure the "health" of your application, set up a status page
  - Provide an "impersonate" feature to Admins to help experience what the customers are experiencing
  - Engineers on rotating support schedule builds empathy, this means you and other co-founders too
  - Have a support ticketing system in place from day 1
  - Define support schedules and communicate them to your customers; enforce them with your support staff
    - Customers who "need" 24x7 support will be willing to pay a premium for it
  - Define and document supported Browsers from day-1
    - If you plan to support IE, ensure that you and the team is setup to test and debug bugs in IE
  - Setup a read-only SQL-query interface within the app for Admins (authorized users) and block use of external clients

- Security
  - Prepare a set of assets to share with Enterprise customers
  - Run static code analysis security tool for your frameworks
  - Look into a third-party pen testing and code audit service/tool sooner than you think you will need to
  - Implement a bug-bounty program

- Compliance
  - Get familiar with the top 3 compliance standards in your industry
  - Create a skeleton of what it would take your company to get the top 3 compliance certificates in your industry

- Misc
  - Find a way to mentor someone (within or outside your company)
  - Join a community of CTOs, engineers, technical leaders who you can knowledge share with
  - In your day-to-day, balance big projects and small enhancements/bug fixes
  - Group email address for ownership of all external services
    - Use your password manager's sharing feature to ensure access doesn't rely on you personally
  - All dependent service's payments on a company Credit Card
    - Role changes, aquisitions, canceled card, etc could make this painful
