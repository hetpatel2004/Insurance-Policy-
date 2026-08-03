import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShieldShaded, PersonCircle, Eye, EyeSlash } from 'react-bootstrap-icons'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { notifySuccess, notifyError } from '../utils/toast'
import ParticleBackground from '../components/ParticleBackground'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login: setAuthUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login({
        loginId: e.target.loginId.value,
        password: e.target.password.value,
      })
      setAuthUser(data)
      notifySuccess(`Welcome back, ${data.firstName}!`)
      const from = location.state?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
      } else if (data.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <ParticleBackground />
      <div
        className="particle-dot"
        style={{ width: '400px', height: '400px', top: '-10%', right: '-10%', opacity: 0.05, filter: 'blur(60px)' }}
      />
      <div
        className="particle-dot"
        style={{ width: '300px', height: '300px', bottom: '-10%', left: '-10%', opacity: 0.05, filter: 'blur(60px)' }}
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
                    <PersonCircle size={48} color="#60a5fa" style={{ opacity: 0.7 }} />
                    <h5 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '12px' }}>Welcome Back</h5>
                    <p style={{ color: 'var(--text-muted-2)', fontSize: '0.9rem' }}>Sign in with your Aadhar number or email</p>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Aadhar Number / Email</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="12-digit Aadhar or email"
                        name="loginId"
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
                      <Form.Text style={{ color: 'var(--text-muted-3)', fontSize: '0.72rem' }}>
                        Users log in with their 12-digit Aadhar card number. Admins use their email.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Password</Form.Label>
                      <div style={{ position: 'relative' }}>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          name="password"
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

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                      />
                      <a href="#" style={{ color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot Password?</a>
                    </div>

                    <Button
                      type="submit"
                      className="w-100 py-3 rounded-pill gradient-bg border-0"
                      style={{ fontWeight: 700, fontSize: '0.95rem' }}
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" animation="border" /> : 'Sign In'}
                    </Button>
                  </Form>

                  <div className="text-center mt-4">
                    <span style={{ color: 'var(--text-muted-2)', fontSize: '0.85rem' }}>
                      Don't have an account?{' '}
                    </span>
                    <Link to="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>
                      Sign Up
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

export default Login
