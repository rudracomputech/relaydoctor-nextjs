'use client'
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { DataTableBulkActions } from './data-table-bulk-actions'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { DataTableRowActions } from './data-table-row-actions'

import { TableConfig } from '@/config/table'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog'
import { useTasks } from './tasks-provider'
import { Ban, CheckCircleIcon, CircleDashedIcon, Timer, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react'



type RowData = Record<string, any>

type DataTableProps = {
  data: RowData[]
  totalCount: number
  entity: string
}


export function TasksTable({ data, totalCount, entity }: DataTableProps) {


  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSearch = Object.fromEntries(searchParams.entries())

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const tableConfig = TableConfig[entity as keyof typeof TableConfig]

  const { open, setOpen } = useTasks()


  const statuses = [
    { value: 'pending', label: 'Pending', icon: CircleDashedIcon },
    { value: 'in_progress', label: 'In Progress', icon: Timer },
    { value: 'completed', label: 'Completed', icon: CheckCircleIcon },
    { value: 'cancelled', label: 'Cancelled', icon: Ban },
    { value: "1", label: 'Enabled', icon: ToggleRightIcon },
    { value: "0", label: 'Disabled', icon: ToggleLeftIcon },
  ]


  console.log("Open state:", open)


  const columns = useMemo<ColumnDef<RowData>[]>(() => [
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
    ...tableConfig.columns.map((col) => ({
      accessorKey: col.id,
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title={col.label} />
      ),
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
    })),
    {
      accessorKey: 'status',
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
      cell: ({ row }: { row: any }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue('status')
        )

        console.log("Row status value:", row.getValue('status'))
        console.log("Matched status object:", status)

        if (!status) {
          return null
        }

        return (
          <div className='flex w-25 items-center gap-2'>
            {status.icon && (
              <status.icon className='text-muted-foreground size-4' />
            )}
            <span>{status.label}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },

    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions entityType={entity} row={row} />,
    },
  ], [tableConfig, statuses])


  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,

  } = useTableUrlState({
    search: currentSearch,
    navigate: (opts) => {
      const params = new URLSearchParams(searchParams.toString())


      if (typeof opts.search === 'function') {
        const result = opts.search(currentSearch)
        Object.entries(result).forEach(([key, value]) => {
          if (value === undefined) params.delete(key)
          else params.set(key, String(value))
        })
      } else if (opts.search !== true) {
        Object.entries(opts.search).forEach(([key, value]) => {
          if (value === undefined) params.delete(key)
          else params.set(key, String(value))
        })
      }

      const url = `${pathname}?${params.toString()}`
      if (opts.replace) {
        router.replace(url, { scroll: false })
      } else {
        router.push(url, { scroll: false })
      }
    },
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },

    ],
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    manualPagination: true,
    manualFiltering: true,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,

    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const id = String(row.getValue('id')).toLowerCase()
      const title = String(row.getValue('title')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return id.includes(searchValue) || title.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
   
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {

  }, [pageCount, 10])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by title or ID...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statuses,
          },

        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(

                        header.id === 'select' && 'w-12',
                        header.column.getCanSort() && 'cursor-pointer select-none',
                        header.column.getIsSorted() === 'asc' && 'aria-sort-ascending',
                        header.column.getIsSorted() === 'desc' && 'aria-sort-descending'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === 'select' && 'w-12',
                        cell.column.id === 'title' && 'font-medium'
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
      <TasksMultiDeleteDialog
        open={open === 'delete'}
        onOpenChange={() => setOpen(null)}
        table={table}
        entity={entity}
      />
    </div>
  )
}
