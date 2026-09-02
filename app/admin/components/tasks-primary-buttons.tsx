'use client'
import { Download, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation' // Use this instead
import { Button } from '@/components/ui/button'

export function TasksPrimaryButtons({ type }: { type: string }) {
  const router = useRouter() // Initialize the router

  const handleCreate = () => {
   
    router.push(`/admin/${type}/create`)
  }

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => { /* Add import logic here */ }}
      >
        <span>Import</span> <Download size={18} />
      </Button>

      <Button className='space-x-1' onClick={handleCreate}>
        <span>Create</span> <Plus size={18} />
      </Button>
    </div>
  )
}