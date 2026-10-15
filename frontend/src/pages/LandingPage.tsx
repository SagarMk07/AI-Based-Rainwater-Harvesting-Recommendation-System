import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LandingHero } from '../components/LandingHero'
import { GuestChoiceModal } from '../components/GuestChoiceModal'
import { useAuth } from '../context/useAuth'
import { useAppContext } from '../context/useAppContext'

export const LandingPage: React.FC = () => {
  const [showGuestChoice, setShowGuestChoice] = useState(false)
  const { user } = useAuth()
  const { setShowMLModal } = useAppContext()
  const navigate = useNavigate()

  const handleStartAnalysis = () => {
    if (user) {
      navigate('/analyze')
    } else {
      setShowGuestChoice(true)
    }
  }

  return (
    <div className="py-6 sm:py-8 min-h-[calc(100vh-16rem)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingHero
          onStartAnalysis={handleStartAnalysis}
          onOpenTelemetry={() => setShowMLModal(true)}
        />
      </div>

      {/* Choice Modal for Logged-Out Visitors Clicking Analyze My Property */}
      <GuestChoiceModal
        isOpen={showGuestChoice}
        onClose={() => setShowGuestChoice(false)}
      />
    </div>
  )
}

export default LandingPage
