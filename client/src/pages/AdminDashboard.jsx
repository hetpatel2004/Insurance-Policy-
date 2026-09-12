import { useEffect, useState } from 'react'
import { Card, Table, Button, Badge, Form, Modal, Spinner } from 'react-bootstrap'
import { motion } from 'framer-motion'
import {
  Speedometer2, PeopleFill, FileEarmarkTextFill,
  PencilSquare, Trash, PersonFill, ShieldFillCheck,
  FileEarmarkText, ClockHistory, BuildingFill,
  PersonBadgeFill, PlusCircleFill, XCircle, CloudUploadFill,
  CurrencyRupee, Check2, ArrowRepeat, EnvelopePlus, Search
} from 'react-bootstrap-icons'
import DashboardLayout from '../components/DashboardLayout'
import { StatCard, PageHeader, StatusBadge, EmptyState } from '../components/dashboard/Widgets'
import BulkUploadModal from '../components/dashboard/BulkUploadModal'
import {
  getUsers, createUser, updateUser, deleteUser, getAllPolicies, updatePolicy, deletePolicy, getUser,
  getCompanies, createCompany, updateCompany, deleteCompany,
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  bulkCreateUsers, bulkCreateCompanies, bulkCreateCustomers, bulkCreatePolicies,
  getExpiringPolicies, getSuggestions, createSuggestion,
} from '../api/auth'
import { notifySuccess, notifyError } from '../utils/toast'
import { POLICY_TYPES, getPolicyLabel } from '../utils/policyTypes'
import { parseCSVRows } from '../utils/csv'

const navItems = [
  { key: 'overview', label: 'Overview', icon: Speedometer2 },
  { key: 'users', label: 'Users', icon: PeopleFill },
  { key: 'policies', label: 'Policies', icon: FileEarmarkTextFill },
  { key: 'pricing', label: 'Pricing', icon: CurrencyRupee },
  { key: 'renewals', label: 'Renewals', icon: ArrowRepeat },
  { key: 'customers', label: 'Customers', icon: PersonBadgeFill },
  { key: 'companies', label: 'Companies', icon: BuildingFill },
]

const policyTypes = POLICY_TYPES.map(p => ({ value: p.type, label: p.label }))

const emptyPolicyRow = () => ({
  policyType: 'health',
  planName: '',
  company: '',
  premium: '',
  coverage: '',
  startDate: '',
  endDate: '',
  status: 'active',
})

const bulkConfig = {
  users: {
    title: 'Bulk Upload Users',
    subtitle: 'Each row creates a login account (role: user). Duplicate Aadhar/email rows are skipped.',
    columns: ['firstName', 'lastName', 'aadharNumber', 'email', 'phone', 'password'],
    sample: ['Rahul', 'Sharma', '444444444444', 'rahul@gmail.com', '+919876543210', 'user123'],
  },
  companies: {
    title: 'Bulk Upload Companies',
    subtitle: 'policyTypes = insurance types offered, separated by "|" (e.g. health|auto|travel).',
    columns: ['name', 'email', 'phone', 'address', 'description', 'policyTypes'],
    sample: ['New Insurer', 'support@newinsurer.com', '+911800000000', 'Mumbai, Maharashtra', 'General insurance provider', 'health|auto|travel'],
  },
  customers: {
    title: 'Bulk Upload Customers',
    subtitle: 'Upserts by Aadhar. One optional policy per row (company must already exist).',
    columns: ['aadharNumber', 'name', 'email', 'phone', 'companyName', 'policyType', 'planName', 'premium', 'coverage', 'status'],
    sample: ['555555555555', 'Priya Patel', 'priya@gmail.com', '+919876543211', 'HDFC ERGO', 'health', 'Family Health Gold', '4500', '500000', 'active'],
  },
  policies: {
    title: 'Bulk Upload Policies',
    subtitle: 'Creates policy applications. The user is found by Aadhar number.',
    columns: ['aadharNumber', 'policyType', 'planName', 'premium', 'coverage', 'companyName', 'status'],
    sample: ['444444444444', 'health', 'Family Health Gold', '4500', '500000', 'HDFC ERGO', 'pending'],
  },
}

const AdminDashboard = () => {
  const [view, setView] = useState('overview')
  const [users, setUsers] = useState([])
  const [policies, setPolicies] = useState([])
  const [companies, setCompanies] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState(null)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showEditPolicy, setShowEditPolicy] = useState(false)
  const [editPolicy, setEditPolicy] = useState(null)
  const [editCompany, setEditCompany] = useState(null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerPolicies, setCustomerPolicies] = useState([])
  const [bulkTarget, setBulkTarget] = useState(null)
  const [companyPolicyTypes, setCompanyPolicyTypes] = useState([])
  const [newUserCompanyId, setNewUserCompanyId] = useState('')
  const [newUserPolicyType, setNewUserPolicyType] = useState('')
  const [pricingDrafts, setPricingDrafts] = useState({})
  const [expiringPolicies, setExpiringPolicies] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestTarget, setSuggestTarget] = useState(null)
  const [userQuery, setUserQuery] = useState('')
  const [policyQuery, setPolicyQuery] = useState('')

  const admin = getUser()

  const loadData = async () => {
    try {
      setLoading(true)
      const [u, p, c, cu, exp, sug] = await Promise.all([
        getUsers(),
        getAllPolicies(),
        getCompanies(),
        getCustomers(),
        getExpiringPolicies(90),
        getSuggestions(),
      ])
      setUsers(u)
      setPolicies(p)
      setCompanies(c)
      setCustomers(cu)
      setExpiringPolicies(exp)
      setSuggestions(sug)
    } catch (err) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleVerifyToggle = async (user) => {
    try {
      await updateUser(user._id, { isVerified: !user.isVerified })
      notifySuccess(`Verification ${user.isVerified ? 'revoked' : 'approved'} for ${user.firstName} ${user.lastName}`)
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user ${user.firstName} ${user.lastName}?`)) return
    try {
      await deleteUser(user._id)
      notifySuccess('User deleted')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const saveUser = async (e) => {
    e.preventDefault()
    try {
      await updateUser(editUser._id, {
        firstName: e.target.firstName.value,
        lastName: e.target.lastName.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
      })
      setShowEditUser(false)
      notifySuccess('User updated')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const openCreateUser = () => {
    setNewUserCompanyId('')
    setNewUserPolicyType('')
    setShowCreateUser(true)
  }

  const saveNewUser = async (e) => {
    e.preventDefault()
    const companyId = e.target.company.value
    const policyType = e.target.policyType.value
    if (companyId && !policyType) {
      notifyError('Select the insurance type offered by the company')
      return
    }
    try {
      await createUser({
        firstName: e.target.firstName.value,
        lastName: e.target.lastName.value,
        aadharNumber: e.target.aadharNumber.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        password: e.target.password.value,
        companyId: companyId || undefined,
        policyType: policyType || undefined,
        planName: policyType ? `${getPolicyLabel(policyType)} Plan` : undefined,
      })
      setShowCreateUser(false)
      notifySuccess('User created')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const toggleCompanyPolicyType = (type) => {
    setCompanyPolicyTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handleBulkUpload = async (text) => {
    const cfg = bulkConfig[bulkTarget]
    const rows = parseCSVRows(text, cfg.columns)
    if (rows.length === 0) {
      notifyError('No data rows found. Check the CSV content.')
      return { created: 0, updated: 0, skipped: 0, errors: [{ row: 0, error: 'No data rows found' }] }
    }
    let res
    if (bulkTarget === 'users') res = await bulkCreateUsers(rows)
    else if (bulkTarget === 'companies') res = await bulkCreateCompanies(rows)
    else if (bulkTarget === 'customers') res = await bulkCreateCustomers(rows)
    else if (bulkTarget === 'policies') res = await bulkCreatePolicies(rows)
    loadData()
    return res
  }

  const handlePolicyStatus = async (policy, status) => {
    try {
      await updatePolicy(policy._id, { status })
      notifySuccess(`Policy ${status === 'active' ? 'approved and activated' : status}`)
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const handleDeletePolicy = async (policy) => {
    if (!window.confirm('Delete this policy?')) return
    try {
      await deletePolicy(policy._id)
      notifySuccess('Policy deleted')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const savePolicy = async (e) => {
    e.preventDefault()
    try {
      await updatePolicy(editPolicy._id, {
        planName: e.target.planName.value,
        premium: e.target.premium.value,
        coverage: e.target.coverage.value,
      })
      setShowEditPolicy(false)
      notifySuccess('Policy updated')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  // ---- Companies ----
  const openCompanyModal = (company = null) => {
    setEditCompany(company)
    setCompanyPolicyTypes(company?.policyTypes || [])
    setShowCompanyModal(true)
  }

  const saveCompany = async (e) => {
    e.preventDefault()
    try {
      const data = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        address: e.target.address.value,
        description: e.target.description.value,
        policyTypes: companyPolicyTypes,
      }
      if (editCompany) {
        await updateCompany(editCompany._id, data)
        notifySuccess('Company updated')
      } else {
        await createCompany(data)
        notifySuccess('Company created')
      }
      setShowCompanyModal(false)
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Delete company "${company.name}"?`)) return
    try {
      await deleteCompany(company._id)
      notifySuccess('Company deleted')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  // ---- Pricing ----
  const updatePriceDraft = (id, field, value) => {
    setPricingDrafts(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }))
  }

  const savePriceRow = async (p) => {
    const d = pricingDrafts[p._id] || {}
    const payload = {}
    if (d.premium !== undefined && d.premium !== '') payload.premium = Number(d.premium)
    if (d.coverage !== undefined && d.coverage !== '') payload.coverage = Number(d.coverage)
    if (Object.keys(payload).length === 0) return
    try {
      await updatePolicy(p._id, payload)
      setPricingDrafts(prev => { const next = { ...prev }; delete next[p._id]; return next })
      notifySuccess('Price updated')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  // ---- Renewals / suggestions ----
  const suggestRenewal = async (p) => {
    if (!window.confirm(`Suggest renewal of "${p.planName}" to ${p.user?.firstName} ${p.user?.lastName}?`)) return
    try {
      await createSuggestion({
        policyId: p._id,
        kind: 'renewal',
        policyType: p.policyType,
        planName: p.planName,
        premium: p.premium,
        coverage: p.coverage,
        company: p.company?._id,
        message: 'Your policy is expiring soon. Renew it today to stay protected without any gap in coverage.',
      })
      notifySuccess('Renewal suggestion sent')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const openSuggestNewPlan = (p) => {
    const base = POLICY_TYPES.find(t => t.type === p.policyType)
    setSuggestTarget({ ...p, suggestType: base?.type || p.policyType })
    setShowSuggestModal(true)
  }

  const saveSuggestion = async (e) => {
    e.preventDefault()
    const target = suggestTarget
    try {
      await createSuggestion({
        policyId: target._id,
        kind: 'new-plan',
        policyType: e.target.policyType.value,
        planName: e.target.planName.value,
        premium: e.target.premium.value,
        coverage: e.target.coverage.value,
        company: e.target.company.value || undefined,
        message: e.target.message.value || 'We have a new plan that may suit you better. Check it out and let us know if you would like to switch.',
      })
      setShowSuggestModal(false)
      notifySuccess('New plan suggestion sent')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  // ---- Customers ----
  const openCustomerModal = (customer = null) => {
    setEditCustomer(customer)
    if (customer) {
      setCustomerPolicies((customer.policies || []).map(p => ({
        policyType: p.policyType || 'health',
        planName: p.planName || '',
        company: p.company?._id || p.company || '',
        premium: p.premium ?? '',
        coverage: p.coverage ?? '',
        startDate: p.startDate ? p.startDate.slice(0, 10) : '',
        endDate: p.endDate ? p.endDate.slice(0, 10) : '',
        status: p.status || 'active',
      })))
    } else {
      setCustomerPolicies([emptyPolicyRow()])
    }
    setShowCustomerModal(true)
  }

  const addPolicyRow = () => setCustomerPolicies(rows => [...rows, emptyPolicyRow()])
  const removePolicyRow = (idx) => setCustomerPolicies(rows => rows.filter((_, i) => i !== idx))
  const setPolicyRow = (idx, field, value) => {
    setCustomerPolicies(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row))
  }

  const saveCustomer = async (e) => {
    e.preventDefault()
    try {
      const data = {
        aadharNumber: e.target.aadharNumber.value,
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        company: e.target.company.value || undefined,
        policies: customerPolicies
          .filter(p => p.planName)
          .map(p => ({
            policyType: p.policyType,
            planName: p.planName,
            company: p.company || undefined,
            premium: Number(p.premium) || 0,
            coverage: Number(p.coverage) || 0,
            startDate: p.startDate || undefined,
            endDate: p.endDate || undefined,
            status: p.status,
          })),
      }
      if (editCustomer) {
        await updateCustomer(editCustomer._id, data)
        notifySuccess('Customer updated')
      } else {
        await createCustomer(data)
        notifySuccess('Customer recorded')
      }
      setShowCustomerModal(false)
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Remove ${customer.name} from the customer list?`)) return
    try {
      await deleteCustomer(customer._id)
      notifySuccess('Customer removed')
      loadData()
    } catch (err) { notifyError(err.message) }
  }

  const activeUsers = users.filter(u => u.role === 'user').length
  const adminsCount = users.filter(u => u.role === 'admin').length
  const activePolicies = policies.filter(p => p.status === 'active').length
  const pendingPolicies = policies.filter(p => p.status === 'pending').length

  const renderOverview = () => (
    <>
      <PageHeader
        title={`Welcome back, ${admin?.firstName} ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â¹`}
        subtitle="Here's what's happening in your insurance portfolio today."
        badge={
          <span className="rounded-pill px-3 py-1" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
            System Online
          </span>
        }
      />
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3"><StatCard icon={PeopleFill} label="Total Users" value={users.length} color="#60a5fa" delay={0} /></div>
        <div className="col-12 col-sm-6 col-lg-3"><StatCard icon={PersonBadgeFill} label="Customers (List)" value={customers.length} color="#34d399" delay={0.1} /></div>
        <div className="col-12 col-sm-6 col-lg-3"><StatCard icon={FileEarmarkTextFill} label="Total Policies" value={policies.length} color="#a78bfa" delay={0.2} /></div>
        <div className="col-12 col-sm-6 col-lg-3"><StatCard icon={ClockHistory} label="Pending Reviews" value={pendingPolicies} color="#fbbf24" delay={0.3} /></div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Card.Header style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}>
              Recent Policies
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
              {policies.length === 0 ? (
                <EmptyState icon={FileEarmarkText} title="No policies yet" subtitle="Policies will appear here once users apply." />
              ) : (
                <div className="table-responsive">
                  <Table hover responsive style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted-2)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th>Customer</th>
                        <th className="d-none d-md-table-cell">Plan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.slice(0, 6).map(p => (
                        <tr key={p._id} style={{ verticalAlign: 'middle' }}>
                          <td>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.user?.firstName} {p.user?.lastName}</div>
                            <div className="d-md-none" style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)' }}>{p.planName}</div>
                          </td>
                          <td className="d-none d-md-table-cell" style={{ textTransform: 'capitalize' }}>{p.planName}</td>
                          <td><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-5">
          <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Card.Header style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}>
              Role Distribution
            </Card.Header>
            <Card.Body>
              {[
                { label: 'Admins', value: adminsCount, pct: users.length ? Math.round((adminsCount / users.length) * 100) : 0, color: '#a78bfa' },
                { label: 'Users', value: activeUsers, pct: users.length ? Math.round((activeUsers / users.length) * 100) : 0, color: '#60a5fa' },
              ].map(item => (
                <div key={item.label} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{item.value} ({item.pct}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 1 }}
                      style={{ height: '100%', borderRadius: '4px', background: item.color }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3" style={{ borderRadius: '12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
                <div className="d-flex align-items-center gap-2">
                  <ShieldFillCheck color="#60a5fa" size={20} />
                  <div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>{activePolicies} Active Policies</div>
                    <div style={{ color: 'var(--text-muted-2)', fontSize: '0.78rem' }}>Generating coverage for customers</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  )

  const renderUsers = () => {
    const userList = users.filter(u => u.role === 'user')
    const term = userQuery.trim().toLowerCase()
    const filteredUsers = userList.filter(u =>
      !term ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.aadharNumber || '').includes(term)
    )
    return (
      <>
        <PageHeader
          title="User Management"
          subtitle="Manage all registered users, roles and verification status."
          badge={
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="d-flex align-items-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', borderRadius: '999px', overflow: 'hidden' }}>
                <input
                  type="text"
                  placeholder="Search by name, email or aadhar..."
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', padding: '0.42rem 0.85rem', minWidth: '200px' }}
                />
                <Button size="sm" className="rounded-pill border-0" onClick={() => {}} style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', marginRight: '4px' }} title="Search">
                  <Search size={14} />
                </Button>
              </div>
              {term && (
                <Button size="sm" variant="outline" className="rounded-pill" onClick={() => setUserQuery('')} style={{ border: '1px solid var(--border-strong)', color: 'var(--text-muted-2)' }}>Clear</Button>
              )}
              <Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--primary-light)' }}>{term ? `${filteredUsers.length}/${userList.length} Users` : `${userList.length} Users`}</Badge>
            <Button className="rounded-pill gradient-bg border-0 px-3" onClick={openCreateUser}>
              <PlusCircleFill className="me-1" /> Add User
            </Button>
            <Button variant="outline-primary" className="rounded-pill px-3" onClick={() => setBulkTarget('users')} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
              <CloudUploadFill className="me-1" /> Bulk Upload
            </Button>
          </div>
        }
      />
      <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body style={{ padding: 0 }}>
          {filteredUsers.length === 0 ? (
            <EmptyState icon={PeopleFill} title={term ? 'No users match your search' : 'No users found'} subtitle={term ? 'Try a different name, email or aadhar number.' : undefined} />
          ) : (
            <div className="table-responsive">
              <Table hover responsive style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted-2)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th>User</th>
                    <th>Aadhar</th>
                    <th className="d-none d-md-table-cell">Email</th>
                    <th>Role</th>
                    <th className="d-none d-sm-table-cell">Verified</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id} style={{ verticalAlign: 'middle' }}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                            <div className="d-md-none" style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{user.aadharNumber}</td>
                      <td className="d-none d-md-table-cell" style={{ fontSize: '0.85rem' }}>{user.email}</td>
                      <td>
                        <span
                          className="rounded-pill px-3 py-1"
                          style={{
                            background: user.role === 'admin' ? 'rgba(167,139,250,0.1)' : 'rgba(96,165,250,0.1)',
                            border: `1px solid ${user.role === 'admin' ? 'rgba(167,139,250,0.3)' : 'rgba(96,165,250,0.25)'}`,
                            color: user.role === 'admin' ? '#a78bfa' : '#60a5fa',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="d-none d-sm-table-cell">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-pill"
                          disabled={user._id === admin?._id}
                          onClick={() => handleVerifyToggle(user)}
                          style={{
                            border: '1px solid rgba(52,211,153,0.3)',
                            color: user.isVerified ? '#34d399' : 'var(--text-secondary)',
                            background: user.isVerified ? 'rgba(52,211,153,0.08)' : 'transparent',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </Button>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => { setEditUser(user); setShowEditUser(true) }} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                            <PencilSquare size={13} />
                          </Button>
                          <Button size="sm" variant="outline-danger" className="rounded-pill" disabled={user._id === admin?._id} onClick={() => handleDeleteUser(user)} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                            <Trash size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      </>
    )
  }

  const renderPolicies = () => {
    const term = policyQuery.trim().toLowerCase()
    const filteredPolicies = policies.filter(p =>
      !term ||
      `${p.user?.firstName} ${p.user?.lastName}`.toLowerCase().includes(term) ||
      (p.planName || '').toLowerCase().includes(term) ||
      getPolicyLabel(p.policyType).toLowerCase().includes(term) ||
      (p.company?.name || '').toLowerCase().includes(term)
    )
    return (
      <>
        <PageHeader
          title="Policy Management"
          subtitle="Review, approve or reject policy applications."
          badge={
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="d-flex align-items-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', borderRadius: '999px', overflow: 'hidden' }}>
                <input
                  type="text"
                  placeholder="Search by customer, plan, type or company..."
                  value={policyQuery}
                  onChange={e => setPolicyQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', padding: '0.42rem 0.85rem', minWidth: '200px' }}
                />
                <Button size="sm" className="rounded-pill border-0" onClick={() => {}} style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', marginRight: '4px' }} title="Search">
                  <Search size={14} />
                </Button>
              </div>
              {term && (
                <Button size="sm" variant="outline" className="rounded-pill" onClick={() => setPolicyQuery('')} style={{ border: '1px solid var(--border-strong)', color: 'var(--text-muted-2)' }}>Clear</Button>
              )}
              <Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>{term ? `${filteredPolicies.length}/${policies.length} Policies` : `${policies.length} Policies`}</Badge>
            <Button variant="outline-primary" className="rounded-pill px-3" onClick={() => setBulkTarget('policies')} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
              <CloudUploadFill className="me-1" /> Bulk Upload
            </Button>
          </div>
        }
      />
      <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body style={{ padding: 0 }}>
          {filteredPolicies.length === 0 ? (
            <EmptyState icon={FileEarmarkText} title={term ? 'No policies match your search' : 'No policy applications'} subtitle={term ? 'Try a different customer, plan or company.' : 'New applications will show up here.'} />
          ) : (
            <div className="table-responsive">
              <Table hover responsive style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted-2)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th>Customer</th>
                    <th className="d-none d-md-table-cell">Type</th>
                    <th>Plan</th>
                    <th className="d-none d-md-table-cell">Company</th>
                    <th className="d-none d-md-table-cell">Premium</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map(p => (
                    <tr key={p._id} style={{ verticalAlign: 'middle' }}>
                      <td>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.user?.firstName} {p.user?.lastName}</div>
                        <div className="d-md-none" style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)' }}>{getPolicyLabel(p.policyType)} Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹{p.premium}</div>
                      </td>
                      <td className="d-none d-md-table-cell">{getPolicyLabel(p.policyType)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.planName}</td>
                      <td className="d-none d-md-table-cell" style={{ fontSize: '0.85rem' }}>{p.company?.name || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</td>
                      <td className="d-none d-md-table-cell">ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹{p.premium}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        <div className="d-flex justify-content-end gap-2 flex-wrap">
                          {p.status === 'pending' && (
                            <>
                              <Button size="sm" variant="success" className="rounded-pill border-0" onClick={() => handlePolicyStatus(p, 'active')} style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', fontWeight: 600 }}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-pill" onClick={() => handlePolicyStatus(p, 'rejected')} style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => { setEditPolicy(p); setShowEditPolicy(true) }} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                            <PencilSquare size={13} />
                          </Button>
                          <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDeletePolicy(p)} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                            <Trash size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  )
  }

  const renderPricing = () => (
    <>
      <PageHeader
        title="Pricing Management"
        subtitle="Adjust the premium and coverage of any policy plan. Edits apply immediately."
        badge={
          <Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--primary-light)' }}>{policies.length} Plans</Badge>
        }
      />
      <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body style={{ padding: 0 }}>
          {policies.length === 0 ? (
            <EmptyState icon={FileEarmarkText} title="No plans yet" subtitle="Add policies first, then adjust their prices here." />
          ) : (
            <div className="table-responsive">
              <Table hover responsive style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted-2)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th>Plan / Customer</th>
                    <th className="d-none d-md-table-cell">Type</th>
                    <th className="d-none d-md-table-cell">Company</th>
                    <th style={{ minWidth: '140px' }}>Premium</th>
                    <th style={{ minWidth: '140px' }}>Coverage</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map(p => {
                    const d = pricingDrafts[p._id] || {}
                    const prem = d.premium !== undefined ? d.premium : p.premium
                    const cov = d.coverage !== undefined ? d.coverage : p.coverage
                    const changed =
                      (d.premium !== undefined && Number(d.premium) !== Number(p.premium)) ||
                      (d.coverage !== undefined && Number(d.coverage) !== Number(p.coverage))
                    return (
                      <tr key={p._id} style={{ verticalAlign: 'middle' }}>
                        <td>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.planName || '-'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)' }}>{p.user?.firstName} {p.user?.lastName}</div>
                        </td>
                        <td className="d-none d-md-table-cell">{getPolicyLabel(p.policyType)}</td>
                        <td className="d-none d-md-table-cell" style={{ fontSize: '0.85rem' }}>{p.company?.name || '-'}</td>
                        <td>
                          <Form.Control
                            type="number"
                            min={0}
                            value={prem}
                            onChange={e => updatePriceDraft(p._id, 'premium', e.target.value)}
                            style={{
                              background: 'var(--input-bg)',
                              border: `1px solid ${d.premium !== undefined ? 'rgba(96,165,250,0.6)' : 'var(--border-strong)'}`,
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              width: '140px',
                            }}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min={0}
                            value={cov}
                            onChange={e => updatePriceDraft(p._id, 'coverage', e.target.value)}
                            style={{
                              background: 'var(--input-bg)',
                              border: `1px solid ${d.coverage !== undefined ? 'rgba(96,165,250,0.6)' : 'var(--border-strong)'}`,
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              width: '140px',
                            }}
                          />
                        </td>
                        <td>
                          <div className="d-flex justify-content-end gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="rounded-pill"
                              disabled={!changed}
                              onClick={() => savePriceRow(p)}
                              style={{ borderColor: 'rgba(96,165,250,0.3)', color: changed ? '#60a5fa' : 'var(--text-muted-3)' }}
                            >
                              <Check2 size={13} className="me-1" />Save
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  )

  const renderRenewals = () => {
    const suggestedIds = new Set(
      suggestions.filter(s => s.status === 'pending' && s.policy?._id).map(s => String(s.policy._id))
    )
    const expired = expiringPolicies.filter(p => p.daysLeft < 0).length
    const soon30 = expiringPolicies.filter(p => p.daysLeft >= 0 && p.daysLeft <= 30).length
    const soon90 = expiringPolicies.filter(p => p.daysLeft > 30 && p.daysLeft <= 90).length

    const daysBadge = (daysLeft) => {
      if (daysLeft < 0) {
        return { text: `Expired ${Math.abs(daysLeft)}d ago`, color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
      }
      if (daysLeft === 0) {
        return { text: 'Expires today', color: '#fb923c', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' }
      }
      if (daysLeft <= 30) {
        return { text: `${daysLeft} days left`, color: '#fb923c', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' }
      }
      return { text: `${daysLeft} days left`, color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' }
    }

    return (
      <>
        <PageHeader
          title="Renewals & Expiring Policies"
          subtitle="See policies that expire soon or have lapsed, and suggest renewal or a new plan to the customer."
          badge={
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>{expired} Expired</Badge>
              <Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c' }}>{soon30} Due in 30d</Badge>
              <Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15' }}>{soon90} Due in 90d</Badge>
            </div>
          }
        />
        <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Card.Body style={{ padding: 0 }}>
            {expiringPolicies.length === 0 ? (
              <EmptyState icon={ShieldFillCheck} title="No expiring policies" subtitle="All active policies are covered for the next 90 days." />
            ) : (
              <div className="table-responsive">
                <Table hover responsive style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted-2)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th>Customer</th>
                      <th>Plan</th>
                      <th className="d-none d-lg-table-cell">Type</th>
                      <th className="d-none d-md-table-cell">Company</th>
                      <th className="d-none d-md-table-cell">Expires on</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringPolicies.map(p => {
                      const badge = daysBadge(p.daysLeft)
                      const suggested = suggestedIds.has(String(p._id))
                      return (
                        <tr key={p._id} style={{ verticalAlign: 'middle' }}>
                          <td>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.user?.firstName} {p.user?.lastName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>{p.user?.phone || p.user?.email}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{p.planName}</td>
                          <td className="d-none d-lg-table-cell">{getPolicyLabel(p.policyType)}</td>
                          <td className="d-none d-md-table-cell" style={{ fontSize: '0.85rem' }}>{p.company?.name || '-'}</td>
                          <td className="d-none d-md-table-cell">{p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}</td>
                          <td>
                            <span className="rounded-pill px-3 py-1" style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontSize: '0.75rem', fontWeight: 600 }}>
                              {badge.text}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                              <Button size="sm" variant="outline" className="rounded-pill" disabled={suggested} onClick={() => suggestRenewal(p)} style={{ border: '1px solid rgba(52,211,153,0.3)', color: suggested ? 'var(--text-muted-3)' : '#34d399', fontWeight: 600 }}>
                                {suggested ? 'Suggested' : <><ArrowRepeat size={13} className="me-1" />Renew</>}
                              </Button>
                              <Button size="sm" variant="outline-primary" className="rounded-pill" disabled={suggested} onClick={() => openSuggestNewPlan(p)} style={{ borderColor: 'rgba(96,165,250,0.3)', color: suggested ? 'var(--text-muted-3)' : '#60a5fa' }}>
                                <EnvelopePlus size={13} className="me-1" />New Plan
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </>
    )
  }

  const renderCompanies = () => (
    <>
      <PageHeader
        title="Insurance Companies"
        subtitle="Companies you have a tie-up with. These appear in customer and policy forms."
        badge={
          <div className="d-flex align-items-center gap-2">
            <Button className="rounded-pill gradient-bg border-0 px-4" onClick={() => openCompanyModal()}>
              <PlusCircleFill className="me-1" /> Add Company
            </Button>
            <Button variant="outline-primary" className="rounded-pill px-3" onClick={() => setBulkTarget('companies')} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
              <CloudUploadFill className="me-1" /> Bulk Upload
            </Button>
          </div>
        }
      />
      <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body style={{ padding: 0 }}>
          {companies.length === 0 ? (
            <EmptyState icon={BuildingFill} title="No companies yet" subtitle="Add insurance companies you work with to start recording clients." />
          ) : (
            <div className="table-responsive">
              <Table hover responsive style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted-2)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th>Company</th>
                    <th className="d-none d-md-table-cell">Contact</th>
                    <th className="d-none d-lg-table-cell">Insurance Types</th>
                    <th className="d-none d-xl-table-cell">Description</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c._id} style={{ verticalAlign: 'middle' }}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                            <BuildingFill size={18} />
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.name}</div>
                            <div className="d-md-none" style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>{c.phone || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <div style={{ fontSize: '0.85rem' }}>{c.email || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)' }}>{c.phone || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</div>
                      </td>
                      <td className="d-none d-lg-table-cell">
                        {(c.policyTypes || []).length === 0 ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted-2)' }}>ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â</span>
                        ) : (
                          <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '280px' }}>
                            {(c.policyTypes || []).slice(0, 3).map(t => (
                              <span key={t} className="rounded-pill px-2 py-1" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: '0.68rem', fontWeight: 600 }}>
                                {getPolicyLabel(t)}
                              </span>
                            ))}
                            {(c.policyTypes || []).length > 3 && (
                              <span className="rounded-pill px-2 py-1" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', fontSize: '0.68rem', fontWeight: 600 }}>
                                +{(c.policyTypes || []).length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="d-none d-xl-table-cell" style={{ fontSize: '0.85rem', maxWidth: '220px' }}>{c.description || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => openCompanyModal(c)} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                            <PencilSquare size={13} />
                          </Button>
                          <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDeleteCompany(c)} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                            <Trash size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  )

  const renderCustomers = () => (
    <>
      <PageHeader
        title="Customer List"
        subtitle="Record your clients by Aadhar. On login they'll see the policies they own."
        badge={
          <div className="d-flex align-items-center gap-2">
            <Button className="rounded-pill gradient-bg border-0 px-4" onClick={() => openCustomerModal()}>
              <PlusCircleFill className="me-1" /> Add Customer
            </Button>
            <Button variant="outline-primary" className="rounded-pill px-3" onClick={() => setBulkTarget('customers')} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
              <CloudUploadFill className="me-1" /> Bulk Upload
            </Button>
          </div>
        }
      />
      <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body style={{ padding: 0 }}>
          {customers.length === 0 ? (
            <EmptyState icon={PersonBadgeFill} title="No customers recorded" subtitle="Add clients with their Aadhar numbers to link them to policies." />
          ) : (
            <div className="table-responsive">
              <Table hover responsive style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted-2)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th>Customer</th>
                    <th>Aadhar</th>
                    <th className="d-none d-md-table-cell">Company</th>
                    <th className="d-none d-sm-table-cell">Policies</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id} style={{ verticalAlign: 'middle' }}>
                      <td>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.name}</div>
                        <div className="d-md-none" style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>{c.phone || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.aadharNumber}</td>
                      <td className="d-none d-md-table-cell">
                        {c.company?.name ? (
                          <span className="rounded-pill px-2 py-1" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {c.company.name}
                          </span>
                        ) : <span style={{ fontSize: '0.8rem' }}>ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â</span>}
                      </td>
                      <td className="d-none d-sm-table-cell">
                        <span className="rounded-pill px-2 py-1" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600 }}>
                          {c.policies?.length || 0} owned
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => openCustomerModal(c)} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                            <PencilSquare size={13} />
                          </Button>
                          <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDeleteCustomer(c)} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                            <Trash size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  )

  return (
    <DashboardLayout navItems={navItems} title="Admin Panel" activeKey={view} onNavigate={setView}>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          {view === 'overview' && renderOverview()}
          {view === 'users' && renderUsers()}
          {view === 'policies' && renderPolicies()}
          {view === 'pricing' && renderPricing()}
          {view === 'renewals' && renderRenewals()}
          {view === 'companies' && renderCompanies()}
          {view === 'customers' && renderCustomers()}
        </>
      )}

      {/* Edit user modal */}
      <Modal show={showEditUser} onHide={() => setShowEditUser(false)} centered contentClassName="glass-card" style={{ color: 'var(--text-primary)' }}>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveUser}>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>First Name</Form.Label>
                  <Form.Control defaultValue={editUser?.firstName} name="firstName" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Last Name</Form.Label>
                  <Form.Control defaultValue={editUser?.lastName} name="lastName" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email</Form.Label>
                  <Form.Control type="email" defaultValue={editUser?.email} name="email" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Phone</Form.Label>
                  <Form.Control defaultValue={editUser?.phone} name="phone" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="outline-light" className="rounded-pill" onClick={() => setShowEditUser(false)} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-strong)' }}>Cancel</Button>
            <Button type="submit" className="rounded-pill gradient-bg border-0">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Create user modal */}
      <Modal show={showCreateUser} onHide={() => setShowCreateUser(false)} centered contentClassName="glass-card" style={{ color: 'var(--text-primary)' }}>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveNewUser}>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>First Name *</Form.Label>
                  <Form.Control name="firstName" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Last Name *</Form.Label>
                  <Form.Control name="lastName" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Aadhar Number *</Form.Label>
                  <Form.Control name="aadharNumber" required minLength={12} maxLength={12} pattern="\d{12}" placeholder="12-digit Aadhar" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email *</Form.Label>
                  <Form.Control type="email" name="email" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Phone</Form.Label>
                  <Form.Control name="phone" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Password *</Form.Label>
                  <Form.Control type="password" name="password" required minLength={6} placeholder="At least 6 characters" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Assign Company & Insurance (optional)</Form.Label>
                  <span className="rounded-pill px-2 py-1" style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', fontSize: '0.65rem', fontWeight: 600 }}>Records them as your customer</span>
                </div>
                <Form.Select
                  name="company"
                  value={newUserCompanyId}
                  onChange={e => { setNewUserCompanyId(e.target.value); setNewUserPolicyType('') }}
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}
                >
                  <option value="" style={{ color: 'var(--text-primary)' }}>Select company</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id} style={{ color: 'var(--text-primary)' }}>{c.name}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Insurance Type (from this company)</Form.Label>
                  <Form.Select
                    name="policyType"
                    value={newUserPolicyType}
                    onChange={e => setNewUserPolicyType(e.target.value)}
                    disabled={!newUserCompanyId}
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}
                  >
                    {!newUserCompanyId && <option value="" style={{ color: 'var(--text-primary)' }}>Select a company first</option>}
                    {newUserCompanyId && <option value="" style={{ color: 'var(--text-primary)' }}>Select insurance type</option>}
                    {newUserCompanyId && (() => {
                      const comp = companies.find(c => c._id === newUserCompanyId)
                      const types = (comp?.policyTypes || []).length > 0 ? comp.policyTypes : POLICY_TYPES.map(p => p.type)
                      return types.map(t => (
                        <option key={t} value={t} style={{ color: 'var(--text-primary)' }}>{getPolicyLabel(t)}</option>
                      ))
                    })()}
                  </Form.Select>
                  {newUserCompanyId && (() => {
                    const comp = companies.find(c => c._id === newUserCompanyId)
                    if ((comp?.policyTypes || []).length === 0) {
                      return <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)', marginTop: '4px' }}>This company has no insurance types set ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â showing all types. Edit the company to restrict its offerings.</div>
                    }
                    return null
                  })()}
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="outline-light" className="rounded-pill" onClick={() => setShowCreateUser(false)} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-strong)' }}>Cancel</Button>
            <Button type="submit" className="rounded-pill gradient-bg border-0">Create User</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit policy modal */}
      <Modal show={showEditPolicy} onHide={() => setShowEditPolicy(false)} centered contentClassName="glass-card" style={{ color: 'var(--text-primary)' }}>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Policy</Modal.Title>
        </Modal.Header>
        <Form onSubmit={savePolicy}>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Plan Name</Form.Label>
                  <Form.Control defaultValue={editPolicy?.planName} name="planName" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Premium (ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹)</Form.Label>
                  <Form.Control type="number" defaultValue={editPolicy?.premium} name="premium" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Coverage (ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹)</Form.Label>
                  <Form.Control type="number" defaultValue={editPolicy?.coverage} name="coverage" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="outline-light" className="rounded-pill" onClick={() => setShowEditPolicy(false)} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-strong)' }}>Cancel</Button>
            <Button type="submit" className="rounded-pill gradient-bg border-0">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Suggest new plan modal */}
      <Modal show={showSuggestModal} onHide={() => setShowSuggestModal(false)} centered contentClassName="glass-card" style={{ color: 'var(--text-primary)' }}>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>Suggest a New Plan</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveSuggestion}>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Customer</Form.Label>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{suggestTarget?.user?.firstName} {suggestTarget?.user?.lastName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>Current: {suggestTarget?.planName}</div>
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Plan Name *</Form.Label>
                  <Form.Control name="planName" required placeholder="e.g. Secure Health Gold" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Insurance Type *</Form.Label>
                  <Form.Select name="policyType" defaultValue={suggestTarget?.suggestType || 'health'} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}>
                    {POLICY_TYPES.map(t => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Company</Form.Label>
                  <Form.Select name="company" defaultValue={suggestTarget?.company?._id || ''} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}>
                    <option value="">No company</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Premium (yearly)</Form.Label>
                  <Form.Control type="number" name="premium" required defaultValue={POLICY_TYPES.find(t => t.type === suggestTarget?.suggestType)?.basePremium || ''} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 600 }} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Coverage</Form.Label>
                  <Form.Control type="number" name="coverage" required defaultValue={POLICY_TYPES.find(t => t.type === suggestTarget?.suggestType)?.coverage || ''} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 600 }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Message (shown to customer)</Form.Label>
                  <Form.Control as="textarea" rows={2} name="message" placeholder="Why should they switch?" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', resize: 'vertical' }} />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="outline-light" className="rounded-pill" onClick={() => setShowSuggestModal(false)} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-strong)' }}>Cancel</Button>
            <Button type="submit" className="rounded-pill gradient-bg border-0">Send Suggestion</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Company modal */}
      <Modal show={showCompanyModal} onHide={() => setShowCompanyModal(false)} centered contentClassName="glass-card" style={{ color: 'var(--text-primary)' }}>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editCompany ? 'Edit Company' : 'Add Company'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveCompany}>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Company Name *</Form.Label>
                  <Form.Control defaultValue={editCompany?.name} name="name" required placeholder="e.g. HDFC ERGO" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email</Form.Label>
                  <Form.Control type="email" defaultValue={editCompany?.email} name="email" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Phone</Form.Label>
                  <Form.Control defaultValue={editCompany?.phone} name="phone" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Address</Form.Label>
                  <Form.Control defaultValue={editCompany?.address} name="address" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} defaultValue={editCompany?.description} name="description" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Insurance Types Offered <span style={{ color: '#f87171' }}>*</span>
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {POLICY_TYPES.map(pt => {
                      const active = companyPolicyTypes.includes(pt.type)
                      return (
                        <Button
                          key={pt.type}
                          type="button"
                          size="sm"
                          onClick={() => toggleCompanyPolicyType(pt.type)}
                          style={{
                            borderRadius: '20px',
                            border: active ? '1px solid rgba(52,211,153,0.5)' : '1px solid var(--border-strong)',
                            background: active ? 'rgba(52,211,153,0.12)' : 'var(--input-bg)',
                            color: active ? '#34d399' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        >
                          {pt.label}
                        </Button>
                      )
                    })}
                  </div>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="outline-light" className="rounded-pill" onClick={() => setShowCompanyModal(false)} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-strong)' }}>Cancel</Button>
            <Button type="submit" className="rounded-pill gradient-bg border-0">{editCompany ? 'Save Changes' : 'Add Company'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Customer modal */}
      <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} centered size="lg" contentClassName="glass-card" style={{ color: 'var(--text-primary)' }}>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editCustomer ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveCustomer}>
          <Modal.Body>
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Full Name *</Form.Label>
                  <Form.Control defaultValue={editCustomer?.name} name="name" required placeholder="Client name" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Aadhar Number *</Form.Label>
                  <Form.Control defaultValue={editCustomer?.aadharNumber} name="aadharNumber" required minLength={12} maxLength={12} pattern="\d{12}" placeholder="12-digit Aadhar" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                </Form.Group>
              </div>
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Phone</Form.Label>
                  <Form.Control defaultValue={editCustomer?.phone} name="phone" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email</Form.Label>
                  <Form.Control type="email" defaultValue={editCustomer?.email} name="email" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Assigned Company</Form.Label>
                  <Form.Select name="company" defaultValue={editCustomer?.company?._id || ''} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}>
                    <option value="" style={{ color: 'var(--text-primary)' }}>Select company (tie-up)</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id} style={{ color: 'var(--text-primary)' }}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            {/* Owned policies */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Owned Policies</div>
              <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={addPolicyRow} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                <PlusCircleFill className="me-1" /> Add Policy
              </Button>
            </div>
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {customerPolicies.length === 0 ? (
                <p style={{ color: 'var(--text-muted-2)', fontSize: '0.85rem' }}>No policies added. Use "Add Policy" to record what this client owns.</p>
              ) : customerPolicies.map((row, idx) => (
                <div key={idx} className="p-3 mb-3 rounded-3" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted-2)' }}>Policy #{idx + 1}</span>
                    <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => removePolicyRow(idx)} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                      <XCircle size={14} />
                    </Button>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <Form.Select size="sm" value={row.policyType} onChange={e => setPolicyRow(idx, 'policyType', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                        {policyTypes.map(t => (
                          <option key={t.value} value={t.value} style={{ color: 'var(--text-primary)' }}>{t.label}</option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-6">
                      <Form.Select size="sm" value={row.company} onChange={e => setPolicyRow(idx, 'company', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                        <option value="" style={{ color: 'var(--text-primary)' }}>Company</option>
                        {companies.map(c => (
                          <option key={c._id} value={c._id} style={{ color: 'var(--text-primary)' }}>{c.name}</option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-12">
                      <Form.Control size="sm" placeholder="Plan name (e.g. Family Health Gold)" value={row.planName} onChange={e => setPolicyRow(idx, 'planName', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="col-4">
                      <Form.Control size="sm" type="number" placeholder="Premium ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹" value={row.premium} onChange={e => setPolicyRow(idx, 'premium', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="col-4">
                      <Form.Control size="sm" type="number" placeholder="Coverage ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹" value={row.coverage} onChange={e => setPolicyRow(idx, 'coverage', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="col-4">
                      <Form.Select size="sm" value={row.status} onChange={e => setPolicyRow(idx, 'status', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                        <option value="active" style={{ color: 'var(--text-primary)' }}>Active</option>
                        <option value="pending" style={{ color: 'var(--text-primary)' }}>Pending</option>
                        <option value="expired" style={{ color: 'var(--text-primary)' }}>Expired</option>
                        <option value="rejected" style={{ color: 'var(--text-primary)' }}>Rejected</option>
                      </Form.Select>
                    </div>
                    <div className="col-6">
                      <Form.Control size="sm" type="date" value={row.startDate} onChange={e => setPolicyRow(idx, 'startDate', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="col-6">
                      <Form.Control size="sm" type="date" value={row.endDate} onChange={e => setPolicyRow(idx, 'endDate', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="outline-light" className="rounded-pill" onClick={() => setShowCustomerModal(false)} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-strong)' }}>Cancel</Button>
            <Button type="submit" className="rounded-pill gradient-bg border-0">{editCustomer ? 'Save Changes' : 'Record Customer'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Bulk upload modal */}
      {bulkTarget && (
        <BulkUploadModal
          show={!!bulkTarget}
          onHide={() => setBulkTarget(null)}
          title={bulkConfig[bulkTarget].title}
          subtitle={bulkConfig[bulkTarget].subtitle}
          columns={bulkConfig[bulkTarget].columns}
          sample={bulkConfig[bulkTarget].sample}
          onUpload={handleBulkUpload}
        />
      )}
    </DashboardLayout>
  )
}

export default AdminDashboard
