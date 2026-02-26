import { redirect } from 'next/navigation'
import { getSession, getPermissions } from '@/lib/auth'
import { Sidebar } from '@/components/sidebar'
import { TopNav } from '@/components/top-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/')
  }

  const permissions = getPermissions(session.role)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        permissions={permissions}
        user={{
          firstName: session.firstName,
          lastName: session.lastName,
          role: session.role,
          department: session.department,
        }}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav
          user={{
            firstName: session.firstName,
            lastName: session.lastName,
            role: session.role,
          }}
        />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
