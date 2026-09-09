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
  ShieldCheck,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  Key,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
} from 'lucide-react'

export interface UserItem {
  _id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'doctor' | 'staff' | 'user'
  permissions?: string[]
  isVerified?: boolean
  isBlocked?: boolean
  avatar?: string
  createdAt?: string
}

export const AVAILABLE_PERMISSIONS = [
  { id: 'admin:all', label: 'Full System Administration', desc: 'Unrestricted control over entire platform' },
  { id: 'manage:doctors', label: 'Doctor Management', desc: 'Approve, verify, edit, and onboard physicians' },
  { id: 'manage:patients', label: 'Patient Registry', desc: 'Create, modify, and access clinical patient charts' },
  { id: 'manage:referrals', label: 'Referral Workflow', desc: 'Monitor and update patient handoff tickets' },
  { id: 'manage:subscriptions', label: 'Subscription Plans', desc: 'Create plans and manage doctor billing' },
  { id: 'manage:coupons', label: 'Coupons & Vouchers', desc: 'Create promotional discounts and codes' },
  { id: 'manage:users', label: 'User Roles & Access', desc: 'Assign roles and fine-tune security permissions' },
  { id: 'manage:finance', label: 'Financial Ledger & Payouts', desc: 'Approve withdrawals and inspect ledger' },
]

export function UsersClient({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserItem[]
  currentUserId?: string
}) {
  const [data, setData] = useState<UserItem[]>(initialUsers)
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<UserItem | null>(null)
  const [viewItem, setViewItem] = useState<UserItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff' as 'admin' | 'doctor' | 'staff' | 'user',
    permissions: [] as string[],
    isVerified: true,
    isBlocked: false,
  })

  function resetForm() {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff',
      permissions: ['manage:doctors', 'manage:patients'],
      isVerified: true,
      isBlocked: false,
    })
  }

  function handleOpenCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function handleOpenEdit(user: UserItem) {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'user',
      permissions: user.permissions || [],
      isVerified: user.isVerified ?? true,
      isBlocked: Boolean(user.isBlocked),
    })
    setEditItem(user)
  }

  function handleTogglePermission(permId: string) {
    setFormData((prev) => {
      const current = prev.permissions
      if (current.includes(permId)) {
        return { ...prev, permissions: current.filter((p) => p !== permId) }
      } else {
        return { ...prev, permissions: [...current, permId] }
      }
    })
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create user')

      setData((prev) => [json.data, ...prev])
      toast.success(`User ${json.data.name} created successfully`)
      setCreateOpen(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!editItem) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/users/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update user')

      setData((prev) =>
        prev.map((u) => (u._id === editItem._id ? { ...u, ...json.data } : u))
      )
      toast.success('User updated successfully')
      setEditItem(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteUser() {
    if (!deleteId) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/users/${deleteId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete user')

      setData((prev) => prev.filter((u) => u._id !== deleteId))
      toast.success('User removed')
      setDeleteId(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleBlock(user: UserItem) {
    try {
      const newStatus = !user.isBlocked
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update block status')

      setData((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isBlocked: newStatus } : u))
      )
      toast.success(newStatus ? 'User account blocked' : 'User account unblocked')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const columns = useMemo<ColumnDef<UserItem>[]>(
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='User' />,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className='flex items-center gap-3 py-1'>
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                }
                alt={user.name}
                className='h-9 w-9 rounded-full object-cover border'
              />
              <div className='min-w-0'>
                <div className='font-semibold text-foreground truncate flex items-center gap-1.5'>
                  {user.name}
                  {user._id === currentUserId && (
                    <Badge variant='outline' className='text-[10px] px-1 py-0 bg-muted'>
                      You
                    </Badge>
                  )}
                </div>
                <div className='text-xs text-muted-foreground truncate'>{user.email}</div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
        cell: ({ row }) => {
          const role = row.getValue('role') as string
          let badgeClass = 'bg-muted text-muted-foreground'
          if (role === 'admin') badgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
          if (role === 'doctor') badgeClass = 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
          if (role === 'staff') badgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'

          return (
            <Badge className={`${badgeClass} border-0 capitalize text-xs font-semibold`}>
              {role}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        id: 'permissions',
        header: 'Permissions & Scope',
        cell: ({ row }) => {
          const perms = row.original.permissions || []
          if (row.original.role === 'admin' || perms.includes('admin:all')) {
            return (
              <Badge variant='outline' className='border-purple-300 text-purple-700 bg-purple-50 text-[11px]'>
                Super Admin (All Access)
              </Badge>
            )
          }
          if (perms.length === 0) {
            return <span className='text-xs text-muted-foreground italic'>Standard Access</span>
          }
          return (
            <div className='flex flex-wrap gap-1 max-w-xs'>
              {perms.slice(0, 2).map((p) => (
                <span key={p} className='text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono'>
                  {p.replace('manage:', '')}
                </span>
              ))}
              {perms.length > 2 && (
                <span className='text-[10px] text-muted-foreground'>+{perms.length - 2} more</span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'isBlocked',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Account Status' />,
        cell: ({ row }) => {
          const blocked = Boolean(row.getValue('isBlocked'))
          return blocked ? (
            <Badge variant='destructive' className='text-xs'>
              Blocked
            </Badge>
          ) : (
            <Badge className='bg-emerald-100 text-emerald-800 border-0 text-xs'>
              Active
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          const str = String(Boolean(row.getValue(id)))
          return value.includes(str)
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const user = row.original
          const isSelf = user._id === currentUserId
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuItem onClick={() => setViewItem(user)}>
                  <Eye className='mr-2 h-4 w-4 text-muted-foreground' />
                  View Permissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                  <Pencil className='mr-2 h-4 w-4 text-muted-foreground' />
                  Edit Role & Access
                </DropdownMenuItem>
                {!isSelf && (
                  <DropdownMenuItem onClick={() => handleToggleBlock(user)}>
                    {user.isBlocked ? (
                      <>
                        <Unlock className='mr-2 h-4 w-4 text-emerald-600' />
                        Unblock User
                      </>
                    ) : (
                      <>
                        <Lock className='mr-2 h-4 w-4 text-amber-600' />
                        Block Account
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {!isSelf && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteId(user._id)}
                      className='text-destructive focus:text-destructive'
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [currentUserId]
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
      const user = row.original
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search)
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
          <Button onClick={handleOpenCreate} className='bg-purple-600 hover:bg-purple-700 text-white'>
            <Plus className='h-4 w-4 mr-1.5' /> Add System User
          </Button>
          <Badge variant='outline' className='px-3 py-1 bg-purple-50 text-purple-700 border-purple-200'>
            {data.length} Accounts Configured
          </Badge>
        </div>
      </div>

      {/* Toolbar with faceted filters & search */}
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by name, email, or role...'
        filters={[
          {
            columnId: 'role',
            title: 'Role',
            options: [
              { label: 'Admin', value: 'admin', icon: Shield },
              { label: 'Doctor', value: 'doctor', icon: UserCheck },
              { label: 'Staff', value: 'staff', icon: Key },
              { label: 'User', value: 'user', icon: UserX },
            ],
          },
          {
            columnId: 'isBlocked',
            title: 'Status',
            options: [
              { label: 'Active', value: 'false' },
              { label: 'Blocked', value: 'true' },
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <ShieldCheck className='h-5 w-5 text-purple-600' />
              Create System User & Role
            </DialogTitle>
            <DialogDescription>
              Add an administrative staff member, doctor account, or manager with assigned privileges.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className='space-y-4 pt-2'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='usr-name'>Full Name *</Label>
                <Input
                  id='usr-name'
                  placeholder='Amit Verma'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='usr-email'>Email Address *</Label>
                <Input
                  id='usr-email'
                  type='email'
                  placeholder='amit@relaydoctor.com'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='usr-phone'>Phone Number</Label>
                <Input
                  id='usr-phone'
                  placeholder='+91 98000 12345'
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='usr-pass'>Password</Label>
                <Input
                  id='usr-pass'
                  type='password'
                  placeholder='Default: relay12345'
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='usr-role'>System Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val: any) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger id='usr-role'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>Admin (Full Control)</SelectItem>
                  <SelectItem value='staff'>Staff / Operations</SelectItem>
                  <SelectItem value='doctor'>Doctor Account</SelectItem>
                  <SelectItem value='user'>Standard User / Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fine-grained Permissions Selector */}
            <div className='space-y-2 pt-2 border-t'>
              <Label className='font-semibold'>Fine-Grained Permissions</Label>
              <div className='grid grid-cols-1 gap-2 p-3 bg-muted/30 rounded-lg border max-h-52 overflow-y-auto'>
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const checked =
                    formData.role === 'admin' || formData.permissions.includes(perm.id)
                  return (
                    <label
                      key={perm.id}
                      className='flex items-start gap-2.5 p-2 rounded hover:bg-muted cursor-pointer'
                    >
                      <Checkbox
                        checked={checked}
                        disabled={formData.role === 'admin'}
                        onCheckedChange={() => handleTogglePermission(perm.id)}
                        className='mt-0.5'
                      />
                      <div className='text-xs'>
                        <div className='font-medium text-foreground'>{perm.label}</div>
                        <div className='text-muted-foreground'>{perm.desc}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <DialogFooter className='gap-2 pt-2'>
              <Button type='button' variant='outline' onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' className='bg-purple-600 hover:bg-purple-700' disabled={submitting}>
                {submitting ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Pencil className='h-5 w-5 text-purple-600' />
                Edit User: {editItem.name}
              </DialogTitle>
              <DialogDescription>Modify access roles, security scopes, and active status.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className='space-y-4 pt-2'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-usr-name'>Full Name</Label>
                  <Input
                    id='edit-usr-name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-usr-email'>Email</Label>
                  <Input
                    id='edit-usr-email'
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-usr-phone'>Phone</Label>
                  <Input
                    id='edit-usr-phone'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='edit-usr-role'>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val: any) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger id='edit-usr-role'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='admin'>Admin</SelectItem>
                      <SelectItem value='staff'>Staff</SelectItem>
                      <SelectItem value='doctor'>Doctor</SelectItem>
                      <SelectItem value='user'>User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2 pt-2 border-t'>
                <Label className='font-semibold'>Assigned Permissions</Label>
                <div className='grid grid-cols-1 gap-2 p-3 bg-muted/30 rounded-lg border max-h-52 overflow-y-auto'>
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const checked =
                      formData.role === 'admin' || formData.permissions.includes(perm.id)
                    return (
                      <label
                        key={perm.id}
                        className='flex items-start gap-2.5 p-2 rounded hover:bg-muted cursor-pointer'
                      >
                        <Checkbox
                          checked={checked}
                          disabled={formData.role === 'admin'}
                          onCheckedChange={() => handleTogglePermission(perm.id)}
                          className='mt-0.5'
                        />
                        <div className='text-xs'>
                          <div className='font-medium text-foreground'>{perm.label}</div>
                          <div className='text-muted-foreground'>{perm.desc}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className='flex items-center justify-between p-3 border rounded-lg bg-muted/30'>
                <div>
                  <Label htmlFor='edit-usr-blocked' className='font-medium cursor-pointer'>
                    Block User Access
                  </Label>
                  <p className='text-xs text-muted-foreground'>Revoke immediate login and API access.</p>
                </div>
                <Switch
                  id='edit-usr-blocked'
                  checked={formData.isBlocked}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBlocked: checked })}
                />
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

      {/* View User Profile & Permissions Dialog */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <img
                  src={
                    viewItem.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewItem.name)}`
                  }
                  alt={viewItem.name}
                  className='h-12 w-12 rounded-full object-cover border'
                />
                <div>
                  <DialogTitle className='text-lg'>{viewItem.name}</DialogTitle>
                  <DialogDescription className='capitalize font-medium text-xs'>
                    {viewItem.role} Role &bull; {viewItem.isBlocked ? 'Blocked' : 'Active'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-3 pt-2 text-xs'>
              <div className='p-3 bg-muted/40 rounded-lg space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground flex items-center gap-1'>
                    <Mail className='h-3 w-3' /> Email
                  </span>
                  <span className='font-mono font-medium'>{viewItem.email}</span>
                </div>
                {viewItem.phone && (
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground flex items-center gap-1'>
                      <Phone className='h-3 w-3' /> Phone
                    </span>
                    <span className='font-mono'>{viewItem.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className='font-semibold uppercase text-muted-foreground tracking-wider mb-2'>
                  Authorized Permissions:
                </h4>
                {viewItem.role === 'admin' ? (
                  <div className='p-3 border rounded bg-purple-50 text-purple-800 text-xs font-medium'>
                    Super Admin privileges: Full read & write authorization across all modules.
                  </div>
                ) : (
                  <div className='space-y-1.5'>
                    {(viewItem.permissions || []).length === 0 ? (
                      <span className='text-muted-foreground italic'>Standard user access only.</span>
                    ) : (
                      viewItem.permissions?.map((p) => {
                        const meta = AVAILABLE_PERMISSIONS.find((m) => m.id === p)
                        return (
                          <div key={p} className='p-2 bg-muted/30 border rounded flex items-center gap-2'>
                            <Key className='h-3.5 w-3.5 text-purple-600 shrink-0' />
                            <div>
                              <div className='font-medium text-foreground'>{meta?.label || p}</div>
                              <div className='text-[10px] text-muted-foreground font-mono'>{p}</div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
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

      {/* Delete User Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently revoke all access and credentials for this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
