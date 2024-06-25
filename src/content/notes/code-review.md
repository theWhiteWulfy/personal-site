---
title: "Code Reviews"
excerpt: "A gist on my process of code reviews"
date: 2020-09-10
path: /notes/code-review/
categories: [notes]
tags: [development, code review, process]
comments: true
support: true
last_modified_at: 2020-09-10T16:21:31-05:00
---

A note on how I like my code reviews.

I follow my checklist sequentially as it helps to reduce effort in subsequent steps.

- Readability: This is where I check if the code follows a well defined style guide, consistent variable naming patterns as well as flagging functions that tries to do lot of things at once, and parts that do not have comments. A linting tool makes this step faster, if conventions are well documented and configured in the tool.
- Maintainability: This is where I look for hard coded configuration, tightly coupled modules, and reliance on legacy libraries and systems.
- Re-usability and Reinventing the wheel: I look for functions and features that have been written again but exist in the language or the libraries that we are using and replace them with standard version. In most cases the constructs available in libraries are simplified and optimized enough to use them as it is. Also I try to find pieces that are reused multiple times and make them available for reuse if not done yet.
- Reliability: I start this part by running automated tests again. Then looking for places where the fault and failures can be gracefully handled. Also this is the part where I review the tests as I review the code.
- Optimization: Pareto principle here. I try to optimise only about 20% stuff which causes about 80% bottlenecks.
- Scalability: If needed and only after initial load testing and analysis. I follow the same principle that I do for optimization.
- Security: Generally I prefer to perform the security related tests and analysis at the last. Whenever I've seen it done before the above steps, the number of issues are significantly higher.

There are two other objectives that I prefer to pursue in parallel,

- Documentation: A readme to tell why the project exists, the tools used, how to use. As well as for making notes of changes that have been proposed and incorporated,
- Fulfillment of Purpose: Does the code do what it is expected to do?

I discovered the process of code review while working on small freelance projects and I received formal computer science education way later. There were few other points that they mentioned in the books but I haven't found the need for them yet.
