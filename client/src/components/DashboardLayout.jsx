import { useState } from 'react'
import { Container } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShieldShaded, BoxArrowRight, List, X } from 'react-bootstrap-icons'
import { getUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

const DashboardLayout = ({ navItems, title, children, activeKey, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const user = getUser()

  const handleNav = (item) => {
    if (onNavigate) onNavigate(item.key)
    setSidebarOpen(false)
    if (item.href) navigate(item.href)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const sidebarContent = (
    <div
      className="h-100 d-flex flex-column"
      style={{ background: 'var(--sidebar-bg)', minHeight: '100%' }}
    >
      {/* Brand */}
      <div
        className="d-flex align-items-center justify-content-between p-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="d-flex align-items-center gap-2">
          <ShieldShaded color="#60a5fa" size={28} />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>SecureLife</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted-2)' }}>{title}</div>
          </div>
        </div>
        <button
          className="d-lg-none border-0 bg-transparent"
          onClick={() => setSidebarOpen(false)}
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={22} />
        </button>
      </div>

        {/* Nav items */}
        <div className="flex-grow-1 p-3">
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Menu
          </div>
          <div className="d-flex justify-content-center mb-3">
            <ThemeToggle />
          </div>
        {navItems.map(item => {
          const active = activeKey === item.key
          return (
            <button
              key={item.key}
              onClick={() => handleNav(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 14px',
                marginBottom: '6px',
                borderRadius: '12px',
                border: active ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
                background: active ? 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))' : 'transparent',
                color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
              }}
            >
              <item.icon size={18} color={active ? '#60a5fa' : '#64748b'} />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* User info */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '16px' }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.08)',
            color: '#f87171',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          <BoxArrowRight size={16} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile top bar */}
      <div
        className="d-lg-none d-flex justify-content-between align-items-center"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1030,
          padding: '12px 16px',
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <button
            className="border-0 bg-transparent"
            onClick={() => setSidebarOpen(true)}
            style={{ color: '#60a5fa' }}
          >
            <List size={26} />
          </button>
          <ShieldShaded color="#60a5fa" size={24} />
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>SecureLife</span>
        </div>
        <span
          className="rounded-pill px-3 py-1"
          style={{
            background: 'rgba(96,165,250,0.1)',
            border: '1px solid rgba(96,165,250,0.2)',
            color: 'var(--primary-light)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {user?.firstName}
        </span>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1040,
          }}
        />
      )}

      {/* Mobile drawer */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="d-lg-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '100vh',
          zIndex: 1050,
          overflowY: 'auto',
        }}
      >
        {sidebarContent}
      </motion.div>

      {/* Desktop sidebar */}
      <div
        className="d-none d-lg-block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '260px',
          height: '100vh',
          zIndex: 1020,
          borderRight: '1px solid var(--border)',
        }}
      >
        {sidebarContent}
      </div>

      {/* Main content */}
      <main style={{ marginLeft: 0, padding: 0 }}>
        <div className="d-none d-lg-block" style={{ marginLeft: '260px' }}>
          <Container fluid style={{ padding: '28px', maxWidth: '1200px' }}>
            {children}
          </Container>
        </div>
        <div className="d-lg-none">
          <Container fluid style={{ padding: '20px 16px' }}>
            {children}
          </Container>
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
