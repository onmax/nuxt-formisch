import type { FormStore, Schema } from '@formisch/vue'
import { useField } from '#imports'

type FieldElementProps = { ref: (el: unknown) => void, name: string, onBlur: () => void }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FieldResult<TValue = any> {
  readonly path: readonly (string | number)[]
  input: TValue
  readonly errors: [string, ...string[]] | null
  readonly isTouched: boolean
  readonly isDirty: boolean
  readonly isValid: boolean
  readonly props: FieldElementProps
}

export function useFormFields<TSchema extends Schema>(form: FormStore<TSchema>) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: <K extends string>(key: K): FieldResult<any> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (useField as any)(() => form, () => ({ path: [key] as const }))
    },
  }
}
