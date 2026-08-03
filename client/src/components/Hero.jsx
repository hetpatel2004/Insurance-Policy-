import { Container, Row, Col, Button } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowRight, GraphUpArrow,ShieldFillCheck } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import { useStats } from '../hooks/useStats'

const Hero = () => {
  const { stats } = useStats()

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '80px',
      }}
    >
      {/* Floating orbs */}
      <div
        className="particle-dot floating"
        style={{
          width: '300px',
          height: '300px',
          top: '-5%',
          right: '-5%',
          opacity: 0.08,
          filter: 'blur(60px)',
        }}
      />
      <div
        className="particle-dot floating-delay"
        style={{
          width: '250px',
          height: '250px',
          bottom: '10%',
          left: '-5%',
          opacity: 0.06,
          filter: 'blur(50px)',
        }}
      />
      <div
        className="particle-dot"
        style={{
          width: '150px',
          height: '150px',
          top: '40%',
          left: '50%',
          opacity: 0.04,
          filter: 'blur(40px)',
        }}
      />

      <Container style={{ position: 'relative', zIndex: 2 }}>
        <Row className="align-items-center min-vh-80">
          <Col lg={6} className="mb-5 mb-lg-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div
                className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4"
                style={{
                  background: 'rgba(96,165,250,0.1)',
                  border: '1px solid rgba(96,165,250,0.2)',
                  fontSize: '0.85rem',
                  color: 'var(--primary-light)',
                }}
              >
                <ShieldFillCheck size={14} />
                Trusted by {stats?.users?.toLocaleString() || '50,000'}+ Customers
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 6vw, 4rem)',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  color: 'var(--text-primary)',
                  marginBottom: '1.5rem',
                }}
              >
                Protect What{' '}
                <span className="gradient-text">Matters Most</span>
                <br />
                With Confidence
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                  maxWidth: '540px',
                }}
              >
                Comprehensive insurance plans tailored for your life's journey.
                From health to home, we've got you covered with 24/7 support
                and instant claims processing.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Button
                  as={Link}
                  to="/register"
                  className="rounded-pill px-5 py-3 gradient-bg border-0 d-flex align-items-center gap-2"
                  style={{ fontWeight: 700, fontSize: '1.05rem' }}
                >
                  Get Protected Now
                  <ArrowRight size={20} />
                </Button>
                <Button
                  variant="outline-light"
                  href="#plans"
                  className="rounded-pill px-5 py-3 d-flex align-items-center gap-2"
                  style={{
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text)',
                  }}
                >
                  <GraphUpArrow size={20} />
                  View Plans
                </Button>
              </div>

              {/* Trust badges */}
              <div className="d-flex flex-wrap gap-4 mt-5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                {[
                  { label: 'Customers', value: (stats?.users || 0).toLocaleString() },
                  { label: 'Policies Issued', value: (stats?.policies || 0).toLocaleString() },
                  { label: 'Partner Companies', value: (stats?.companies || 0).toLocaleString() },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted-2)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </Col>

          <Col lg={6} className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="perspective-1000 d-inline-block"
            >
              {/* 3D Rotating Shield */}
              <div
                className="rotate-y-3d floating"
                style={{
                  width: 'clamp(200px, 30vw, 360px)',
                  height: 'clamp(200px, 30vw, 360px)',
                  margin: '0 auto',
                  position: 'relative',
                }}
              >
                <div
                  className="pulse-glow"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: '2px solid rgba(96,165,250,0.2)',
                  }}
                >
                  <ShieldCheck
                    size={80}
                    color="#60a5fa"
                    style={{ opacity: 0.9 }}
                  />
                  {/* Orbiting rings */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-15px',
                      borderRadius: '50%',
                      border: '1px solid rgba(96,165,250,0.1)',
                      animation: 'spin 8s linear infinite',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-30px',
                      borderRadius: '50%',
                      border: '1px dashed rgba(167,139,250,0.1)',
                      animation: 'spin 12s linear infinite reverse',
                    }}
                  />
                  {/* Dots on ring */}
                  {[0, 60, 120, 180, 240, 300].map(deg => (
                    <div
                      key={deg}
                      style={{
                        position: 'absolute',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#60a5fa',
                        opacity: 0.4,
                        transform: `rotate(${deg}deg) translateY(-165px)`,
                        transformOrigin: 'center center',
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}

export default Hero
