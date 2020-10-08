import { graphql, Link } from 'gatsby'
import React, { useState, useEffect } from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import firebase from '../components/firebase'
import site from '../../config/site'
import style from '../styles/archive.module.css'

const metaImage = site.image

const LeadForm = () => {
  // useState() hook captures the value from the input value
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [reference, setReference] = useState('')
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(true)
  const visiblityconditional = visible
    ? 'contact-form-show'
    : 'contact-form-hide'
  const visiblityunconditional = visible
    ? 'contact-form-hide'
    : 'contact-form-show'

  let clientinfo
  if (typeof window !== 'undefined') {
    let sBrowser
    const sUsrAg = navigator.userAgent
    // The order matters here, and this may report false positives for unlisted browsers.
    if (sUsrAg.indexOf('Firefox') > -1) {
      sBrowser = 'Mozilla Firefox'
      // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
    } else if (sUsrAg.indexOf('SamsungBrowser') > -1) {
      sBrowser = 'Samsung Internet'
      // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
    } else if (sUsrAg.indexOf('Opera') > -1 || sUsrAg.indexOf('OPR') > -1) {
      sBrowser = 'Opera'
      // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
    } else if (sUsrAg.indexOf('Trident') > -1) {
      sBrowser = 'Microsoft Internet Explorer'
      // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
    } else if (sUsrAg.indexOf('Edge') > -1) {
      sBrowser = 'Microsoft Edge'
      // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
    } else if (sUsrAg.indexOf('Chrome') > -1) {
      sBrowser = 'Google Chrome or Chromium'
      // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
    } else if (sUsrAg.indexOf('Safari') > -1) {
      sBrowser = 'Apple Safari'
      // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
    } else {
      sBrowser = 'unknown'
    }

    clientinfo = {
      'browser-name': sBrowser,
      'browser-version': navigator.appVersion,
      'cookies-enabled': navigator.cookieEnabled,
      'browser-language': navigator.language,
      'browser-online': navigator.onLine,
      platform: navigator.platform,
      'user-agent-header': navigator.userAgent,
      'browser-vendor': navigator.vendor,
      'network-type': navigator.connection.type,
      'connection-type': navigator.connection.effectiveType,
      'data-saver-plan': navigator.connection.saveData,
      'ram-memory': navigator.deviceMemory,
      'automation-or-bot': navigator.webdriver,
    }
  }

  // The onSubmit function we takes the 'e' or event and submits it to Firebase
  const onSubmit = (e) => {
    e.preventDefault() // preventDefault is important because it prevents the whole page from reloading
    firebase
      .firestore()
      .collection('leads')
      .add({
        name,
        email,
        reference,
        message,
        timestamp: new Date().toISOString(),
        clientinfo,
      })
      // then will reset the form to nothing
      .then(() => {
        /* 
        setName('')
        setEmail('')
        setReference('')
        setMessage('')
        */
        setVisible(!visible)
      })
  }

  return (
    <form
      id="contact-form"
      name="contact-form"
      acceptCharset="UTF-8"
      autoComplete="off"
      encType="multipart/form-data"
      method="post"
      onSubmit={onSubmit}
    >
      <div className={`${'form-group' + ' '}${visiblityconditional}`}>
        <label id="name-label" htmlFor="usrname">
          Name
          <input
            id="usrname"
            name="usrname"
            type="text"
            spellCheck="false"
            maxLength={511}
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </label>
      </div>
      <div className={`${'form-group' + ' '}${visiblityconditional}`}>
        <label id="email-label" htmlFor="email">
          Email address <small>(will remain private)</small>
          <input
            id="email"
            name="email"
            type="email"
            spellCheck="false"
            maxLength={511}
            required
            pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </label>
      </div>
      <div className={`${'form-group' + ' '}${visiblityconditional}`}>
        <label id="msg-label" htmlFor="msg">
          Message
          <textarea
            id="msg"
            name="msg"
            spellCheck="true"
            rows={10}
            cols={50}
            required
            defaultValue={''}
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          />
        </label>
      </div>
      <div className={`${'form-group' + ' '}${visiblityconditional}`}>
        <label id="ref-label" htmlFor="ref">
          How’d you hear about my website?
          <input
            id="ref"
            name="ref"
            type="text"
            maxLength={255}
            placeholder="e.g. Came from LinkedIn/Github/Google"
            value={reference}
            onChange={(e) => setReference(e.currentTarget.value)}
          />
        </label>
      </div>
      <div className={`${'form-group' + ' '}${visiblityconditional}`}>
        <button
          id="saveForm"
          name="saveForm"
          className="btn submit"
          type="submit"
        >
          Send message
        </button>
      </div>

      <div
        className={`${
          'custom-block' + ' ' + 'notice' + ' '
        }${visiblityunconditional}`}
      >
        <div className="custom-block-heading">Message successfully sent!</div>
        <div className="custom-block-body">
          <p>Hey {name}!</p>
          <p>
            I have received your message, so keep an eye out on your mailbox to
            see if you have a reply. I'll try my best to get back to you within
            a day. And while you wait go ahead and read my{' '}
            <Link to="/notes/">latest posts</Link>.
          </p>
          <p>
            Till then, cheers!
            <span role="img" aria-label="Cheers">
              🍻
            </span>
          </p>
        </div>
      </div>
    </form>
  )
}

const ContactPage = () => (
  <Layout>
    <SEO
      title={`Contact Me | ${site.titleAlt}`}
      path="/contact/"
      description="Preferred methods of sending your questions, inquires, messages, and love letters to me."
      metaImage={metaImage}
    />
    <main className={style.main}>
      <div className={style.title}>
        <h1 className={style.heading}>
          <span>Contact Me</span>
        </h1>
      </div>

      <div className={style.content}>
        <p>
          Have a question for me? My direct messages are open on either{' '}
          <a href="https://instagram.com/thewhitewulfy">Instagram</a> or{' '}
          <a href="https://twitter.com/thewhitewulfy">Twitter</a> for short and
          succinct messages. Before sending, please read my{' '}
          <Link to="/faqs/">frequently asked questions section</Link> first to
          make sure I haven't already answered it.
        </p>
        <p>
          If you have a project that you'd like to discuss, it is faster and
          more efficient to contact me{' '}
          <a href="https://wa.me/919315852108">on Whatsapp</a> or write a mail
          to me at <a href="mailto:i@alokprateek.in">i@alokprateek.in</a>. A
          good ol' fashioned mail is always welcome, because I like reading and
          writing long mails as I do not have much time for writing shorter
          replies.
        </p>
        <p>
          If you are willing to wait and for anything else use the form below.
        </p>
        <LeadForm />
      </div>
    </main>
  </Layout>
)

export const pageQuery = graphql`
  query ContactQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default ContactPage
