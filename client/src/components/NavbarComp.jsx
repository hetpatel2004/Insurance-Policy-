import { useState, useEffect } from 'react'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShieldShaded, PersonCircle, List, X, BoxArrowRight, Speedometer2 } from 'react-bootstrap-icons'
import { getUser, isAuthenticated } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

const NavbarComp = () => {
  const [scrolled, setScrolled] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const user = getUser()
  const authenticated = isAuthenticated()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setExpanded(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Navbar
      expand="lg"
      fixed="top"
      expanded={expanded}
      onToggle={setExpanded}
      style={{
        background: scrolled
          ? 'var(--nav-bg)'
          : 'var(--nav-bg-fade)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.4s ease',
        padding: scrolled ? '8px 0' : '16px 0',
        zIndex: 1000,
      }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2 text-white text-decoration-none"
          style={{ fontWeight: 800, fontSize: '1.4rem' }}
        >
          <ShieldShaded color="#60a5fa" size={30} />
          <span className="gradient-text">SecureLife</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="main-navbar"
          className="border-0"
          style={{ color: '#fff', fontSize: '1.5rem' }}
        >
          {expanded ? <X /> : <List />}
        </Navbar.Toggle>

        <Navbar.Collapse id="main-navbar">
          <Nav className="mx-auto gap-3">
            {[
              { label: 'Home', to: '/' },
              { label: 'Plans', to: '/', anchor: 'plans' },
              { label: 'About', to: '/about' },
              { label: 'Contact', to: '/contact' },
            ].map(item => (
              <Nav.Link
                key={item.label}
                as={item.anchor ? undefined : Link}
                to={item.anchor ? undefined : item.to}
                href={item.anchor ? undefined : undefined}
                onClick={() => {
                  if (item.anchor) {
                    if (location.pathname !== '/') {
                      navigate('/')
                      setTimeout(() => {
                        document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth' })
                      }, 200)
                    } else {
                      document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }
                }}
                className="nav-link-custom px-3"
                style={{ color: 'var(--text-nav)', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer' }}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <div className="d-flex gap-2 mt-3 mt-lg-0 flex-wrap align-items-center">
            <ThemeToggle className="me-2" />
            {authenticated ? (
              <>
                <Button
                  as={Link}
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  variant="outline-primary"
                  className="rounded-pill px-4"
                  style={{
                    borderColor: 'rgba(96,165,250,0.3)',
                    color: '#60a5fa',
                    fontWeight: 600,
                  }}
                >
                  <Speedometer2 className="me-2" />
                  Dashboard
                </Button>
                <Button
                  as={Link}
                  to="/"
                  className="rounded-pill px-4 gradient-bg border-0"
                  style={{ fontWeight: 600 }}
                >
                  <PersonCircle className="me-2" />
                  {user?.firstName || 'Hi'}
                </Button>
                <Button
                  variant="outline-light"
                  className="rounded-pill px-3"
                  onClick={handleLogout}
                  style={{
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text)',
                    fontWeight: 600,
                  }}
                >
                  <BoxArrowRight size={16} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  className="rounded-pill px-4"
                  style={{
                    borderColor: 'rgba(96,165,250,0.3)',
                    color: '#60a5fa',
                    fontWeight: 600,
                  }}
                >
                  <PersonCircle className="me-2" />
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  className="rounded-pill px-4 gradient-bg border-0"
                  style={{ fontWeight: 600 }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavbarComp
