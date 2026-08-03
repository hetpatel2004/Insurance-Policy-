import { Container, Row, Col, Card, Carousel } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { StarFill, Quote } from 'react-bootstrap-icons'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner, California',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'SecureLife made the entire process seamless. When my home was damaged in a storm, they processed the claim within 24 hours and had the repair crew out the next day. Absolutely outstanding service!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Small Business Owner',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'I\'ve been with SecureLife for over 5 years now. Their health insurance plans are comprehensive and the premium rates are very competitive. The mobile app makes managing everything so easy.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Freelancer, Texas',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: 'As a freelancer, finding good insurance was always a challenge. SecureLife\'s tailored plans for self-employed professionals changed everything. Highly recommend their travel insurance too!',
    rating: 5,
  },
  {
    name: 'David Thompson',
    role: 'Retired, Florida',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    text: 'The retirement planning team at SecureLife helped me secure a comfortable future. Their knowledge and patience in explaining all options made me feel completely at ease with my decisions.',
    rating: 5,
  },
]

const Testimonials = () => {
  return (
    <section style={{ padding: '100px 0', background: 'var(--bg-secondary)', position: 'relative' }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <div
            className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 mb-3"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', fontSize: '0.85rem' }}
          >
            Testimonials
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
        </motion.div>

        <Row className="g-4">
          {testimonials.map((t, i) => (
            <Col xs={12} md={6} lg={3} key={t.name}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                viewport={{ once: true }}
                style={{ height: '100%' }}
              >
                <Card className="glass-card h-100" style={{ padding: '24px' }}>
                  <Quote size={32} color="#2563eb" style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <Card.Text style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>
                    "{t.text}"
                  </Card.Text>
                  <div className="mb-3">
                    {[...Array(t.rating)].map((_, idx) => (
                      <StarFill key={idx} size={14} color="#f59e0b" className="me-1" />
                    ))}
                  </div>
                  <div className="d-flex align-items-center gap-3 mt-auto">
                    <img
                      src={t.image}
                      alt={t.name}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(96,165,250,0.3)' }}
                    />
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ color: 'var(--text-muted-2)', fontSize: '0.8rem' }}>{t.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default Testimonials
