// app/component/user/profile/page.tsx
import InvestmentDashboard from '@/app/component/user/profile/InvestmentDashboard'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'

const InvestmentPage = async () => {
  // Get the session on the server side
  const { session } = await getSession()
  
  if (!session?.user?.id) {
    redirect('/signin')
  }

  return (
    <div>
      <InvestmentDashboard userId={session.user.id} />
    </div>
  )
}

export default InvestmentPage