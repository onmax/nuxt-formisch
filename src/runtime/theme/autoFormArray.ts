import { tv } from '../utils/tv'

export default tv({
  slots: {
    root: 'space-y-2',
    legend: 'text-sm font-medium text-muted mb-2',
    item: 'flex items-start gap-2 p-2 bg-muted/10 rounded-md',
    removeButton: 'shrink-0 mt-6', // Align with first field input
    addButton: 'mt-2',
    grid: 'flex-1 grid gap-2',
  },
  variants: {
    columns: {
      1: { grid: 'grid-cols-1' },
      2: { grid: 'sm:grid-cols-2' },
      3: { grid: 'sm:grid-cols-2 lg:grid-cols-3' },
      4: { grid: 'sm:grid-cols-2 lg:grid-cols-4' },
    },
  },
  defaultVariants: { columns: 1 },
})
