'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Stethoscope,
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  Tag,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export interface SpecialityCategoryItem {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  image?: string
  displayOrder: number
  isActive: boolean
  subcategoriesCount?: number
  createdAt?: string
}

export interface SpecialitySubcategoryItem {
  _id: string
  name: string
  slug: string
  categoryId: string
  category?: {
    _id: string
    name: string
    slug: string
  }
  description?: string
  icon?: string
  displayOrder: number
  isActive: boolean
  createdAt?: string
}

export function SpecialitiesClient({
  initialCategories,
  initialSubcategories,
}: {
  initialCategories: SpecialityCategoryItem[]
  initialSubcategories: SpecialitySubcategoryItem[]
}) {
  const [categories, setCategories] = useState<SpecialityCategoryItem[]>(initialCategories)
  const [subcategories, setSubcategories] = useState<SpecialitySubcategoryItem[]>(initialSubcategories)
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories')

  // Search & Filter states
  const [catSearch, setCatSearch] = useState('')
  const [subSearch, setSubSearch] = useState('')
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all')

  // Category Dialog States
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SpecialityCategoryItem | null>(null)
  const [catFormData, setCatFormData] = useState({
    name: '',
    description: '',
    icon: 'Stethoscope',
    displayOrder: 0,
    isActive: true,
  })
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null)

  // Subcategory Dialog States
  const [subDialogOpen, setSubDialogOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<SpecialitySubcategoryItem | null>(null)
  const [subFormData, setSubFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    icon: 'Stethoscope',
    displayOrder: 0,
    isActive: true,
  })
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)

  // Filtered lists
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(catSearch.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(catSearch.toLowerCase())
  )

  const filteredSubcategories = subcategories.filter((s) => {
    const matchesCat = selectedCatFilter === 'all' || s.categoryId === selectedCatFilter
    const matchesSearch =
      s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.slug.toLowerCase().includes(subSearch.toLowerCase()) ||
      (s.category?.name || '').toLowerCase().includes(subSearch.toLowerCase())
    return matchesCat && matchesSearch
  })

  // Category Handlers
  function openCreateCategory() {
    setEditingCategory(null)
    setCatFormData({
      name: '',
      description: '',
      icon: 'Stethoscope',
      displayOrder: categories.length + 1,
      isActive: true,
    })
    setCatDialogOpen(true)
  }

  function openEditCategory(cat: SpecialityCategoryItem) {
    setEditingCategory(cat)
    setCatFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Stethoscope',
      displayOrder: cat.displayOrder ?? 0,
      isActive: cat.isActive ?? true,
    })
    setCatDialogOpen(true)
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!catFormData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      setSubmitting(true)
      if (editingCategory) {
        const res = await fetch(`/api/admin/specialities/categories/${editingCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catFormData),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to update category')

        setCategories((prev) =>
          prev.map((c) => (c._id === editingCategory._id ? { ...c, ...json.data } : c))
        )
        // Also update nested category info in subcategories
        setSubcategories((prev) =>
          prev.map((s) =>
            s.categoryId === editingCategory._id
              ? { ...s, category: { ...s.category, name: json.data.name, slug: json.data.slug } as any }
              : s
          )
        )
        toast.success(`Category "${json.data.name}" updated successfully`)
      } else {
        const res = await fetch('/api/admin/specialities/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catFormData),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to create category')

        setCategories((prev) => [...prev, json.data])
        toast.success(`Category "${json.data.name}" created successfully`)
      }
      setCatDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteCategory() {
    if (!deleteCatId) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/specialities/categories/${deleteCatId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete category')

      setCategories((prev) => prev.filter((c) => c._id !== deleteCatId))
      setSubcategories((prev) => prev.filter((s) => s.categoryId !== deleteCatId))
      toast.success('Category and its subcategories deleted successfully')
      setDeleteCatId(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleCategoryStatus(cat: SpecialityCategoryItem) {
    try {
      const updatedStatus = !cat.isActive
      const res = await fetch(`/api/admin/specialities/categories/${cat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to toggle status')

      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, isActive: updatedStatus } : c))
      )
      toast.success(`Category marked as ${updatedStatus ? 'Active' : 'Inactive'}`)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Subcategory Handlers
  function openCreateSubcategory() {
    setEditingSubcategory(null)
    setSubFormData({
      name: '',
      categoryId: selectedCatFilter !== 'all' ? selectedCatFilter : categories[0]?._id || '',
      description: '',
      icon: 'Stethoscope',
      displayOrder: subcategories.length + 1,
      isActive: true,
    })
    setSubDialogOpen(true)
  }

  function openEditSubcategory(sub: SpecialitySubcategoryItem) {
    setEditingSubcategory(sub)
    setSubFormData({
      name: sub.name,
      categoryId: sub.categoryId,
      description: sub.description || '',
      icon: sub.icon || 'Stethoscope',
      displayOrder: sub.displayOrder ?? 0,
      isActive: sub.isActive ?? true,
    })
    setSubDialogOpen(true)
  }

  async function handleSaveSubcategory(e: React.FormEvent) {
    e.preventDefault()
    if (!subFormData.name.trim()) {
      toast.error('Subcategory name is required')
      return
    }
    if (!subFormData.categoryId) {
      toast.error('Please select a parent category')
      return
    }

    try {
      setSubmitting(true)
      if (editingSubcategory) {
        const res = await fetch(`/api/admin/specialities/subcategories/${editingSubcategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subFormData),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to update subcategory')

        setSubcategories((prev) =>
          prev.map((s) => (s._id === editingSubcategory._id ? { ...s, ...json.data } : s))
        )
        toast.success(`Subcategory "${json.data.name}" updated`)
      } else {
        const res = await fetch('/api/admin/specialities/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subFormData),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to create subcategory')

        setSubcategories((prev) => [...prev, json.data])
        // Update category subcategory count
        setCategories((prev) =>
          prev.map((c) =>
            c._id === subFormData.categoryId
              ? { ...c, subcategoriesCount: (c.subcategoriesCount || 0) + 1 }
              : c
          )
        )
        toast.success(`Subcategory "${json.data.name}" created`)
      }
      setSubDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteSubcategory() {
    if (!deleteSubId) return
    try {
      setSubmitting(true)
      const subToDelete = subcategories.find((s) => s._id === deleteSubId)
      const res = await fetch(`/api/admin/specialities/subcategories/${deleteSubId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to delete subcategory')

      setSubcategories((prev) => prev.filter((s) => s._id !== deleteSubId))
      if (subToDelete) {
        setCategories((prev) =>
          prev.map((c) =>
            c._id === subToDelete.categoryId
              ? { ...c, subcategoriesCount: Math.max(0, (c.subcategoriesCount || 1) - 1) }
              : c
          )
        )
      }
      toast.success('Subcategory deleted successfully')
      setDeleteSubId(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleSubcategoryStatus(sub: SpecialitySubcategoryItem) {
    try {
      const updatedStatus = !sub.isActive
      const res = await fetch(`/api/admin/specialities/subcategories/${sub._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to toggle status')

      setSubcategories((prev) =>
        prev.map((s) => (s._id === sub._id ? { ...s, isActive: updatedStatus } : s))
      )
      toast.success(`Subcategory marked as ${updatedStatus ? 'Active' : 'Inactive'}`)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Navigation Tabs */}
      <div className='flex flex-wrap items-center justify-between gap-4 border-b pb-4'>
        <div className='flex items-center space-x-2 bg-muted/60 p-1 rounded-lg'>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setActiveTab('categories')}
            className={activeTab === 'categories' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}
          >
            <FolderTree className='h-4 w-4 mr-2' />
            Speciality Categories ({categories.length})
          </Button>
          <Button
            variant={activeTab === 'subcategories' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setActiveTab('subcategories')}
            className={activeTab === 'subcategories' ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' : ''}
          >
            <Layers className='h-4 w-4 mr-2' />
            Subcategories ({subcategories.length})
          </Button>
        </div>

        {activeTab === 'categories' ? (
          <Button onClick={openCreateCategory} className='bg-teal-600 hover:bg-teal-700 text-white'>
            <Plus className='h-4 w-4 mr-1.5' /> Add Speciality Category
          </Button>
        ) : (
          <Button onClick={openCreateSubcategory} className='bg-teal-600 hover:bg-teal-700 text-white'>
            <Plus className='h-4 w-4 mr-1.5' /> Add Subcategory
          </Button>
        )}
      </div>

      {/* Categories View */}
      {activeTab === 'categories' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search categories...'
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <Badge variant='outline' className='text-muted-foreground'>
              Showing {filteredCategories.length} of {categories.length} Categories
            </Badge>
          </div>

          <Card className='shadow-sm overflow-hidden border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-16'>Order</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className='text-center'>Subcategories</TableHead>
                  <TableHead className='text-center'>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-32 text-center text-muted-foreground'>
                      No speciality categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat._id} className='hover:bg-muted/30'>
                      <TableCell className='font-mono text-xs text-muted-foreground'>
                        #{cat.displayOrder ?? 0}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2.5 font-semibold text-foreground'>
                          <div className='h-8 w-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0'>
                            <Stethoscope className='h-4 w-4' />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className='text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground'>
                          {cat.slug}
                        </code>
                      </TableCell>
                      <TableCell className='max-w-xs truncate text-xs text-muted-foreground'>
                        {cat.description || '—'}
                      </TableCell>
                      <TableCell className='text-center'>
                        <Badge
                          variant='secondary'
                          className='bg-teal-50 text-teal-700 border-teal-200 font-mono text-xs'
                        >
                          {cat.subcategoriesCount ?? 0} Subcategories
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <Switch
                            checked={cat.isActive}
                            onCheckedChange={() => handleToggleCategoryStatus(cat)}
                          />
                          <span className='text-xs text-muted-foreground'>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => openEditCategory(cat)}
                            className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setDeleteCatId(cat._id)}
                            className='h-8 w-8 p-0 text-destructive hover:bg-destructive/10'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Subcategories View */}
      {activeTab === 'subcategories' && (
        <div className='space-y-4'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='relative w-64'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search subcategories...'
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className='pl-9'
                />
              </div>
              <Select value={selectedCatFilter} onValueChange={setSelectedCatFilter}>
                <SelectTrigger className='w-48'>
                  <SelectValue placeholder='Filter by Category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant='outline' className='text-muted-foreground'>
              Showing {filteredSubcategories.length} of {subcategories.length} Subcategories
            </Badge>
          </div>

          <Card className='shadow-sm overflow-hidden border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-16'>Order</TableHead>
                  <TableHead>Subcategory Name</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className='text-center'>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-32 text-center text-muted-foreground'>
                      No speciality subcategories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubcategories.map((sub) => (
                    <TableRow key={sub._id} className='hover:bg-muted/30'>
                      <TableCell className='font-mono text-xs text-muted-foreground'>
                        #{sub.displayOrder ?? 0}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2 font-semibold text-foreground'>
                          <Tag className='h-4 w-4 text-teal-600' />
                          <span>{sub.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='bg-muted/40 font-medium text-xs'>
                          {sub.category?.name || 'Category'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className='text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground'>
                          {sub.slug}
                        </code>
                      </TableCell>
                      <TableCell className='max-w-xs truncate text-xs text-muted-foreground'>
                        {sub.description || '—'}
                      </TableCell>
                      <TableCell className='text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <Switch
                            checked={sub.isActive}
                            onCheckedChange={() => handleToggleSubcategoryStatus(sub)}
                          />
                          <span className='text-xs text-muted-foreground'>
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => openEditSubcategory(sub)}
                            className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setDeleteSubId(sub._id)}
                            className='h-8 w-8 p-0 text-destructive hover:bg-destructive/10'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <form onSubmit={handleSaveCategory}>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Speciality Category' : 'Create Speciality Category'}
              </DialogTitle>
              <DialogDescription>
                High-level medical practice domain (e.g. Cardiology, Pediatrics, Surgery).
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='cat-name'>Category Name *</Label>
                <Input
                  id='cat-name'
                  placeholder='e.g., Cardiology'
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='cat-desc'>Description</Label>
                <Input
                  id='cat-desc'
                  placeholder='Brief description of this clinical domain'
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='cat-order'>Display Order</Label>
                  <Input
                    id='cat-order'
                    type='number'
                    value={catFormData.displayOrder}
                    onChange={(e) =>
                      setCatFormData({ ...catFormData, displayOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className='space-y-1.5 flex flex-col justify-end'>
                  <div className='flex items-center space-x-2 pb-2'>
                    <Switch
                      id='cat-active'
                      checked={catFormData.isActive}
                      onCheckedChange={(val) => setCatFormData({ ...catFormData, isActive: val })}
                    />
                    <Label htmlFor='cat-active' className='cursor-pointer text-sm font-medium'>
                      Active Category
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setCatDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={submitting}
                className='bg-teal-600 hover:bg-teal-700 text-white'
              >
                {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <form onSubmit={handleSaveSubcategory}>
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? 'Edit Subcategory' : 'Create Subcategory'}
              </DialogTitle>
              <DialogDescription>
                Super-speciality or sub-domain belonging to a parent category.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='sub-cat'>Parent Category *</Label>
                <Select
                  value={subFormData.categoryId}
                  onValueChange={(val) => setSubFormData({ ...subFormData, categoryId: val })}
                >
                  <SelectTrigger id='sub-cat'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='sub-name'>Subcategory Name *</Label>
                <Input
                  id='sub-name'
                  placeholder='e.g., Interventional Cardiology'
                  value={subFormData.name}
                  onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='sub-desc'>Description</Label>
                <Input
                  id='sub-desc'
                  placeholder='Subcategory notes or details'
                  value={subFormData.description}
                  onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='sub-order'>Display Order</Label>
                  <Input
                    id='sub-order'
                    type='number'
                    value={subFormData.displayOrder}
                    onChange={(e) =>
                      setSubFormData({ ...subFormData, displayOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className='space-y-1.5 flex flex-col justify-end'>
                  <div className='flex items-center space-x-2 pb-2'>
                    <Switch
                      id='sub-active'
                      checked={subFormData.isActive}
                      onCheckedChange={(val) => setSubFormData({ ...subFormData, isActive: val })}
                    />
                    <Label htmlFor='sub-active' className='cursor-pointer text-sm font-medium'>
                      Active Subcategory
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setSubDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={submitting}
                className='bg-teal-600 hover:bg-teal-700 text-white'
              >
                {submitting ? 'Saving...' : editingSubcategory ? 'Save Changes' : 'Create Subcategory'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCatId} onOpenChange={() => setDeleteCatId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Speciality Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category and all associated subcategories. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Subcategory Confirmation */}
      <AlertDialog open={!!deleteSubId} onOpenChange={() => setDeleteSubId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subcategory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subcategory. Doctors previously assigned to it will retain their profile text.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubcategory}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete Subcategory
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
