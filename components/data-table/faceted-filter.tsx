import * as React from 'react'
import { CheckIcon, PlusCircleIcon } from 'lucide-react'
import { type Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircleIcon className='size-4' />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
    <PopoverContent className='w-50 p-0' align='start'>
  <div className="p-1">
    {options.map((option) => {
      const isSelected = selectedValues.has(option.value)

      return (
        <div
          key={option.value}
          className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
          onClick={() => {
            if (isSelected) {
              selectedValues.delete(option.value)
            } else {
              selectedValues.add(option.value)
            }

            const filterValues = Array.from(selectedValues)

            column?.setFilterValue(
              filterValues.length ? filterValues : undefined
            )
          }}
        >
          <div
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-sm border",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "opacity-50"
            )}
          >
            {isSelected && <CheckIcon className="h-3 w-3" />}
          </div>

          {option.icon && (
            <option.icon className="h-4 w-4 text-muted-foreground" />
          )}

          <span>{option.label}</span>

          {facets?.get(option.value) && (
            <span className="ml-auto text-xs text-muted-foreground">
              {facets.get(option.value)}
            </span>
          )}
        </div>
      )
    })}
  </div>
</PopoverContent>
    </Popover>
  )
}
