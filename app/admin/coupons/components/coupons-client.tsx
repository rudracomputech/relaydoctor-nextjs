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
} from '@/components/ui/card'
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
  TicketPercent,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Percent,
  Calendar,
} from 'lucide-react'

export interface CouponItem {
  _id: string
  code: string
  description?: string
  discountType: string
  discountValue: number
  minOrderAmount?: number
  minimumAmount?: number
  maxDiscount?: number
  usageLimit?: number
  maxUsageLimit?: number
  usageCount?: number
  usedCount?: number
  validUntil?: string
  expiryDate?: string
  isActive: boolean
  createdAt?: string
}

export function CouponsClient({ initialCoupons }: { initialCoupons: CouponItem[] }) {
  const [data, setData] = useState<CouponItem[]>(initialCoupons)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<CouponItem | null>(null)
  const [viewItem, setViewItem] = useState<CouponItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'flat',
    discountValue: 200,
    minOrderAmount: 999,
    maxDiscount: 1000,
    usageLimit: 100,
    validUntil: '',
    isActive: true,
  })

  function resetForm() {
    setFormData({
      code: '',
      description: '',
      discountType: 'flat',
      discountValue: 200,
      minOrderAmount: 999,
      maxDiscount: 1000,
      usageLimit: 100,
      validUntil: '',
      isActive: true,
    })
  }

  function handleOpenCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function handleOpenEdit(coupon: CouponItem) {
    const formattedDate = coupon.validUntil || coupon.expiryDate
      ? new Date(coupon.validUntil || coupon.expiryDate!).toISOString().split('T')[0]
      : ''

    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: (coupon.discountType || 'flat').toLowerCase(),
      discountValue: coupon.discountValue || 0,
      minOrderAmount: coupon.minOrderAmount || coupon.minimumAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || coupon.maxUsageLimit || 100,
      validUntil: formattedDate,
      isActive: coupon.isActive ?? true,
    })
    setEditItem(coupon)
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.code || formData.discountValue === undefined) {
      toast.error('Coupon code and discount value are required')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create coupon')

      setData((prev) => [json.data, ...prev])
      toast.success(`Coupon ${json.data.code} created`)
      setCreateOpen(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!editItem) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/coupons/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update coupon')

      setData((prev) =>
        prev.map((c) => (c._id === editItem._id ? { ...c, ...json.data } : c))
      )
      toast.success('Coupon updated successfully')
      setEditItem(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteCoupon() {
    if (!deleteId) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/coupons/${deleteId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete coupon')

      setData((prev) => prev.filter((c) => c._id !== deleteId))
      toast.success('Coupon removed')
      setDeleteId(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(coupon: CouponItem) {
    try {
      const newStatus = !coupon.isActive
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update status')

      setData((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: newStatus } : c))
      )
      toast.success(newStatus ? 'Coupon activated' : 'Coupon deactivated')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const columns = useMemo<ColumnDef<CouponItem>[]>(
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
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Voucher Code' />,
        cell: ({ row }) => {
          const coupon = row.original
          return (
            <div className='py-1'>
              <div className='flex items-center gap-2'>
                <span className='px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded font-mono font-bold text-xs tracking-wider border border-amber-300'>
                  {coupon.code}
                </span>
              </div>
              <div className='text-xs text-muted-foreground mt-0.5 truncate max-w-xs'>
                {coupon.description || 'Special plan discount voucher'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'discountValue',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Discount' />,
        cell: ({ row }) => {
          const c = row.original
          const isFlat = (c.discountType || 'flat').toLowerCase() === 'flat'
          return (
            <div className='font-bold text-foreground text-sm'>
              {isFlat ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
              <span className='block text-[11px] text-muted-foreground font-normal capitalize'>
                {c.discountType} discount
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'minOrderAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Min Spend' />,
        cell: ({ row }) => {
          const min = row.original.minOrderAmount || row.original.minimumAmount || 0
          return <span className='font-mono text-xs text-foreground'>₹{min}</span>
        },
      },
      {
        id: 'usage',
        header: 'Redemptions',
        cell: ({ row }) => {
          const c = row.original
          const used = c.usageCount || c.usedCount || 0
          const limit = c.usageLimit || c.maxUsageLimit || 100
          return (
            <div className='text-xs font-mono'>
              <span className='font-semibold text-foreground'>{used}</span>
              <span className='text-muted-foreground'> / {limit} uses</span>
            </div>
          )
        },
      },
      {
        id: 'validUntil',
        header: 'Validity',
        cell: ({ row }) => {
          const dateStr = row.original.validUntil || row.original.expiryDate
          if (!dateStr) {
            return <span className='text-xs text-muted-foreground'>No expiry</span>
          }
          const isExpired = new Date(dateStr) < new Date()
          return (
            <div className='flex items-center gap-1 text-xs'>
              <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
              <span className={isExpired ? 'text-destructive line-through' : 'font-mono'}>
                {new Date(dateStr).toLocaleDateString()}
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
              Disabled
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
          const coupon = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem onClick={() => setViewItem(coupon)}>
                  <Eye className='mr-2 h-4 w-4 text-muted-foreground' />
                  View Voucher
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(coupon)}>
                  <Pencil className='mr-2 h-4 w-4 text-muted-foreground' />
                  Edit Coupon
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleActive(coupon)}>
                  {coupon.isActive ? (
                    <>
                      <XCircle className='mr-2 h-4 w-4 text-amber-600' />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='mr-2 h-4 w-4 text-emerald-600' />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteId(coupon._id)}
                  className='text-destructive focus:text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete Coupon
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
      const c = row.original
      return (
        c.code.toLowerCase().includes(search) ||
        (c.description || '').toLowerCase().includes(search)
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
    <div className='space-y-6'>
      {/* Top Action Bar */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Button onClick={handleOpenCreate} className='bg-amber-600 hover:bg-amber-700 text-white'>
            <Plus className='h-4 w-4 mr-1.5' /> Add New Coupon
          </Button>
          <Badge variant='outline' className='px-3 py-1 bg-amber-50 text-amber-700 border-amber-200'>
            {data.length} Active Vouchers
          </Badge>
        </div>
      </div>

      {/* Toolbar with faceted filters & search */}
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by coupon code or description...'
        filters={[
          {
            columnId: 'isActive',
            title: 'Status',
            options: [
              { label: 'Active', value: 'true', icon: CheckCircle2 },
              { label: 'Disabled', value: 'false', icon: XCircle },
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
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Visual Cards Grid Preview */}
      <div className='pt-6 border-t'>
        <h3 className='text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-4'>
          Live Voucher Cards Preview
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {data.map((coupon) => (
            <Card
              key={coupon._id}
              className='border-dashed border-2 shadow-sm hover:border-amber-400 transition-colors'
            >
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <span className='px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded font-mono font-bold text-sm tracking-wider'>
                    {coupon.code}
                  </span>
                  {coupon.isActive ? (
                    <Badge className='bg-emerald-100 text-emerald-800 border-0 text-xs'>Active</Badge>
                  ) : (
                    <Badge variant='outline' className='text-muted-foreground text-xs'>Disabled</Badge>
                  )}
                </div>

                <div className='mt-4'>
                  <div className='text-2xl font-black text-foreground'>
                    {(coupon.discountType || 'flat').toLowerCase() === 'flat'
                      ? `₹${coupon.discountValue} OFF`
                      : `${coupon.discountValue}% OFF`}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {coupon.description || 'Special plan discount voucher'}
                  </p>
                </div>

                <div className='mt-4 pt-3 border-t text-[11px] text-muted-foreground flex justify-between'>
                  <span>
                    Min Spend: <strong>₹{coupon.minOrderAmount || coupon.minimumAmount || 0}</strong>
                  </span>
                  <span>
                    Redeemed: <strong>{coupon.usageCount || coupon.usedCount || 0} times</strong>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Coupon Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <TicketPercent className='h-5 w-5 text-amber-600' />
              Create Promotional Coupon
            </DialogTitle>
            <DialogDescription>
              Add discount codes applicable to doctor subscriptions at checkout.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCoupon} className='space-y-4 pt-2'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='cpn-code'>Coupon Code *</Label>
                <Input
                  id='cpn-code'
                  placeholder='RELAY50'
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='cpn-type'>Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val) => setFormData({ ...formData, discountType: val })}
                >
                  <SelectTrigger id='cpn-type'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='flat'>Flat Amount (₹)</SelectItem>
                    <SelectItem value='percentage'>Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='cpn-val'>Discount Value *</Label>
                <Input
                  id='cpn-val'
                  type='number'
                  min={1}
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='cpn-min'>Minimum Spend (₹)</Label>
                <Input
                  id='cpn-min'
                  type='number'
                  min={0}
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: Number(e.target.value) })
                  }
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='cpn-limit'>Usage Limit</Label>
                <Input
                  id='cpn-limit'
                  type='number'
                  min={1}
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: Number(e.target.value) })
                  }
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='cpn-expiry'>Expiry Date</Label>
                <Input
                  id='cpn-expiry'
                  type='date'
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='cpn-desc'>Description</Label>
              <Input
                id='cpn-desc'
                placeholder='Special doctor launch discount'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/30'>
              <div>
                <Label htmlFor='cpn-active' className='font-medium cursor-pointer'>
                  Active Immediately
                </Label>
                <p className='text-xs text-muted-foreground'>Doctors can redeem this code now.</p>
              </div>
              <Switch
                id='cpn-active'
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' className='bg-amber-600 hover:bg-amber-700' disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Pencil className='h-5 w-5 text-amber-600' />
                Edit Coupon: {editItem.code}
              </DialogTitle>
              <DialogDescription>Modify discount rules, spend limits, or expiry.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCoupon} className='space-y-4 pt-2'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-cpn-code'>Code</Label>
                  <Input
                    id='edit-cpn-code'
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-cpn-type'>Discount Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(val) => setFormData({ ...formData, discountType: val })}
                  >
                    <SelectTrigger id='edit-cpn-type'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='flat'>Flat (₹)</SelectItem>
                      <SelectItem value='percentage'>Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-cpn-val'>Discount Value</Label>
                  <Input
                    id='edit-cpn-val'
                    type='number'
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-cpn-min'>Min Spend (₹)</Label>
                  <Input
                    id='edit-cpn-min'
                    type='number'
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: Number(e.target.value) })
                    }
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-cpn-limit'>Usage Limit</Label>
                  <Input
                    id='edit-cpn-limit'
                    type='number'
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: Number(e.target.value) })
                    }
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-cpn-expiry'>Expiry Date</Label>
                  <Input
                    id='edit-cpn-expiry'
                    type='date'
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='edit-cpn-desc'>Description</Label>
                <Input
                  id='edit-cpn-desc'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/30'>
                <Label htmlFor='edit-cpn-active' className='font-medium cursor-pointer'>
                  Active Status
                </Label>
                <Switch
                  id='edit-cpn-active'
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <DialogFooter className='gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={() => setEditItem(null)}>
                  Cancel
                </Button>
                <Button type='submit' className='bg-amber-600 hover:bg-amber-700' disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Coupon Details Dialog */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <TicketPercent className='h-5 w-5 text-amber-600' />
                Voucher Details: {viewItem.code}
              </DialogTitle>
              <DialogDescription>{viewItem.description || 'Doctor subscription voucher'}</DialogDescription>
            </DialogHeader>
            <div className='space-y-4 pt-2'>
              <div className='p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 border-2 border-dashed border-amber-300 rounded-xl text-center'>
                <span className='px-4 py-1.5 bg-amber-500 text-white rounded font-mono font-extrabold text-lg tracking-widest inline-block shadow-sm'>
                  {viewItem.code}
                </span>
                <div className='text-3xl font-black text-foreground mt-3'>
                  {(viewItem.discountType || 'flat').toLowerCase() === 'flat'
                    ? `₹${viewItem.discountValue} OFF`
                    : `${viewItem.discountValue}% OFF`}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Valid on all physician memberships
                </p>
              </div>

              <div className='grid grid-cols-2 gap-3 text-xs'>
                <div className='p-3 bg-muted/40 rounded-lg'>
                  <span className='text-muted-foreground block'>Min Spend</span>
                  <span className='font-mono font-semibold text-sm'>
                    ₹{viewItem.minOrderAmount || viewItem.minimumAmount || 0}
                  </span>
                </div>
                <div className='p-3 bg-muted/40 rounded-lg'>
                  <span className='text-muted-foreground block'>Usage</span>
                  <span className='font-mono font-semibold text-sm'>
                    {viewItem.usageCount || viewItem.usedCount || 0} /{' '}
                    {viewItem.usageLimit || viewItem.maxUsageLimit || 100}
                  </span>
                </div>
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

      {/* Delete Coupon Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              Doctors will no longer be able to apply this discount code during subscription checkout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Coupon'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
