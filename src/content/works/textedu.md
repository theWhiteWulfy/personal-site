---
title: "TextEdu"
date: 2020-08-13
path: /work/textedu/
excerpt: "A online SaaS for multi-channel messaging and analytics."
last_modified_at: 2020-08-13T12:25:41-05:00
image: /images/cover/textedu-feature.png
categories: [work]
tags: [web-app, web development, optimization, code review, Project Management]
work: "Design & Development"
breadcrumbs:
  - label: "Work"
    url: /work/
comments: true
hide_meta: false
toc: true
---

TextEdu was a SaaS that provided multi-channel messaging with link tracking and analytics on SMS. It also had a link shortening service and provided analytics on clicks, conversions and other metrics on links and campaigns.

My work at TextEdu was fixing long-standing issues and making back-end operations available as standardized REST APIs. We also planned to have the entire front end on react. But instead, our leadership prioritized plugins building on the REST APIs and targeted different CRMs. These plugins were something which brought in the revenue from large organizations.

The platform's first version was written in PHP and directly interacted with an SMPP server. There was a slight logical separation between the front-end and the back-end. The entire application ran on a colocation server, as we needed our dedicated hardware to run telephony and SMS stack. My work involved designing the REST API using OpenAPI v3 specifications to provide a  clear separation of the back-end interactions with SMPP, the application logic and front-end views.

We used Stoplight Studio(which was very new and not so mature then, but we used it nonetheless) to design and document the APIs. We used CodeIgniter to write the new REST APIs as the application still had to remain on PHP, as the team working with SMPP was familiar with PHP only. We had the enormous benefit of splitting the codebase into smaller segments running as independent APIs. This provided a way to test and benchmark each endpoint and optimize them if possible.

Secondly, having an OpenAPI compliant endpoint helped with client libraries for multiple programming languages using OpenAPI generator. This was a significant improvement over the engineering process that the company had. This benefit also helped us in building plugins for different CRMs.
