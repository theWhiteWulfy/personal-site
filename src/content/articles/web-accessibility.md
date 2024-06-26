---
title: "Introduction To Accessibility"
excerpt: "Understanding Accessibility and getting started"
path: /articles/web-accessibility/
categories: [articles]
tags: [web development, design, open source]
date: 2019-07-16
last_modified_at: 2020-01-06T09:59:14-05:00
comments: true
toc: true
---

Accessibility is a term you keep hearing, but may not fully understand. This is in part because the word itself can be a bit confusing. The root word, access, makes the concept seem tied to things like passwords. If users can “access” your site, accessibility is checked off. If only it were that simple.

Web accessibility is really about a user’s ability to access your site’s content, regardless of any physical or mental impairments. The inventor of the internet, **Sir Tim Berners-Lee**, put it perfectly:

> “The power of the Web is in its universality. Access by everyone regardless of disability is an essential aspect.”

A truly accessible website is inclusive of every potential user. It covers differential abilities of all shapes, sizes, and permanence. Users who are blind have their own needs, as do users with a broken hand. There’s also overlap among accessibility groups. Users experiencing concussion symptoms can benefit from features designed to make a piece of content more accessible for users who experience seizures. Accessibility is a multi-faceted topic.

There are six basics principles that make web better for everyone!

## Have correct text size

Users of the Internet have varying eye sight levels (due to injury, disease or age factor) and it's important to have a decent font size so that everyone can read your website without strain.

Browsers come at with a default font size of `16px`. We should try to not go below that at least. Take `16px` as your smallest base and build your text hierarchy upwards.

At the very minimum set your font sizes in em unit so that users can zoom in your website to increase font sizes.

> Except for captions and images of text, text can be resized without assistive technology up to 200 percent without loss of content or functionality.
> -w3.org

## Better Color Contrast

Users of the Internet have varying eye sight levels and it's important to have a good contrast so that everyone can read your websites without strain. My dad has deuteranopia. He can't see all colors as I do, which i discovered when I was in middle school. These days I use a plugin that checks for color issues. More on that later.

This is why there is a recommended guideline just to prevent this issue. It requires that,

> The visual presentation of text and images of text has a contrast ratio of at least 4.5:1.
> -w3.org

## Make text content easy to read and understandable

Some sentences are just highly compounded and complex that require the reader to put in extra mental focus to figure out the overall meaning of the sentence. It might still be understandable by many people. But there are people with disabilities, including reading disabilities, even among highly educated users with specialized knowledge of the subject matter. It may be possible to accommodate these users by making the text more readable.

Here is the required guideline:

> When text requires reading ability more advanced than the lower secondary education level after removal of proper names and titles, supplemental content, or a version that does not require reading ability more advanced than the lower secondary education level, is available.
> -w3.org

In short,

- Avoid difficult and less common words
- Write short sentences
- Don't use more than two conjunctions in a sentence
- Bullet points help wherever applicable

## Labelled Form Controls

Yes, we know that once a while we see a checkbox that is too small to be clicked. A normal size checkbox could have been just fine for you to click easily. But important thing to understand here is that even the normal size checkbox can be difficult to click for some people. Specially the ones with weak motor skills i.e. Ability to do a pre-determined movement with maximum certainty.

This is one of the reasons why there is a recommended guideline to associate a `<label>` element with the `<input>` element (with all form controls in general). This makes the label also a clickable part of the form control. So you don't have to pin-point the form control.

> Present instructions or labels that identify the controls in a form so that users know what input data is expected.
> -w3.org

Again, note that this is just one of the reasons why form controls should be correctly labelled. There are more benefits to it, Which I will come to in the next part

## Labels or Instructions

Unfortunately, the developer decided to put it as the placeholder of the input. Placeholders vanish as soon as any text is entered in the input field.

What's wrong in it? Nowadays many input fields in the forms are auto-filled by browsers for us. In such a situation, if the user wants to cross-check the filled values if they are appropriate, they have no way to know what's really asked in a particular input field! The same issue also applies to a user with short memory who started filling the form and then wants to verify the fields mid-way. So always label your input fields such that the label/instruction is accessible to the user at all times.

> Present instructions or labels that identify the controls in a form so that users know what input data is expected.
> -w3.org

## Adjustable Timings

>Ensure that users with disabilities are given adequate time to interact with Web content whenever possible. People with disabilities such as blindness, low vision, dexterity impairments, and cognitive limitations may require more time to read content or to perform functions such as filling out on-line forms.
> -w3.org

Websites are filled with things like alerts, notification etc that show for a short duration and then go away. Here are few things you can do to make them more accessible:

- Make them stay longer.
- Show how much time is left before they go away.
- Pause their timer when hovered or focused.

In the past few points, you went through some examples of web content. The motive of those examples was two-fold:

- To display few ways in which websites are generally found inaccessible.
- To bring forth the fact that what you find okay for yourself, can be inaccessible for someone else. So the best we can do to make our websites accessible to most people is - Follow the recommended guidelines.
Hope it was a learning experience for you. If it was, please pass this on to every other developer, designer, marketer, any you know who works with websites.

Let's make the Web a better place!

Did I miss something? or You can share some more better tips?
Please leave your views in comments!
