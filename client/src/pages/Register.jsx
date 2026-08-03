import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldShaded, PersonPlus, Eye, EyeSlash } from 'react-bootstrap-icons'
import { register } from '../api/auth'
import { notifySuccess, notifyError } from '../utils/toast'
import ParticleBackground from '../components/ParticleBackground'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    if (form.password.value !== form.confirmPassword.value) {
      notifyError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const data = await register({
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        aadharNumber: form.aadharNumber.value,
        email: form.email.value,
        phone: form.phone.value,
        password: form.password.value,
        role: 'user',
      })
      notifySuccess(`Account created! Welcome, ${data.firstName}!`)
      navigate('/dashboard')
    } catch (err) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '100px 0' }}>
      <ParticleBackground />
      <div
        className="particle-dot"
        style={{ width: '400px', height: '400px', top: '-10%', left: '-10%', opacity: 0.05, filter: 'blur(60px)' }}
      />
      <div
        className="particle-dot"
        style={{ width: '300px', height: '300px', bottom: '-5%', right: '-5%', opacity: 0.05, filter: 'blur(60px)' }}
      />

      <Container style={{ position: 'relative', zIndex: 2 }}>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={6} lg={5} xl={4}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-4">
                <Link to="/" className="text-decoration-none">
                  <ShieldShaded color="#60a5fa" size={40} className="mb-2" />
                  <h4 className="gradient-text" style={{ fontWeight: 800 }}>SecureLife</h4>
                </Link>
              </div>

              <Card className="glass-card p-4" style={{ border: '1px solid var(--border)' }}>
                <Card.Body>
                  <div className="text-center mb-4">
                    <PersonPlus size={48} color="#60a5fa" style={{ opacity: 0.7 }} />
                    <h5 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '12px' }}>Create Account</h5>
                    <p style={{ color: 'var(--text-muted-2)', fontSize: '0.9rem' }}>Join SecureLife today</p>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Account Type</Form.Label>
                      <div className="d-flex align-items-center gap-2 p-3 rounded-3" style={{ background: 'var(--icon-bg)', border: '1px solid rgba(96,165,250,0.25)' }}>
                        <PersonPlus size={20} color="#60a5fa" />
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Customer Account</span>
                        <span className="ms-auto text-end" style={{ color: 'var(--text-muted-2)', fontSize: '0.78rem', maxWidth: '150px' }}>
                          Register with your Aadhar to view policies &amp; buy insurance
                        </span>
                      </div>
                    </div>

                    <Row>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="John"
                            name="firstName"
                            required
                            style={{
                              background: 'var(--input-bg)',
                              border: '1px solid var(--border-strong)',
                              color: 'var(--text-primary)',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Doe"
                            name="lastName"
                            required
                            style={{
                              background: 'var(--input-bg)',
                              border: '1px solid var(--border-strong)',
                              color: 'var(--text-primary)',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Aadhar Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="12-digit Aadhar number"
                        name="aadharNumber"
                        required
                        minLength={12}
                        maxLength={12}
                        pattern="\d{12}"
                        title="Please enter exactly 12 digits"
                        style={{
                          background: 'var(--input-bg)',
                          border: '1px solid var(--border-strong)',
                          color: 'var(--text-primary)',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                          fontFamily: 'monospace',
                          letterSpacing: '2px',
                        }}
                      />
                      <Form.Text style={{ color: 'var(--text-muted-3)', fontSize: '0.72rem' }}>
                        Your Aadhar number will be your login ID for this account.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="you@example.com"
                        name="email"
                        required
                        style={{
                          background: 'var(--input-bg)',
                          border: '1px solid var(--border-strong)',
                          color: 'var(--text-primary)',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        name="phone"
                        required
                        style={{
                          background: 'var(--input-bg)',
                          border: '1px solid var(--border-strong)',
                          color: 'var(--text-primary)',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Password</Form.Label>
                      <div style={{ position: 'relative' }}>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          required
                          minLength={6}
                          name="password"
                          style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border-strong)',
                            color: 'var(--text-primary)',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                          }}
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted-2)',
                            cursor: 'pointer',
                          }}
                        >
                          {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Confirm Password</Form.Label>
                      <div style={{ position: 'relative' }}>
                        <Form.Control
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          required
                          name="confirmPassword"
                          style={{
                            background: 'var(--input-bg)',
                            border: '1px solid var(--border-strong)',
                            color: 'var(--text-primary)',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                          }}
                        />
                        <span
                          onClick={() => setShowConfirm(!showConfirm)}
                          style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted-2)',
                            cursor: 'pointer',
                          }}
                        >
                          {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </span>
                      </div>
                    </Form.Group>

                    <Form.Check
                      type="checkbox"
                      label="I agree to the Terms & Conditions and Privacy Policy"
                      required
                      className="mb-4"
                      style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                    />

                    <Button
                      type="submit"
                      className="w-100 py-3 rounded-pill gradient-bg border-0"
                      style={{ fontWeight: 700, fontSize: '0.95rem' }}
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" animation="border" /> : 'Create Account'}
                    </Button>
                  </Form>

                  <div className="text-center mt-4">
                    <span style={{ color: 'var(--text-muted-2)', fontSize: '0.85rem' }}>
                      Already have an account?{' '}
                    </span>
                    <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>
                      Sign In
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Register
