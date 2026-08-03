import { useEffect, useState } from 'react'
import { Card, Row, Col, Button, Form, Spinner, Badge } from 'react-bootstrap'
import { motion } from 'framer-motion'
import {
  Speedometer2, FileEarmarkTextFill, PlusCircleFill,
  PersonFill, ShieldCheck, Wallet2, Calendar3,
  ClockHistory, CheckCircle, BuildingFill,
  LightbulbFill, PersonCheckFill
} from 'react-bootstrap-icons'
import DashboardLayout from '../components/DashboardLayout'
import { StatCard, PageHeader, StatusBadge, EmptyState } from '../components/dashboard/Widgets'
import { getMyPolicies, applyPolicy, updateProfile, getUser, getMyCustomer, getCompanies } from '../api/auth'
import { POLICY_TYPES, getPolicyLabel } from '../utils/policyTypes'
import { notifySuccess, notifyError } from '../utils/toast'

const navItems = [
  { key: 'overview', label: 'Overview', icon: Speedometer2 },
  { key: 'policies', label: 'My Policies', icon: FileEarmarkTextFill },
  { key: 'apply', label: 'Apply Policy', icon: PlusCircleFill },
  { key: 'profile', label: 'Profile', icon: PersonFill },
]

const policyOptions = POLICY_TYPES

const UserDashboard = () => {
  const [view, setView] = useState('overview')
  const [policies, setPolicies] = useState([])
  const [customer, setCustomer] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [applyType, setApplyType] = useState(policyOptions[0].type)
  const [applyPremium, setApplyPremium] = useState(policyOptions[0].basePremium)
  const [applyCoverage, setApplyCoverage] = useState(policyOptions[0].coverage)
  const [applyCompany, setApplyCompany] = useState('')

  const user = getUser()
  const isExistingCustomer = !!customer
  const ownedPolicies = customer?.policies || []

  const loadData = async () => {
    try {
      setLoading(true)
      const [data, cust, comps] = await Promise.all([
        getMyPolicies(),
        getMyCustomer(),
        getCompanies(),
      ])
      setPolicies(data)
      setCustomer(cust)
      setCompanies(comps)
    } catch (err) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectPolicyType = (type) => {
    const opt = policyOptions.find(o => o.type === type)
    setApplyType(type)
    if (opt) {
      setApplyPremium(opt.basePremium)
      setApplyCoverage(opt.coverage)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setApplying(true)
    try {
      const plan = policyOptions.find(p => p.type === applyType)
      await applyPolicy({
        policyType: applyType,
        planName: e.target.planName.value || plan.label,
        premium: Number(applyPremium),
        coverage: Number(applyCoverage),
        company: applyCompany || undefined,
      })
      notifySuccess('Policy application submitted! Our team will review it soon.')
      loadData()
      setView('policies')
    } catch (err) {
      notifyError(err.message)
    } finally {
      setApplying(false)
    }
  }

  const handleProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        firstName: e.target.firstName.value,
        lastName: e.target.lastName.value,
        phone: e.target.phone.value,
      }
      if (e.target.password.value) data.password = e.target.password.value
      await updateProfile(data)
      notifySuccess('Profile updated successfully')
    } catch (err) {
      notifyError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const ownedTypes = new Set([
    ...ownedPolicies.map(p => p.policyType),
    ...policies.map(p => p.policyType),
  ])
  const suggestedOptions = policyOptions.filter(o => !ownedTypes.has(o.type))

  const activeCount = policies.filter(p => p.status === 'active').length
  const pendingCount = policies.filter(p => p.status === 'pending').length
  const totalCoverage = policies.reduce((sum, p) => sum + p.coverage, 0) + ownedPolicies.reduce((sum, p) => sum + (p.coverage || 0), 0)

  const renderOverview = () => (
    <>
      <PageHeader
        title={`Hello, ${user?.firstName} 👋`}
        subtitle={isExistingCustomer ? 'Welcome back! Your recorded policies are ready for you below.' : 'Welcome to your SecureLife insurance dashboard.'}
        badge={
          <span className="rounded-pill px-3 py-1" style={{ background: isExistingCustomer ? 'rgba(52,211,153,0.1)' : 'rgba(96,165,250,0.1)', color: isExistingCustomer ? '#34d399' : 'var(--primary-light)', fontSize: '0.8rem', fontWeight: 600 }}>
            {isExistingCustomer ? '✓ Recorded Client' : 'New Customer'}
          </span>
        }
      />

      {isExistingCustomer && (
        <div className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <PersonCheckFill color="#34d399" size={26} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{customer?.name}</span> is recorded in our customer list
            {customer?.company?.name && <> under <BuildingFill size={13} className="mx-1" style={{ color: '#60a5fa' }} /><span style={{ color: '#60a5fa', fontWeight: 600 }}>{customer.company.name}</span></>}.
            Showing the <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ownedPolicies.length}</span> polic{ownedPolicies.length === 1 ? 'y' : 'ies'} you own.
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3"><StatCard icon={FileEarmarkTextFill} label="Total Policies" value={ownedPolicies.length + policies.length} color="#60a5fa" delay={0} /></div>
        <div className="col-12 col-sm-6 col-lg-3"><StatCard icon={ShieldCheck} label="Active Policies" value={activeCount} color="#34d399" delay={0.1} /></div>
        <div className="col-12 col-sm-6 col-lg-3"><StatCard icon={ClockHistory} label="Under Review" value={pendingCount} color="#fbbf24" delay={0.2} /></div>
        <div className="col-12 col-sm-6 col-lg-3"><StatCard icon={Wallet2} label="Total Coverage" value={`₹${(totalCoverage / 100000).toFixed(1)}L`} color="#a78bfa" delay={0.3} /></div>
      </div>

      <Row className="g-3">
        <Col lg={7}>
          <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Card.Header style={{ background: 'var(--border)', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}>
              My Policies
            </Card.Header>
            <Card.Body>
              {ownedPolicies.length + policies.length === 0 ? (
                <EmptyState icon={FileEarmarkTextFill} title="No policies yet" subtitle="Apply for your first policy to get protected." />
              ) : (
                [...ownedPolicies, ...policies].slice(0, 4).map((p, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center p-3 mb-2" style={{ borderRadius: '12px', background: 'var(--border)', border: '1px solid var(--border)' }}>
                    <div>
                      <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                        {p.planName}
                        {idx < ownedPolicies.length && (
                          <span className="rounded-pill px-2" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '0.68rem', fontWeight: 700 }}>On File</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted-2)', fontSize: '0.78rem' }}>
                        ₹{p.premium || 0}/yr · ₹{p.coverage || 0} cover{p.company?.name ? ` · ${p.company.name}` : ''}
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Card.Header style={{ background: 'var(--border)', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}>
              Profile Summary
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ color: 'var(--text-muted-2)', fontSize: '0.82rem' }}>{user?.email}</div>
                </div>
              </div>
              {[
                { label: 'Aadhar Number', value: user?.aadharNumber, mono: true },
                { label: 'Phone', value: user?.phone },
                { label: 'Customer List', value: isExistingCustomer ? 'Recorded' : 'Not recorded', cap: true },
              ].map(row => (
                <div key={row.label} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid var(--input-bg)' }}>
                  <span style={{ color: 'var(--text-muted-2)', fontSize: '0.82rem' }}>{row.label}</span>
                  <span style={{ color: row.value === 'Recorded' ? '#34d399' : 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, fontFamily: row.mono ? 'monospace' : 'inherit', textTransform: row.cap ? 'capitalize' : 'none' }}>{row.value}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )

  const renderPolicies = () => (
    <>
      <PageHeader
        title="My Policies"
        subtitle={isExistingCustomer ? 'Your policies on file plus your applications.' : 'Explore what we can do for you.'}
        badge={<Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--primary-light)' }}>{ownedPolicies.length + policies.length} Policies</Badge>}
      />

      {/* Policies on file (from agent's customer list) */}
      {isExistingCustomer && (
        <>
          <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
            <PersonCheckFill color="#34d399" /> Policies Recorded by Your Agent
          </h6>
          <div className="row g-3 mb-4">
            {ownedPolicies.length === 0 ? (
              <Col xs={12}>
                <p style={{ color: 'var(--text-muted-2)', fontSize: '0.9rem' }}>You're on our customer list but no policies have been recorded yet.</p>
              </Col>
            ) : ownedPolicies.map((p, i) => (
              <Col xs={12} md={6} xl={4} key={i}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ height: '100%' }}>
                  <Card className="glass-card h-100" style={{ borderRadius: '16px', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{getPolicyLabel(p.policyType)}</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>{p.planName}</div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="d-flex gap-4 py-3" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>Premium</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>₹{p.premium || 0}/yr</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>Coverage</div>
                          <div style={{ color: '#34d399', fontWeight: 700 }}>₹{p.coverage || 0}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-3" style={{ color: 'var(--text-muted-2)', fontSize: '0.8rem' }}>
                        <BuildingFill size={14} color="#60a5fa" />
                        {p.company?.name || 'Company not specified'}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1" style={{ color: 'var(--text-muted-2)', fontSize: '0.8rem' }}>
                        <Calendar3 size={14} />
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'Start date not set'}
                        {p.endDate && <span>→ {new Date(p.endDate).toLocaleDateString()}</span>}
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </div>
        </>
      )}

      {/* Applied / applied applications */}
      {policies.length > 0 && (
        <>
          <h6 className="mb-3" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Your Applications</h6>
          <div className="row g-3 mb-4">
            {policies.map((p, i) => (
              <Col xs={12} md={6} xl={4} key={p._id}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ height: '100%' }}>
                  <Card className="glass-card h-100" style={{ borderRadius: '16px' }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{getPolicyLabel(p.policyType)}</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>{p.planName}</div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="d-flex gap-4 py-3" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>Premium</div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>₹{p.premium}/yr</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>Coverage</div>
                          <div style={{ color: '#34d399', fontWeight: 700 }}>₹{p.coverage}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-3" style={{ color: 'var(--text-muted-2)', fontSize: '0.8rem' }}>
                        <BuildingFill size={14} color="#60a5fa" />
                        {p.company?.name || 'Company not specified'}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1" style={{ color: 'var(--text-muted-2)', fontSize: '0.8rem' }}>
                        <Calendar3 size={14} />
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'Not started yet'}
                        {p.endDate && <span>→ {new Date(p.endDate).toLocaleDateString()}</span>}
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </div>
        </>
      )}

      {/* Suggestions for insurance types not owned */}
      {suggestedOptions.length > 0 && (
        <>
          <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
            <LightbulbFill color="#fbbf24" /> Suggested for You
          </h6>
          <div className="row g-3 mb-2">
            {suggestedOptions.map((opt, i) => (
              <Col xs={12} md={6} xl={4} key={opt.type}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ height: '100%' }}>
                  <Card className="glass-card h-100" style={{ borderRadius: '16px' }}>
                    <Card.Body className="d-flex flex-column">
                      <div style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>{opt.label}</div>
                      <div className="mt-auto pt-2">
                        <div style={{ color: 'var(--text-muted-2)', fontSize: '0.8rem' }}>From ₹{opt.basePremium}/yr</div>
                        <Button
                          size="sm"
                          className="rounded-pill mt-2 w-100 gradient-bg border-0"
                          style={{ fontWeight: 600 }}
                          onClick={() => { selectPolicyType(opt.type); setView('apply') }}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </div>
        </>
      )}

      {ownedPolicies.length + policies.length === 0 && suggestedOptions.length === 0 && (
        <Card className="glass-card">
          <EmptyState icon={CheckCircle} title="You're fully covered!" subtitle="We'll notify you when new plans are available." />
        </Card>
      )}
    </>
  )

  const renderApply = () => (
    <>
      <PageHeader
        title="Apply for a Policy"
        subtitle="Choose a plan that suits your needs. Pick the insurance company you prefer."
      />
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="glass-card" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <Form onSubmit={handleApply}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Select Policy Type</Form.Label>
                  <Form.Select value={applyType} onChange={e => selectPolicyType(e.target.value)} required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}>
                    {policyOptions.map(opt => (
                      <option key={opt.type} value={opt.type} style={{ color: '#0f172a' }}>
                        {opt.label} - ₹{opt.basePremium}/yr
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Insurance Company</Form.Label>
                  <Form.Select value={applyCompany} onChange={e => setApplyCompany(e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}>
                    <option value="">Select company (optional)</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id} style={{ color: '#0f172a' }}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Plan Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="planName"
                    placeholder="e.g. Secure Health Plus"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}
                  />
                </Form.Group>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <Form.Group>
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Premium (₹/yr)</Form.Label>
                      <Form.Control type="number" name="premium" required value={applyPremium} onChange={e => setApplyPremium(e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }} />
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group>
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Coverage (₹)</Form.Label>
                      <Form.Control type="number" name="coverage" required value={applyCoverage} onChange={e => setApplyCoverage(e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }} />
                    </Form.Group>
                  </div>
                </div>

                <div className="p-3 mb-4" style={{ borderRadius: '12px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle color="#34d399" size={20} style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    Applications are reviewed by our team within 24 hours. You'll be able to track the status here.
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-100 py-3 rounded-pill gradient-bg border-0"
                  style={{ fontWeight: 700 }}
                  disabled={applying}
                >
                  {applying ? <Spinner size="sm" animation="border" /> : 'Submit Application'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )

  const renderProfile = () => (
    <>
      <PageHeader title="My Profile" subtitle="Update your personal information." />
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="glass-card" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <Form onSubmit={handleProfile}>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <Form.Group>
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>First Name</Form.Label>
                      <Form.Control name="firstName" defaultValue={user?.firstName} required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }} />
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group>
                      <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Last Name</Form.Label>
                      <Form.Control name="lastName" defaultValue={user?.lastName} required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }} />
                    </Form.Group>
                  </div>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Aadhar Number</Form.Label>
                  <Form.Control value={user?.aadharNumber} disabled style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-muted-2)', padding: '12px 16px', borderRadius: '12px', fontFamily: 'monospace' }} />
                  <Form.Text style={{ color: 'var(--text-muted-3)', fontSize: '0.75rem' }}>Aadhar number is your login ID and cannot be changed.</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Phone</Form.Label>
                  <Form.Control name="phone" defaultValue={user?.phone} required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>New Password (optional)</Form.Label>
                  <Form.Control type="password" name="password" placeholder="Leave blank to keep current password" minLength={6} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }} />
                </Form.Group>
                <Button type="submit" className="w-100 py-3 rounded-pill gradient-bg border-0" style={{ fontWeight: 700 }} disabled={saving}>
                  {saving ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )

  return (
    <DashboardLayout navItems={navItems} title="My Dashboard" activeKey={view} onNavigate={setView}>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          {view === 'overview' && renderOverview()}
          {view === 'policies' && renderPolicies()}
          {view === 'apply' && renderApply()}
          {view === 'profile' && renderProfile()}
        </>
      )}
    </DashboardLayout>
  )
}

export default UserDashboard
