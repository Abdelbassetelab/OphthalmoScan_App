import { checkRole } from '@/utils/roles'
import { redirect } from 'next/navigation'

export default async function ManagementDashboard() {
  // Protect the page from users who are not admins
  const isAdmin = await checkRole('admin')
  if (!isAdmin) {
    redirect('/')
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Management</h1>
      <p>This is the protected admin management area. Only users with the `admin` role can access this page.</p>
    </div>
  )
}