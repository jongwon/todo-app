import Link from 'next/link'
import { FolderOpen, Kanban } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="container mx-auto p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">프로젝트 관리 시스템</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Kanban 보드로 프로젝트와 할일을 효율적으로 관리하세요
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          <div className="p-6 border rounded-lg">
            <FolderOpen className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h2 className="text-xl font-semibold mb-2">프로젝트 관리</h2>
            <p className="text-muted-foreground mb-4">
              여러 프로젝트를 생성하고 관리할 수 있습니다
            </p>
            <Link href="/projects">
              <Button className="w-full">프로젝트 보기</Button>
            </Link>
          </div>
          <div className="p-6 border rounded-lg">
            <Kanban className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Kanban 보드</h2>
            <p className="text-muted-foreground mb-4">
              할일을 Todo, In Progress, Done으로 관리
            </p>
            <Link href="/projects">
              <Button variant="outline" className="w-full">시작하기</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}