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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { toast } from 'sonner'
import {
  CreditCard,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Check,
  Sparkles,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export interface PlanItem {
  _id: string
  name: string
  tagline?: string
  badge?: string
  priceMonthly: number
  priceAnnually: number
  annualSavingsText?: string
  features: string[]
  isPopular?: boolean
  isActive: boolean
  createdAt?: string
}

export interface DoctorSubscriptionItem {
  _id: string
  doctorId?: {
    _id: string
    name: string
    specialization?: string
    hospital?: string
    email?: string
  }
  planId?: {
    _id: string
    name: string
    priceMonthly?: number
    priceAnnually?: number
  }
  amount: number
  billingCycle: string
  startDate: string
  endDate: string
  status: string
}

export function SubscriptionsClient({
  initialPlans,
  initialSubscriptions,
}: {
  initialPlans: PlanItem[]
  initialSubscriptions: DoctorSubscriptionItem[]
}) {
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans)
  const [subscriptions] = useState<DoctorSubscriptionItem[]>(initialSubscriptions)

  // Plan table states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<PlanItem | null>(null)
  const [viewItem, setViewItem] = useState<PlanItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tagline: 'Better care with priority access',
    badge: 'Value Provider',
    priceMonthly: 999,
    priceAnnually: 9999,
    annualSavingsText: 'Save ₹1,200/year',
    features: 'Unlimited Patient Referrals\nInstant Specialist Connect\nPriority Doctor Support',
    isPopular: false,
    isActive: true,
  })

  function resetForm() {
    setFormData({
      name: '',
      tagline: 'Better care with priority access',
      badge: 'Value Provider',
      priceMonthly: 999,
      priceAnnually: 9999,
      annualSavingsText: 'Save ₹1,200/year',
      features: 'Unlimited Patient Referrals\nInstant Specialist Connect\nPriority Doctor Support',
      isPopular: false,
      isActive: true,
    })
  }

  function handleOpenCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function handleOpenEdit(plan: PlanItem) {
    setFormData({
      name: plan.name || '',
      tagline: plan.tagline || '',
      badge: plan.badge || '',
      priceMonthly: plan.priceMonthly || 999,
      priceAnnually: plan.priceAnnually || 9999,
      annualSavingsText: plan.annualSavingsText || '',
      features: (plan.features || []).join('\n'),
      isPopular: Boolean(plan.isPopular),
      isActive: plan.isActive ?? true,
    })
    setEditItem(plan)
  }

  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Plan name is required')
      return
    }

    try {
      setSubmitting(true)
      const featuresArray = formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)

      const payload = {
        ...formData,
        features: featuresArray,
      }

      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create plan')

      setPlans((prev) => [...prev, json.data])
      toast.success(`Plan "${json.data.name}" created successfully`)
      setCreateOpen(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdatePlan(e: React.FormEvent) {
    e.preventDefault()
    if (!editItem) return

    try {
      setSubmitting(true)
      const featuresArray = formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)

      const payload = {
        ...formData,
        features: featuresArray,
      }

      const res = await fetch(`/api/admin/subscriptions/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update plan')

      setPlans((prev) =>
        prev.map((p) => (p._id === editItem._id ? { ...p, ...json.data } : p))
      )
      toast.success('Subscription plan updated')
      setEditItem(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeletePlan() {
    if (!deleteId) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/subscriptions/${deleteId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete plan')

      setPlans((prev) => prev.filter((p) => p._id !== deleteId))
      toast.success('Subscription plan removed')
      setDeleteId(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<PlanItem>[]>(
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Plan Title' />,
        cell: ({ row }) => {
          const plan = row.original
          return (
            <div className='py-1'>
              <div className='font-semibold text-foreground flex items-center gap-2'>
                <span>{plan.name}</span>
                {plan.badge && (
                  <Badge className='bg-purple-100 text-purple-800 border-0 text-[10px]'>
                    {plan.badge}
                  </Badge>
                )}
                {plan.isPopular && (
                  <Badge className='bg-amber-100 text-amber-800 border-0 text-[10px] flex items-center gap-0.5'>
                    <Sparkles className='h-2.5 w-2.5' /> Popular
                  </Badge>
                )}
              </div>
              <div className='text-xs text-muted-foreground mt-0.5'>
                {plan.tagline || 'Doctor membership plan'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'priceMonthly',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Monthly Price' />,
        cell: ({ row }) => {
          const val = row.getValue('priceMonthly') as number
          return <span className='font-mono font-semibold text-foreground'>₹{val}</span>
        },
      },
      {
        accessorKey: 'priceAnnually',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Annual Price' />,
        cell: ({ row }) => {
          const val = row.getValue('priceAnnually') as number
          const savings = row.original.annualSavingsText
          return (
            <div>
              <span className='font-mono font-semibold text-foreground'>₹{val}</span>
              {savings && <div className='text-[11px] text-emerald-600 font-medium'>{savings}</div>}
            </div>
          )
        },
      },
      {
        id: 'features',
        header: 'Included Features',
        cell: ({ row }) => {
          const feats = row.original.features || []
          return (
            <div className='text-xs text-muted-foreground'>
              <span className='font-medium text-foreground'>{feats.length} features</span>
              <span className='block truncate max-w-xs'>
                {feats.slice(0, 2).join(' &bull; ')}
                {feats.length > 2 ? ' ...' : ''}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
          const active = Boolean(row.getValue('isActive'))
          return active ? (
            <Badge className='bg-emerald-100 text-emerald-800 border-0 text-xs'>
              Active
            </Badge>
          ) : (
            <Badge variant='outline' className='text-muted-foreground text-xs'>
              Inactive
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(String(row.getValue(id)))
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const plan = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem onClick={() => setViewItem(plan)}>
                  <Eye className='mr-2 h-4 w-4 text-muted-foreground' />
                  Preview Card
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(plan)}>
                  <Pencil className='mr-2 h-4 w-4 text-muted-foreground' />
                  Edit Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteId(plan._id)}
                  className='text-destructive focus:text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Plan
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
    data: plans,
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
      const plan = row.original
      return (
        plan.name.toLowerCase().includes(search) ||
        (plan.tagline || '').toLowerCase().includes(search) ||
        (plan.badge || '').toLowerCase().includes(search)
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
    <Tabs defaultValue='plans' className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <TabsList>
          <TabsTrigger value='plans' className='gap-2'>
            <CreditCard className='h-4 w-4' /> Subscription Plans ({plans.length})
          </TabsTrigger>
          <TabsTrigger value='memberships' className='gap-2'>
            <User className='h-4 w-4' /> Doctor Memberships ({subscriptions.length})
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Plans Tab with DataTable & CRUD */}
      <TabsContent value='plans' className='space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <Button onClick={handleOpenCreate} className='bg-purple-600 hover:bg-purple-700 text-white'>
            <Plus className='h-4 w-4 mr-1.5' /> Create Subscription Plan
          </Button>
        </div>

        <DataTableToolbar
          table={table}
          searchPlaceholder='Filter plans by title or tagline...'
          filters={[
            {
              columnId: 'isActive',
              title: 'Status',
              options: [
                { label: 'Active', value: 'true', icon: CheckCircle2 },
                { label: 'Inactive', value: 'false', icon: XCircle },
              ],
            },
          ]}
        />

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
                    No plans found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />

        {/* Live Plans Cards Preview */}
        <div className='mt-8 pt-6 border-t'>
          <h3 className='text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-4'>
            Live Doctor Portal Card Preview
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {plans.map((plan) => (
              <Card
                key={plan._id}
                className={`relative overflow-hidden ${
                  plan.isPopular ? 'border-2 border-purple-500 shadow-md' : 'shadow-sm'
                }`}
              >
                {plan.badge && (
                  <div className='absolute top-4 right-4'>
                    <Badge className='bg-purple-100 text-purple-800 border-0 flex items-center gap-1 font-semibold text-xs'>
                      <Sparkles className='h-3 w-3' /> {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className='text-xl font-bold text-foreground'>{plan.name}</CardTitle>
                  <CardDescription>{plan.tagline || 'Doctor membership plan'}</CardDescription>
                  <div className='mt-4 flex items-baseline gap-2'>
                    <span className='text-3xl font-extrabold text-foreground'>
                      ₹{plan.priceAnnually}
                    </span>
                    <span className='text-sm text-muted-foreground'>/ year</span>
                    <span className='text-xs text-muted-foreground ml-1'>
                      (or ₹{plan.priceMonthly}/mo)
                    </span>
                  </div>
                  {plan.annualSavingsText && (
                    <p className='text-xs font-semibold text-emerald-600 mt-1'>
                      {plan.annualSavingsText}
                    </p>
                  )}
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2'>
                    Included Features:
                  </div>
                  {plan.features?.map((feat, idx) => (
                    <div key={idx} className='flex items-start gap-2 text-sm'>
                      <div className='rounded-full bg-emerald-100 p-0.5 text-emerald-600 mt-0.5 shrink-0'>
                        <Check className='h-3.5 w-3.5' />
                      </div>
                      <span className='text-foreground'>{feat}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Doctor Memberships Tab */}
      <TabsContent value='memberships' className='space-y-4'>
        <Card className='shadow-sm'>
          <CardHeader>
            <CardTitle>Doctor Subscriptions & Renewals</CardTitle>
            <CardDescription>Live active doctor memberships and billing statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b text-muted-foreground text-left'>
                    <th className='pb-3 font-medium'>Doctor</th>
                    <th className='pb-3 font-medium'>Plan</th>
                    <th className='pb-3 font-medium'>Cycle & Amount</th>
                    <th className='pb-3 font-medium'>Valid Until</th>
                    <th className='pb-3 font-medium'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='py-6 text-center text-muted-foreground'>
                        No active subscriptions.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub._id} className='hover:bg-muted/40 transition-colors'>
                        <td className='py-4'>
                          <div className='font-semibold text-foreground flex items-center gap-1.5'>
                            <User className='h-3.5 w-3.5 text-muted-foreground' />
                            {sub.doctorId?.name}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {sub.doctorId?.specialization} &bull; {sub.doctorId?.hospital}
                          </div>
                        </td>
                        <td className='py-4 font-medium'>{sub.planId?.name || 'Standard'}</td>
                        <td className='py-4'>
                          <div className='font-semibold text-foreground'>₹{sub.amount}</div>
                          <span className='text-xs text-muted-foreground capitalize'>
                            {sub.billingCycle}
                          </span>
                        </td>
                        <td className='py-4 text-xs font-mono'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3 text-muted-foreground' />
                            {new Date(sub.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className='py-4'>
                          <Badge className='bg-emerald-100 text-emerald-800 border-0'>
                            {sub.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Create Plan Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5 text-purple-600' />
              Create Subscription Plan
            </DialogTitle>
            <DialogDescription>
              Define doctor membership tiers, pricing, and feature allowances.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePlan} className='space-y-4 pt-2'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='plan-name'>Plan Name *</Label>
                <Input
                  id='plan-name'
                  placeholder='e.g. Premium Pro'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='plan-badge'>Badge Text</Label>
                <Input
                  id='plan-badge'
                  placeholder='e.g. Most Popular / Value Provider'
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='plan-monthly'>Monthly Price (₹) *</Label>
                <Input
                  id='plan-monthly'
                  type='number'
                  value={formData.priceMonthly}
                  onChange={(e) =>
                    setFormData({ ...formData, priceMonthly: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='plan-annually'>Annual Price (₹) *</Label>
                <Input
                  id='plan-annually'
                  type='number'
                  value={formData.priceAnnually}
                  onChange={(e) =>
                    setFormData({ ...formData, priceAnnually: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='plan-tagline'>Tagline</Label>
              <Input
                id='plan-tagline'
                placeholder='Better care with priority access'
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='plan-savings'>Annual Savings Highlight</Label>
              <Input
                id='plan-savings'
                placeholder='Save ₹1,200/year'
                value={formData.annualSavingsText}
                onChange={(e) => setFormData({ ...formData, annualSavingsText: e.target.value })}
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='plan-features'>Features List (One feature per line)</Label>
              <Textarea
                id='plan-features'
                rows={4}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>

            <div className='space-y-3 pt-2'>
              <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/30'>
                <div>
                  <Label htmlFor='plan-popular' className='font-medium cursor-pointer'>
                    Highlight as Popular Plan
                  </Label>
                  <p className='text-xs text-muted-foreground'>Displays high-contrast border and badge.</p>
                </div>
                <Switch
                  id='plan-popular'
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                />
              </div>

              <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/30'>
                <div>
                  <Label htmlFor='plan-active' className='font-medium cursor-pointer'>
                    Active for Subscriptions
                  </Label>
                  <p className='text-xs text-muted-foreground'>Available during doctor portal checkout.</p>
                </div>
                <Switch
                  id='plan-active'
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' className='bg-purple-600 hover:bg-purple-700' disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Pencil className='h-5 w-5 text-purple-600' />
                Edit Plan: {editItem.name}
              </DialogTitle>
              <DialogDescription>Modify pricing, features, and popularity settings.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePlan} className='space-y-4 pt-2'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-plan-name'>Plan Name</Label>
                  <Input
                    id='edit-plan-name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-plan-badge'>Badge</Label>
                  <Input
                    id='edit-plan-badge'
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-plan-monthly'>Monthly Price (₹)</Label>
                  <Input
                    id='edit-plan-monthly'
                    type='number'
                    value={formData.priceMonthly}
                    onChange={(e) =>
                      setFormData({ ...formData, priceMonthly: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-plan-annually'>Annual Price (₹)</Label>
                  <Input
                    id='edit-plan-annually'
                    type='number'
                    value={formData.priceAnnually}
                    onChange={(e) =>
                      setFormData({ ...formData, priceAnnually: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='edit-plan-tagline'>Tagline</Label>
                <Input
                  id='edit-plan-tagline'
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='edit-plan-savings'>Savings Text</Label>
                <Input
                  id='edit-plan-savings'
                  value={formData.annualSavingsText}
                  onChange={(e) => setFormData({ ...formData, annualSavingsText: e.target.value })}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='edit-plan-features'>Features (One per line)</Label>
                <Textarea
                  id='edit-plan-features'
                  rows={4}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                />
              </div>

              <div className='space-y-3 pt-2'>
                <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/30'>
                  <Label htmlFor='edit-plan-popular' className='font-medium cursor-pointer'>
                    Highlight as Popular Plan
                  </Label>
                  <Switch
                    id='edit-plan-popular'
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                  />
                </div>

                <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/30'>
                  <Label htmlFor='edit-plan-active' className='font-medium cursor-pointer'>
                    Active for Subscriptions
                  </Label>
                  <Switch
                    id='edit-plan-active'
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              <DialogFooter className='gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={() => setEditItem(null)}>
                  Cancel
                </Button>
                <Button type='submit' className='bg-purple-600 hover:bg-purple-700' disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Plan Card Dialog */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center justify-between'>
                <span>{viewItem.name}</span>
                {viewItem.badge && (
                  <Badge className='bg-purple-100 text-purple-800 border-0'>{viewItem.badge}</Badge>
                )}
              </DialogTitle>
              <DialogDescription>{viewItem.tagline}</DialogDescription>
            </DialogHeader>
            <div className='space-y-4 pt-2'>
              <div className='p-4 bg-muted/40 rounded-lg text-center'>
                <div className='text-3xl font-extrabold text-foreground'>
                  ₹{viewItem.priceAnnually}
                  <span className='text-sm font-normal text-muted-foreground'> / year</span>
                </div>
                <div className='text-xs text-muted-foreground mt-1'>
                  or ₹{viewItem.priceMonthly} billed monthly
                </div>
                {viewItem.annualSavingsText && (
                  <div className='text-xs font-semibold text-emerald-600 mt-1'>
                    {viewItem.annualSavingsText}
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <div className='text-xs font-semibold uppercase text-muted-foreground'>
                  Features Included:
                </div>
                {viewItem.features?.map((f, i) => (
                  <div key={i} className='flex items-center gap-2 text-sm'>
                    <Check className='h-4 w-4 text-emerald-600 shrink-0' />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className='pt-2'>
              <Button variant='outline' onClick={() => setViewItem(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Plan Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Doctors currently subscribed to this plan will remain active until expiry, but new
              subscriptions will no longer be offered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Plan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  )
}
