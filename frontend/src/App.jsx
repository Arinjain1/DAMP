import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import CoreFeatures from './components/CoreFeatures'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

const App = () => {
  return (
    <div className='min-h-screen bg-[#F5F5F7] relative'>
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <HeroSection />
      <FeaturesSection />
      <CoreFeatures />
      <CTASection />
      <Footer />
    </div>
  )
}

export default App
