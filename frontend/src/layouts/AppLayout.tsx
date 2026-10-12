import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppNavbar } from '../components/AppNavbar'
import { Footer } from '../components/Footer'
import { MLTelemetryModal } from '../components/MLTelemetryModal'
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal'
import { AuthModal, type AuthMode } from '../components/auth/AuthModal'
import { RainHarvestChatWidget } from '../components/RainHarvestChatWidget'
import { useAuth } from '../context/AuthContext'
import { useAppContext } from '../context/AppContext'
import { registerSessionExpiredHandler } from '../services/api'

export const AppLayout: React.FC = () => {
  const { deleteAccount } = useAuth()
  const { showMLModal, setShowMLModal, showPrivacyModal, setShowPrivacyModal, clearHistory, setAnalysisResult } = useAppContext()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('session_expired')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      setAuthModalMode('session_expired')
      setShowAuthModal(true)
    })
  }, [])

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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-forest-100 selection:text-forest-900">
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
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-200">
            <h3 className="text-base font-bold text-rose-900">Confirm Permanent Account Deletion</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This will permanently delete your profile, saved properties, and all associated hydrological recommendations from both the cloud database and local cache. This action is irreversible.
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
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
