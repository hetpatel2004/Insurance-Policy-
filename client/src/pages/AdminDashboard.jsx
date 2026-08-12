import { useEffect, useState } from 'react'
import { Card, Table, Button, Badge, Form, Modal, Spinner } from 'react-bootstrap'
import { motion } from 'framer-motion'
import {
  Speedometer2, PeopleFill, FileEarmarkTextFill,
  PencilSquare, Trash, PersonFill, ShieldFillCheck,
  FileEarmarkText, ClockHistory, BuildingFill,
  PersonBadgeFill, PlusCircleFill, XCircle, CloudUploadFill
} from 'react-bootstrap-icons'
import DashboardLayout from '../components/DashboardLayout'
import { StatCard, PageHeader, StatusBadge, EmptyState } from '../components/dashboard/Widgets'
import BulkUploadModal from '../components/dashboard/BulkUploadModal'
import {
  getUsers, createUser, updateUser, deleteUser, getAllPolicies, updatePolicy, deletePolicy, getUser,
  getCompanies, createCompany, updateCompany, deleteCompany,
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  bulkCreateUsers, bulkCreateCompanies, bulkCreateCustomers, bulkCreatePolicies,
} from '../api/auth'
import { notifySuccess, notifyError } from '../utils/toast'
import { POLICY_TYPES, getPolicyLabel } from '../utils/policyTypes'
import { parseCSVRows } from '../utils/csv'

const navItems = [
  { key: 'overview', label: 'Overview', icon: Speedometer2 },
  { key: 'users', label: 'Users', icon: PeopleFill },
  { key: 'policies', label: 'Policies', icon: FileEarmarkTextFill },
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
    subtitle: 'Each row creates a login account. Duplicate Aadhar/email rows are skipped.',
    columns: ['firstName', 'lastName', 'aadharNumber', 'email', 'phone', 'password', 'role'],
    sample: ['Rahul', 'Sharma', '444444444444', 'rahul@gmail.com', '+919876543210', 'user123', 'user'],
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

  const admin = getUser()

  const loadData = async () => {
    try {
      setLoading(true)
      const [u, p, c, cu] = await Promise.all([
        getUsers(),
        getAllPolicies(),
        getCompanies(),
        getCustomers(),
      ])
      setUsers(u)
      setPolicies(p)
      setCompanies(c)
      setCustomers(cu)
    } catch (err) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRoleChange = async (user, role) => {
    try {
      await updateUser(user._id, { role })
      notifySuccess(`Role changed to ${role} for ${user.firstName} ${user.lastName}`)
      loadData()
    } catch (err) { notifyError(err.message) }
  }

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
        role: e.target.role.value,
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
        title={`Welcome back, ${admin?.firstName} 👋`}
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

  const renderUsers = () => (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage all registered users, roles and verification status."
        badge={
          <div className="d-flex align-items-center gap-2">
            <Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--primary-light)' }}>{users.length} Users</Badge>
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
          {users.length === 0 ? (
            <EmptyState icon={PeopleFill} title="No users found" />
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
                  {users.map(user => (
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
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user, e.target.value)}
                          disabled={user._id === admin?._id}
                          style={{
                            background: user.role === 'admin' ? 'rgba(167,139,250,0.1)' : 'var(--input-bg)',
                            border: `1px solid ${user.role === 'admin' ? 'rgba(167,139,250,0.3)' : 'var(--border-strong)'}`,
                            color: user.role === 'admin' ? '#a78bfa' : 'var(--text-secondary)',
                            borderRadius: '8px',
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          <option value="user" style={{ color: '#0f172a' }}>User</option>
                          <option value="admin" style={{ color: '#0f172a' }}>Admin</option>
                        </select>
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

  const renderPolicies = () => (
    <>
      <PageHeader
        title="Policy Management"
        subtitle="Review, approve or reject policy applications."
        badge={
          <div className="d-flex align-items-center gap-2">
            <Badge bg="none" className="rounded-pill px-3 py-1" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>{policies.length} Policies</Badge>
            <Button variant="outline-primary" className="rounded-pill px-3" onClick={() => setBulkTarget('policies')} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
              <CloudUploadFill className="me-1" /> Bulk Upload
            </Button>
          </div>
        }
      />
      <Card className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Body style={{ padding: 0 }}>
          {policies.length === 0 ? (
            <EmptyState icon={FileEarmarkText} title="No policy applications" subtitle="New applications will show up here." />
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
                  {policies.map(p => (
                    <tr key={p._id} style={{ verticalAlign: 'middle' }}>
                      <td>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.user?.firstName} {p.user?.lastName}</div>
                        <div className="d-md-none" style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)' }}>{getPolicyLabel(p.policyType)} · ₹{p.premium}</div>
                      </td>
                      <td className="d-none d-md-table-cell">{getPolicyLabel(p.policyType)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.planName}</td>
                      <td className="d-none d-md-table-cell" style={{ fontSize: '0.85rem' }}>{p.company?.name || '—'}</td>
                      <td className="d-none d-md-table-cell">₹{p.premium}</td>
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
                            <div className="d-md-none" style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>{c.phone || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <div style={{ fontSize: '0.85rem' }}>{c.email || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)' }}>{c.phone || '—'}</div>
                      </td>
                      <td className="d-none d-lg-table-cell">
                        {(c.policyTypes || []).length === 0 ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted-2)' }}>—</span>
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
                      <td className="d-none d-xl-table-cell" style={{ fontSize: '0.85rem', maxWidth: '220px' }}>{c.description || '—'}</td>
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
                        <div className="d-md-none" style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)' }}>{c.phone || '—'}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.aadharNumber}</td>
                      <td className="d-none d-md-table-cell">
                        {c.company?.name ? (
                          <span className="rounded-pill px-2 py-1" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {c.company.name}
                          </span>
                        ) : <span style={{ fontSize: '0.8rem' }}>—</span>}
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
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Role</Form.Label>
                  <Form.Select name="role" defaultValue="user" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px' }}>
                    <option value="user" style={{ color: '#0f172a' }}>User</option>
                    <option value="admin" style={{ color: '#0f172a' }}>Admin</option>
                  </Form.Select>
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
                  <option value="">Select company</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id} style={{ color: '#0f172a' }}>{c.name}</option>
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
                    {!newUserCompanyId && <option value="" style={{ color: '#0f172a' }}>Select a company first</option>}
                    {newUserCompanyId && <option value="" style={{ color: '#0f172a' }}>Select insurance type</option>}
                    {newUserCompanyId && (() => {
                      const comp = companies.find(c => c._id === newUserCompanyId)
                      const types = (comp?.policyTypes || []).length > 0 ? comp.policyTypes : POLICY_TYPES.map(p => p.type)
                      return types.map(t => (
                        <option key={t} value={t} style={{ color: '#0f172a' }}>{getPolicyLabel(t)}</option>
                      ))
                    })()}
                  </Form.Select>
                  {newUserCompanyId && (() => {
                    const comp = companies.find(c => c._id === newUserCompanyId)
                    if ((comp?.policyTypes || []).length === 0) {
                      return <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)', marginTop: '4px' }}>This company has no insurance types set — showing all types. Edit the company to restrict its offerings.</div>
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
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Premium (₹)</Form.Label>
                  <Form.Control type="number" defaultValue={editPolicy?.premium} name="premium" required style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Coverage (₹)</Form.Label>
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
                    <option value="">Select company (tie-up)</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id} style={{ color: '#0f172a' }}>{c.name}</option>
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
                          <option key={t.value} value={t.value} style={{ color: '#0f172a' }}>{t.label}</option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-6">
                      <Form.Select size="sm" value={row.company} onChange={e => setPolicyRow(idx, 'company', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                        <option value="">Company</option>
                        {companies.map(c => (
                          <option key={c._id} value={c._id} style={{ color: '#0f172a' }}>{c.name}</option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-12">
                      <Form.Control size="sm" placeholder="Plan name (e.g. Family Health Gold)" value={row.planName} onChange={e => setPolicyRow(idx, 'planName', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="col-4">
                      <Form.Control size="sm" type="number" placeholder="Premium ₹" value={row.premium} onChange={e => setPolicyRow(idx, 'premium', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="col-4">
                      <Form.Control size="sm" type="number" placeholder="Coverage ₹" value={row.coverage} onChange={e => setPolicyRow(idx, 'coverage', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="col-4">
                      <Form.Select size="sm" value={row.status} onChange={e => setPolicyRow(idx, 'status', e.target.value)} style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                        <option value="active" style={{ color: '#0f172a' }}>Active</option>
                        <option value="pending" style={{ color: '#0f172a' }}>Pending</option>
                        <option value="expired" style={{ color: '#0f172a' }}>Expired</option>
                        <option value="rejected" style={{ color: '#0f172a' }}>Rejected</option>
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
