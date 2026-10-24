<script setup lang="ts" generic="TSchema extends FormSchema">
import { computed, provide } from 'vue'
import type { HTMLAttributes, VNodeChild } from 'vue'
import type * as v from 'valibot'
import { Form, reset, useForm } from '@formisch/vue'
import type { DeepPartial, FormSchema, FormStore, SubmitEventHandler, ValidationMode } from '@formisch/vue'
import { tv } from '@nuxt/ui/utils/tv'
import UButton from '@nuxt/ui/components/Button.vue'
import { useAppConfig } from '#imports'
import { autoFormSlots, autoFormTheme } from '../theme'
import type { AutoFormColumns, AutoFormSlot, AutoFormThemeConfig } from '../theme'
import { introspectSchema, toFormSchema } from '../utils/introspectSchema'
import type { FieldConfig, ResolvedField } from '../utils/introspectSchema'
import { autoFormKey, colSpan } from '../utils/autoForm'
import type { FieldPath } from '../utils/autoForm'
import AutoFormField from './AutoFormField.vue'

const {
  schema,
  initialInput,
  fieldConfig,
  columns,
  disabled = false,
  validate,
  revalidate,
  onSubmit,
  class: rootClass,
  ui: uiProp,
} = defineProps<{
  /** Valibot object schema. The form store is created once, so change `key` to swap schemas. */
  schema: TSchema
  initialInput?: DeepPartial<v.InferInput<TSchema>>
  /** Per-field UI overrides keyed by dotted key (array indexes left out), e.g. `{ 'address.city': { label: 'Town' } }`. */
  fieldConfig?: Record<string, FieldConfig>
  /** Grid columns for top-level fields and array items. @default 1 */
  columns?: AutoFormColumns
  disabled?: boolean
  /** When fields validate before the first submit. @default 'submit' */
  validate?: ValidationMode
  /** When fields revalidate after the first submit. @default 'input' */
  revalidate?: Exclude<ValidationMode, 'initial'>
  /** Called with the typed, validated output. While its promise is pending, `form.isSubmitting` is true. */
  onSubmit?: SubmitEventHandler<TSchema>
  class?: HTMLAttributes['class']
  /** Extra classes per theme slot. */
  ui?: Partial<Record<AutoFormSlot, string>>
}>()

const slots = defineSlots<{
  /** Replaces the default submit button. */
  actions?: (props: { form: FormStore<TSchema>, reset: () => void }) => VNodeChild
  /** Replaces the field with this dotted key, e.g. `field:address.city`. */
  [key: `field:${string}`]: (props: { field: ResolvedField, path: FieldPath, form: FormStore<TSchema> }) => VNodeChild
}>()

const form = useForm({
  schema: toFormSchema(schema),
  initialInput,
  validate,
  revalidate,
})

const fields = computed(() => introspectSchema(schema, fieldConfig))

const sections = computed(() => {
  const map = new Map<string, ResolvedField[]>()
  for (const field of fields.value) {
    const title = field.section ?? ''
    map.set(title, [...(map.get(title) ?? []), field])
  }
  return [...map].map(([title, fields]) => ({ title, fields }))
})

// SAFETY: `appConfig.formisch` is typed by the module's `nuxt/schema` augmentation; this cast only matters
// where Nuxt generates no app config schema, which turns the augmented key into `unknown`.
const appConfig = useAppConfig() as { formisch?: { autoForm?: AutoFormThemeConfig } }
const theme = tv(autoFormTheme)
const ui = computed(() => {
  const slotClasses = tv({ extend: theme, slots: appConfig.formisch?.autoForm?.slots ?? {} })({ columns })
  // SAFETY: the entries cover every key of `autoFormSlots`, which is every AutoFormSlot.
  return Object.fromEntries(autoFormSlots.map(slot => [
    slot,
    slotClasses[slot]({ class: [uiProp?.[slot], slot === 'root' ? rootClass : undefined] }),
  ])) as Record<AutoFormSlot, string>
})

provide(autoFormKey, {
  form,
  disabled: computed(() => disabled),
  ui,
  hasFieldSlot: key => Boolean(slots[`field:${key}`]),
  renderFieldSlot: (field, path) => slots[`field:${field.key}`]?.({ field, path, form }),
})

function resetForm() {
  reset(form)
}

async function submit(output: v.InferOutput<TSchema>, event: SubmitEvent) {
  await onSubmit?.(output, event)
}

defineExpose({ form })
</script>

<template>
  <Form
    :of="form"
    :class="ui.root"
    @submit="submit"
  >
    <div
      v-for="section in sections"
      :key="section.title"
      :class="ui.section"
    >
      <h3
        v-if="section.title"
        :class="ui.sectionTitle"
      >
        {{ section.title }}
      </h3>
      <div :class="ui.grid">
        <AutoFormField
          v-for="field in section.fields"
          :key="field.key"
          :field
          :path="[field.name]"
          :style="colSpan(field.colSpan)"
        />
      </div>
    </div>

    <p
      v-if="form.errors"
      :class="ui.error"
    >
      {{ form.errors[0] }}
    </p>

    <div :class="ui.actions">
      <slot
        name="actions"
        :form
        :reset="resetForm"
      >
        <UButton
          type="submit"
          :loading="form.isSubmitting"
          :disabled
        >
          Submit
        </UButton>
      </slot>
    </div>
  </Form>
</template>
