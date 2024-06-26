---
title: "Make any Jekyll site into a PWA"
excerpt: "Understanding PWA + Jekyll"
path: /articles/jekyll-pwa/
categories: [articles]
tags: [web development, design, open source]
date: 2019-08-06
last_modified_at: 2020-01-06T09:59:14-05:00
comments: true
featured: true
toc: true
---


A Progressive Web App, or PWA, uses modern web capabilities to deliver an app-like user experience. Any website can be made into a PWA.

## The basics

Turning a basic website into a PWA is easy and has a lot of benefits, but first, let us know more about them in brief.

At its core Progressive Web App is just a way to optimize your website for better, faster delivery. As a developer we should learn to take advantage of these new possibilities, regardless of what our content is.

My own site is just a bunch of static HTML, and my blog is based on Jekyll, and they are still perfectly valid Progressive Web App. If you run anything on the web, you can definitely benefit from this.

The beauty is that PWAs offer the best of both worlds - deep linking and URLs from the web, offline access, push notifications and more device specific features from native apps - while still staying completely platform-independent. Just the web. If an older browser does not support it, it will not break; it just falls back to the default: a regular website. And yes there are few services out there that can make your PWA into an app, that you can just publish to the app stores.

There are some serious advantages:

- A faster, more secure user experience
- A better Google ranking
- Better usability
- Better performance
- Offline access
- Home screen shortcut like native apps

Even if you don’t expect your users to “install” your PWA (e.g. place a shortcut on their home screen), there is still a lot to be gained by making the switch. In fact, all of the steps necessary to make a PWA will actively improve your website and many of them are considered as best practices.

## How do I do it in Jekyll?

We will begin with the manifest and move to the JavaScript parts. Jekyll uses a build system based on partials that we will take advantage of.

The second part of the series will take a look on how we can make any static website a PWA and the third part will deal with using device specific features in a PWA.

We will partially take advantage of [PWA-Builder](https://www.pwabuilder.com) to do many things in this tutorial.

## The Manifest

A manifest is just a JSON file that describes all the meta data of your PWA. Things like the name, language and icon of your app go in there. This information will tell browsers how to display your app when it’s saved as a shortcut.

```json
{
  "lang": "en",
  "dir": "ltr\rtl",
  "name": "This is my jekyll PWA",
  "short_name": "myPWA",
  "icons": [
    {
      "src": "\/assets\/images\/touch\/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image\/png"
    }
  ],
  "theme_color": "#1a1a1a",
  "background_color": "#1a1a1a",
  "start_url": "/",
  "display": "standalone",
  "orientation": "natural"
}

```

This is usually called `manifest.json` or `site.webmanifest`, and linked to from the `<head>` of your site as

```html
<link rel="manifest" href="manifest.json">

```

Regarding what fields can be there in a manifest file see [MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest).

For Jekyll we will do few changes to `manifest.json` so that we can make changes directly from `_config.yml` and prevent jekyll to render it using default layout (which might insert the json into html for some themes).

The `<head>` portion will come in the `partial` that builds the head of every page. Usually it would be located in `_partials`.

```json

---
layout: none

---

{
  "lang": "{{ site.language }}",
  "dir": "{{ site.lang_direction }}",
  "name": {{ site.name | smartify | jsonify }},
  "short_name": {{ site.short_name | smartify | jsonify }},
  "icons": [
    {
      "src": "\/assets\/images\/touch\/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image\/png"
    }
  ],
  "theme_color": "{{ site.color }}",
  "background_color": "{{ site.color }}",
  "start_url": "{{ site.url }}",
  "display": "standalone",
  "orientation": "natural"
}

```

And in the `_config.yml` we might already have these following fields, if not we can always add it there.😅

```yaml

name: "mysite"
short_name: "ms"
url: "https://mysite.com"
language: "en"
lang_direction: "ltr"
color: "#abc123"

```

So your manifest is set up. Now we move to next part.

## Register the service worker

Now we need to add the JavaScript that registers the service worker into the `partial` that forms the `<head>` of your every page. As before it would usually  be located in `_partials`.

We need to add the following piece of JavaScript in `<script>` tag.

```js

if ("serviceWorker" in navigator) {
  if (navigator.serviceWorker.controller) {
    console.log("An active service worker found, no need to register");
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register("{{ site.baseurl }}/serviceworker.js", {
        scope: "./"
      })
      .then(function (reg) {
        console.log("Service worker has been registered for scope: " + reg.scope);
      });
  }
}

```

## Service Worker

Now we move to the next step. We need to create the `serviceworker.js` at the root of your site.

It will have the following JavaScript:

```js

const CACHE = "pwabuilder-offline";

const offlineFallbackPage = "index.html";

// Install stage sets up the index page (home page) in the cache and opens a new cache
self.addEventListener("install", function (event) {
  console.log("Install Event processing");

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("Cached offline page during install");

      if (offlineFallbackPage === "ToDo-replace-this-name.html") {
        return cache.add(new Response("Update the value of the offlineFallbackPage constant in the serviceworker."));
      }
      return cache.add(offlineFallbackPage);
    })
  );
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        console.log("Add page to offline cache: " + response.url);

        // If request was success, add or update it in the cache
        event.waitUntil(updateCache(event.request, response.clone()));

        return response;
      })
      .catch(function (error) {
        console.log("Network request Failed. Serving content from cache: " + error);
        return fromCache(event.request);
      })
  );
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return error page
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}

```

Now you're all done with the JavaScript part.

## Looking forward

Push these changes to your Jekyll site and voila! It is now a PWA.😁

I intentionally missed the part where we map the icons to the config to keep things simple, if you need help with that, drop me a comment below and I'll show you how.

Also HTTPS is essential for the site to be a PWA. Most likely you might already have heard of it and maybe using it, so I didn't stress on it.

[OPTIONAL] You can check the status of your PWA by Lighthouse Audit.😄

## Make your app

Yes!

If you have reached so far why not go a step further?

If you want you can build your apps to be uploaded to Microsoft Store, Play Store and App Store via [PWA-Builder](https://www.pwabuilder.com).

First you'll have to enter the url of your site and click enter. It will rate your PWA out of 100. If you followed this guide you'll get 95. Not bad. 😅

You will see a bright purple button on top right, a page will come with instructions to download the apps and proceed further. If you need help, you can always drop a comment below.😀

Until next time!

Cheers!🍻
