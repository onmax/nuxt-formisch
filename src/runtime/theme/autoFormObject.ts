import { tv } from '../utils/tv'

export default tv({
  slots: {
    root: 'col-span-full rounded-lg border border-default p-3 space-y-3 bg-muted/5',
    legend: 'text-sm font-medium px-2',
    grid: 'grid gap-3',
  },
  variants: {
    columns: {
      1: { grid: 'grid-cols-1' },
      2: { grid: 'grid-cols-2' },
      3: { grid: 'grid-cols-3' },
      4: { grid: 'grid-cols-4' },
    },
  },
  defaultVariants: { columns: 1 },
})
