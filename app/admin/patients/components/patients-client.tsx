'use client'

import { useState, useMemo } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { toast } from 'sonner'
import {
  Users,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Phone,
  HeartPulse,
  User,
  Calendar,
  AlertCircle,
  MapPin,
  FileText,
  Activity,
  Droplet,
  ExternalLink,
  X,
  FileCheck,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'

export interface PatientReportItem {
  name: string
  url?: string
  fileType?: string
  uploadedAt?: string
}

export interface PatientItem {
  _id: string
  patientId?: string
  avatar?: string
  name: string
  phone?: string
  mobile?: string
  age: number
  gender: string
  bloodGroup?: string
  condition?: string
  allergies?: string
  caseStatus?: string
  registeredBy?: {
    _id: string
    name: string
    specialization?: string
    hospital?: string
  }
  doctorId?: {
    _id: string
    name: string
    specialization?: string
    hospital?: string
  }
  medicalHistory?: string
  medicalHistoryTags?: string[]
  problem?: string
  diagnosis?: string
  prescription?: string
  address?: string
  emergencyContact?: string
  reports?: PatientReportItem[]
  referralCount?: number
  visitDate?: string
  createdAt?: string
}

export interface DoctorOption {
  _id: string
  name: string
  specialization?: string
  hospital?: string
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const CASE_STATUS_OPTIONS = [
  {
    value: 'Under Treatment',
    label: 'Under Treatment',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  },
  {
    value: 'Follow Up',
    label: 'Follow Up',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    value: 'Critical',
    label: 'Critical',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
  },
  {
    value: 'Recovered',
    label: 'Recovered',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    value: 'Discharged',
    label: 'Discharged',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  },
  {
    value: 'New Patient',
    label: 'New Patient',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
  },
]

const DEFAULT_REPORTS: PatientReportItem[] = [
  { name: 'Reports & Documents', url: '#', fileType: 'pdf' },
  { name: 'ECG Report.pdf', url: '#', fileType: 'pdf' },
  { name: 'Blood Test. jpg', url: '#', fileType: 'image' },
  { name: 'Prescriptions pdf', url: '#', fileType: 'pdf' },
]

export function PatientsClient({
  initialPatients,
  doctors,
}: {
  initialPatients: PatientItem[]
  doctors: DoctorOption[]
}) {
  const [data, setData] = useState<PatientItem[]>(initialPatients)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    gender: false,
    bloodGroup: false,
    caseStatusFilter: false,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<PatientItem | null>(null)
  const [viewItem, setViewItem] = useState<PatientItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Tag & Document input states
  const [newTag, setNewTag] = useState('')
  const [newDocName, setNewDocName] = useState('')
  const [newDocUrl, setNewDocUrl] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    patientId: '',
    avatar: '',
    phone: '',
    age: 45,
    gender: 'male',
    bloodGroup: 'B+',
    condition: 'Chest Pain',
    allergies: 'None',
    caseStatus: 'Under Treatment',
    registeredBy: 'none',
    medicalHistory: '',
    medicalHistoryTags: ['Hypertension (2 years)', 'Previous Chest Discomfort'],
    diagnosis: '',
    prescription: '',
    address: '',
    emergencyContact: '',
    reports: DEFAULT_REPORTS,
  })

  function resetForm() {
    setFormData({
      name: '',
      patientId: `p-${Math.floor(10000 + Math.random() * 90000)}`,
      avatar: '',
      phone: '',
      age: 45,
      gender: 'male',
      bloodGroup: 'B+',
      condition: 'Chest Pain',
      allergies: 'None',
      caseStatus: 'Under Treatment',
      registeredBy: 'none',
      medicalHistory: '',
      medicalHistoryTags: ['Hypertension (2 years)', 'Previous Chest Discomfort'],
      diagnosis: '',
      prescription: '',
      address: '',
      emergencyContact: '',
      reports: DEFAULT_REPORTS,
    })
    setNewTag('')
    setNewDocName('')
    setNewDocUrl('')
  }

  function handleOpenCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function handleOpenEdit(patient: PatientItem) {
    const existingTags =
      patient.medicalHistoryTags && patient.medicalHistoryTags.length > 0
        ? patient.medicalHistoryTags
        : (patient.medicalHistory || patient.problem || '')
            .split(/[,;]/)
            .map((t) => t.trim())
            .filter(Boolean)

    setFormData({
      name: patient.name || '',
      patientId: patient.patientId || `p-${Math.floor(10000 + Math.random() * 90000)}`,
      avatar: patient.avatar || '',
      phone: patient.phone || patient.mobile || '',
      age: patient.age || 45,
      gender: (patient.gender || 'male').toLowerCase(),
      bloodGroup: patient.bloodGroup || 'B+',
      condition: patient.condition || patient.problem || 'Chest Pain',
      allergies: patient.allergies || 'None',
      caseStatus: patient.caseStatus || 'Under Treatment',
      registeredBy: patient.registeredBy?._id || patient.doctorId?._id || 'none',
      medicalHistory: patient.medicalHistory || patient.problem || '',
      medicalHistoryTags:
        existingTags.length > 0
          ? existingTags
          : ['Hypertension (2 years)', 'Previous Chest Discomfort'],
      diagnosis: patient.diagnosis || '',
      prescription: patient.prescription || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      reports:
        patient.reports && patient.reports.length > 0
          ? patient.reports
          : DEFAULT_REPORTS,
    })
    setEditItem(patient)
  }

  // Tag helper
  function addHistoryTag() {
    if (!newTag.trim()) return
    setFormData((prev) => ({
      ...prev,
      medicalHistoryTags: [...prev.medicalHistoryTags, newTag.trim()],
    }))
    setNewTag('')
  }

  function removeHistoryTag(index: number) {
    setFormData((prev) => ({
      ...prev,
      medicalHistoryTags: prev.medicalHistoryTags.filter((_, i) => i !== index),
    }))
  }

  // Report helper
  function addReportDocument() {
    if (!newDocName.trim()) return
    setFormData((prev) => ({
      ...prev,
      reports: [
        ...prev.reports,
        {
          name: newDocName.trim(),
          url: newDocUrl.trim() || '#',
          fileType: newDocName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'document',
        },
      ],
    }))
    setNewDocName('')
    setNewDocUrl('')
  }

  function removeReportDocument(index: number) {
    setFormData((prev) => ({
      ...prev,
      reports: prev.reports.filter((_, i) => i !== index),
    }))
  }

  async function handleCreatePatient(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      toast.error('Patient name and phone number are required')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        ...formData,
        registeredBy: formData.registeredBy === 'none' ? null : formData.registeredBy,
        medicalHistory:
          formData.medicalHistory || formData.medicalHistoryTags.join(', '),
      }
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create patient')

      setData((prev) => [json.data, ...prev])
      toast.success(`Patient record for ${json.data.name} created!`)
      setCreateOpen(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdatePatient(e: React.FormEvent) {
    e.preventDefault()
    if (!editItem) return

    try {
      setSubmitting(true)
      const payload = {
        ...formData,
        registeredBy: formData.registeredBy === 'none' ? null : formData.registeredBy,
        medicalHistory:
          formData.medicalHistory || formData.medicalHistoryTags.join(', '),
      }
      const res = await fetch(`/api/admin/patients/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update patient')

      setData((prev) =>
        prev.map((p) => (p._id === editItem._id ? { ...p, ...json.data } : p))
      )
      toast.success('Patient details updated successfully')
      setEditItem(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeletePatient() {
    if (!deleteId) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/patients/${deleteId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete patient')

      setData((prev) => prev.filter((p) => p._id !== deleteId))
      toast.success('Patient record removed')
      setDeleteId(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<PatientItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label='Select all'
            className='translate-y-0.5'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='translate-y-0.5'
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Patient Demographics' />,
        cell: ({ row }) => {
          const pat = row.original
          const gender = (pat.gender || 'male').toLowerCase()
          const pid = pat.patientId || `p-${pat._id.slice(-5)}`
          const initials = pat.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          return (
            <div className='flex items-center gap-3 py-1'>
              {pat.avatar ? (
                <img
                  src={pat.avatar}
                  alt={pat.name}
                  className='h-11 w-11 rounded-xl object-cover border shrink-0 shadow-sm'
                />
              ) : (
                <div className='h-11 w-11 rounded-xl bg-neutral-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm'>
                  {initials || 'PT'}
                </div>
              )}
              <div className='min-w-0'>
                <div className='font-semibold text-foreground truncate flex items-center gap-2'>
                  <span>{pat.name}</span>
                  <Badge variant='outline' className='text-[10px] font-mono px-1.5 py-0 bg-muted/40'>
                    {pid}
                  </Badge>
                </div>
                <div className='text-xs text-muted-foreground flex items-center gap-2 mt-0.5'>
                  <span>Age: {pat.age || 45}</span>
                  <span>&bull;</span>
                  <span className='capitalize font-medium'>{gender === 'female' ? 'Female' : 'Male'}</span>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'condition',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Health Summary' />,
        cell: ({ row }) => {
          const pat = row.original
          const cond = pat.condition || pat.problem || 'Chest Pain'
          const bg = pat.bloodGroup || 'B+'
          const allergies = pat.allergies || 'None'

          return (
            <div className='space-y-1'>
              <div className='flex items-center gap-1.5 flex-wrap'>
                <Badge variant='outline' className='bg-teal-50 text-teal-700 border-teal-200 text-[11px] font-medium'>
                  Condition: <span className='font-bold ml-1'>{cond}</span>
                </Badge>
                <Badge variant='outline' className='bg-rose-50 text-rose-700 border-rose-200 text-[11px] font-medium'>
                  Blood: <span className='font-bold ml-1'>{bg}</span>
                </Badge>
              </div>
              <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
                <span>Allergies:</span>
                <span className={allergies.toLowerCase() === 'none' ? 'text-muted-foreground' : 'text-rose-600 font-medium'}>
                  {allergies}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'caseStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Case Status' />,
        cell: ({ row }) => {
          const status = row.original.caseStatus || 'Under Treatment'
          const meta =
            CASE_STATUS_OPTIONS.find((o) => o.value.toLowerCase() === status.toLowerCase()) ||
            CASE_STATUS_OPTIONS[0]

          return (
            <Badge variant='outline' className={`${meta.badgeClass} font-semibold text-xs py-1`}>
              {meta.label}
            </Badge>
          )
        },
      },
      {
        id: 'registeredBy',
        header: 'Assigned Physician',
        cell: ({ row }) => {
          const doc = row.original.registeredBy || row.original.doctorId
          if (!doc) {
            return (
              <span className='text-xs text-muted-foreground italic'>
                Direct Intake (Hospital Walk-in)
              </span>
            )
          }
          return (
            <div className='text-xs'>
              <div className='font-semibold text-foreground flex items-center gap-1'>
                <Stethoscope className='h-3.5 w-3.5 text-teal-600 shrink-0' />
                <span>{doc.name}</span>
              </div>
              <div className='text-muted-foreground pl-4.5'>
                {doc.specialization || 'Cardiologist'} &bull; {doc.hospital || 'Clinic'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'phone',
        header: 'Contact Phone',
        cell: ({ row }) => {
          const ph = row.original.phone || row.original.mobile || 'N/A'
          return (
            <div className='font-mono text-xs'>
              <a
                href={`tel:${ph}`}
                className='flex items-center gap-1.5 text-teal-700 dark:text-teal-400 hover:underline'
              >
                <Phone className='h-3.5 w-3.5' />
                <span>{ph}</span>
              </a>
            </div>
          )
        },
      },
      {
        id: 'reportsCount',
        header: 'Reports',
        cell: ({ row }) => {
          const count = row.original.reports?.length || 4
          return (
            <Badge variant='secondary' className='font-mono text-xs flex items-center gap-1 w-fit'>
              <FileText className='h-3 w-3 text-teal-600' />
              <span>{count} file{count === 1 ? '' : 's'}</span>
            </Badge>
          )
        },
      },
      {
        accessorKey: 'referralCount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Referrals' />,
        cell: ({ row }) => {
          const count = row.original.referralCount || 0
          return (
            <Badge variant='outline' className='font-bold text-xs'>
              {count} Case{count === 1 ? '' : 's'}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        enableHiding: true,
        filterFn: (row, id, value) => {
          const val = (row.getValue(id) as string || '').toLowerCase()
          return value.includes(val)
        },
      },
      {
        accessorKey: 'bloodGroup',
        header: 'Blood Group',
        enableHiding: true,
        filterFn: (row, id, value) => {
          const val = (row.getValue(id) as string || 'B+')
          return value.includes(val)
        },
      },
      {
        id: 'caseStatusFilter',
        accessorFn: (row) => row.caseStatus || 'Under Treatment',
        header: 'Status Filter',
        enableHiding: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const pat = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem onClick={() => setViewItem(pat)}>
                  <Eye className='mr-2 h-4 w-4 text-muted-foreground' />
                  View Patient Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(pat)}>
                  <Pencil className='mr-2 h-4 w-4 text-muted-foreground' />
                  Edit Patient File
                </DropdownMenuItem>
                {pat.phone && (
                  <DropdownMenuItem asChild>
                    <a href={`tel:${pat.phone}`} className='flex items-center text-teal-600'>
                      <Phone className='mr-2 h-4 w-4' />
                      Call Patient
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteId(pat._id)}
                  className='text-destructive focus:text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Patient
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase()
      const pat = row.original
      const phone = pat.phone || pat.mobile || ''
      const docName = pat.registeredBy?.name || pat.doctorId?.name || ''
      const problem = pat.medicalHistory || pat.problem || pat.condition || ''
      const pid = pat.patientId || ''
      const bg = pat.bloodGroup || ''
      const status = pat.caseStatus || ''

      return (
        pat.name.toLowerCase().includes(search) ||
        pid.toLowerCase().includes(search) ||
        phone.includes(search) ||
        docName.toLowerCase().includes(search) ||
        problem.toLowerCase().includes(search) ||
        bg.toLowerCase().includes(search) ||
        status.toLowerCase().includes(search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='space-y-4'>
      {/* Top Action Bar */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Button onClick={handleOpenCreate} className='bg-teal-600 hover:bg-teal-700 text-white'>
            <Plus className='h-4 w-4 mr-1.5' /> New Patient Intake
          </Button>
          <Badge variant='outline' className='px-3 py-1 bg-teal-50 text-teal-700 border-teal-200'>
            {data.length} Active Records
          </Badge>
        </div>
      </div>

      {/* Toolbar with faceted filters & search */}
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by patient, ID, phone, condition, blood group, doctor...'
        filters={[
          {
            columnId: 'gender',
            title: 'Gender',
            options: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ],
          },
          {
            columnId: 'bloodGroup',
            title: 'Blood Group',
            options: BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg })),
          },
          {
            columnId: 'caseStatusFilter',
            title: 'Case Status',
            options: CASE_STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
          },
        ]}
      />

      {/* TanStack Table Container */}
      <div className='rounded-md border bg-card overflow-hidden shadow-sm'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center text-muted-foreground'>
                  No patient records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Create Patient Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <HeartPulse className='h-5 w-5 text-teal-600' />
              New Patient Intake & Clinical Profile
            </DialogTitle>
            <DialogDescription>
              Register a patient with full health summary, medical history tags, and clinical documents.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePatient} className='space-y-4 pt-2'>
            {/* Section 1: Demographics & Contact */}
            <div className='p-3 border rounded-xl bg-card space-y-3'>
              <div className='font-semibold text-sm flex items-center gap-1.5 text-foreground'>
                <User className='h-4 w-4 text-teal-600' /> Patient Identification & Contact
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-name'>Full Name *</Label>
                  <Input
                    id='pat-name'
                    placeholder='Rabindranath'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-id'>Patient ID</Label>
                  <Input
                    id='pat-id'
                    placeholder='p-21243'
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-phone'>Contact Phone Number *</Label>
                  <Input
                    id='pat-phone'
                    placeholder='+91 98765 43210'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-avatar'>Avatar Photo URL</Label>
                  <Input
                    id='pat-avatar'
                    placeholder='https://...'
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-age'>Age</Label>
                  <Input
                    id='pat-age'
                    type='number'
                    min={1}
                    max={120}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-gender'>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                  >
                    <SelectTrigger id='pat-gender'>
                      <SelectValue placeholder='Select gender' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>Male</SelectItem>
                      <SelectItem value='female'>Female</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Health Summary */}
            <div className='p-3 border rounded-xl bg-card space-y-3'>
              <div className='font-semibold text-sm flex items-center gap-1.5 text-foreground'>
                <Activity className='h-4 w-4 text-teal-600' /> Health Summary & Status
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-condition'>Primary Condition</Label>
                  <Input
                    id='pat-condition'
                    placeholder='Chest Pain'
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-bg'>Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                  >
                    <SelectTrigger id='pat-bg'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-allergies'>Allergies</Label>
                  <Input
                    id='pat-allergies'
                    placeholder='None'
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-doctor'>Assigned Doctor</Label>
                  <Select
                    value={formData.registeredBy}
                    onValueChange={(val) => setFormData({ ...formData, registeredBy: val })}
                  >
                    <SelectTrigger id='pat-doctor'>
                      <SelectValue placeholder='Select physician' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>None (Direct Hospital Intake)</SelectItem>
                      {doctors.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name} ({d.specialization || 'Physician'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='pat-status'>Case Status</Label>
                  <Select
                    value={formData.caseStatus}
                    onValueChange={(val) => setFormData({ ...formData, caseStatus: val })}
                  >
                    <SelectTrigger id='pat-status'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CASE_STATUS_OPTIONS.map((st) => (
                        <SelectItem key={st.value} value={st.value}>
                          {st.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 3: Medical History Tags */}
            <div className='p-3 border rounded-xl bg-card space-y-3'>
              <div className='font-semibold text-sm flex items-center gap-1.5 text-foreground'>
                <AlertCircle className='h-4 w-4 text-teal-600' /> Medical History Tags
              </div>
              <div className='flex flex-wrap gap-2'>
                {formData.medicalHistoryTags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant='outline'
                    className='px-2.5 py-1 text-xs flex items-center gap-1.5 bg-muted/30 border-teal-200'
                  >
                    <span>{tag}</span>
                    <button
                      type='button'
                      onClick={() => removeHistoryTag(idx)}
                      className='text-muted-foreground hover:text-destructive'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className='flex gap-2'>
                <Input
                  placeholder='Add tag e.g. Hypertension (2 years)'
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addHistoryTag()
                    }
                  }}
                  className='h-8 text-xs'
                />
                <Button type='button' variant='outline' size='sm' onClick={addHistoryTag} className='h-8 text-xs'>
                  Add Tag
                </Button>
              </div>
            </div>

            {/* Section 4: Reports & Documents */}
            <div className='p-3 border rounded-xl bg-card space-y-3'>
              <div className='font-semibold text-sm flex items-center gap-1.5 text-foreground'>
                <FileText className='h-4 w-4 text-teal-600' /> Reports & Documents
              </div>
              <div className='space-y-1.5'>
                {formData.reports.map((rep, idx) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs'
                  >
                    <div className='flex items-center gap-2 font-medium text-foreground'>
                      <FileCheck className='h-4 w-4 text-teal-600' />
                      <span>{rep.name}</span>
                    </div>
                    <button
                      type='button'
                      onClick={() => removeReportDocument(idx)}
                      className='text-muted-foreground hover:text-destructive'
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  </div>
                ))}
              </div>
              <div className='flex gap-2'>
                <Input
                  placeholder='Document Name e.g. ECG Report.pdf'
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className='h-8 text-xs flex-1'
                />
                <Input
                  placeholder='URL (optional)'
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className='h-8 text-xs flex-1'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addReportDocument}
                  className='h-8 text-xs shrink-0'
                >
                  Add File
                </Button>
              </div>
            </div>

            {/* Section 5: Address & Emergency */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='pat-address'>Address</Label>
                <Input
                  id='pat-address'
                  placeholder='Residential address'
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='pat-emergency'>Emergency Contact</Label>
                <Input
                  id='pat-emergency'
                  placeholder='Kin Name & Phone'
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' className='bg-teal-600 hover:bg-teal-700 text-white' disabled={submitting}>
                {submitting ? 'Creating File...' : 'Create Patient Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Pencil className='h-5 w-5 text-teal-600' />
                Edit Patient File: {editItem.name}
              </DialogTitle>
              <DialogDescription>
                Update clinical summary, case status, medical history, or attached reports.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePatient} className='space-y-4 pt-2'>
              {/* Section 1: Demographics & Contact */}
              <div className='p-3 border rounded-xl bg-card space-y-3'>
                <div className='font-semibold text-sm flex items-center gap-1.5 text-foreground'>
                  <User className='h-4 w-4 text-teal-600' /> Patient Identification & Contact
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-name'>Full Name</Label>
                    <Input
                      id='edit-pat-name'
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-id'>Patient ID</Label>
                    <Input
                      id='edit-pat-id'
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-phone'>Phone Number</Label>
                    <Input
                      id='edit-pat-phone'
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-avatar'>Avatar Photo URL</Label>
                    <Input
                      id='edit-pat-avatar'
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-age'>Age</Label>
                    <Input
                      id='edit-pat-age'
                      type='number'
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-gender'>Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => setFormData({ ...formData, gender: val })}
                    >
                      <SelectTrigger id='edit-pat-gender'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Male</SelectItem>
                        <SelectItem value='female'>Female</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 2: Health Summary */}
              <div className='p-3 border rounded-xl bg-card space-y-3'>
                <div className='font-semibold text-sm flex items-center gap-1.5 text-foreground'>
                  <Activity className='h-4 w-4 text-teal-600' /> Health Summary & Status
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-condition'>Primary Condition</Label>
                    <Input
                      id='edit-pat-condition'
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-bg'>Blood Group</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                    >
                      <SelectTrigger id='edit-pat-bg'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map((bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-allergies'>Allergies</Label>
                    <Input
                      id='edit-pat-allergies'
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-doc'>Assigned Doctor</Label>
                    <Select
                      value={formData.registeredBy}
                      onValueChange={(val) => setFormData({ ...formData, registeredBy: val })}
                    >
                      <SelectTrigger id='edit-pat-doc'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>None (Direct Hospital Intake)</SelectItem>
                        {doctors.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name} ({d.specialization || 'Physician'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='edit-pat-status'>Case Status</Label>
                    <Select
                      value={formData.caseStatus}
                      onValueChange={(val) => setFormData({ ...formData, caseStatus: val })}
                    >
                      <SelectTrigger id='edit-pat-status'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CASE_STATUS_OPTIONS.map((st) => (
                          <SelectItem key={st.value} value={st.value}>
                            {st.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 3: Medical History Tags */}
              <div className='p-3 border rounded-xl bg-card space-y-3'>
                <div className='font-semibold text-sm flex items-center gap-1.5 text-foreground'>
                  <AlertCircle className='h-4 w-4 text-teal-600' /> Medical History Tags
                </div>
                <div className='flex flex-wrap gap-2'>
                  {formData.medicalHistoryTags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant='outline'
                      className='px-2.5 py-1 text-xs flex items-center gap-1.5 bg-muted/30 border-teal-200'
                    >
                      <span>{tag}</span>
                      <button
                        type='button'
                        onClick={() => removeHistoryTag(idx)}
                        className='text-muted-foreground hover:text-destructive'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Add tag e.g. Hypertension (2 years)'
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addHistoryTag()
                      }
                    }}
                    className='h-8 text-xs'
                  />
                  <Button type='button' variant='outline' size='sm' onClick={addHistoryTag} className='h-8 text-xs'>
                    Add Tag
                  </Button>
                </div>
              </div>

              {/* Section 4: Reports & Documents */}
              <div className='p-3 border rounded-xl bg-card space-y-3'>
                <div className='font-semibold text-sm flex items-center gap-1.5 text-foreground'>
                  <FileText className='h-4 w-4 text-teal-600' /> Reports & Documents
                </div>
                <div className='space-y-1.5'>
                  {formData.reports.map((rep, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs'
                    >
                      <div className='flex items-center gap-2 font-medium text-foreground'>
                        <FileCheck className='h-4 w-4 text-teal-600' />
                        <span>{rep.name}</span>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeReportDocument(idx)}
                        className='text-muted-foreground hover:text-destructive'
                      >
                        <X className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <Input
                    placeholder='Document Name e.g. ECG Report.pdf'
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className='h-8 text-xs flex-1'
                  />
                  <Input
                    placeholder='URL (optional)'
                    value={newDocUrl}
                    onChange={(e) => setNewDocUrl(e.target.value)}
                    className='h-8 text-xs flex-1'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addReportDocument}
                    className='h-8 text-xs shrink-0'
                  >
                    Add File
                  </Button>
                </div>
              </div>

              {/* Section 5: Address & Emergency Contact */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-pat-address'>Address</Label>
                  <Input
                    id='edit-pat-address'
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-pat-emergency'>Emergency Contact</Label>
                  <Input
                    id='edit-pat-emergency'
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className='gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={() => setEditItem(null)}>
                  Cancel
                </Button>
                <Button type='submit' className='bg-teal-600 hover:bg-teal-700 text-white' disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Record'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Patient Clinical Dossier Dialog matching attached Mobile Screen */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className='max-w-md p-0 overflow-hidden rounded-3xl border shadow-xl bg-slate-50/50 dark:bg-slate-950'>
            {/* Top Bar matching Mobile Header */}
            <div className='p-4 pb-2 flex items-center justify-between border-b bg-card'>
              <h2 className='font-bold text-lg text-foreground text-center flex-1'>
                Patient detail
              </h2>
            </div>

            <div className='p-4 space-y-4 max-h-[80vh] overflow-y-auto'>
              {/* Header Card matching Screenshot */}
              <div className='p-4 border rounded-2xl bg-card shadow-sm space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    {viewItem.avatar ? (
                      <img
                        src={viewItem.avatar}
                        alt={viewItem.name}
                        className='h-14 w-14 rounded-2xl object-cover border shrink-0 shadow-sm'
                      />
                    ) : (
                      <div className='h-14 w-14 rounded-2xl bg-neutral-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0'>
                        {viewItem.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'PT'}
                      </div>
                    )}
                    <div>
                      <h3 className='font-bold text-lg text-foreground leading-tight'>
                        {viewItem.name}
                      </h3>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Patient ID: {viewItem.patientId || `p-${viewItem._id.slice(-5)}`}
                      </p>
                    </div>
                  </div>
                  <div className='text-xs text-muted-foreground font-medium'>
                    Age: {viewItem.age || 45} &nbsp;|&nbsp;{' '}
                    <span className='capitalize'>{viewItem.gender?.toLowerCase() === 'female' ? 'Female' : 'Male'}</span>
                  </div>
                </div>

                {/* Health Summary Section */}
                <div className='space-y-2 pt-2 border-t'>
                  <h4 className='font-semibold text-sm text-foreground'>Health Summary</h4>
                  <div className='flex flex-wrap gap-2'>
                    <div className='inline-flex items-center px-3 py-1 rounded-full border bg-card text-xs text-muted-foreground'>
                      Condition:&nbsp;<span className='text-teal-600 dark:text-teal-400 font-semibold'>{viewItem.condition || viewItem.problem || 'Chest Pain'}</span>
                    </div>
                    <div className='inline-flex items-center px-3 py-1 rounded-full border bg-card text-xs text-muted-foreground'>
                      Blood Group:&nbsp;<span className='text-teal-600 dark:text-teal-400 font-semibold'>{viewItem.bloodGroup || 'B+'}</span>
                    </div>
                    <div className='inline-flex items-center px-3 py-1 rounded-full border bg-card text-xs text-muted-foreground'>
                      Allergies:&nbsp;<span className='text-teal-600 dark:text-teal-400 font-semibold'>{viewItem.allergies || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Current Case Status Section */}
                <div className='space-y-2 pt-2 border-t'>
                  <h4 className='font-semibold text-sm text-foreground'>Current Case Status</h4>
                  <div className='space-y-2'>
                    <div className='inline-flex items-center px-3 py-1.5 rounded-full border bg-card text-xs text-muted-foreground max-w-full truncate'>
                      Doctor:&nbsp;
                      <span className='text-teal-600 dark:text-teal-400 font-semibold truncate'>
                        {viewItem.registeredBy?.name || viewItem.doctorId?.name || 'Dr. Amit Mehta'}{' '}
                        ({viewItem.registeredBy?.specialization || viewItem.doctorId?.specialization || 'Cardiologist'})
                      </span>
                    </div>
                    <br />
                    <div className='inline-flex items-center px-3 py-1.5 rounded-full border bg-card text-xs text-muted-foreground'>
                      Status:&nbsp;<span className='text-teal-600 dark:text-teal-400 font-semibold'>{viewItem.caseStatus || 'Under Treatment'}</span>
                    </div>
                  </div>
                </div>

                {/* Medical History Section */}
                <div className='space-y-2 pt-2 border-t'>
                  <h4 className='font-semibold text-sm text-foreground'>Medical History</h4>
                  <div className='flex flex-wrap gap-2'>
                    {(viewItem.medicalHistoryTags && viewItem.medicalHistoryTags.length > 0
                      ? viewItem.medicalHistoryTags
                      : ['Hypertension (2 years)', 'Previous Chest Discomfort']
                    ).map((tag, i) => (
                      <div
                        key={i}
                        className='px-3 py-1.5 rounded-full border bg-card text-xs font-medium text-foreground shadow-xs'
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* View Reports Card matching Screenshot */}
              <div className='p-4 border rounded-2xl bg-card shadow-sm space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-semibold text-sm text-foreground'>View Reports</h4>
                  <button
                    type='button'
                    onClick={() => toast.info('All attached documents are displayed below.')}
                    className='text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline'
                  >
                    View all
                  </button>
                </div>

                <div className='space-y-2'>
                  {(viewItem.reports && viewItem.reports.length > 0
                    ? viewItem.reports
                    : DEFAULT_REPORTS
                  ).map((rep, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/40 transition-colors'
                    >
                      <span className='font-medium text-xs text-foreground truncate pr-2'>
                        {rep.name}
                      </span>
                      <div className='p-1.5 rounded-lg text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 shrink-0'>
                        <Activity className='h-4 w-4' />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call Action Button matching Screenshot */}
              <div className='pt-1'>
                <a
                  href={`tel:${viewItem.phone || viewItem.mobile || ''}`}
                  className='w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors text-sm'
                >
                  <Phone className='h-4 w-4 fill-current' />
                  Call
                </a>
              </div>
            </div>

            <div className='p-3 border-t bg-card flex justify-end gap-2'>
              <Button variant='outline' size='sm' onClick={() => setViewItem(null)}>
                Close
              </Button>
              <Button
                size='sm'
                className='bg-teal-600 hover:bg-teal-700 text-white'
                onClick={() => {
                  const pat = viewItem
                  setViewItem(null)
                  handleOpenEdit(pat)
                }}
              >
                <Pencil className='mr-1.5 h-3.5 w-3.5' /> Edit File
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Patient Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this patient record and all clinical documents associated
              with this chart.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Patient'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
