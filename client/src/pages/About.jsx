import { Container, Row, Col, Card, Badge } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { ShieldShaded, CheckCircle, Clock, LightningChargeFill, HeartFill, PeopleFill } from 'react-bootstrap-icons'
import NavbarComp from '../components/NavbarComp'
import Footer from '../components/Footer'
import ParticleBackground from '../components/ParticleBackground'

const values = [
  {
    icon: ShieldShaded,
    title: 'Trust & Security',
    desc: 'Every policy is built on transparency and backed by trusted insurance companies.',
    color: '#3b82f6',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    desc: 'Our support team is available around the clock to assist you at every step.',
    color: '#10b981',
  },
  {
    icon: LightningChargeFill,
    title: 'Instant Claims',
    desc: 'Streamlined claim processing so you get your settlement without unnecessary delays.',
    color: '#f59e0b',
  },
  {
    icon: HeartFill,
    title: 'Customer First',
    desc: 'We design every plan around your life, your family, and your business needs.',
    color: '#ef4444',
  },
]

const About = () => {
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
              About Us
            </Badge>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text-primary)' }}>
              Protecting What Matters{' '}
              <span className="gradient-text">Since 2010</span>
            </h1>
            <p style={{ color: 'var(--text-muted-2)', maxWidth: '700px', margin: '1.5rem auto 0', fontSize: '1.1rem', lineHeight: 1.8 }}>
              SecureLife is an insurance agent platform helping individuals and businesses find the
              right protection. We connect you with trusted insurance companies, keep your policies
              recorded, and make sure you never miss out on the coverage you deserve.
            </p>
          </motion.div>

          <Row className="g-4 mb-5">
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-100" style={{ padding: '32px' }}>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '1rem' }}>
                    Our Mission
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8 }}>
                    Our mission is simple — to make insurance honest, accessible, and personal.
                    Whether you need health cover, protection for your vehicle, or security for your
                    business, we work with you one-on-one to find the right plan and keep it
                    running year after year.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8 }}>
                    As your agent, we record your policies, track renewals, and suggest new coverage
                    the moment you need it — so you can focus on living, while we handle the risk.
                  </p>
                </Card>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-100" style={{ padding: '32px' }}>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '1rem' }}>
                    Why Choose Us
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {[
                      'Policies issued by trusted insurance companies',
                      'A dedicated agent who records and tracks your cover',
                      'Smart suggestions for the insurance you still need',
                      'Simple online applications and quick claim support',
                    ].map(item => (
                      <li key={item} className="d-flex align-items-start gap-2 mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <CheckCircle size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </Col>
          </Row>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
            style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2.5rem' }}
          >
            Our <span className="gradient-text">Values</span>
          </motion.h2>

          <Row className="g-4 pb-5">
            {values.map((v, i) => (
              <Col xs={12} sm={6} lg={3} key={v.title}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-card h-100 text-center" style={{ padding: '32px 20px' }}>
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3 mx-auto mb-3"
                      style={{ width: '56px', height: '56px', background: `${v.color}15`, color: v.color }}
                    >
                      <v.icon size={26} />
                    </div>
                    <h5 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{v.title}</h5>
                    <p style={{ color: 'var(--text-muted-2)', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
                      {v.desc}
                    </p>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center pb-5"
          >
            <div
              className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 mb-3"
              style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', fontSize: '0.85rem' }}
            >
              <PeopleFill size={14} /> Let's Work Together
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Have Questions? <span className="gradient-text">We're Here to Help</span>
            </h2>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  )
}

export default About
