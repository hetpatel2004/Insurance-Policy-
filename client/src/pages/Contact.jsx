import { useState } from 'react'
import { Container, Row, Col, Card, Badge, Button, Form } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { TelephoneFill, EnvelopeFill, GeoAltFill, Clock } from 'react-bootstrap-icons'
import NavbarComp from '../components/NavbarComp'
import Footer from '../components/Footer'
import ParticleBackground from '../components/ParticleBackground'
import { notifySuccess, notifyError } from '../utils/toast'

const contactInfo = [
  { icon: TelephoneFill, title: 'Call Us', value: '+91 1800 123 456', sub: 'Mon–Sat, 9am to 8pm' },
  { icon: EnvelopeFill, title: 'Email Us', value: 'support@securelife.com', sub: 'We reply within 24 hours' },
  { icon: GeoAltFill, title: 'Visit Us', value: 'SecureLife Insurance, Mumbai, India', sub: 'By appointment' },
  { icon: Clock, title: 'Working Hours', value: 'Mon–Sat: 9am – 8pm', sub: '24/7 claim support' },
]

const Contact = () => {
  const [sending, setSending] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      notifySuccess('Your message has been sent! Our team will get back to you soon.')
      e.target.reset()
    }, 800)
  }

  return (
    <>
      <ParticleBackground />
      <NavbarComp />
      <main style={{ position: 'relative', zIndex: 1, paddingTop: '120px', minHeight: '80vh' }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-5"
          >
            <Badge
              bg="none"
              className="rounded-pill px-4 py-2 mb-3"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: 'var(--primary-light)', fontSize: '0.85rem' }}
            >
              Contact Us
            </Badge>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text-primary)' }}>
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p style={{ color: 'var(--text-muted-2)', maxWidth: '600px', margin: '1.5rem auto 0', fontSize: '1.1rem', lineHeight: 1.8 }}>
              Have a question about a policy or need help with a claim? Reach out — our team is
              always ready to help.
            </p>
          </motion.div>

          <Row className="g-4 mb-5">
            {contactInfo.map((c, i) => (
              <Col xs={12} sm={6} lg={3} key={c.title}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-card h-100 text-center" style={{ padding: '28px 16px' }}>
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3 mx-auto mb-3"
                      style={{ width: '52px', height: '52px', background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}
                    >
                      <c.icon size={24} />
                    </div>
                    <h6 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{c.title}</h6>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{c.value}</div>
                    <div style={{ color: 'var(--text-muted-2)', fontSize: '0.8rem' }}>{c.sub}</div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          <Row className="g-4 pb-5 justify-content-center">
            <Col lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card" style={{ padding: '40px' }}>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Send us a Message
                  </h3>
                  <p style={{ color: 'var(--text-muted-2)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                  <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Control
                          required
                          name="name"
                          placeholder="Your Name"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px' }}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          required
                          type="email"
                          name="email"
                          placeholder="Your Email"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px' }}
                        />
                      </Col>
                      <Col xs={12}>
                        <Form.Control
                          required
                          name="subject"
                          placeholder="Subject"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px' }}
                        />
                      </Col>
                      <Col xs={12}>
                        <Form.Control
                          required
                          as="textarea"
                          name="message"
                          rows={5}
                          placeholder="How can we help you?"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', resize: 'vertical' }}
                        />
                      </Col>
                      <Col xs={12} className="text-end">
                        <Button
                          type="submit"
                          disabled={sending}
                          className="rounded-pill px-5 py-2 gradient-bg border-0"
                          style={{ fontWeight: 700 }}
                        >
                          {sending ? 'Sending...' : 'Send Message'}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </main>
      <Footer />
    </>
  )
}

export default Contact
