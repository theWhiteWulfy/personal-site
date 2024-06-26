---
title: "Blog API on Github Pages"
excerpt: "Jekyll API + Github Pages + JSON Feed"
path: /articles/jekyll-api-gh-pages/
categories: [articles]
tags: [Jekyll, web development, design, open source]
date: 2019-07-14
last_modified_at: 2020-01-06T09:59:14-05:00
comments: true
featured: true
toc: true
---

We are going to see how to build an API for static websites powered by Jekyll, so you can consume static data via any web/mobile application.

We will also see how we can use the API for JSON feed.

## Steps

### Output data as JSON

If you just need to output some data as JSON you can easily do that using the `jsonify` filter.

All variables in the front matter of your site will be accessible via site variable so we took our YAML array `site.whatever` and convert it to JSON with the `jsonify` liquid filter.

Now let's try with a more practical example. What if you want to get the JSON output of all your posts in a JSON file. That's also not hard using Jekyll. You can do it following these two steps:

- First create the output file with a name, let's call it `output.json`.

- Next open the `output.json` file and add the following code:

```liquid

---
  limit: 10
---

{% for post in site.posts limit: page.limit %}
    {
         "id": "{{ post.id }}",
         "date"     : "{{ post.date | date: "%B %d, %Y" }}",
         "title": {{ post.title | smartify | jsonify }},
         "content_html": {{ post.content | jsonify }},
         "url": "{{ site.url }}{{ post.url }}",
         "summary": {% if post.url contains "/blog/" %}{{ post.excerpt | smartify | jsonify }}{% else %}{{ post.description | smartify | jsonify }}{% endif %},
         "date_published": "{{ post.date }}",
         {% if post.categories %} "categories"  : [
                {% for category in post.categories %} "{{ category }}"
                {% if forloop.last %}{% else %},{% endif %}
                {% endfor %}
                ],
         {% endif %}
         {% if post.categories == nil %} "categories"  : [],  {% endif %}
         {% if post.tags %} "tags"  : [
                {% for tag in post.tags %} "{{ tag }}"
                {% if forloop.last %}{% else %},{% endif %}
                {% endfor %}
                ]
         {% endif %}
         {% if post.tags == nil %} "tags"  : []  {% endif %}
    }{% unless forloop.last == true %},{% endunless %}
{% endfor %}


```

We have looped through all `site.posts` and created a JSON object with each post data separating the objects with a comma. After building your website, Jekyll will take care of parsing the YAML and Liquid data and outputting `output.json` with your posts data in the JSON format.

Go ahead and test it with a Jekyll blog, serve it or build it then look inside of your `_site` folder for your `output.json` with posts data. Or just visit `127.0.0.1:4000/output.json` to see the result.

If you use use github pages go to your blog link `/output.json` and see the result.

The `limit` meta in the front matter controls the number of posts to output as `JSON`.

### Using the output as API

It's simple! Place the `output.json` under a new folder called `api` and rename it `index.json`.

### Making this API as JSON feed

I read about the [JSON feed spec](https://jsonfeed.org/version/1), and I was intrigued by the novelty of it — not the ease of using JSON as much as the insurmountable pain of using Atom XML.

For most developers, JSON is far easier to read and write than XML. Developers may groan at picking up an XML parser, but decoding JSON is often just a single line of code.

Since I already been using Jekyll for my blog, writing the code would need to be done in Liquid without any plugins.

Also in the example we already have a API ready, Why not use it?

```liquid

---
layout: none
---
{
    ""version": "https://jsonfeed.org/version/1",
    "title": {{ site.name | smartify | jsonify }},
    {% if site.description %}"description": {{ site.description | smartify | jsonify }},{% endif %}
    "home_page_url": "{{ site.url }}/",
    "feed_url": "{{ site.url }}/api/index.json",
    "icon": "{{ site.url }}/assets/favicon/android-chrome-192x192.png",
    "favicon": "{{ site.url }}/favicon.ico",
    "author": {
        "name": "{{ site.author }}",
        "url": "https://alokprateek.in/",
        "avatar": "https://alokprateek.in/avatar3.jpg"
    },
    "expired": false,
    "items": [
           ]
}

```

Under `items` whatever existed in `index.json` before goes in, without the front matter, that remains the same.

Fields like `icon`, `favicon`, and `author` depend on your particular implementation, and I didn’t feel like generalizing the code by using front-matter variables rather I just pasted the values directly.

Second, you’ll have to read the spec for the full info on which fields are optional and mandatory.

That’s about it! 😊

For a final example take a look at my final JSON. And you can curl at this link [blog.alokprateek.in/api/](https://blog.alokprateek.in/api/)

```liquid

---
limit: 10
layout: none
---
{
    "version": "https://jsonfeed.org/version/1",
    "title": {{ site.name | smartify | jsonify }},
    {% if site.description %}"description": {{ site.description | smartify | jsonify }},{% endif %}
    "home_page_url": "{{ site.url }}/",
    "feed_url": "{{ site.url }}/api/index.json",
    "icon": "{{ site.url }}/assets/favicon/android-chrome-192x192.png",
    "favicon": "{{ site.url }}/favicon.ico",
    "author": {
        "name": "{{ site.author }}",
        "url": "https://alokprateek.in/",
        "avatar": "https://alokprateek.in/avatar3.jpg"
    },
    "expired": false,
    "items": [
{% for post in site.posts limit: page.limit %}
    {
      "title": "{{ post.title }}",
      "date"     : "{{ post.date | date: "%B %d, %Y" }}",
      "url": "{{ site.url }}{{ post.url }}",
      "summary": {{ post.excerpt | smartify | jsonify }},
      "content_html": {{ post.content | jsonify }},
      {% if post.categories %} "categories"  : [
        {% for category in post.categories %} "{{ category }}"
        {% if forloop.last %}{% else %},{% endif %}
        {% endfor %}
        ],
      {% endif %}
      {% if post.categories == nil %} "categories"  : [],  {% endif %}
      {% if post.tags %} "tags"  : [
        {% for tag in post.tags %} "{{ tag }}"
        {% if forloop.last %}{% else %},{% endif %}
        {% endfor %}
        ]
      {% endif %}
      {% if post.tags == nil %} "tags"  : []  {% endif %}

    }
    {% unless forloop.last %},{% endunless %}
{% endfor %}
    ]
}

```

Until next time!

Cheers!🍻
