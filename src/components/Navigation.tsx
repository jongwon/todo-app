'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen } from 'lucide-react'
import { Button } from './ui/button'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PM</span>
            </div>
            <span className="text-xl font-bold">프로젝트 관리</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button 
                variant={pathname === '/' ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                홈
              </Button>
            </Link>
            <Link href="/projects">
              <Button 
                variant={pathname.startsWith('/projects') ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                프로젝트
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}