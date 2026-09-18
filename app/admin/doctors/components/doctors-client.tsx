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
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  Check,
  Activity,
  CalendarDays,
  User,
  Trash,
  Coins,
  TrendingUp,
  ArrowDownUp,
  ExternalLink,
} from 'lucide-react'

export interface EducationItem {
  degree?: string
  collegeName?: string
  yearOfCompletion?: number | string
  yearsOfExperience?: number
}

export interface DoctorItem {
  _id: string
  name: string
  email: string
  phone?: string
  gender?: string
  city?: string
  location?: string
  specialization?: string
  speciality?: string
  hospital?: string
  clinicAddress?: string
  hospitalAddress?: string
  additionalAddresses?: string[]
  age?: number
  dateOfBirth?: string | Date
  experienceYears?: number
  education?: EducationItem[]
  workSchedule?: {
    opdTiming?: string
    opdDays?: string[]
    surgeryTiming?: string
    surgeryDays?: string[]
  }
  availabilityStatus?: string
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
  totalEarnings?: number
  pendingBalance?: number
  totalWithdrawn?: number
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
  'Cardiology',
]

const DEGREES = [
  'MBBS',
  'MD',
  'MS',
  'DM',
  'MCh',
  'DNB',
  'BDS',
  'MDS',
  'BAMS',
  'BHMS',
  'Fellowship',
  'Diploma',
]

const AVAILABILITY_OPTIONS = [
  {
    value: 'Available For Call',
    label: 'Available For Call',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    activeBg: 'bg-emerald-600 text-white',
    icon: Phone,
  },
  {
    value: 'In OPD',
    label: 'In OPD',
    color: 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-300',
    activeBg: 'bg-teal-600 text-white',
    icon: Stethoscope,
  },
  {
    value: 'In Surgery',
    label: 'In Surgery',
    color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    activeBg: 'bg-slate-700 text-white',
    icon: Clock,
  },
  {
    value: 'Busy',
    label: 'Busy',
    color: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
    activeBg: 'bg-rose-500 text-white',
    icon: Activity,
  },
  {
    value: 'In Vacation',
    label: 'In Vacation',
    color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
    activeBg: 'bg-amber-500 text-white',
    icon: CalendarDays,
  },
]

export function DoctorsClient({ initialDoctors }: { initialDoctors: DoctorItem[] }) {
  const [data, setData] = useState<DoctorItem[]>(initialDoctors)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    experienceLevel: false,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Computed location options from active doctor records
  const locationOptions = useMemo(() => {
    const set = new Set<string>()
    data.forEach((d) => {
      if (d.city?.trim()) set.add(d.city.trim())
      if (d.location?.trim()) set.add(d.location.trim())
    })
    if (set.size === 0) {
      ;['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'].forEach((c) =>
        set.add(c)
      )
    }
    return Array.from(set).map((c) => ({ label: c, value: c }))
  }, [data])

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<DoctorItem | null>(null)
  const [viewItem, setViewItem] = useState<DoctorItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Doctor Wallet Adjust States
  const [adjustDoc, setAdjustDoc] = useState<DoctorItem | null>(null)
  const [adjustAction, setAdjustAction] = useState<'credit' | 'debit'>('credit')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustType, setAdjustType] = useState('Referral Bonus')
  const [adjustNote, setAdjustNote] = useState('')
  const [adjustSubmitting, setAdjustSubmitting] = useState(false)

  // Form state for Create/Edit matching attached screenshot
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male',
    city: '',
    age: 35,
    dateOfBirth: '',
    specialization: 'Cardiology',
    clinicAddress: '',
    hospitalAddress: '',
    additionalAddresses: [] as string[],
    experienceYears: 4,
    education: [
      {
        degree: 'MBBS',
        collegeName: '',
        yearOfCompletion: 2018,
        yearsOfExperience: 4,
      },
    ] as EducationItem[],
    workSchedule: {
      opdTiming: 'MON-FRI | 10 AM TO 1 PM',
      surgeryTiming: 'MON-FRI | 10 AM TO 1 PM',
    },
    availabilityStatus: 'Available For Call',
    consultationFee: 500,
    isVerified: true,
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
  })

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      gender: 'male',
      city: '',
      age: 35,
      dateOfBirth: '',
      specialization: 'Cardiology',
      clinicAddress: '',
      hospitalAddress: '',
      additionalAddresses: [],
      experienceYears: 4,
      education: [
        {
          degree: 'MBBS',
          collegeName: '',
          yearOfCompletion: 2018,
          yearsOfExperience: 4,
        },
      ],
      workSchedule: {
        opdTiming: 'MON-FRI | 10 AM TO 1 PM',
        surgeryTiming: 'MON-FRI | 10 AM TO 1 PM',
      },
      availabilityStatus: 'Available For Call',
      consultationFee: 500,
      isVerified: true,
      bio: '',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    })
  }

  function handleOpenCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function handleOpenEdit(doctor: DoctorItem) {
    const dobFormatted = doctor.dateOfBirth
      ? new Date(doctor.dateOfBirth).toISOString().split('T')[0]
      : ''

    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      password: '',
      gender: (doctor.gender || 'male').toLowerCase(),
      city: doctor.city || doctor.location || '',
      age: doctor.age || 35,
      dateOfBirth: dobFormatted,
      specialization: doctor.specialization || doctor.speciality || 'Cardiology',
      clinicAddress: doctor.clinicAddress || '',
      hospitalAddress: doctor.hospitalAddress || doctor.hospital || '',
      additionalAddresses: doctor.additionalAddresses || [],
      experienceYears: doctor.experienceYears || 4,
      education:
        doctor.education && doctor.education.length > 0
          ? doctor.education
          : [
              {
                degree: 'MBBS',
                collegeName: '',
                yearOfCompletion: 2018,
                yearsOfExperience: doctor.experienceYears || 4,
              },
            ],
      workSchedule: {
        opdTiming: doctor.workSchedule?.opdTiming || 'MON-FRI | 10 AM TO 1 PM',
        surgeryTiming: doctor.workSchedule?.surgeryTiming || 'MON-FRI | 10 AM TO 1 PM',
      },
      availabilityStatus: doctor.availabilityStatus || 'Available For Call',
      consultationFee: doctor.consultationFee || 500,
      isVerified: doctor.isVerified ?? true,
      bio: doctor.bio || '',
      avatar:
        doctor.avatar ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    })
    setEditItem(doctor)
  }

  // Address helpers
  function addAddressField() {
    setFormData((prev) => ({
      ...prev,
      additionalAddresses: [...prev.additionalAddresses, ''],
    }))
  }

  function updateAddressField(index: number, val: string) {
    setFormData((prev) => {
      const updated = [...prev.additionalAddresses]
      updated[index] = val
      return { ...prev, additionalAddresses: updated }
    })
  }

  function removeAddressField(index: number) {
    setFormData((prev) => ({
      ...prev,
      additionalAddresses: prev.additionalAddresses.filter((_, i) => i !== index),
    }))
  }

  // Education helpers
  function addEducationField() {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: 'MD',
          collegeName: '',
          yearOfCompletion: 2020,
          yearsOfExperience: 2,
        },
      ],
    }))
  }

  function updateEducationField(index: number, key: keyof EducationItem, val: any) {
    setFormData((prev) => {
      const updated = [...prev.education]
      updated[index] = { ...updated[index], [key]: val }
      return { ...prev, education: updated }
    })
  }

  function removeEducationField(index: number) {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  async function handleCreateDoctor(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Doctor name and email are required')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        ...formData,
        hospital: formData.hospitalAddress || formData.clinicAddress,
      }
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create doctor')

      setData((prev) => [json.data, ...prev])
      toast.success(`Dr. ${json.data.name} profile saved!`)
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
      const payload = {
        ...formData,
        hospital: formData.hospitalAddress || formData.clinicAddress,
      }
      const res = await fetch(`/api/admin/doctors/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update doctor')

      setData((prev) =>
        prev.map((d) => (d._id === editItem._id ? { ...d, ...json.data } : d))
      )
      toast.success('Doctor profile updated successfully')
      setEditItem(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleQuickStatusChange(doctor: DoctorItem, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/doctors/${doctor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update status')

      setData((prev) =>
        prev.map((d) => (d._id === doctor._id ? { ...d, availabilityStatus: newStatus } : d))
      )
      if (viewItem && viewItem._id === doctor._id) {
        setViewItem({ ...viewItem, availabilityStatus: newStatus })
      }
      toast.success(`Status changed to "${newStatus}"`)
    } catch (err: any) {
      toast.error(err.message)
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

  async function handleToggleVerification(doctor: DoctorItem) {
    try {
      const newStatus = !doctor.isVerified
      const res = await fetch(`/api/admin/doctors/${doctor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update verification status')

      setData((prev) =>
        prev.map((d) => (d._id === doctor._id ? { ...d, isVerified: newStatus } : d))
      )
      if (viewItem && viewItem._id === doctor._id) {
        setViewItem({ ...viewItem, isVerified: newStatus })
      }
      toast.success(`Dr. ${doctor.name} marked as ${newStatus ? 'Verified' : 'Not Verified'}`)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  function handleOpenAdjustModal(doctor: DoctorItem) {
    setAdjustDoc(doctor)
    setAdjustAction('credit')
    setAdjustAmount('')
    setAdjustType('Referral Bonus')
    setAdjustNote('')
  }

  async function handleSubmitAdjust(e: React.FormEvent) {
    e.preventDefault()
    if (!adjustDoc) return
    const amt = Number(adjustAmount)
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid positive amount')
      return
    }

    try {
      setAdjustSubmitting(true)
      const res = await fetch('/api/admin/wallets/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: adjustDoc._id,
          action: adjustAction,
          amount: amt,
          type: adjustType,
          description: adjustNote || `Manual ${adjustAction} by admin`,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to adjust balance')

      const newBalance = json.data?.balance ?? 0
      const newTotalEarnings = json.data?.totalEarnings ?? adjustDoc.totalEarnings ?? 0

      setData((prev) =>
        prev.map((d) =>
          d._id === adjustDoc._id
            ? {
                ...d,
                walletBalance: newBalance,
                totalEarnings: newTotalEarnings,
              }
            : d
        )
      )

      if (viewItem && viewItem._id === adjustDoc._id) {
        setViewItem((prev) =>
          prev
            ? {
                ...prev,
                walletBalance: newBalance,
                totalEarnings: newTotalEarnings,
              }
            : null
        )
      }

      toast.success(
        `Successfully ${adjustAction === 'credit' ? 'credited' : 'debited'} ₹${amt.toLocaleString('en-IN')} for Dr. ${adjustDoc.name}`
      )
      setAdjustDoc(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setAdjustSubmitting(false)
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Doctor Profile' />,
        cell: ({ row }) => {
          const doc = row.original
          const firstDegree = doc.education?.[0]?.degree
          return (
            <div className='flex items-center gap-3 py-1'>
              <img
                src={
                  doc.avatar ||
                  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face'
                }
                alt={doc.name}
                className='h-11 w-11 rounded-full object-cover border-2 border-teal-200 shrink-0 shadow-sm'
              />
              <div className='min-w-0'>
                <div className='font-semibold text-foreground truncate flex items-center gap-1.5'>
                  <span>{doc.name}</span>
                  {firstDegree && (
                    <span className='text-[11px] font-normal text-muted-foreground font-mono'>
                      ({firstDegree})
                    </span>
                  )}
                  {doc.isVerified && (
                    <CheckCircle2 className='h-3.5 w-3.5 text-teal-600 shrink-0' />
                  )}
                </div>
                <div className='text-xs text-muted-foreground flex items-center gap-2 mt-0.5'>
                  {doc.age && <span>{doc.age} yrs</span>}
                  {doc.phone && <span>&bull; {doc.phone}</span>}
                  <span className='truncate'>&bull; {doc.email}</span>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'specialization',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Speciality & Experience' />
        ),
        cell: ({ row }) => {
          const spec = row.getValue('specialization') as string || row.original.speciality || 'General'
          const exp = row.original.experienceYears || 4
          return (
            <div>
              <Badge variant='outline' className='bg-teal-50 text-teal-700 border-teal-200 font-medium'>
                {spec}
              </Badge>
              <div className='text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1'>
                <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
                <span>{row.original.rating || 3.9}</span>
                <span>&bull; {exp}+ Years Exp.</span>
              </div>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'hospitalAddress',
        header: 'Clinic & Hospital',
        cell: ({ row }) => {
          const doc = row.original
          return (
            <div className='text-xs max-w-48 space-y-0.5'>
              {doc.hospitalAddress || doc.hospital ? (
                <div className='font-medium text-foreground truncate flex items-center gap-1'>
                  <Building2 className='h-3 w-3 text-muted-foreground shrink-0' />
                  <span className='truncate'>{doc.hospitalAddress || doc.hospital}</span>
                </div>
              ) : null}
              {doc.clinicAddress ? (
                <div className='text-muted-foreground truncate flex items-center gap-1'>
                  <MapPin className='h-3 w-3 text-muted-foreground shrink-0' />
                  <span className='truncate'>{doc.clinicAddress}</span>
                </div>
              ) : null}
              {!doc.hospitalAddress && !doc.clinicAddress && !doc.hospital && (
                <span className='text-muted-foreground italic'>Address not added</span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'gender',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />,
        cell: ({ row }) => {
          const g = (row.getValue('gender') as string || row.original.gender || 'male').toLowerCase()
          const isFemale = g === 'female'
          return (
            <Badge variant='outline' className='text-xs font-normal border-muted'>
              {isFemale ? 'Female Doctor' : 'Male Doctor'}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          const g = (row.getValue(id) as string || row.original.gender || 'male').toLowerCase()
          return value.includes(g)
        },
      },
      {
        accessorKey: 'city',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Location' />,
        cell: ({ row }) => {
          const doc = row.original
          const loc = doc.city || doc.location || '—'
          return (
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <MapPin className='h-3 w-3 text-teal-600 shrink-0' />
              <span className='truncate'>{loc}</span>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          const c = ((row.getValue(id) as string) || row.original.city || row.original.location || '').toLowerCase()
          return value.some((v: string) => c.includes(v.toLowerCase()))
        },
      },
      {
        id: 'experienceLevel',
        accessorFn: (row) => {
          const exp = row.experienceYears ?? 0
          if (exp < 5) return '< 5 Years'
          if (exp <= 10) return '5 - 10 Years'
          if (exp <= 15) return '10 - 15 Years'
          return '15+ Years'
        },
        header: ({ column }) => <DataTableColumnHeader column={column} title='Experience' />,
        cell: ({ row }) => {
          return <span className='text-xs font-mono'>{row.getValue('experienceLevel')}</span>
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'availabilityStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Real-Time Status' />,
        cell: ({ row }) => {
          const status = (row.getValue('availabilityStatus') as string) || 'Available For Call'
          const meta = AVAILABILITY_OPTIONS.find(
            (o) => o.value.toLowerCase() === status.toLowerCase()
          ) || AVAILABILITY_OPTIONS[0]
          const Icon = meta.icon

          return (
            <Badge variant='outline' className={`${meta.color} font-medium text-xs flex items-center gap-1 py-1`}>
              <Icon className='h-3 w-3' />
              <span>{meta.label}</span>
              {meta.value === 'Available For Call' && <Check className='h-3 w-3 text-emerald-600' />}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        id: 'schedule',
        header: 'Work Schedule',
        cell: ({ row }) => {
          const sched = row.original.workSchedule
          return (
            <div className='text-[11px] max-w-44 text-muted-foreground'>
              <div className='truncate font-medium text-foreground'>
                OPD: {sched?.opdTiming || 'MON-FRI | 10 AM TO 1 PM'}
              </div>
              <div className='truncate'>
                Surgery: {sched?.surgeryTiming || 'MON-FRI | 10 AM TO 1 PM'}
              </div>
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Wallet Balance' />,
        cell: ({ row }) => {
          const bal = Number(row.getValue('walletBalance')) || 0
          return (
            <div className='flex items-center gap-1.5'>
              <Badge
                variant='outline'
                className='font-mono font-semibold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
              >
                ₹{bal.toLocaleString('en-IN')}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: 'isVerified',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Verification' />,
        cell: ({ row }) => {
          const isVer = Boolean(row.getValue('isVerified'))
          return isVer ? (
            <Badge className='bg-emerald-100 text-emerald-800 border-0 text-xs'>
              Verified
            </Badge>
          ) : (
            <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-300 text-xs'>
              Not Verified
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          const isVer = Boolean(row.getValue(id))
          return value.includes(String(isVer))
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
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem onClick={() => setViewItem(doc)}>
                  <Eye className='mr-2 h-4 w-4 text-muted-foreground' />
                  View Full Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(doc)}>
                  <Pencil className='mr-2 h-4 w-4 text-muted-foreground' />
                  Edit Profile Fields
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleVerification(doc)}>
                  {doc.isVerified ? (
                    <>
                      <XCircle className='mr-2 h-4 w-4 text-amber-600' />
                      Mark as Not Verified
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='mr-2 h-4 w-4 text-emerald-600' />
                      Mark as Verified
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <div className='px-2 py-1 text-[10px] uppercase font-semibold text-muted-foreground'>
                  Set Real-Time Status:
                </div>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleQuickStatusChange(doc, opt.value)}
                    className='text-xs'
                  >
                    <opt.icon className='mr-2 h-3.5 w-3.5' />
                    {opt.label}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleOpenAdjustModal(doc)}
                  className='text-emerald-700 dark:text-emerald-400'
                >
                  <ArrowDownUp className='mr-2 h-4 w-4' />
                  Adjust Balance
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = `/admin/wallets?search=${encodeURIComponent(doc.name)}`
                  }}
                  className='text-teal-700 dark:text-teal-400'
                >
                  <Wallet className='mr-2 h-4 w-4' />
                  Manage Wallet
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
      const degrees = (doc.education || []).map((e) => e.degree).join(' ')
      return (
        doc.name.toLowerCase().includes(search) ||
        doc.email.toLowerCase().includes(search) ||
        (doc.specialization || '').toLowerCase().includes(search) ||
        (doc.hospital || '').toLowerCase().includes(search) ||
        (doc.hospitalAddress || '').toLowerCase().includes(search) ||
        (doc.clinicAddress || '').toLowerCase().includes(search) ||
        (doc.city || '').toLowerCase().includes(search) ||
        (doc.location || '').toLowerCase().includes(search) ||
        (doc.gender || '').toLowerCase().includes(search) ||
        degrees.toLowerCase().includes(search) ||
        (doc.availabilityStatus || '').toLowerCase().includes(search)
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
            <Plus className='h-4 w-4 mr-1.5' /> Add Doctor Profile
          </Button>
          <Badge variant='outline' className='px-3 py-1 bg-teal-50 text-teal-700 border-teal-200'>
            {data.length} Registered Specialists
          </Badge>
        </div>
      </div>

      {/* Toolbar with faceted filters & search matching mobile Filter screen */}
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by name, degree, address, speciality, location, status...'
        filters={[
          {
            columnId: 'specialization',
            title: 'Speciality',
            options: SPECIALIZATIONS.map((s) => ({ label: s, value: s })),
          },
          {
            columnId: 'gender',
            title: 'Gender',
            options: [
              { label: 'Male Doctor', value: 'male' },
              { label: 'Female Doctor', value: 'female' },
            ],
          },
          {
            columnId: 'availabilityStatus',
            title: 'Availability',
            options: AVAILABILITY_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
              icon: o.icon,
            })),
          },
          {
            columnId: 'experienceLevel',
            title: 'Experience',
            options: [
              { label: '< 5 Years', value: '< 5 Years' },
              { label: '5 - 10 Years', value: '5 - 10 Years' },
              { label: '10 - 15 Years', value: '10 - 15 Years' },
              { label: '15+ Years', value: '15+ Years' },
            ],
          },
          {
            columnId: 'isVerified',
            title: 'Verification',
            options: [
              { label: 'Verified', value: 'true' },
              { label: 'Not Verified', value: 'false' },
            ],
          },
          {
            columnId: 'city',
            title: 'Location',
            options: locationOptions,
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

      {/* Create / Edit Form Dialog */}
      <Dialog
        open={createOpen || !!editItem}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false)
            setEditItem(null)
          }
        }}
      >
        <DialogContent className='max-w-2xl max-h-[92vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl'>
              <Stethoscope className='h-5 w-5 text-teal-600' />
              {editItem ? `Edit Doctor Profile: ${editItem.name}` : 'Create Doctor Profile'}
            </DialogTitle>
            <DialogDescription>
              Configure basic details, education, clinic/hospital addresses, work schedules, and real-time availability.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editItem ? handleUpdateDoctor : handleCreateDoctor} className='space-y-6 pt-2'>
            {/* Section 1: Basic Detail */}
            <div className='p-4 border rounded-xl bg-card space-y-4'>
              <div className='flex items-center gap-2 font-bold text-sm text-foreground border-b pb-2'>
                <User className='h-4 w-4 text-teal-600' />
                <span>Basic Detail</span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-name'>Name *</Label>
                  <Input
                    id='f-name'
                    placeholder='Dr ANIL'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-email'>Email *</Label>
                  <Input
                    id='f-email'
                    type='email'
                    placeholder='doctor@hospital.com'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-phone'>Phone Number</Label>
                  <Input
                    id='f-phone'
                    placeholder='+91 98765 43210'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                {!editItem && (
                  <div className='space-y-1.5'>
                    <Label htmlFor='f-pass'>Password</Label>
                    <Input
                      id='f-pass'
                      type='password'
                      placeholder='Default: doctor123'
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                )}
                <div className='space-y-1.5'>
                  <Label htmlFor='f-age'>Age</Label>
                  <Input
                    id='f-age'
                    type='number'
                    min={20}
                    max={100}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-dob'>Date of Birth</Label>
                  <Input
                    id='f-dob'
                    type='date'
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-gender'>Gender</Label>
                  <Select
                    value={formData.gender || 'male'}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                  >
                    <SelectTrigger id='f-gender'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>Male Doctor</SelectItem>
                      <SelectItem value='female'>Female Doctor</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-spec'>Speciality</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(val) => setFormData({ ...formData, specialization: val })}
                  >
                    <SelectTrigger id='f-spec'>
                      <SelectValue />
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
                  <Label htmlFor='f-city'>City / Area (Location)</Label>
                  <Input
                    id='f-city'
                    placeholder='e.g. Mumbai, Bandra'
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-fee'>Consultation Fee (₹)</Label>
                  <Input
                    id='f-fee'
                    type='number'
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData({ ...formData, consultationFee: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-clinic'>Clinic Address</Label>
                  <Input
                    id='f-clinic'
                    placeholder='House 123 newyork'
                    value={formData.clinicAddress}
                    onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-hosp'>Hospital Address</Label>
                  <Input
                    id='f-hosp'
                    placeholder='City Hospital'
                    value={formData.hospitalAddress}
                    onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                  />
                </div>
              </div>

              {/* Additional Addresses */}
              {formData.additionalAddresses.map((addr, idx) => (
                <div key={idx} className='flex items-center gap-2'>
                  <Input
                    placeholder={`Additional Address #${idx + 1}`}
                    value={addr}
                    onChange={(e) => updateAddressField(idx, e.target.value)}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeAddressField(idx)}
                    className='text-destructive'
                  >
                    <Trash className='h-4 w-4' />
                  </Button>
                </div>
              ))}

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addAddressField}
                className='w-full text-teal-700 border-teal-300 hover:bg-teal-50'
              >
                <Plus className='h-4 w-4 mr-1' /> Add Address +
              </Button>
            </div>

            {/* Section 2: Education & Experience */}
            <div className='p-4 border rounded-xl bg-card space-y-4'>
              <div className='flex items-center gap-2 font-bold text-sm text-foreground border-b pb-2'>
                <GraduationCap className='h-4 w-4 text-teal-600' />
                <span>Education & Experience</span>
              </div>

              {formData.education.map((edu, idx) => (
                <div key={idx} className='p-3 border rounded-lg bg-muted/20 space-y-3 relative'>
                  {formData.education.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute top-2 right-2 text-destructive h-7 w-7 p-0'
                      onClick={() => removeEducationField(idx)}
                    >
                      <Trash className='h-3.5 w-3.5' />
                    </Button>
                  )}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <Label className='text-xs'>Degree</Label>
                      <Select
                        value={edu.degree || 'MBBS'}
                        onValueChange={(val) => updateEducationField(idx, 'degree', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEGREES.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs'>Collage Name</Label>
                      <Input
                        placeholder='e.g. AIIMS New Delhi'
                        value={edu.collegeName || ''}
                        onChange={(e) => updateEducationField(idx, 'collegeName', e.target.value)}
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs'>Year of Completion</Label>
                      <Input
                        placeholder='e.g. 2018'
                        value={edu.yearOfCompletion || ''}
                        onChange={(e) =>
                          updateEducationField(idx, 'yearOfCompletion', e.target.value)
                        }
                      />
                    </div>

                    <div className='space-y-1'>
                      <Label className='text-xs'>Years of Experience</Label>
                      <Input
                        type='number'
                        min={0}
                        placeholder='4'
                        value={edu.yearsOfExperience || 0}
                        onChange={(e) =>
                          updateEducationField(idx, 'yearsOfExperience', Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addEducationField}
                className='w-full text-teal-700 border-teal-300 hover:bg-teal-50'
              >
                <Plus className='h-4 w-4 mr-1' /> Add Education +
              </Button>
            </div>

            {/* Section 3: Work Schedule */}
            <div className='p-4 border rounded-xl bg-card space-y-4'>
              <div className='flex items-center gap-2 font-bold text-sm text-foreground border-b pb-2'>
                <Clock className='h-4 w-4 text-teal-600' />
                <span>Work Schedule</span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='f-opd' className='flex items-center gap-1 text-xs'>
                    <Clock className='h-3.5 w-3.5 text-teal-600' /> OPD Timing & Days
                  </Label>
                  <Input
                    id='f-opd'
                    placeholder='MON-FRI | 10 AM TO 1 PM'
                    value={formData.workSchedule.opdTiming}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workSchedule: { ...formData.workSchedule, opdTiming: e.target.value },
                      })
                    }
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='f-surg' className='flex items-center gap-1 text-xs'>
                    <Clock className='h-3.5 w-3.5 text-teal-600' /> Surgery Timing & Days
                  </Label>
                  <Input
                    id='f-surg'
                    placeholder='MON-FRI | 10 AM TO 1 PM'
                    value={formData.workSchedule.surgeryTiming}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workSchedule: { ...formData.workSchedule, surgeryTiming: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Real Time Availability Status */}
            <div className='p-4 border rounded-xl bg-card space-y-3'>
              <div className='flex items-center justify-between border-b pb-2'>
                <div className='flex items-center gap-2 font-bold text-sm text-foreground'>
                  <Activity className='h-4 w-4 text-teal-600' />
                  <span>Real Time Availability status</span>
                </div>
                <span className='text-[11px] text-muted-foreground flex items-center gap-1'>
                  <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                  Real-time status to other doctors
                </span>
              </div>

              {/* Status pills selector matching screenshot */}
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1'>
                {AVAILABILITY_OPTIONS.map((opt) => {
                  const isSelected = formData.availabilityStatus === opt.value
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type='button'
                      onClick={() => setFormData({ ...formData, availabilityStatus: opt.value })}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? `${opt.activeBg} border-transparent shadow-sm ring-2 ring-offset-1 ring-teal-500`
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted border-border'
                      }`}
                    >
                      <Icon className='h-3.5 w-3.5' />
                      <span>{opt.label}</span>
                      {isSelected && opt.value === 'Available For Call' && (
                        <Check className='h-3 w-3 ml-0.5' />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Verification Switch */}
            <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/40'>
              <div>
                <Label htmlFor='f-verified' className='font-medium cursor-pointer'>
                  Mark as Verified Specialist
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Physician credentials marked active immediately across referrals.
                </p>
              </div>
              <Switch
                id='f-verified'
                checked={formData.isVerified}
                onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
              />
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setCreateOpen(false)
                  setEditItem(null)
                }}
              >
                Cancel
              </Button>
              <Button type='submit' className='bg-teal-600 hover:bg-teal-700' disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Doctor Dossier Dialog matching attached screen */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className='max-w-lg max-h-[92vh] overflow-y-auto p-6'>
            <DialogHeader>
              <DialogTitle className='text-lg font-bold'>Doctor Profile</DialogTitle>
              <DialogDescription>Full physician registry dossier and real-time telemetry</DialogDescription>
            </DialogHeader>

            <div className='space-y-4 pt-2'>
              {/* Header card matching the top of the mobile screen */}
              <div className='p-4 bg-gradient-to-r from-teal-50/70 to-blue-50/50 dark:from-teal-950/40 dark:to-blue-950/20 border border-teal-200/70 rounded-2xl flex items-center gap-4'>
                <img
                  src={
                    viewItem.avatar ||
                    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face'
                  }
                  alt={viewItem.name}
                  className='h-16 w-16 rounded-full object-cover border-2 border-white shadow-md'
                />
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-bold text-lg text-foreground truncate'>{viewItem.name}</h3>
                    {viewItem.isVerified && (
                      <CheckCircle2 className='h-4 w-4 text-teal-600 shrink-0' />
                    )}
                  </div>
                  <p className='text-sm font-semibold text-teal-700 dark:text-teal-400'>
                    {viewItem.specialization || viewItem.speciality || 'Cardiologist'}
                  </p>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground mt-0.5'>
                    <Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400' />
                    <span className='font-semibold text-foreground'>{viewItem.rating || 3.9}</span>
                    <span>| {viewItem.experienceYears || 15}+ Years Exp.</span>
                  </div>
                </div>
              </div>

              {/* Doctor Wallet & Financial Health Section */}
              <div className='p-4 border border-emerald-500/30 rounded-xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-background dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-card space-y-3 shadow-xs'>
                <div className='flex items-center justify-between border-b border-emerald-200/50 dark:border-emerald-800/40 pb-2'>
                  <div className='flex items-center gap-2 font-bold text-foreground text-sm'>
                    <div className='h-7 w-7 rounded-lg bg-emerald-600/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 flex items-center justify-center'>
                      <Wallet className='h-4 w-4' />
                    </div>
                    <span>Doctor Wallet & Financial Health</span>
                  </div>
                  <Badge variant='outline' className='bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[11px] font-medium flex items-center gap-1.5 py-0.5 px-2'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                    Active Wallet
                  </Badge>
                </div>

                <div className='grid grid-cols-2 gap-2.5'>
                  {/* Current Available Balance */}
                  <div className='p-3 bg-card border border-emerald-200/70 dark:border-emerald-900/60 rounded-xl shadow-xs'>
                    <span className='text-muted-foreground text-[11px] font-medium flex items-center gap-1'>
                      <Coins className='h-3 w-3 text-emerald-600 dark:text-emerald-400' /> Available Balance
                    </span>
                    <span className='text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 block'>
                      ₹{(viewItem.walletBalance || 0).toLocaleString('en-IN')}
                    </span>
                    <span className='text-[10px] text-muted-foreground'>Ready for payouts & withdraw</span>
                  </div>

                  {/* Total Lifetime Earnings */}
                  <div className='p-3 bg-card border border-teal-200/70 dark:border-teal-900/60 rounded-xl shadow-xs'>
                    <span className='text-muted-foreground text-[11px] font-medium flex items-center gap-1'>
                      <TrendingUp className='h-3 w-3 text-teal-600 dark:text-teal-400' /> Total Earnings
                    </span>
                    <span className='text-xl font-bold font-mono text-teal-700 dark:text-teal-400 mt-0.5 block'>
                      ₹{(viewItem.totalEarnings || 0).toLocaleString('en-IN')}
                    </span>
                    <span className='text-[10px] text-muted-foreground'>Accumulated referral rewards</span>
                  </div>
                </div>

                {/* Referral Flow & Action Buttons */}
                <div className='flex items-center justify-between pt-1 gap-2 flex-wrap'>
                  <div className='text-[11px] text-muted-foreground'>
                    Referral Flow: <strong className='text-foreground'>{viewItem.sentReferrals ?? 0} sent</strong> &bull; <strong className='text-foreground'>{viewItem.receivedReferrals ?? 0} received</strong>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      className='h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40 gap-1'
                      onClick={() => handleOpenAdjustModal(viewItem)}
                    >
                      <ArrowDownUp className='h-3 w-3' />
                      Adjust Balance
                    </Button>
                    <Button
                      type='button'
                      size='sm'
                      variant='ghost'
                      className='h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2'
                      onClick={() => {
                        window.location.href = `/admin/wallets?search=${encodeURIComponent(viewItem.name)}`
                      }}
                    >
                      <ExternalLink className='h-3 w-3' />
                      Manage Wallet
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section 1: Basic Detail */}
              <div className='p-4 border rounded-xl bg-card space-y-2.5 text-xs'>
                <div className='flex items-center gap-1.5 font-bold text-foreground text-sm border-b pb-1.5'>
                  <User className='h-3.5 w-3.5 text-teal-600' /> Basic Detail
                </div>

                <div className='grid grid-cols-2 gap-2 pt-1'>
                  <div>
                    <span className='text-muted-foreground block'>Name</span>
                    <span className='font-semibold text-foreground text-sm'>{viewItem.name}</span>
                  </div>
                  <div>
                    <span className='text-muted-foreground block'>Gender</span>
                    <span className='font-semibold text-foreground capitalize'>
                      {viewItem.gender?.toLowerCase() === 'female' ? 'Female Doctor' : 'Male Doctor'}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground block'>Age</span>
                    <span className='font-semibold text-foreground'>{viewItem.age || 35}</span>
                  </div>
                  <div>
                    <span className='text-muted-foreground block'>Date of Birth</span>
                    <span className='font-medium text-foreground'>
                      {viewItem.dateOfBirth
                        ? new Date(viewItem.dateOfBirth).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                          })
                        : '15 May'}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground block'>Speciality</span>
                    <span className='font-medium text-teal-700 dark:text-teal-400'>
                      {viewItem.specialization || viewItem.speciality || 'Cardiology'}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground block'>City / Location</span>
                    <span className='font-medium text-foreground'>
                      {viewItem.city || viewItem.location || 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className='pt-1 space-y-1.5'>
                  <div>
                    <span className='text-muted-foreground flex items-center gap-1'>
                      <MapPin className='h-3 w-3 text-teal-600' /> Clinic Address
                    </span>
                    <span className='font-medium text-foreground pl-4 block'>
                      {viewItem.clinicAddress || 'House 123 newyork'}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground flex items-center gap-1'>
                      <Building2 className='h-3 w-3 text-teal-600' /> Hospital Address
                    </span>
                    <span className='font-medium text-foreground pl-4 block'>
                      {viewItem.hospitalAddress || viewItem.hospital || 'City Hospital'}
                    </span>
                  </div>
                  {viewItem.additionalAddresses && viewItem.additionalAddresses.length > 0 && (
                    <div>
                      <span className='text-muted-foreground pl-4 block font-semibold'>
                        Additional Addresses ({viewItem.additionalAddresses.length}):
                      </span>
                      {viewItem.additionalAddresses.map((addr, i) => (
                        <span key={i} className='font-medium text-foreground pl-4 block'>
                          &bull; {addr}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Education & Experience */}
              <div className='p-4 border rounded-xl bg-card space-y-2.5 text-xs'>
                <div className='flex items-center gap-1.5 font-bold text-foreground text-sm border-b pb-1.5'>
                  <GraduationCap className='h-3.5 w-3.5 text-teal-600' /> Education & Experience
                </div>

                {viewItem.education && viewItem.education.length > 0 ? (
                  viewItem.education.map((edu, idx) => (
                    <div key={idx} className='p-2.5 bg-muted/30 rounded-lg space-y-1'>
                      <div className='flex items-center justify-between'>
                        <span className='font-bold text-foreground text-sm'>{edu.degree || 'MBBS'}</span>
                        <span className='text-muted-foreground font-mono'>
                          Completed: {edu.yearOfCompletion || '2018'}
                        </span>
                      </div>
                      <div className='text-muted-foreground'>
                        College: <strong>{edu.collegeName || 'Medical Institute'}</strong>
                      </div>
                      <div className='text-teal-700 dark:text-teal-400 font-medium'>
                        {edu.yearsOfExperience || viewItem.experienceYears || 4} Years Experience
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='p-2.5 bg-muted/30 rounded-lg space-y-1'>
                    <div className='flex items-center justify-between'>
                      <span className='font-bold text-foreground text-sm'>MBBS</span>
                      <span className='text-muted-foreground font-mono'>Completed: 2018</span>
                    </div>
                    <div className='text-muted-foreground'>College: Medical Institute</div>
                    <div className='text-teal-700 dark:text-teal-400 font-medium'>
                      {viewItem.experienceYears || 4} Years Experience
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Work Schedule */}
              <div className='p-4 border rounded-xl bg-card space-y-2.5 text-xs'>
                <div className='flex items-center gap-1.5 font-bold text-foreground text-sm border-b pb-1.5'>
                  <Clock className='h-3.5 w-3.5 text-teal-600' /> Work Schedule
                </div>

                <div className='grid grid-cols-2 gap-3 pt-1'>
                  <div className='p-2.5 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 rounded-lg'>
                    <span className='font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-1 mb-1'>
                      <Clock className='h-3 w-3' /> OPD Timing & Days
                    </span>
                    <Badge variant='outline' className='bg-white dark:bg-slate-900 text-teal-700 font-mono text-[10px]'>
                      {viewItem.workSchedule?.opdTiming || 'MON-FRI | 10 AM TO 1 PM'}
                    </Badge>
                  </div>

                  <div className='p-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 rounded-lg'>
                    <span className='font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1 mb-1'>
                      <Clock className='h-3 w-3' /> Surgery Timing & Days
                    </span>
                    <Badge variant='outline' className='bg-white dark:bg-slate-900 text-blue-700 font-mono text-[10px]'>
                      {viewItem.workSchedule?.surgeryTiming || 'MON-FRI | 10 AM TO 1 PM'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Section 4: Real Time Availability status */}
              <div className='p-4 border rounded-xl bg-card space-y-2 text-xs'>
                <div className='flex items-center justify-between border-b pb-1.5'>
                  <div className='flex items-center gap-1.5 font-bold text-foreground text-sm'>
                    <Activity className='h-3.5 w-3.5 text-teal-600' /> Real Time Availability status
                  </div>
                  <span className='text-[10px] text-muted-foreground flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                    Live to network
                  </span>
                </div>

                <div className='pt-2 flex flex-wrap gap-2'>
                  {AVAILABILITY_OPTIONS.map((opt) => {
                    const isActive =
                      (viewItem.availabilityStatus || 'Available For Call').toLowerCase() ===
                      opt.value.toLowerCase()
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => handleQuickStatusChange(viewItem, opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isActive
                            ? `${opt.activeBg} border-transparent shadow-sm ring-2 ring-offset-1 ring-teal-500`
                            : 'bg-muted/40 text-muted-foreground hover:bg-muted border-border'
                        }`}
                      >
                        <Icon className='h-3.5 w-3.5' />
                        <span>{opt.label}</span>
                        {isActive && opt.value === 'Available For Call' && (
                          <Check className='h-3 w-3 ml-0.5' />
                        )}
                      </button>
                    )
                  })}
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
                <Pencil className='mr-1.5 h-4 w-4' /> Edit Doctor Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Adjust Doctor Wallet Dialog */}
      {adjustDoc && (
        <Dialog open={!!adjustDoc} onOpenChange={(open) => !open && setAdjustDoc(null)}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <div className='p-1.5 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300'>
                  <Wallet className='h-4 w-4' />
                </div>
                <span>Adjust Doctor Wallet</span>
              </DialogTitle>
              <DialogDescription>
                Directly adjust wallet balance for <strong>Dr. {adjustDoc.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitAdjust} className='space-y-4 pt-1'>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  type='button'
                  variant={adjustAction === 'credit' ? 'default' : 'outline'}
                  className={
                    adjustAction === 'credit'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                      : 'border-muted-foreground/30'
                  }
                  onClick={() => setAdjustAction('credit')}
                >
                  + Credit (Add)
                </Button>
                <Button
                  type='button'
                  variant={adjustAction === 'debit' ? 'destructive' : 'outline'}
                  className={
                    adjustAction === 'debit'
                      ? 'font-semibold'
                      : 'border-muted-foreground/30'
                  }
                  onClick={() => setAdjustAction('debit')}
                >
                  - Debit (Deduct)
                </Button>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='adjust-amount'>Amount (₹)</Label>
                <div className='relative'>
                  <span className='absolute left-3 top-2.5 text-muted-foreground font-mono font-semibold'>₹</span>
                  <Input
                    id='adjust-amount'
                    type='number'
                    min='1'
                    step='any'
                    className='pl-8 font-mono text-base'
                    placeholder='1000'
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='adjust-type'>Adjustment Category</Label>
                <Select value={adjustType} onValueChange={setAdjustType}>
                  <SelectTrigger id='adjust-type'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Referral Bonus'>Referral Bonus</SelectItem>
                    <SelectItem value='Consultation Settlement'>Consultation Settlement</SelectItem>
                    <SelectItem value='Administrative Adjustment'>Administrative Adjustment</SelectItem>
                    <SelectItem value='Correction'>Correction / Rectification</SelectItem>
                    <SelectItem value='Bonus'>Special Incentive / Bonus</SelectItem>
                    <SelectItem value='Penalty'>Penalty / Deduction</SelectItem>
                    <SelectItem value='Other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='adjust-note'>Reason / Audit Memo</Label>
                <Input
                  id='adjust-note'
                  placeholder='e.g. Referral settlement for case #RF-809'
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                />
              </div>

              {/* Real-time projected preview */}
              <div className='p-3 bg-muted/50 rounded-xl border space-y-1.5 text-xs'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Current Balance:</span>
                  <span className='font-mono font-medium'>₹{(adjustDoc.walletBalance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Adjustment:</span>
                  <span
                    className={`font-mono font-medium ${
                      adjustAction === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {adjustAction === 'credit' ? '+' : '-'}₹{(Number(adjustAmount) || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className='flex justify-between pt-1.5 border-t font-semibold text-foreground text-sm'>
                  <span>Projected Balance:</span>
                  <span className='font-mono text-teal-700 dark:text-teal-400'>
                    ₹{Math.max(
                      0,
                      adjustAction === 'credit'
                        ? (adjustDoc.walletBalance || 0) + (Number(adjustAmount) || 0)
                        : (adjustDoc.walletBalance || 0) - (Number(adjustAmount) || 0)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <DialogFooter className='gap-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setAdjustDoc(null)}
                  disabled={adjustSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='bg-teal-600 hover:bg-teal-700'
                  disabled={adjustSubmitting || !adjustAmount || Number(adjustAmount) <= 0}
                >
                  {adjustSubmitting ? 'Processing...' : `Confirm ${adjustAction === 'credit' ? 'Credit' : 'Debit'}`}
                </Button>
              </DialogFooter>
            </form>
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
