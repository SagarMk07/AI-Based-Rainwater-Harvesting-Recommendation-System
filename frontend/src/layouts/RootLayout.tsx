import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { useHealth } from '../hooks/useHealth'

export const RootLayout: FC = () => {
  const { data: health, loading, error, refetch } = useHealth(15000)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar health={health} loading={loading} error={error} />
      <main className="flex-1">
        <Outlet context={{ health, loading, error, refetch }} />
      </main>
      <Footer />
    </div>
  )
}
