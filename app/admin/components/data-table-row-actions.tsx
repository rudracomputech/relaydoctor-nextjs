
import { type Row } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, MoreHorizontal, PenBox, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useTasks } from './tasks-provider'


type Priorities = { value: string; label: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }
type Statuses = { value: string; label: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }

const statuses: Statuses[] = [
  { value: 'todo', label: 'To Do', icon: CircleArrowUp },
  { value: 'in-progress', label: 'In Progress', icon: CircleArrowUp },
  { value: 'done', label: 'Done', icon: CircleArrowUp },
]

const priorities: Priorities[] = [
  { value: 'low', label: 'Low', icon: ArrowUpDown },
  { value: 'medium', label: 'Medium', icon: ArrowUpDown },
  { value: 'high', label: 'High', icon: ArrowUpDown },
]

const taskSchema = [{
  id: 'string',
  title: 'string',
  description: 'string',
  status: statuses,
  priority: priorities,
  label: 'string',
  createdAt: 'string'
}]

const labels = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'enhancement', label: 'Enhancement' },
]



type DataTableRowActionsProps<TData> = {
  entityType:string
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  entityType,
  row,
}: DataTableRowActionsProps<TData>) {
  const task = {...row.original} as typeof taskSchema[number]
  const router = useRouter()

  const { setOpen, setCurrentRow } = useTasks()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
         <MoreHorizontal className="h-4 w-4" />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            const id = (row.original as any)?.id
            router.push(`/admin/${entityType}/${id}/edit`)
          }}
        >
          Edit
             <DropdownMenuShortcut>
            <PenBox size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
   
        <DropdownMenuItem
        variant='destructive'
      onSelect={(e) => {
            e.preventDefault()
           
            row.getLeafRows().forEach(() => row.toggleSelected(false))
            row.toggleSelected(true)
            setCurrentRow(row.original as any)
            
        
            setOpen('delete')
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <Trash2 className='stroke-destructive' size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
