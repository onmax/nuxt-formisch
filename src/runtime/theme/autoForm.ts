import { tv } from '../utils/tv'

export default tv({
  slots: {
    root: 'space-y-6',
    section: '',
    sectionTitle: 'text-lg font-medium mb-3',
    grid: 'grid gap-4',
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
