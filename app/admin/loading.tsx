import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 space-y-6 max-w-full overflow-hidden animate-in fade-in-50 duration-150'>
      {/* Top Heading Skeleton */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64 bg-muted/60' />
          <Skeleton className='h-4 w-96 max-w-full bg-muted/40' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-28 bg-muted/50' />
          <Skeleton className='h-9 w-28 bg-muted/50' />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='p-4 rounded-xl border bg-card/60 space-y-3 shadow-xs'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-28 bg-muted/50' />
              <Skeleton className='h-8 w-8 rounded-lg bg-muted/50' />
            </div>
            <Skeleton className='h-7 w-20 bg-muted/70' />
            <Skeleton className='h-3 w-36 bg-muted/40' />
          </div>
        ))}
      </div>

      {/* Main Table / Card Skeleton */}
      <div className='rounded-xl border bg-card/60 p-5 space-y-4 shadow-xs flex-1'>
        <div className='flex items-center justify-between gap-4'>
          <Skeleton className='h-9 w-64 bg-muted/50' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-24 bg-muted/40' />
            <Skeleton className='h-8 w-24 bg-muted/40' />
          </div>
        </div>

        <div className='space-y-2.5 pt-2'>
          <Skeleton className='h-10 w-full bg-muted/60 rounded-lg' />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-12 w-full bg-muted/30 rounded-lg' />
          ))}
        </div>
      </div>
    </div>
  )
}
