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
      })
      // then will reset the form to nothing
      .then(() => setName(''), setEmail(''), setReference(''), setMessage(''))
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
      <div className="form-group">
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
      <div className="form-group">
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
      <div className="form-group">
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
      <div className="form-group">
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
      <div className="form-group">
        <button
          id="saveForm"
          name="saveForm"
          className="btn submit"
          type="submit"
        >
          Send message
        </button>
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
          If you have a project that you'd like to discuss, then please contact
          me <a href="https://wa.me/919315852108">on Whatsapp</a> or write to me
          at <a href="mailto:i@alokprateek.in">i@alokprateek.in</a>. A good ol'
          fashioned mail is always welcome, because I like reading and writing
          long mails as I do not have much time for writing shorter replies.
        </p>
        <p>For anything else use the form below.</p>
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
