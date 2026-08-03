import { Card, Badge } from 'react-bootstrap'
import { motion } from 'framer-motion'

export const StatCard = ({ icon: Icon, label, value, color = '#60a5fa', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{ height: '100%' }}
  >
    <Card className="glass-card h-100 p-3" style={{ borderRadius: '16px' }}>
      <div className="d-flex align-items-center gap-3">
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}15`,
            color,
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {value}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted-2)' }}>{label}</div>
        </div>
      </div>
    </Card>
  </motion.div>
)

export const PageHeader = ({ title, subtitle, badge }) => (
  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
    <div>
      <h4 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '4px' }}>{title}</h4>
      {subtitle && <p style={{ color: 'var(--text-muted-2)', fontSize: '0.9rem', margin: 0 }}>{subtitle}</p>}
    </div>
    {badge}
  </div>
)

export const StatusBadge = ({ status }) => {
  const map = {
    active: { bg: 'rgba(52,211,153,0.1)', color: '#34d399' },
    pending: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
    expired: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8' },
    rejected: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
  }
  const s = map[status] || map.pending
  return (
    <Badge
      bg="none"
      style={{
        background: s.bg,
        color: s.color,
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        padding: '5px 12px',
        borderRadius: '20px',
      }}
    >
      {status}
    </Badge>
  )
}

export const EmptyState = ({ icon, title, subtitle }) => (
  <div className="text-center py-5">
    <icon size={48} color="var(--text-muted-3)" style={{ opacity: 0.6 }} />
    <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '16px' }}>{title}</h6>
    {subtitle && <p style={{ color: 'var(--text-muted-2)', fontSize: '0.85rem', margin: 0 }}>{subtitle}</p>}
  </div>
)
