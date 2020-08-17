---
title: "Paper 2.0.0 bugs and other strange behaviors"
path: /mastering-paper/paper-2-0/
date: 2014-09-28T14:59:29-04:00
last_modified_at: 2020-01-06T10:36:27-05:00
excerpt: "Documented bugs and other strange behaviors found in Paper for iOS version 2.0.0 when using Pencil."
categories: [mastering-paper]
tags: [Paper for iOS, Pencil by 53, Pogo Connect, Apple]
image: ../../images/paper-2-0-0-feature.jpg
toc: true
comments: true
comments_locked: true
---

With **FiftyThree's Paper** hitting 2.0 and Apple's iOS 8 system update dropping recently we've seen some noticeable [improvements in the software](/mastering-paper/watercolor-brush-update/) along with brand new features like [Mix](/mastering-paper/mix-with-me/) and **Surface Pressure**.

With such a substantial upgrade to both Paper and iOS, a few bugs were bound to slip through. My goal with this post is to document these "bugs" and what conditions they occur under.

If you've experienced any of these know that you're not alone and hopefully a fix or official workaround from FiftyThree is on the way.

## Using a stylus to Blend is unreliable

I've always used Paper's Blend feature as designed: draw with Pencil and smudge with one of my fingers. Because I'm a finger blender I learned about this next bit from [Edwin over on Tumblr](https://mademistakes.tumblr.com/post/98571965783/paper-200-193). For those of you who prefer using a capacitive stylus like [Wacom's Bamboo](https://amzn.to/2ZXG3AX) to smudge, you may need to change your work-flow after updating Paper to version 2.0.0...

In my tests this appears to be limited to styli with smaller nibs. In **Paper 2.0.0 (193)**, smudging with these sorts of nibs no longer works... well not 100% of the time. If you press hard enough to "squish" the tip it might register as a touch and smudge but at the cost of wearing out faster.

I tried several styli with rubber nibs to see if it was indeed the tip's size or some other quality. As long as the tip is fat enough Paper will interpret it as a finger touch and Blend --- and sometimes draw ([see bug below](#pencil-nothing-bug)). Anything smaller it ignores as a way of filtering out touches to avoid making errant smudges.

[[notice | Dumb stylus woes]]
| I've also observed Paper getting confused when pressing lightly with a capacitive styli. I'd expect it to Blend or not do anything, but instead it begins drawing marks.

`youtube: https://www.youtube.com/watch?v=cleK43E6M6o`

While I believe activating Blend with finger sized touch targets is the intended behavior. I do see how it could be bothersome for those who prefer using a stylus (that falls under the size threshold[^small-tip]) to Blend. If you want to test it out here are the steps I followed:

[^small-tip]: Known small tip styli with Blend problems: Wacom Bamboo, ZEN 3-in-1, Universal Touch Screen Pen.

1. Tap Settings in the upper right corner.
2. Choose Pencil.
3. Set Finger to **Blend**.
4. Draw something with Pencil.
5. Attempt to smudge something with another stylus.
6. Lightly drag this same stylus' tip across the screen.

## Pencil "nothing" bug

Under ideal conditions, a Pencil stylus paired to Paper should only draw/paint/erase with it's tip and Blend with a finger. I've found that a stylus used in place of your finger will *draw* even if you've turned off the Blend feature. Here's how to reproduce the bug:

1. Tap Settings in the upper right corner.
2. Choose Pencil.
3. Set Finger to **Nothing**.
4. Make a stroke with Pencil.
5. Switch to another stylus and make another stroke.

It doesn't always draw and it doesn't happen with every stylus. Capacitive tip styli with smaller tips exhibit it more often than those that are fat and squishy --- but not always.

[[notice | Be mindful of how you hold Pencil]]
| If your palm or another finger depresses the Eraser end of Pencil as you draw it will begin erasing instead.

## Pogo Connect bug

I've been using my Pogo Connect less and less these days so this bug hasn't been that troubling for me. But for those of you who rely on it (especially pre-iPad air users), you may want to take extra care when using a Pogo Connect until this bug is fixed.

This is a weird one and I'm not entirely sure why it's happening, but it certainly feels like it has something to do with the [new watercolor brush behavior](/mastering-paper/watercolor-brush-update/). Here's how to reproduce it:

1. Draw something with one of the ink tools.
2. Switch to the watercolor brush and paint.
3. Invoke the Rewind gesture.

Here's a video to better show what's going on, but the gist of it is this. 

`youtube: https://www.youtube.com/watch?v=2BJerajpehQ`

If you paint something after drawing and then invoke Rewind, it undoes the drawing strokes instead of the painted strokes with no way or restoring them.

### How to avoid the bug

To get around this bug take extra care when using the fountain pen, pencil, and watercolor brush tools. As far as I can tell if you make strokes with the fountain pen or pencil tools and then paint with the brush, you could potentially lose parts of your artwork after Rewinding. It doesn't happen all the time but is more prevalent when switching tools quickly.

## iOS accessibility zoom and Pencil

Back before Paper had the Loupe tool, many of us resorted to the *Accessibility Zoom hack* as a crude way of zooming in and doing detail work. By going into the **Settings app**, selecting *General > Accessibility*, you could turn on a 3 finger tap gesture to magnify the screen.

![iOS 8 Settings app screenshot](../../images/ios-8-accessibility-zoom.jpg)

If you use FiftyThree's Pencil, have the **2.0.0 version** of Paper, and the zoom accessibility feature enabled, you're in for a rude awakening. When you launch Paper you won't be able to flip pages, draw, open the tool tray, or pretty much anything else.

I'm sure there is a good reason for this, but for now you need to *disable Zoom* in the Settings app to use Paper properly.

`youtube: https://www.youtube.com/watch?v=6_n1eWpZlV8`

For those of you that don't use Pencil, the 3 finger tap accessibility zoom gesture works perfectly fine in Paper 2.0.0.

### Other bugs

Have you noticed any other bugs since updating to Paper 2.0.0 or iOS 8? Let me know in the comments section below so I can include them in the list.
