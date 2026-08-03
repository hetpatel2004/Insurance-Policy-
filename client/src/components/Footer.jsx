import { Container, Row, Col, Button } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { ShieldShaded, ArrowRight, ChatDotsFill, TelephoneFill } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { useStats } from '../hooks/useStats'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { stats } = useStats()
  const navigate = useNavigate()

  const goToPlans = () => {
    navigate('/')
    setTimeout(() => {
      document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })
    }, 200)
  }

  return (
    <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}>
      {/* CTA Section */}
      <div style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Ready to Secure Your Future?
            </h2>
            <p style={{ color: 'var(--text-muted-2)', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
              Join {stats?.users?.toLocaleString() || '50,000'}+ happy customers who trust us with their insurance needs. Get a free quote today!
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Button
                as={Link}
                to="/register"
                className="rounded-pill px-5 py-3 gradient-bg border-0 d-flex align-items-center gap-2"
                style={{ fontWeight: 700, fontSize: '1rem' }}
              >
                Get Started Now <ArrowRight size={18} />
              </Button>
              <Button
                variant="outline-light"
                href="tel:+18001234567"
                className="rounded-pill px-5 py-3 d-flex align-items-center gap-2"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text)', fontWeight: 600 }}
              >
                <TelephoneFill size={16} />
                Call 1-800-123-4567
              </Button>
            </div>
          </motion.div>
        </Container>
      </div>

      {/* Footer Links */}
      <Container style={{ padding: '60px 0 40px' }}>
        <Row className="g-4">
          <Col lg={4} md={6}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <ShieldShaded color="#60a5fa" size={28} />
              <span style={{ fontWeight: 800, fontSize: '1.3rem' }} className="gradient-text">SecureLife</span>
            </div>
            <p style={{ color: 'var(--text-muted-2)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '320px' }}>
              Protecting what matters most since 2010. We provide comprehensive insurance solutions 
              tailored to your unique needs with 24/7 support and instant claims processing.
            </p>
            <div className="d-flex gap-3 mt-3">
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map(s => (
                <a
                  key={s}
                  href="#"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted-2)',
                    textDecoration: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    transition: 'all 0.3s',
                  }}
                  onMouseOver={e => { e.target.style.background = 'rgba(96,165,250,0.2)'; e.target.style.color = '#60a5fa' }}
                  onMouseOut={e => { e.target.style.background = 'var(--input-bg)'; e.target.style.color = 'var(--text-muted-2)' }}
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </Col>

          {[
            {
              title: 'Quick Links',
              links: [
                { label: 'Home', to: '/', action: null },
                { label: 'Insurance Plans', to: null, action: goToPlans },
                { label: 'About Us', to: '/about', action: null },
                { label: 'Contact', to: '/contact', action: null },
                { label: 'FAQ', to: '#', action: null },
              ],
            },
            {
              title: 'Insurance',
              links: ['Health', 'Life', 'Home', 'Auto', 'Travel', 'Two Wheeler'].map(label => ({
                label,
                to: null,
                action: goToPlans,
              })),
            },
            {
              title: 'Support',
              links: ['Help Center', 'Claims Process', 'Downloads', 'Privacy Policy', 'Terms & Conditions'].map(label => ({
                label,
                to: '#',
                action: null,
              })),
            },
          ].map(col => (
            <Col lg={2} md={4} xs={6} key={col.title}>
              <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>
                {col.title}
              </h6>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map(link => (
                  <li key={link.label} className="mb-2">
                    {link.action ? (
                      <span
                        onClick={link.action}
                        style={{ color: 'var(--text-muted-2)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s', cursor: 'pointer' }}
                        onMouseOver={e => { e.target.style.color = '#60a5fa' }}
                        onMouseOut={e => { e.target.style.color = 'var(--text-muted-2)' }}
                      >
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        to={link.to}
                        style={{ color: 'var(--text-muted-2)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s' }}
                        onMouseOver={e => { e.target.style.color = '#60a5fa' }}
                        onMouseOut={e => { e.target.style.color = 'var(--text-muted-2)' }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '20px 0' }}>
        <Container>
          <div className="d-flex flex-wrap justify-content-between align-items-center" style={{ gap: '10px' }}>
            <span style={{ color: 'var(--text-muted-3)', fontSize: '0.85rem' }}>
              &copy; {currentYear} SecureLife Insurance. All rights reserved.
            </span>
            <span style={{ color: 'var(--text-muted-3)', fontSize: '0.85rem' }}>
              <ChatDotsFill className="me-2" />
              Made with care for your security
            </span>
          </div>
        </Container>
      </div>
    </footer>
  )
}

export default Footer
