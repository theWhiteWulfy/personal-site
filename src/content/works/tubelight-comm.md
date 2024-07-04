---
title: "Tubelight Communications"
date: 2021-06-29
path: /work/tubelight-comm/
excerpt: "Multiple verticals. API Design, Website, SaaS."
last_modified_at: 2021-06-29T10:25:41-05:00
image: /images/cover/tubelight-comm-feature.png
categories: [work]
tags: [API, web development, Open API, Documentation, API development]
work: "Design & Development"
breadcrumbs:
  - label: "Work"
    url: /work/
comments: true
hide_meta: false
toc: true
---
Tubelight communications is a CPaaS(Communication Platform as a Service) vendor that caters to large enterprises and banks. The company provides everything from automated SMS, OTPs, IVR, Voice calls, Outbound prerecorded calls and more. Our core USP was that we did on-premise installations for large enterprises. They had several platforms that worked in different verticals(SMS, Voice, Marketing and analytics). I joined as an intern first, got an offer as full-stack dev, and was promoted to product manager for their analytics and marketing platform [Textedu](/work/textedu/) after a short time span.

My first epic as an intern was to create a developer documentation portal for their product. This exercise involved collecting and organizing existing documentation to build a reference from where the content in the developer documentation would be picked up or rewritten for clarity.

I used [Docsify(a common JS-based solution)](https://docsify.js.org/) as it would fit with all tech stacks(PHP and Java) that they were using for different platforms. I refactored a lot of segments of Docsify to add a theming system, pdf generation using js-pdf and code highlighting. Doing so, I faced several challenges; number one, the documentation at that time was scanty, and I had to figure a lot of stuff by trial-and-error, something I liked doing very much. Using a solution to print pdfs from webpage of multiple web pages was very hard. it required some hacking, understanding that there is something called `media-query: print` to display the print version of the webpage to debug it. Overall the entire experience of doing so was very insightful.

My next major epic was making a website for them, moving from WordPress to a static site generator(SSG). Building websites was something I had extensively worked on before in my freelance days, and it took me a concise amount of time to create a website that suited their taste. But the content and the copy of the website were another matter. We spent several months improving our website copy, rearranging stuff, something a copywriter or a non-tech guy could have done quickly on WordPress without my involvement. Still, no, everyone breathed on my shoulder to make edits to the copy, and I had to spawn multiple versions on git to keep track. Soon this entire experiment failed, as my focus was designing APIs and maintaining the Textedu product.

We switched back to WordPress, where the team brought my created design and UI from the SSG website into WordPress.

After this I was given the handover of the technical side of the Textedu platform, and tasked with maintaing and upgrading the platform.

Another aspect that we were building on was standarising our apis. After extensive research we went with [Open API v3](https://spec.openapis.org/oas/v3.1.0), for its' clarity on documenting and describing APIs thoroughly. We used [Stoplight Studio](https://stoplight.io/studio) to draft the api spec, and then start developing the apis via the mock server built in stoplight. We were using an api framework like express to write the apis, and then test the endpoint response against the api spec, to minimize chaances of bugs or quirky behavior. We also customized and used [Open API generator](https://openapi-generator.tech/) to generate client libraries, against the latest tested api spec version.

I also able to share some of our bug fixes to the Open API generator source repo.