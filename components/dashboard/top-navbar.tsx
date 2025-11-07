'use client'

import { useRouter } from 'next/navigation'
import { NotificationCenter } from './notification-center'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface TopNavbarProps {
  toggleSidebar: () => void
}

export function TopNavbar({ toggleSidebar }: TopNavbarProps) {
  const router = useRouter()

  return (
    <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm'>
      <div className='flex h-16 items-center justify-between px-6'>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        
        <div className='flex items-center gap-3'>
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
