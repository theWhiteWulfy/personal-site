import React from 'react'
import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import { loadReCaptcha, ReCaptcha } from 'react-recaptcha-google'
import Alert from '../alert'

import site from '../../../config/site'

import style from '../../styles/comment-form.module.css'

class CommentForm extends React.Component {
  constructor(props, context) {
    super(props, context)
    const slugDir = this.props.slug.replace(/^\/+|/g, ``)

    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this)
    this.verifyCallback = this.verifyCallback.bind(this)

    this.initialState = {
      submitting: false,
      success: false,
      error: false,
      errorCaptcha: false,
      isCaptchaValid: false,
      commentCount: this.props.commentCount,
      newComment: {
        parent: this.props.slug,
        slug: slugDir,
        'fields[name]': '',
        'fields[email]': '',
        'fields[url]': '',
        'fields[message]': '',
      },
    }

    this.state = this.initialState
  }

  componentDidMount() {
    loadReCaptcha()
    if (this.captcha) {
      this.captcha.reset()
    }
  }

  onLoadRecaptcha() {
    if (this.captcha) {
      this.captcha.reset()
    }
  }

  onSubmitComment = async event => {
    event.preventDefault()

    this.setState({ submitting: true })

    // extract form data
    const formdata = new FormData(event.target)
    const formUrl = site.staticmanApi

    // convert formData to json object
    // SOURCE: https://stackoverflow.com/a/46774073
    const json = {}
    formdata.forEach(function(value, prop) {
      json[prop] = value
    })

    // convert json to urlencoded query string
    // SOURCE: https://stackoverflow.com/a/37562814 (comments)
    const formBody = Object.keys(json)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(json[key]))
      .join('&')

    // POST the request to Staticman's API endpoint
    if (this.state.isCaptchaValid) {
      const response = await fetch(formUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      })

      if (response.ok === true) {
        this.setState(prevState => ({
          ...prevState,
          newComment: {
            parent: '',
            slug: '',
            'fields[name]': '',
            'fields[email]': '',
            'fields[url]': '',
            'fields[message]': '',
          },
          success: true,
          error: false,
        }))
      } else {
        this.setState({ ...this.initialState, error: true })
      }
    } else {
      this.captcha.reset()
      this.setState({ submitting: false })
      this.setState({ ...this.initialState, errorCaptcha: true })
    }
  }

  handleChange = event => {
    const { newComment } = this.state
    const { name, value } = event.target

    this.setState({
      newComment: { ...newComment, [name]: value },
    })
  }

  verifyCallback() {
    this.setState({
      isCaptchaValid: true,
    })
  }

  render() {
    const {
      submitting,
      success,
      error,
      errorCaptcha,
      newComment: { name, email, url, message },
    } = this.state

    const showError = () =>
      error && (
        <Alert
          type="danger"
          content="<p><strong>Sorry, there was an error with your submission.</strong> Please make sure all required fields have been completed and try again.</p>"
        />
      )
    const showSuccess = () =>
      success && (
        <Alert
          type="success"
          content="<p><strong>Thanks for your comment!</strong> It is currently pending and will show on the website once approved.</p>"
        />
      )
    const showCaptchaError = () =>
      errorCaptcha && (
        <Alert
          type="danger"
          content="<p><strong>Sorry, there was an error with your submission.</strong> Please make sure the captcha has been completed and try again.</p>"
        />
      )
    const slugDir = this.props.slug.replace(/^\/+|/g, ``)

    return (
      <div>
        {success || error ? (
          showError() || showSuccess()
        ) : (
          <>
            <h3 className={style.title}>Leave a comment</h3>
            <div className={style.instructions}>
              <p>Your email address will not be published.</p>
            </div>
            <form
              id="new-comment"
              className={style.form}
              onSubmit={this.onSubmitComment}
            >
              <input
                name="options[parent]"
                type="hidden"
                value={this.props.slug}
              />
              <input name="options[slug]" type="hidden" value={slugDir} />
              <input
                name="options[reCaptcha][siteKey]"
                type="hidden"
                value={site.reCaptcha.siteKey}
              />
              <input
                name="options[reCaptcha][secret]"
                type="hidden"
                value={site.reCaptcha.secret}
              />
              <div className={style.row}>
                <label className={style.srOnly} htmlFor="message">
                  Comment
                </label>
                <textarea
                  id="message"
                  className={style.textarea}
                  name="fields[message]"
                  value={message}
                  placeholder="New comment"
                  rows="6"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className={style.row}>
                <label className={style.label} htmlFor="name">
                  Name
                  <input
                    id="name"
                    className={style.input}
                    name="fields[name]"
                    value={name}
                    type="text"
                    onChange={this.handleChange}
                    required
                  />
                </label>
                <label className={style.label} htmlFor="email">
                  E-mail
                  <input
                    id="email"
                    className={style.input}
                    name="fields[email]"
                    value={email}
                    type="email"
                    pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
                    onChange={this.handleChange}
                  />
                </label>
              </div>
              <div className={style.row}>
                <label className={style.label} htmlFor="website">
                  Website
                  <input
                    id="website"
                    className={style.input}
                    name="fields[url]"
                    value={url}
                    onChange={this.handleChange}
                    type="text"
                  />
                </label>
              </div>
              <div className={style.row}>
                <ReCaptcha
                  ref={el => {
                    this.captcha = el
                  }}
                  size="normal"
                  data-theme="light"
                  render="explicit"
                  onChange={response => {
                    this.setState({ captchaResponse: response })
                  }}
                  sitekey={site.reCaptcha.siteKey}
                  onloadCallback={this.onLoadRecaptcha}
                  verifyCallback={this.verifyCallback}
                />
              </div>
              {errorCaptcha && showCaptchaError()}
              <button
                className={style.submit}
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Sending. Please wait...' : 'Send comment'}
              </button>
            </form>
            <div className={style.instructions}>
              <p>
                All comments are held for moderation so there can be a delay
                until they appear. I publish comments that are on topic, useful,
                not rude, etc.
              </p>
              <p>
                Comments may be written in{' '}
                <a href="https://commonmark.org/help/" rel="nofollow">
                  <strong>Markdown</strong>
                </a>
                . This is the best way to post any code, inline like
                `&lt;div&gt;this&lt;/div&gt;` or multiline blocks within triple
                backtick fences (```) with double new lines before and after.
              </p>
              <p>
                Want to share something privately?{' '}
                <Link to="/contact/">
                  <strong>Contact me</strong>
                </Link>
                .
              </p>
            </div>
          </>
        )}
      </div>
    )
  }
}

CommentForm.propTypes = {
  slug: PropTypes.string.isRequired,
  commentCount: PropTypes.number,
}

export default CommentForm
