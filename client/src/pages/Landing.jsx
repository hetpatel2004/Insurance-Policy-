import NavbarComp from '../components/NavbarComp'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Plans from '../components/Plans'
import Footer from '../components/Footer'
import ParticleBackground from '../components/ParticleBackground'

const Landing = () => {
  return (
    <>
      <ParticleBackground />
      <NavbarComp />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <Stats />
        <Plans />
      </main>
      <Footer />
    </>
  )
}

export default Landing
