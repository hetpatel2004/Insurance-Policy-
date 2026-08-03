import { useEffect, useState, useRef } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { motion, useInView } from 'framer-motion'
import { PeopleFill, ShieldCheck, BuildingFill, Clock } from 'react-bootstrap-icons'
import { useStats } from '../hooks/useStats'

const CountUp = ({ value, decimals = 0, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref} className="counter-number">
      {count.toFixed(decimals)}{suffix}
    </span>
  )
}

const Stats = () => {
  const { stats } = useStats()

  const items = [
    { icon: PeopleFill, value: stats?.users || 0, suffix: '+', label: 'Happy Customers' },
    { icon: ShieldCheck, value: stats?.policies || 0, suffix: '+', label: 'Policies Issued' },
    { icon: BuildingFill, value: stats?.companies || 0, suffix: '+', label: 'Partner Companies' },
    { icon: Clock, value: 24, suffix: '/7', label: 'Support Available' },
  ]

  return (
    <section className="section-dark-2" style={{ padding: '80px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <Container>
        <Row className="g-4">
          {items.map((stat, i) => (
            <Col xs={6} md={3} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon
                  size={32}
                  color="#60a5fa"
                  className="mb-3"
                  style={{ opacity: 0.7 }}
                />
                <CountUp value={stat.value} suffix={stat.suffix} />
                <p style={{ color: 'var(--text-muted-2)', fontSize: '0.9rem', fontWeight: 500, marginTop: '4px' }}>
                  {stat.label}
                </p>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default Stats
