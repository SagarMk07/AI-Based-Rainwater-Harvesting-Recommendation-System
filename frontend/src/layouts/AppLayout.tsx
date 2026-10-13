import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppNavbar } from '../components/AppNavbar'
import { Footer } from '../components/Footer'
import { MLTelemetryModal } from '../components/MLTelemetryModal'
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal'
import { RainHarvestChatWidget } from '../components/RainHarvestChatWidget'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export const AppLayout: React.FC = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    showMLModal,
    setShowMLModal,
    clearHistory,
    setAnalysisResult,
  } = useAppContext()

  const { deleteAccount } = useAuth()
  const navigate = useNavigate()

  const handleDeleteAccountConfirm = async () => {
    const res = await deleteAccount()
    setShowDeleteConfirm(false)
    if (res.success) {
      clearHistory()
      setAnalysisResult(null)
      navigate('/')
    } else {
      alert(res.error || 'Failed to delete account')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#E9E9E4] text-[#252B26] font-sans antialiased selection:bg-forest-100 selection:text-forest-900">
      <AppNavbar
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onDeleteAccount={() => setShowDeleteConfirm(true)}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer
        onOpenTelemetry={() => setShowMLModal(true)}
      />

      {/* Global Application Modals */}
      <MLTelemetryModal isOpen={showMLModal} onClose={() => setShowMLModal(false)} />
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#252B26]/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md neu-card p-6 border border-[#DEDFD8] shadow-neu space-y-4">
            <h3 className="text-base font-bold text-rose-900">Confirm Permanent Account Deletion</h3>
            <p className="text-xs text-[#687068] leading-relaxed">
              This will permanently delete your profile, saved properties, and all associated hydrological recommendations from both the cloud database and local cache. This action is irreversible.
            </p>
            <div className="pt-2 flex justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="neu-btn-secondary px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition"
              >
                Permanently Delete Data
              </button>
            </div>
          </div>
        </div>
      )}

      <RainHarvestChatWidget />
    </div>
  )
}

export default AppLayout
