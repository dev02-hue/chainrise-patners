// In your admin page
"use client"
import AdminEmailForm from "@/app/component/admin/AdminEmailForm"

 
export default function AdminPage() {
  const handleEmailSent = () => {
    // Refresh user list or show notification
    console.log('Email sent successfully')
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AdminEmailForm onEmailSent={handleEmailSent} />
    </div>
  )
}