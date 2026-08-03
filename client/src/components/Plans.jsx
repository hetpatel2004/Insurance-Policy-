import { useState } from 'react'
import { Container, Row, Col, Card, Badge, Modal, Button } from 'react-bootstrap'
import { motion } from 'framer-motion'
import {
  HeartPulseFill, PersonFill, Bicycle, CarFrontFill,
  AirplaneFill, Fire, BriefcaseFill, HouseDoorFill,
  Shop, LockFill, ArrowRight, ShieldCheck, CashCoin,
  JournalCheck
} from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom'
import { POLICY_TYPES } from '../utils/policyTypes'
import { isAuthenticated } from '../api/auth'

const LANDING_TYPES = [
  'health', 'personal-accident', 'two-wheeler', 'auto', 'travel',
  'fire', 'workman-compensation', 'household', 'shopkeeper', 'burglary',
]

const iconMap = {
  health: HeartPulseFill,
  'personal-accident': PersonFill,
  'two-wheeler': Bicycle,
  auto: CarFrontFill,
  travel: AirplaneFill,
  fire: Fire,
  'workman-compensation': BriefcaseFill,
  household: HouseDoorFill,
  shopkeeper: Shop,
  burglary: LockFill,
}

const plans = LANDING_TYPES
  .map(type => POLICY_TYPES.find(p => p.type === type))
  .filter(Boolean)

const Plans = () => {
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const openPlan = (plan) => setSelected(plan)

  const handleApply = () => {
    const target = isAuthenticated() ? '/dashboard' : '/register'
    navigate(target)
  }

  return (
    <section id="plans" style={{ padding: '100px 0', background: 'var(--bg)', position: 'relative' }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <Badge
            bg="none"
            className="rounded-pill px-4 py-2 mb-3"
            style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: 'var(--primary-light)', fontSize: '0.85rem' }}
          >
            Our Plans
          </Badge>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Comprehensive Insurance{' '}
            <span className="gradient-text">Solutions</span>
          </h2>
          <p style={{ color: 'var(--text-muted-2)', maxWidth: '600px', margin: '1rem auto 0', fontSize: '1.05rem' }}>
            Choose from our wide range of insurance plans designed to protect every aspect of your life
          </p>
        </motion.div>

        <Row className="g-4">
          {plans.map((plan, i) => {
            const Icon = iconMap[plan.type]
            return (
              <Col xs={12} sm={6} lg={3} key={plan.type}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 4) * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    className="glass-card h-100 position-relative overflow-hidden"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openPlan(plan)}
                  >
                    <Card.Body className="p-4 d-flex flex-column">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                        style={{
                          width: '52px',
                          height: '52px',
                          background: `${plan.color}15`,
                          color: plan.color,
                        }}
                      >
                        <Icon size={24} />
                      </div>

                      <Card.Title style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>
                        {plan.label}
                      </Card.Title>

                      <Card.Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, flex: 1 }}>
                        {plan.desc}
                      </Card.Text>

                      <div className="mt-auto">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted-2)' }}>
                            <CashCoin size={12} className="me-1" />
                            ₹{plan.basePremium.toLocaleString()}/yr
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted-2)' }}>
                            <ShieldCheck size={12} className="me-1" />
                            ₹{plan.coverage.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                          Learn More <ArrowRight size={14} />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            )
          })}
        </Row>
      </Container>

      {/* Learn More Modal */}
      <Modal
        show={!!selected}
        onHide={() => setSelected(null)}
        centered
        size="lg"
        contentClassName="glass-card border-0"
      >
        {selected && (
          <>
            <Modal.Header closeButton className="border-0 pb-0" style={{ background: 'transparent' }}>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: '56px',
                  height: '56px',
                  background: `${selected.color}15`,
                  color: selected.color,
                }}
              >
                {(() => { const Icon = iconMap[selected.type]; return <Icon size={26} /> })()}
              </div>
            </Modal.Header>
            <Modal.Body style={{ background: 'transparent' }} className="px-4 pb-4">
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
                {selected.label}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                {selected.desc}
              </p>

              <div className="d-flex flex-wrap gap-3 my-3">
                <div className="rounded-3 px-3 py-2" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)' }}>Annual Premium</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{selected.basePremium.toLocaleString()}</div>
                </div>
                <div className="rounded-3 px-3 py-2" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)' }}>Sum Insured</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{selected.coverage.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                <JournalCheck size={16} className="me-2" style={{ color: '#60a5fa' }} />
                What's Covered
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {selected.features.map(f => (
                  <span
                    key={f}
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      background: 'var(--input-bg)',
                      padding: '5px 12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="d-flex flex-wrap gap-3 align-items-center pt-2">
                <Button
                  onClick={handleApply}
                  className="rounded-pill px-4 gradient-bg border-0 d-flex align-items-center gap-2"
                  style={{ fontWeight: 700 }}
                >
                  Apply for this policy <ArrowRight size={16} />
                </Button>
                <Button
                  variant="outline-light"
                  onClick={() => setSelected(null)}
                  className="rounded-pill px-4"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text)', fontWeight: 600 }}
                >
                  Close
                </Button>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </section>
  )
}

export default Plans
