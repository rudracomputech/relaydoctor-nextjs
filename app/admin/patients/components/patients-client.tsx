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
} from 'lucide-react'

export interface PatientItem {
  _id: string
  name: string
  phone?: string
  mobile?: string
  age: number
  gender: string
  registeredBy?: {
    _id: string
    name: string
    specialization?: string
    hospital?: string
  }
  medicalHistory?: string
  problem?: string
  diagnosis?: string
  prescription?: string
  address?: string
  emergencyContact?: string
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

export function PatientsClient({
  initialPatients,
  doctors,
}: {
  initialPatients: PatientItem[]
  doctors: DoctorOption[]
}) {
  const [data, setData] = useState<PatientItem[]>(initialPatients)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<PatientItem | null>(null)
  const [viewItem, setViewItem] = useState<PatientItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: 35,
    gender: 'male',
    registeredBy: 'none',
    medicalHistory: '',
    diagnosis: '',
    prescription: '',
    address: '',
    emergencyContact: '',
  })

  function resetForm() {
    setFormData({
      name: '',
      phone: '',
      age: 35,
      gender: 'male',
      registeredBy: 'none',
      medicalHistory: '',
      diagnosis: '',
      prescription: '',
      address: '',
      emergencyContact: '',
    })
  }

  function handleOpenCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function handleOpenEdit(patient: PatientItem) {
    setFormData({
      name: patient.name || '',
      phone: patient.phone || patient.mobile || '',
      age: patient.age || 35,
      gender: (patient.gender || 'male').toLowerCase(),
      registeredBy: patient.registeredBy?._id || 'none',
      medicalHistory: patient.medicalHistory || patient.problem || '',
      diagnosis: patient.diagnosis || '',
      prescription: patient.prescription || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
    })
    setEditItem(patient)
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
      }
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create patient')

      setData((prev) => [json.data, ...prev])
      toast.success(`Patient record for ${json.data.name} created`)
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
      toast.success('Patient details updated')
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
          return (
            <div className='py-1'>
              <div className='font-semibold text-foreground flex items-center gap-2'>
                <HeartPulse className='h-4 w-4 text-rose-500' />
                <span>{pat.name}</span>
              </div>
              <div className='text-xs text-muted-foreground flex items-center gap-2 mt-0.5'>
                <Badge
                  variant='outline'
                  className={`text-[10px] px-1.5 py-0 capitalize ${
                    gender === 'female'
                      ? 'bg-pink-50 text-pink-700 border-pink-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {gender}
                </Badge>
                <span>&bull; {pat.age ? `${pat.age} yrs` : 'Age N/A'}</span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Contact Phone' />,
        cell: ({ row }) => {
          const ph = row.original.phone || row.original.mobile || 'N/A'
          return (
            <div className='font-mono text-xs flex items-center gap-1.5'>
              <Phone className='h-3.5 w-3.5 text-muted-foreground' />
              <span>{ph}</span>
            </div>
          )
        },
      },
      {
        id: 'registeredBy',
        header: 'Primary Physician',
        cell: ({ row }) => {
          const doc = row.original.registeredBy
          if (!doc) {
            return (
              <span className='text-xs text-muted-foreground italic'>
                Direct Intake (Hospital Walk-in)
              </span>
            )
          }
          return (
            <div className='text-xs'>
              <div className='font-medium text-foreground'>{doc.name}</div>
              <div className='text-muted-foreground'>
                {doc.specialization} &bull; {doc.hospital || 'Clinic'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'medicalHistory',
        header: 'Clinical Summary / Problem',
        cell: ({ row }) => {
          const history =
            row.original.medicalHistory || row.original.problem || 'No documented prior history.'
          return (
            <p className='text-xs text-muted-foreground line-clamp-2 max-w-xs' title={history}>
              {history}
            </p>
          )
        },
      },
      {
        accessorKey: 'referralCount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Referrals' />,
        cell: ({ row }) => {
          const count = row.original.referralCount || 0
          return (
            <div className='text-center'>
              <Badge variant='secondary' className='font-bold text-xs'>
                {count} case{count === 1 ? '' : 's'}
              </Badge>
            </div>
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
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem onClick={() => setViewItem(pat)}>
                  <Eye className='mr-2 h-4 w-4 text-muted-foreground' />
                  View File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(pat)}>
                  <Pencil className='mr-2 h-4 w-4 text-muted-foreground' />
                  Edit Patient
                </DropdownMenuItem>
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
    initialState: {
      columnVisibility: { gender: false },
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
      const docName = pat.registeredBy?.name || ''
      const problem = pat.medicalHistory || pat.problem || ''
      return (
        pat.name.toLowerCase().includes(search) ||
        phone.includes(search) ||
        docName.toLowerCase().includes(search) ||
        problem.toLowerCase().includes(search)
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
          <Button onClick={handleOpenCreate} className='bg-blue-600 hover:bg-blue-700 text-white'>
            <Plus className='h-4 w-4 mr-1.5' /> New Patient Intake
          </Button>
          <Badge variant='outline' className='px-3 py-1 bg-blue-50 text-blue-700 border-blue-200'>
            {data.length} Active Records
          </Badge>
        </div>
      </div>

      {/* Toolbar with faceted filters & search */}
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by patient, phone, clinical notes...'
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
              <HeartPulse className='h-5 w-5 text-blue-600' />
              New Patient Clinical Intake
            </DialogTitle>
            <DialogDescription>
              Register a patient and associate them with a referring or consulting physician.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePatient} className='space-y-4 pt-2'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='pat-name'>Patient Full Name *</Label>
                <Input
                  id='pat-name'
                  placeholder='e.g. Ramesh Chandra'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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

            <div className='space-y-1.5'>
              <Label htmlFor='pat-doctor'>Primary / Referring Physician</Label>
              <Select
                value={formData.registeredBy}
                onValueChange={(val) => setFormData({ ...formData, registeredBy: val })}
              >
                <SelectTrigger id='pat-doctor'>
                  <SelectValue placeholder='Select physician (Optional)' />
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
              <Label htmlFor='pat-history'>Chief Medical Complaint / Problem</Label>
              <Textarea
                id='pat-history'
                rows={2}
                placeholder='Persistent chest tightness on exertion, shortness of breath...'
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='pat-diag'>Preliminary Diagnosis</Label>
                <Input
                  id='pat-diag'
                  placeholder='Suspected Angina / CAD'
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
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

            <div className='space-y-1.5'>
              <Label htmlFor='pat-address'>Residential Address</Label>
              <Input
                id='pat-address'
                placeholder='Flat 301, Lakeview Residency, Sector 4'
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' className='bg-blue-600 hover:bg-blue-700' disabled={submitting}>
                {submitting ? 'Creating File...' : 'Create Record'}
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
                <Pencil className='h-5 w-5 text-blue-600' />
                Edit Patient: {editItem.name}
              </DialogTitle>
              <DialogDescription>
                Update clinical history, physician assignments, or contact data.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePatient} className='space-y-4 pt-2'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                  <Label htmlFor='edit-pat-phone'>Phone</Label>
                  <Input
                    id='edit-pat-phone'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
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
                <Label htmlFor='edit-pat-history'>Medical Complaint / Problem</Label>
                <Textarea
                  id='edit-pat-history'
                  rows={2}
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-pat-diag'>Diagnosis</Label>
                  <Input
                    id='edit-pat-diag'
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
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

              <div className='space-y-1.5'>
                <Label htmlFor='edit-pat-address'>Address</Label>
                <Input
                  id='edit-pat-address'
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <DialogFooter className='gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={() => setEditItem(null)}>
                  Cancel
                </Button>
                <Button type='submit' className='bg-blue-600 hover:bg-blue-700' disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Record'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Patient Clinical Dossier Dialog */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-rose-50 text-rose-600 rounded-full'>
                  <HeartPulse className='h-6 w-6' />
                </div>
                <div>
                  <DialogTitle className='text-xl flex items-center gap-2'>
                    {viewItem.name}
                    <Badge variant='outline' className='capitalize text-xs'>
                      {viewItem.gender || 'Unknown'} &bull; {viewItem.age ? `${viewItem.age} yrs` : ''}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className='flex items-center gap-2 mt-0.5'>
                    <Phone className='h-3.5 w-3.5 text-muted-foreground' />
                    <span className='font-mono'>{viewItem.phone || viewItem.mobile || 'No contact'}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 pt-2 text-sm'>
              {/* Primary Physician */}
              <div className='p-3 bg-muted/40 rounded-lg'>
                <span className='text-xs text-muted-foreground block font-medium'>
                  Attending / Referring Physician
                </span>
                {viewItem.registeredBy ? (
                  <div className='mt-1'>
                    <div className='font-semibold text-foreground'>{viewItem.registeredBy.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {viewItem.registeredBy.specialization} &bull; {viewItem.registeredBy.hospital}
                    </div>
                  </div>
                ) : (
                  <span className='text-xs text-muted-foreground italic mt-1 block'>
                    Direct Intake (Walk-in)
                  </span>
                )}
              </div>

              {/* Medical History */}
              <div>
                <h4 className='text-xs font-semibold uppercase text-muted-foreground'>
                  Clinical Background & Symptoms
                </h4>
                <p className='text-xs text-foreground mt-1 p-3 bg-muted/30 rounded border leading-relaxed'>
                  {viewItem.medicalHistory || viewItem.problem || 'No prior notes documented.'}
                </p>
              </div>

              {viewItem.diagnosis && (
                <div>
                  <h4 className='text-xs font-semibold uppercase text-muted-foreground'>
                    Preliminary Clinical Diagnosis
                  </h4>
                  <p className='text-xs text-foreground mt-1 p-2.5 bg-muted/30 rounded border font-medium'>
                    {viewItem.diagnosis}
                  </p>
                </div>
              )}

              {viewItem.prescription && (
                <div>
                  <h4 className='text-xs font-semibold uppercase text-muted-foreground'>
                    Prescription / Active Regimen
                  </h4>
                  <p className='text-xs text-foreground mt-1 p-2.5 bg-muted/30 rounded border font-mono'>
                    {viewItem.prescription}
                  </p>
                </div>
              )}

              <div className='grid grid-cols-2 gap-3 text-xs'>
                {viewItem.address && (
                  <div className='p-2.5 border rounded'>
                    <span className='text-muted-foreground block'>Address</span>
                    <span className='font-medium text-foreground mt-0.5 block'>{viewItem.address}</span>
                  </div>
                )}
                {viewItem.emergencyContact && (
                  <div className='p-2.5 border rounded'>
                    <span className='text-muted-foreground block'>Emergency Contact</span>
                    <span className='font-medium text-foreground mt-0.5 block'>
                      {viewItem.emergencyContact}
                    </span>
                  </div>
                )}
              </div>

              <div className='p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg flex items-center justify-between text-xs'>
                <span className='text-blue-700 dark:text-blue-300 font-medium'>
                  Referral Consultation Pipeline
                </span>
                <Badge className='bg-blue-600 text-white font-bold'>
                  {viewItem.referralCount || 0} Case
                  {(viewItem.referralCount || 0) === 1 ? '' : 's'} Logged
                </Badge>
              </div>
            </div>

            <DialogFooter className='pt-2'>
              <Button variant='outline' onClick={() => setViewItem(null)}>
                Close
              </Button>
              <Button
                className='bg-blue-600 hover:bg-blue-700'
                onClick={() => {
                  const pat = viewItem
                  setViewItem(null)
                  handleOpenEdit(pat)
                }}
              >
                <Pencil className='mr-1.5 h-4 w-4' /> Edit File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Patient Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this patient record and all clinical notes associated
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
