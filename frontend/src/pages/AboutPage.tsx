import React from 'react'
import { AboutSection } from '../components/AboutSection'

export const AboutPage: React.FC = () => {
  return (
    <div className="py-6 sm:py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AboutSection />
      </div>
    </div>
  )
}

export default AboutPage
