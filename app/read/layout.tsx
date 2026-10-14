import { DesktopSidebar, MobileHeader } from '@/components/book/reader-nav'

export default function ReadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <DesktopSidebar />
      <div className="min-w-0 flex-1">
        <MobileHeader />
        {children}
      </div>
    </div>
  )
}
