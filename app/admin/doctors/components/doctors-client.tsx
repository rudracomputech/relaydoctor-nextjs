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
import { Switch } from '@/components/ui/switch'
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
  Stethoscope,
  CheckCircle2,
  XCircle,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Star,
  Building2,
  Phone,
  Mail,
  Wallet,
  ShieldCheck,
  Award,
} from 'lucide-react'

export interface DoctorItem {
  _id: string
  name: string
  email: string
  phone?: string
  specialization?: string
  hospital?: string
  clinicAddress?: string
  experienceYears?: number
  consultationFee?: number
  rating?: number
  reviewCount?: number
  avatar?: string
  isVerified: boolean
  isBlocked?: boolean
  bio?: string
  sentReferrals?: number
  receivedReferrals?: number
  walletBalance?: number
  createdAt?: string
}

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Neurologist',
  'Orthopedic Surgeon',
  'Dermatologist',
  'Pediatrician',
  'Gynecologist',
  'Oncologist',
  'Psychiatrist',
  'Radiologist',
  'ENT Specialist',
  'Ophthalmologist',
]

export function DoctorsClient({ initialDoctors }: { initialDoctors: DoctorItem[] }) {
  const [data, setData] = useState<DoctorItem[]>(initialDoctors)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<DoctorItem | null>(null)
  const [viewItem, setViewItem] = useState<DoctorItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: 'General Physician',
    hospital: '',
    clinicAddress: '',
    experienceYears: 5,
    consultationFee: 500,
    isVerified: true,
    bio: '',
  })

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      specialization: 'General Physician',
      hospital: '',
      clinicAddress: '',
      experienceYears: 5,
      consultationFee: 500,
      isVerified: true,
      bio: '',
    })
  }

  function handleOpenCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function handleOpenEdit(doctor: DoctorItem) {
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      password: '',
      specialization: doctor.specialization || 'General Physician',
      hospital: doctor.hospital || '',
      clinicAddress: doctor.clinicAddress || '',
      experienceYears: doctor.experienceYears || 5,
      consultationFee: doctor.consultationFee || 500,
      isVerified: doctor.isVerified ?? true,
      bio: doctor.bio || '',
    })
    setEditItem(doctor)
  }

  async function handleCreateDoctor(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Doctor name and email are required')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create doctor')

      setData((prev) => [json.data, ...prev])
      toast.success(`Dr. ${json.data.name} added successfully!`)
      setCreateOpen(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateDoctor(e: React.FormEvent) {
    e.preventDefault()
    if (!editItem) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/doctors/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update doctor')

      setData((prev) =>
        prev.map((d) => (d._id === editItem._id ? { ...d, ...json.data } : d))
      )
      toast.success('Doctor details updated')
      setEditItem(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteDoctor() {
    if (!deleteId) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/doctors/${deleteId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete doctor')

      setData((prev) => prev.filter((d) => d._id !== deleteId))
      toast.success('Doctor removed from registry')
      setDeleteId(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleVerify(doctor: DoctorItem) {
    try {
      const newStatus = !doctor.isVerified
      const res = await fetch(`/api/admin/doctors/${doctor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update status')

      setData((prev) =>
        prev.map((d) => (d._id === doctor._id ? { ...d, isVerified: newStatus } : d))
      )
      toast.success(newStatus ? 'Doctor verified' : 'Doctor unverified')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const columns = useMemo<ColumnDef<DoctorItem>[]>(
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Doctor' />,
        cell: ({ row }) => {
          const doc = row.original
          return (
            <div className='flex items-center gap-3 py-1'>
              <img
                src={
                  doc.avatar ||
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face'
                }
                alt={doc.name}
                className='h-10 w-10 rounded-full object-cover border border-teal-200'
              />
              <div className='min-w-0'>
                <div className='font-semibold text-foreground truncate flex items-center gap-1.5'>
                  {doc.name}
                  {doc.isVerified && (
                    <CheckCircle2 className='h-3.5 w-3.5 text-teal-600 shrink-0' />
                  )}
                </div>
                <div className='text-xs text-muted-foreground flex items-center gap-2 mt-0.5'>
                  <span className='truncate'>{doc.email}</span>
                  {doc.phone && <span>&bull; {doc.phone}</span>}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'specialization',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Specialization' />
        ),
        cell: ({ row }) => {
          const spec = row.getValue('specialization') as string
          const exp = row.original.experienceYears || 5
          return (
            <div>
              <Badge variant='outline' className='bg-teal-50 text-teal-700 border-teal-200'>
                {spec || 'General'}
              </Badge>
              <div className='text-[11px] text-muted-foreground mt-0.5'>
                {exp} yrs experience
              </div>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'hospital',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Hospital / Clinic' />,
        cell: ({ row }) => {
          const hosp = row.getValue('hospital') as string
          return (
            <div className='text-xs max-w-48 truncate'>
              <div className='font-medium text-foreground flex items-center gap-1'>
                <Building2 className='h-3 w-3 text-muted-foreground' />
                <span className='truncate'>{hosp || 'Private Practice'}</span>
              </div>
              <div className='text-muted-foreground truncate'>
                {row.original.clinicAddress || 'Clinic details not added'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'rating',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rating' />,
        cell: ({ row }) => {
          const rating = (row.getValue('rating') as number) || 4.8
          const count = row.original.reviewCount || 100
          return (
            <div className='flex items-center gap-1 text-xs font-semibold'>
              <Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400' />
              <span>{rating}</span>
              <span className='text-[10px] text-muted-foreground'>({count})</span>
            </div>
          )
        },
      },
      {
        id: 'referrals',
        header: 'Referrals (Out/In)',
        cell: ({ row }) => {
          const doc = row.original
          return (
            <div className='text-xs'>
              <Badge variant='secondary' className='font-mono'>
                {doc.sentReferrals ?? 0} out &bull; {doc.receivedReferrals ?? 0} in
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: 'walletBalance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Wallet' />,
        cell: ({ row }) => {
          const bal = (row.getValue('walletBalance') as number) || 0
          return (
            <span className='font-mono text-xs font-semibold text-emerald-600'>
              ₹{bal.toLocaleString()}
            </span>
          )
        },
      },
      {
        accessorKey: 'isVerified',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
          const isVer = Boolean(row.getValue('isVerified'))
          return isVer ? (
            <Badge className='bg-emerald-100 text-emerald-800 border-0 text-xs'>
              Verified
            </Badge>
          ) : (
            <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-300 text-xs'>
              Pending
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          const valStr = String(row.getValue(id))
          return value.includes(valStr)
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const doc = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem onClick={() => setViewItem(doc)}>
                  <Eye className='mr-2 h-4 w-4 text-muted-foreground' />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(doc)}>
                  <Pencil className='mr-2 h-4 w-4 text-muted-foreground' />
                  Edit Doctor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleVerify(doc)}>
                  {doc.isVerified ? (
                    <>
                      <XCircle className='mr-2 h-4 w-4 text-amber-600' />
                      Mark Unverified
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='mr-2 h-4 w-4 text-emerald-600' />
                      Mark Verified
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteId(doc._id)}
                  className='text-destructive focus:text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Doctor
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
      const doc = row.original
      return (
        doc.name.toLowerCase().includes(search) ||
        doc.email.toLowerCase().includes(search) ||
        (doc.specialization || '').toLowerCase().includes(search) ||
        (doc.hospital || '').toLowerCase().includes(search) ||
        (doc.phone || '').includes(search)
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
      {/* Top action bar */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Button onClick={handleOpenCreate} className='bg-teal-600 hover:bg-teal-700 text-white'>
            <Plus className='h-4 w-4 mr-1.5' /> Add Doctor
          </Button>
          <Badge variant='outline' className='px-3 py-1 bg-teal-50 text-teal-700 border-teal-200'>
            {data.length} Registered Specialists
          </Badge>
        </div>
      </div>

      {/* Toolbar with faceted filters & search */}
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by name, email, specialization...'
        filters={[
          {
            columnId: 'specialization',
            title: 'Specialty',
            options: SPECIALIZATIONS.map((s) => ({ label: s, value: s })),
          },
          {
            columnId: 'isVerified',
            title: 'Verification',
            options: [
              { label: 'Verified', value: 'true', icon: CheckCircle2 },
              { label: 'Pending', value: 'false', icon: XCircle },
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
                  No doctors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Create Doctor Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Stethoscope className='h-5 w-5 text-teal-600' />
              Register New Specialist Doctor
            </DialogTitle>
            <DialogDescription>
              Add a new physician to the RelayDoctor patient referral network.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDoctor} className='space-y-4 pt-2'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='doc-name'>Full Name *</Label>
                <Input
                  id='doc-name'
                  placeholder='Dr. Rajesh Sharma'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='doc-email'>Email Address *</Label>
                <Input
                  id='doc-email'
                  type='email'
                  placeholder='dr.rajesh@hospital.com'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='doc-phone'>Phone Number</Label>
                <Input
                  id='doc-phone'
                  placeholder='+91 98765 43210'
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='doc-pass'>Temporary Password</Label>
                <Input
                  id='doc-pass'
                  type='password'
                  placeholder='Default: doctor123'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='doc-spec'>Specialization</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(val) => setFormData({ ...formData, specialization: val })}
                >
                  <SelectTrigger id='doc-spec'>
                    <SelectValue placeholder='Select specialization' />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='doc-hospital'>Hospital / Affiliation</Label>
                <Input
                  id='doc-hospital'
                  placeholder='Apollo Hospitals / City Care Clinic'
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='doc-exp'>Years of Experience</Label>
                <Input
                  id='doc-exp'
                  type='number'
                  min={0}
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceYears: Number(e.target.value) })
                  }
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='doc-fee'>Consultation Fee (₹)</Label>
                <Input
                  id='doc-fee'
                  type='number'
                  min={0}
                  value={formData.consultationFee}
                  onChange={(e) =>
                    setFormData({ ...formData, consultationFee: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='doc-clinic'>Clinic / Hospital Address</Label>
              <Input
                id='doc-clinic'
                placeholder='Room 402, Medical Block B, Ring Road'
                value={formData.clinicAddress}
                onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='doc-bio'>Professional Bio / Summary</Label>
              <Input
                id='doc-bio'
                placeholder='Experienced practitioner specializing in non-invasive interventions...'
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/40'>
              <div>
                <Label htmlFor='doc-verified' className='font-medium cursor-pointer'>
                  Mark as Verified Physician
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Doctor credentials and medical license will be marked active immediately.
                </p>
              </div>
              <Switch
                id='doc-verified'
                checked={formData.isVerified}
                onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
              />
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' className='bg-teal-600 hover:bg-teal-700' disabled={submitting}>
                {submitting ? 'Registering...' : 'Register Doctor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Pencil className='h-5 w-5 text-teal-600' />
                Edit Doctor: {editItem.name}
              </DialogTitle>
              <DialogDescription>
                Modify profile details, affiliations, and verification status.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateDoctor} className='space-y-4 pt-2'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-doc-name'>Full Name</Label>
                  <Input
                    id='edit-doc-name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-doc-email'>Email Address</Label>
                  <Input
                    id='edit-doc-email'
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-doc-phone'>Phone Number</Label>
                  <Input
                    id='edit-doc-phone'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-doc-spec'>Specialization</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(val) => setFormData({ ...formData, specialization: val })}
                  >
                    <SelectTrigger id='edit-doc-spec'>
                      <SelectValue placeholder='Select specialization' />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-doc-hospital'>Hospital / Affiliation</Label>
                  <Input
                    id='edit-doc-hospital'
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-doc-fee'>Consultation Fee (₹)</Label>
                  <Input
                    id='edit-doc-fee'
                    type='number'
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData({ ...formData, consultationFee: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='edit-doc-clinic'>Clinic / Hospital Address</Label>
                <Input
                  id='edit-doc-clinic'
                  value={formData.clinicAddress}
                  onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='edit-doc-bio'>Bio</Label>
                <Input
                  id='edit-doc-bio'
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/40'>
                <div>
                  <Label htmlFor='edit-doc-verified' className='font-medium cursor-pointer'>
                    Verified Status
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Doctor will be displayed with a verified badge in referrals.
                  </p>
                </div>
                <Switch
                  id='edit-doc-verified'
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                />
              </div>

              <DialogFooter className='gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={() => setEditItem(null)}>
                  Cancel
                </Button>
                <Button type='submit' className='bg-teal-600 hover:bg-teal-700' disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Doctor Profile Dialog */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <div className='flex items-center gap-4'>
                <img
                  src={
                    viewItem.avatar ||
                    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face'
                  }
                  alt={viewItem.name}
                  className='h-16 w-16 rounded-full object-cover border-2 border-teal-200'
                />
                <div>
                  <DialogTitle className='text-xl flex items-center gap-2'>
                    {viewItem.name}
                    {viewItem.isVerified && (
                      <Badge className='bg-teal-100 text-teal-800 border-0 text-xs'>
                        Verified
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className='text-teal-700 dark:text-teal-400 font-medium text-sm mt-0.5'>
                    {viewItem.specialization} &bull; {viewItem.experienceYears || 5} Years Exp
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 pt-2 text-sm'>
              <div className='grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg'>
                <div>
                  <span className='text-xs text-muted-foreground block'>Hospital / Affiliation</span>
                  <span className='font-medium text-foreground flex items-center gap-1 mt-0.5'>
                    <Building2 className='h-3.5 w-3.5 text-muted-foreground' />
                    {viewItem.hospital || 'Private Clinic'}
                  </span>
                </div>
                <div>
                  <span className='text-xs text-muted-foreground block'>Consultation Fee</span>
                  <span className='font-semibold text-foreground mt-0.5 block'>
                    ₹{viewItem.consultationFee || 500}
                  </span>
                </div>
                <div>
                  <span className='text-xs text-muted-foreground block'>Email</span>
                  <span className='text-foreground flex items-center gap-1 mt-0.5 truncate'>
                    <Mail className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                    {viewItem.email}
                  </span>
                </div>
                <div>
                  <span className='text-xs text-muted-foreground block'>Phone</span>
                  <span className='text-foreground flex items-center gap-1 mt-0.5'>
                    <Phone className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                    {viewItem.phone || 'N/A'}
                  </span>
                </div>
              </div>

              {viewItem.clinicAddress && (
                <div>
                  <h4 className='text-xs font-semibold uppercase text-muted-foreground'>Clinic Address</h4>
                  <p className='text-xs text-foreground mt-1 p-2.5 bg-muted/30 rounded border'>
                    {viewItem.clinicAddress}
                  </p>
                </div>
              )}

              {viewItem.bio && (
                <div>
                  <h4 className='text-xs font-semibold uppercase text-muted-foreground'>Biography</h4>
                  <p className='text-xs text-foreground mt-1 p-2.5 bg-muted/30 rounded border'>
                    {viewItem.bio}
                  </p>
                </div>
              )}

              <div className='grid grid-cols-3 gap-2 text-center text-xs pt-2'>
                <div className='p-2 bg-muted/50 rounded-lg'>
                  <div className='text-muted-foreground'>Rating</div>
                  <div className='font-bold text-foreground flex items-center justify-center gap-1 mt-0.5'>
                    <Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400' />
                    {viewItem.rating || 4.8}
                  </div>
                </div>
                <div className='p-2 bg-muted/50 rounded-lg'>
                  <div className='text-muted-foreground'>Referrals (Sent/Recv)</div>
                  <div className='font-bold text-foreground mt-0.5'>
                    {viewItem.sentReferrals || 0} / {viewItem.receivedReferrals || 0}
                  </div>
                </div>
                <div className='p-2 bg-muted/50 rounded-lg'>
                  <div className='text-muted-foreground'>Wallet Balance</div>
                  <div className='font-bold text-emerald-600 mt-0.5'>
                    ₹{viewItem.walletBalance || 0}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className='pt-2'>
              <Button variant='outline' onClick={() => setViewItem(null)}>
                Close
              </Button>
              <Button
                className='bg-teal-600 hover:bg-teal-700'
                onClick={() => {
                  const doc = viewItem
                  setViewItem(null)
                  handleOpenEdit(doc)
                }}
              >
                <Pencil className='mr-1.5 h-4 w-4' /> Edit Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this doctor's account and remove their specialist profile
              from the active referral network.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDoctor}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Doctor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
