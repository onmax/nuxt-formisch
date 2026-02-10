import type autoForm from '../theme/autoForm'
import type autoFormField from '../theme/autoFormField'
import type autoFormObject from '../theme/autoFormObject'
import type autoFormArray from '../theme/autoFormArray'

type SlotConfig<T> = T extends { slots: infer S } ? { [K in keyof S]?: string } : never

declare module '@nuxt/schema' {
  interface AppConfigInput {
    ui?: {
      autoForm?: Partial<SlotConfig<typeof autoForm>>
      autoFormField?: Partial<SlotConfig<typeof autoFormField>>
      autoFormObject?: Partial<SlotConfig<typeof autoFormObject>>
      autoFormArray?: Partial<SlotConfig<typeof autoFormArray>>
    }
  }
}

export {}
