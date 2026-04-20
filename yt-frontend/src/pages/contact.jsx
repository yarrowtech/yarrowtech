import React, { useEffect, useState } from 'react'
import { Mail, MapPin, Phone, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import './contact.css'

export default function ContactPage({ open = true, onClose, isModal = false, currentUser }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [animate, setAnimate] = useState(false)

  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    (typeof window !== 'undefined' && window.__API_BASE__) ||
    'http://localhost:5000'

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimate(true), 200)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: currentUser?.name || prev.name,
      email: currentUser?.email || prev.email,
    }))
  }, [currentUser])

  useEffect(() => {
    if (!isModal || !open) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isModal, onClose, open])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy) return

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields.')
      return
    }

    const loadingId = toast.loading('Sending your message...')
    setBusy(true)
    setSubmitted(false)

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to send. Please try again.')
      }

      toast.success('Message sent!', { id: loadingId })
      setFormData({ name: '', email: '', message: '' })
      setSubmitted(true)

      window.setTimeout(() => setSubmitted(false), 4000)

      if (isModal && onClose) {
        window.setTimeout(() => onClose(), 1200)
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong.', { id: loadingId })
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  const contactContent = (
    <section
      id={isModal ? undefined : 'contact'}
      className={`contact-section ${isModal ? 'contact-section-modal' : ''}`}
    >
      <div className={`container fade-in ${animate ? 'show' : ''}`}>
        <div className="contact-heading slide-up">
          <span className="contact-badge">Let&apos;s Talk</span>
          <h2 className="title">Contact Us</h2>
          <p className="subtitle">
            Share your requirement, question, or idea and our team will get back to you
            with the right next step.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info slide-up delay-3">
            <div className="contact-info-panel">
              <p className="contact-eyebrow">Speak with our team</p>
              <h3>Start your project conversation with Yarrowtech</h3>
              <p className="contact-description">
                Whether you need a website, ERP solution, mobile app, or custom software,
                we are ready to understand your goals and guide you from planning to delivery.
              </p>

              <div className="contact-highlights">
                <div className="contact-highlight">
                  <strong>Fast response</strong>
                  <span>We usually reply within one business day.</span>
                </div>
                <div className="contact-highlight">
                  <strong>Expert guidance</strong>
                  <span>Get help choosing the right service for your business.</span>
                </div>
              </div>
            </div>

            <div className="left-card-group">
              <div className="info-card">
                <div className="info-icon-wrap">
                  <Mail size={24} className="icon" />
                </div>
                <div className="info-copy">
                  <h4>Email</h4>
                  <span>Send us your project details</span>
                  <p>career@yarrowtech.co.in</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrap">
                  <Phone size={24} className="icon" />
                </div>
                <div className="info-copy">
                  <h4>Phone</h4>
                  <span>Talk directly with our team</span>
                  <p>+91 9830590929</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon-wrap">
                  <MapPin size={24} className="icon" />
                </div>
                <div className="info-copy">
                  <h4>Address</h4>
                  <span>Visit our office location</span>
                  <p>3A, Humayan Place, Esplanade, Kolkata, India</p>
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form slide-up delay-4" onSubmit={handleSubmit} noValidate>
            <div className="form-header">
              <p className="form-kicker">Send a message</p>
              <h3>Tell us what you need</h3>
              <p>
                Fill out the form and we&apos;ll connect you with the right person from our team.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="contact-name">Your Name</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Enter your name"
                onChange={handleChange}
                value={formData.name}
                disabled={busy}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">Your Email</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                value={formData.email}
                disabled={busy}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Your Message</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Tell us about your project, service need, or question..."
                rows="6"
                onChange={handleChange}
                value={formData.message}
                disabled={busy}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={busy}>
              <Send size={18} />
              {busy ? 'Sending...' : 'Send Message'}
            </button>

            {submitted && (
              <p className="success-msg">Thank you. We&apos;ll get back to you soon.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )

  if (!isModal) {
    return contactContent
  }

  return (
    <div className="contact-modal-overlay" onClick={() => onClose?.()}>
      <div className="contact-modal-shell" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="contact-modal-close"
          onClick={() => onClose?.()}
          aria-label="Close contact form"
        >
          <X size={20} />
        </button>
        {contactContent}
      </div>
    </div>
  )
}
