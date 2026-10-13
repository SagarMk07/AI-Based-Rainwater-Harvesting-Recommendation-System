import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '../components/PublicNavbar'
import { Footer } from '../components/Footer'
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal'
import { MLTelemetryModal } from '../components/MLTelemetryModal'

export const PublicLayout: React.FC = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showMLModal, setShowMLModal] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[#E9E9E4] text-[#252B26] font-sans antialiased selection:bg-forest-100 selection:text-forest-900">
      <PublicNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer
        onOpenTelemetry={() => setShowMLModal(true)}
      />

      {/* Modals */}
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <MLTelemetryModal isOpen={showMLModal} onClose={() => setShowMLModal(false)} />
    </div>
  )
}

export default PublicLayout
