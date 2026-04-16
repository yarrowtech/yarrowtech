import React, { useState, useEffect } from 'react'
import './contact.css'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [animate, setAnimate] = useState(false)

  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    (typeof window !== 'undefined' && window.__API_BASE__) ||
    'http://localhost:5000'

  useEffect(() => {
    setTimeout(() => setAnimate(true), 200)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (busy) return

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields.')
      return
    }

    const loadingId = toast.loading('Sending your message…')
    setBusy(true)
    setSubmitted(false)

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to send. Please try again.')
      }

      toast.success('Message sent!', { id: loadingId })
      setFormData({ name: '', email: '', message: '' })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 4000)
    } catch (err) {
      toast.error(err.message || 'Something went wrong.', { id: loadingId })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className={`container fade-in ${animate ? 'show' : ''}`}>

        <h2 className="title slide-up">Contact Us</h2>

        <p className="subtitle slide-up delay-2">
          We’d love to hear from you! Whether you have a question about our services, pricing,
          or projects — our team is here to help.
        </p>

        <div className="contact-grid">

          {/* LEFT SIDE (Equal-height 3 cards) */}
          <div className="contact-info slide-up delay-3">
            <div className="left-card-group">

              <div className="info-card">
                <Mail size={32} className="icon" />
                <div>
                  <h4>Email</h4>
                  <p>career@yarrowtech.co.in</p>
                </div>
              </div>

              <div className="info-card">
                <Phone size={32} className="icon" />
                <div>
                  <h4>Phone</h4>
                  <p>+91 9830590929</p>
                </div>
              </div>

              <div className="info-card">
                <MapPin size={32} className="icon" />
                <div>
                  <h4>Address</h4>
                  <p>3A,Humayan Place , Esplanade, Kolkata, India</p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <form className="contact-form slide-up delay-4" onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                onChange={handleChange}
                value={formData.name}
                disabled={busy}
              />
            </div>

            <div className="form-group">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                value={formData.email}
                disabled={busy}
              />
            </div>

            <div className="form-group">
              <label>Your Message</label>
              <textarea
                name="message"
                placeholder="Write your message here..."
                rows="5"
                onChange={handleChange}
                value={formData.message}
                disabled={busy}
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={busy}>
              <Send size={20} style={{ marginRight: "8px" }} />
              {busy ? "Sending..." : "Send Message"}
            </button>

            {submitted && <p className="success-msg">✅ Thank you! We’ll get back to you soon.</p>}
          </form>

        </div>
      </div>
    </section>
  )
}
