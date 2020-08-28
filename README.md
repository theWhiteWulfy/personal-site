# [Metoric Teachings](https://alokprateek.in) Source Code

This is the source code of Metoric Teachings, a personal blog and portfolio built
with [Gatsby](https://www.gatsbyjs.org/), [Travis CI](https://travis-ci.org/),  and [Netlify](https://www.netlify.com/).

[![Netlify Status](https://api.netlify.com/api/v1/badges/e57b82b2-6e03-4991-9235-65db79341a3d/deploy-status)](https://app.netlify.com/sites/thewhitewulfy/deploys)

## Getting started

1. **Install dependencies**
  
   ```shell
   yarn install
   ```

2. **Add `.env` file to the root with your GitHub API token.**

   ```env
   GITHUB_API_TOKEN=yourPersonalGitHubApiToken
   ```

   **Note:** do not commit this file. Builds will fail with a `TypeError: Cannot read property 'match' of undefined` since GitHub repo listing on `/pages/works.js` can't resolve the GraphQL query.

3. **Start developing.**
  
   ```shell
   gatsby develop
   ```

   **Note:** When developing on Windows prepend all Gatsby commands with `dotenv` to load environment variables. e.g. `dotenv gatsby build`

4. **Default structure:**

   ```bash
   .
   ├── config
   |   └──site.js             # => site wide config
   ├── src
   |   ├── comments           # => comments content
   |   ├── components
   |   ├── data
   |   |   └── taxonomy.yml   # => taxonomy content
   |   ├── images
   |   ├── pages
   |   ├── posts
   |   ├── styles
   |   ├── templates
   |   └── html.js
   ├── .travis.yml
   ├── gatsby-browser.js
   ├── gatsby-config.js
   ├── gatsby.node.js
   └── staticman.yml
   ```

### Posts and Pages

Posts are all Markdown files and should be placed in `src/posts/` and filed under the appropriate category. Pages can be Markdown or `.js` files placed in `src/pages/`.

```bash
.
├── src
|   ├── posts
|   |   ├── category-name-1
|   |   |   └── filename-slug.md
|   |   ├── category-name-2
|   |   |   └── another-filename-slug.md
```

Front matter available for Markdown files.

|                  | Type     | Description | Example |
| ---------------- | -------- | ----------- | ------- |
| title            | string   | Page title. | `"How I use Jekyll to build sites"` |
| path             | string   | Page permalink. | `/category-name/file-name-slug/` |
| date             | datetime | Published date. | `2020-01-09` |
| last_modified_at | datetime | Updated date. | `2020-01-09T13:52:13-05:00` |
| excerpt          | string   | Page description used a teaser text in listings and SEO purposes. | `"This is a most excellent post about static site generators."` |
| image            | string   | Path to an image (relative to the Markdown file) used as a cover or teaser in listings and SEO purposes. | `../../images/post-image.jpeg` |
| categories       | array    | Categories to classify the post as. | `[articles]` |
| tags             | array    | Tags to classify the post as. | `[web development, GitHub, tutorial]` |
| toc              | boolean  | Display table of contents links. | `true` |
| hide_meta        | boolean  | Hide post meta data from page e.g. (date, read time, etc.) | `true` |
| comments         | boolean  | Display comments. Disabled by default. | `true` |
| comments_locked  | boolean  | Lock a comment threads discussion. | `true` |
| featured         | boolean  | Mark a post post/page as featured. | `true` |

### Taxonomy Data File

`src/data/taxonomy.yml` file contains key/value pairs for all categories and tags used across the site. This file is useful for adding custom content to be used on category and tag pages.

|         | Type   | Description                                   |
| ------- | ------ | --------------------------------------------- |
| id      | string | Value used in `tags` and `categories` arrays. |
| name    | string | Display name.                                 |
| excerpt | string | Plain text description.                       |
| html    | string | HTML description.                             |

**Example:**

```yaml
- id: work
  name: Works
  excerpt: A selection of things I’ve designed, illustrated, and developed.
  html: |
    <p>A selection of things I’ve designed, illustrated, and developed.</p>
```

### Markdown content

HTML recipes and such for styling custom bits of content used in Markdown files.

#### Figures

TODO: Migrate into a component. For now HTML in Markdown will suffice.

**Example:**

```html
<figure>
  <img src="../../images/image.jpeg" alt="">
  <figcaption><p>Figure caption goes here.</p></figcaption>
</figure>
```

**Two column rows:**

```html
<figure class="two-column">
  <img src="../../images/image-1.jpeg" alt="">
  <img src="../../images/image-2.jpeg" alt="">
  <figcaption><p>Figure caption goes here.</p></figcaption>
</figure>
```

**Three column rows:**

```html
<figure class="three-column">
  <img src="../../images/image-1.jpeg" alt="">
  <img src="../../images/image-2.jpeg" alt="">
  <img src="../../images/image-3.jpeg" alt="">
  <figcaption><p>Figure caption goes here.</p></figcaption>
</figure>
```

#### Notices

Call-out text via [gatsby-remark-custom-blocks](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-custom-blocks) plugin with Markdown.

**Example:**

```markdown
[[notice | iOS screen recording]]
| Apple has built this feature directly into iOS allowing you to [capture the screen](https://support.apple.com/en-us/HT207935) directly on device.
```

#### Thumbnail gallery

TODO: Migrate into a component. For now HTML in Markdown will suffice.

**Example:**

```html
<ul class="gallery-thumbnails">
  <li>
    <a href="../../images/thumbnail-1.jpeg">
      <img src="../../images/image-1.jpeg" alt="">
    </a>
  </li>
  ...
</ul>
```

#### Browser frame

Wrap an image with the `.browser-frame` class to give it browser chrome styling.

**Example:**

```html
<div class="browser-frame">
  <img src="../../images/webpage.jpeg" alt="">
</div>
```

#### Button links

Style links to look like a button.

**Example:**

```html
<p>
  <a href="#" class="btn">Link label</a>
</p>
```

---

## Introduction

The below guide is from [performance matters by travis downs](https://travisdowns.github.io/blog/2020/02/05/now-with-comments.html)

I am using [staticman](https://staticman.net/), created by [Eduardo Bouças](https://github.com/eduardoboucas), as my comments system for this static site.

The basic flow for comment submission is as follows:

 1. A reader submits the comment form on a blog post.
 2. Javascript[^backup] attached to the form submits it to my _staticman API bridge[^bridge]_ running on Heroku.
 3. The API bridge does some validation of the request and submits a pull request to the github repo hosting my blog, consisting of a .yml file with the post content and meta data.
 4. When I accept the pull request, it triggers a regeneration and republishing of the content (this is a GitHub pages feature), so the reply appears almost immediately[^cache].

Here are the detailed steps to get this working. There are several other tutorials out there, with varying states of exhaustiveness, some of which
I found only after writing most of this, but I'm going to add the pile anyways. There have been several changes to deploying staticman which mean that existing resources (and this one, of course) are marked by which "era" they were written in.

The major changes are:

 - At one point the idea was that everyone would use the public staticman API bridge, but this proved unsustainable. A large amount of the work in setting up staticman is associated with running your own instance of the bridge.
 - There are three version of the staticman API: v1, v2 and v3. This guide uses v2 (although v3 is almost identical[^v3]), but the v1 version is considerably different.

[^v3]: v3 mostly just extends to the URL format for the `/event` endpoint to include the hosting provider (either GitHub or GitLab), allowing the use of GitHub in addition to GitLab. Almost everything in this guide would remain unchanged.

## Set Up GitHub Bot Account

You'll want to create a GitHub _bot account_ which will be the account that the API bridge uses to actually submit the pull requests to your blog repository. In principle, you can skip this step entirely and simply use your existing GitHub account, but I wouldn't recommend it:

 - You'll be generating a _personal access token_ for this account, and uploading it to the cloud (Heroku) and if this somehow gets compromised, it's better that it's a throwaway bot account than your real account.
 - Having a dedicated account makes it easy to segregate work done by the bot, versus what you've done yourself. That is, you probably don't want all the commits and pushes the bot does to show up on your personal account.

The _bot account_ is nothing special: it is just a regular personal account that you'll only be using from the API bridge. So, open a private browser window, go to [GitHub](https://github.com) and choose "Sign Up". Call your bot something specific, which I'll refer to as _GITHUB-BOT-NAME_ from here forwards.

### Generate Personal Access Token

Next, you'll need to generate a GitHub _personal access token_, for your bot account. The [GitHub doc](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) does a better job of explaining this than I can. If you just want everything to work for sure now and in the future, select every single scope when it prompts you, but if you care about security you should only need the _repo_ and _user_ scopes (today):

**Repo scope:**
{% include assetimg.md alt="Repo scope" path="scopes-repo.png" %}

**User scope:**
{% include assetimg.md alt="User scope" path="scopes-user.png" %}

Copy and paste the displayed token somewhere safe: you'll need this token in a later step where I'll refer to it as  _${github\_token}_. Once you close this page there is no way to recover the access token.

## Set Up the Blog Repository Configuration

You'll need to include configuration for staticman in two separate places in your blog repository: `_config.yml` (the primary Jekyll config file) and `staticman.yml`, both at the top level of the repository.

In general, the stuff that goes in `_config.yml` is for use within the static generation phase of your site, e.g., controlling the generation of the comment form and the associated javascipt. The stuff in `staticman.yml` isn't used during generation, but is used dynamically by the API bridge (read directly from GitHub on each request) to configure the activities of the bridge. A few thigns are duplicated in both places.

### Configuring staticman.yml

Most of the configuration for the ABI bridge is set in `staticman.yml` which lives in the top level of your _blog repository_. This means that one API bridge can support many different blog repositories, each with their own configuration (indeed, this feature was critical for the original design of a shared ABI bridge).

[Here's a sample file](https://github.com/eduardoboucas/staticman/blob/master/staticman.sample.yml) from the staticman GitHub repository, but you might want to use [this one](https://github.com/travisdowns/travisdowns.github.io/blob/master/staticman.yml) from my repository as it is a bit more fleshed out.

The main things you want to change are shown below.

~~~yaml

# all of these fields are nested under the comments key, which corresponds to the final element
# of the API bridge enpoint, i.e., you can different configurations even within the same staticman.yml
# file all under different keys
comments:

  # There are many more required config values here, not shown:
  # use the file linked above as a template

  # I guess used only for email notifications?
  name: "Performance Matters Blog"

  # You may want a different set of "required fields". Staticman will
  # reject posts without all of these fields
  requiredFields: ["name", "email", "message"]

  # you are going to want reCaptcha set up, but for now leave it disabled because we need the API
  # bridge up and running in order to encrypt the secrets that go in this section
  reCaptcha:
    enabled: false
  #  siteKey: 6LcWstQUAAAAALoGBcmKsgCFbMQqkiGiEt361nK1
  #  secret: a big encrypted secret (see Note above)


~~~

### Configuring _config.yml

The remainder of the configuration goes in `_config.yml`. Here's the configuration I added to start with (we'll add a bit more later):

~~~yaml
# The URL for the staticman API bridge endpoint
# You will want to modify some of the values:
#  ${github-username}: the username of the account with which you publish your blog
#  ${blog-repo}: the name of your blog repository in github
#  master: this the branch out of which your blog is published, often master or gh-pages
#  ${bridge_app_name}: the name you chose in Heroku for your bridge API
#  comments: the so-called property, this defines the key in staticman.yml where the configuration is found
#
# for me, this line reads:
# https://staticman-travisdownsio.herokuapp.com/v2/entry/travisdowns/travisdowns.github.io/master/comments
staticman_url: https://${bridge_app_name}.herokuapp.com/v2/entry/${github-username}/${blog-repo}/master/comments
~~~

## Set Up the API Bridge

This section covers deploying a private instances of the API bridge to Heroku.

### Generate an RSA Keypair

This keypair will be used to encrypt secrets that will be stored in public places, such as your reCAPTCHA site secret. The sececrets will be encrypted with the public half of the keypair, and decriped in the Bridge API server with the private part.

Use the following on your local to generate to generate the pair:

    ssh-keygen -m PEM -t rsa -b 4096 -C "staticman key" -f ~/.ssh/staticman_key

Don't use any passphrase[^pass]. You can change the `-f` argument if you want to save the key somewhere else, in which case you'll have to use the new location when setting up the Heroku config below.

You can verify the key was genreated by running:

    head -2 ~/.ssh/staticman_key

Which should output something like:

~~~
-----BEGIN RSA PRIVATE KEY-----
MIIJKAIBAAKCAgEAud7+fPWXzuxCoyyGbQTYCGi9C1N984roI/Tr7yJi074F+Cfp
~~~

Your second line will vary of course, but the first line must be `-----BEGIN RSA PRIVATE KEY-----`. If you see something else, perhaps mentioning `OPENSSH PRIVATE KEY`, it won't work.

[^pass]: You could use a passphrase, but then you'll have to change the `cat` used below to echo the key into the Heroku config. If you want to be super safe, best is to generate the key to a transient location like ramfs and then simply delete the private portion after you've uploaded it to the Heroku config.

### Sign Up for Heroku

The original idea of staticman was to have a public API bridge that everyone uses for free. However, in practice this hasn't proved sustainable as whatever free tier the thing was running on tends to hit its limits and then the fun stops. So the current recommendation is to set up a free instance of the API bridge on Heroku. So let's do that.

[Sign up](https://signup.heroku.com/) for a free account on Heroku. No credit card is required and a free account should give you enough juice for at least 1,000 comments a month[^juice].

### Deploy Staticman Bridge to Heroku

The easiest way to do this is simply to click the _Deploy to Heroku_ button in the [README on the staticman repo](https://github.com/eduardoboucas/staticman):

{% include assetimg.md alt="Deploy" path="deploy.png" width="50%" %}

You'll see probably some logging indicating that the project is downloading, building and then successfully deployed.

### Configure Bridge Secrets

The bridge needs a couple of secrets to do its job:

 - The _GitHub personal access token_ of your bot account. This lets it do work on behalf of your bot account (in particular, submit pull requests to your blog repository).
 - The private key of the keypair you generated earlier.

If you want, you can add both of these through the Heroku web dashboard: go to Settings -> Reveal Config Vars, and enter them [like this]({{assetpath}}/config-vars.png)).

However, you might as well get familiar with the Heroku command line, because it's pretty cool and allows you to complete this flow without having your GitHub token flow through your clipboard and makes it easy to remove the newline characters in the private key.

Follow [the instructions](https://devcenter.heroku.com/articles/heroku-cli) to install and login to the Heroku CLI, then issue the following commands from any directory (note that `${github_token}` is the _personal access token_ you generated earlier: copy and paste it into the command):


~~~bash
heroku config:add --app ${bridge_app_name} "RSA_PRIVATE_KEY=$(cat ~/.ssh/staticman_key | tr -d '\n')"
heroku config:add --app ${bridge_app_name} "GITHUB_TOKEN=${github_token}"
~~~

Here, the `tr -d '\n'` part of the pipeline is removing the newlines from the private key, since Heroku config variables can't handle them and/or the API bridge can't handle them.

You can check that the config was correctly set by outputting it as follows:

~~~bash
heroku config --app ${bridge_app_name}
~~~


[^backup]: If javascript is disabled, a regular POST action takes over.
[^bridge]: I don't think you'll find this _bridge_ term in the official documentation, but I'm going to use it here.
[^cache]: Well, subject to whatever edge caching GitHub pages is using -- btw you can bust the cache by appending any random query parameter to the page: `...post.html?foo=1234`.
[^juice]: In particular, the _unverified_ (no credit card) free tier gives you 550 hours of uptime a month, and since the _dyno_ (heroku speak for their on-demand host) sleeps after 30 minutes, I figure you can handle 550/0.5 = 1100 sparsely submitted comments. Of course, if comments come in bursts, you could handle much more than that, since you've already "paid" for the 30 minute uptime.

## Invite and Accept Bot to Blog Repo

Finally, you need to invite your GitHub _bot account_ that you created earlier to your blog repository[^whycollab] and accept the invite.

[^whycollab]: The bot needs to be a collaborator to, at a minimum, commit comments to the repository, and to delete branches (using the delete branches webhook which cleans up comment related branches). However, it is possible to not use either of these features if you have moderation enabled (in which case comments arrive as a PR, which doesn't require any particular permissions), and aren't using the webhook. So maybe you could do without the collaborator status in that case? I haven't tested it.

Open your blog repository, go to _Settings -> Collaborators_ and search for and add the GitHub bot account that you created earlier as a collaborator:

{% include assetimg.md alt="Adding Collaborators" path="add-collab.png" %}

Next, accept[^invite] the invitation using the bridge API, by going to the following URL:

    https://${bridge_app_name}.herokuapp.com/v2/connect/${github-username}/${blog-repo}

You should see `OK!` as the output if it worked: this only appears _once_ when the invitation got accepted, at all other times it will show `Invitation not found`.

[^invite]: I guess you can also just accept the invitation by opening the email sent to you by github and following the link there. This workflow involving the `v2/connect` endpoint probably made more sense when the API was meant to be shared among many uses using a common github bot account.

## Enable reCAPTCHA

You are going to want to gate comment submission using reCAPTCHA or a similar system so you don't get destroyed by spam (even if you have moderation enabled, dealing with all the pull requests will probably be tiring).

Here we'll cover setting up reCAPTCHA, which has built-in support in staticman. Although it involves modifying the same `_config.yml` and `staticman.yml` files that we've modified before, this part of the configuration needs to occur after the bridge is running because we use the `/encrypt` endpoint on the bridge as part of the setup.

### Sign Up for reCAPTCHA

Go to [reCAPTCHA](https://developers.google.com/recaptcha) and sign up if you haven't already, and create a new site. We are going to use the "v2, Checkbox" variant ([docs here](https://developers.google.com/recaptcha/docs/display)), although I'm interested to hear how it works out with other variants.

You will need the reCAPTCHA _site key_ and _secret key_ for configuration in the next section.

### Configure reCAPTCHA

Next, we need to add the _site key_ and _secret key_ to the `_config.yml` and `staticman.yml` config files.

The _site key_ will be used as-is, but the _secret key_ property will be [_encrypted_](https://staticman.net/docs/encryption) so that it is not exposed in plaintext in your configuration files. To encrypt the secret key copy the secret from the reCAPTCHA admin console, and load the following URL from your API bridge, replacing `YOUR_SITE_KEY` at with the copied secret key.

    https://${bridge_app_name}.herokuapp.com/v2/encrypt/YOUR_SITE_KEY

You should get a blob of characters back as a result (considerably longer than the original secret) -- it is _this_ value that you need to include as `reCaptcha.secret` in both `staticman.yml` and in `_config.yml`.

The reCAPTCHA configuration for both files is almost the same. It looks like this for `staticman.yml`:

~~~yaml
comments:

  # more stuff

  # note that reCaptcha is nested under comments
  reCaptcha:
    enabled: true
    # the siteKey is used as-is (no encryption)
    siteKey: 6LcWstQUAAAAALoGBcmKsgCFbMQqkiGiEt361nK1
    # the secret is the encrypted blob you got back from the encrypt call
    secret: a big encrypted secret (see description above)
~~~

The `_config.yml` version is similar except that they key appears at the top level and there is no enabled property:

~~~yaml
# reCaptcha configuration info: the exact same site key and *encrypted* secret that you used in staticman.yml
# I personally don't think the secret needs to be included in the generated site, but the staticman API bridge uses
# it to ensure the site configuration and bridge configuration match (but why not just compare the site key?)
reCaptcha:
  siteKey: 6LcWstQUAAAAALoGBcmKsgCFbMQqkiGiEt361nK1
  secret: exactly the same secret as the staticman.yml file
~~~


## License

Copyright (c) 2004-2020 Alok Prateek

Metoric Teachings incorporates photographs from [Unsplash](https://unsplash.com).

