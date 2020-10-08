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
