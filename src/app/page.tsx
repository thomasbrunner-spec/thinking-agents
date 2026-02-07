'use client'

import { useSession } from 'next-auth/react'
import { LoginForm } from '@/components/LoginForm'
import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full typing-dot" />
          <div className="w-3 h-3 bg-primary-500 rounded-full typing-dot" />
          <div className="w-3 h-3 bg-primary-500 rounded-full typing-dot" />
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginForm />
  }

  return <Dashboard />
}
