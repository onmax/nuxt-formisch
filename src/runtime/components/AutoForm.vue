<script setup lang="ts">
import { computed, ref, toRaw, useForm, useField, useAppConfig } from '#imports'
import type { Schema } from '@formisch/vue'
import { introspectSchema } from '../composables/useSchemaIntrospection'
import type { FieldConfig, ResolvedField } from '../composables/useSchemaIntrospection'
import theme from '../theme/autoForm'
import AutoFormField from './AutoFormField.vue'
import AutoFormObject from './AutoFormObject.vue'
import AutoFormArray from './AutoFormArray.vue'

type SlotKeys = 'root' | 'section' | 'sectionTitle' | 'grid'

const props = withDefaults(defineProps<{
  schema: Schema
  initialValues?: Record<string, unknown>
  fieldConfig?: Record<string, FieldConfig>
  disabled?: boolean
  columns?: 1 | 2 | 3 | 4
  validateOn?: 'blur' | 'input' | 'change'
  class?: string
  ui?: Partial<Record<SlotKeys, string>>
}>(), { columns: 1, validateOn: 'blur' })

const emit = defineEmits<{
  submit: [data: Record<string, unknown>]
  error: [errors: Record<string, string>]
}>()

// Create formisch form store
const form = useForm({
  schema: props.schema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialInput: props.initialValues as any,
})

// Introspect schema once at setup time to get all field names
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initialFields = introspectSchema(props.schema as any)

// Create field stores for all schema fields at setup time (composables must be called at top level)
const fieldStores: Record<string, ReturnType<typeof useField>> = {}
for (const f of initialFields) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fieldStores[f.name] = (useField as any)(() => form, () => ({ path: [f.name] as const }))
}

// Resolved fields with fieldConfig applied (re-computed when fieldConfig changes)
const resolvedFields = computed(() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  introspectSchema(props.schema as any, props.fieldConfig),
)

// Dirty tracking
const isDirty = computed(() => form.isDirty)
const isSubmitting = ref(false)

function reset() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(form as any).reset?.()
}

// Visible + sorted fields
const visibleFields = computed(() =>
  resolvedFields.value
    .filter(f => !props.fieldConfig?.[f.name]?.hidden)
    .sort((a, b) => (props.fieldConfig?.[a.name]?.order ?? 0) - (props.fieldConfig?.[b.name]?.order ?? 0)),
)

// Group by section
const sections = computed(() => {
  const map = new Map<string, ResolvedField[]>()
  for (const field of visibleFields.value) {
    const section = props.fieldConfig?.[field.name]?.section || field.ui.section || ''
    if (!map.has(section)) map.set(section, [])
    map.get(section)!.push(field)
  }
  return map
})

const flatErrors = computed(() => {
  const errors: Record<string, string> = {}
  for (const [name, store] of Object.entries(fieldStores)) {
    if (store.errors?.[0]) errors[name] = store.errors[0]
  }
  return errors
})

const appConfig = useAppConfig()
const slots = computed(() => {
  const tv = theme({ columns: props.columns })
  const appUi = (appConfig.ui as { autoForm?: Partial<Record<SlotKeys, string>> } | undefined)?.autoForm
  return {
    root: [tv.root(), appUi?.root, props.ui?.root, props.class].filter(Boolean).join(' '),
    section: [tv.section(), appUi?.section, props.ui?.section].filter(Boolean).join(' '),
    sectionTitle: [tv.sectionTitle(), appUi?.sectionTitle, props.ui?.sectionTitle].filter(Boolean).join(' '),
    grid: [tv.grid(), appUi?.grid, props.ui?.grid].filter(Boolean).join(' '),
  }
})

function colSpanStyle(field: ResolvedField) {
  const span = props.fieldConfig?.[field.name]?.colSpan
  return span ? `grid-column: span ${span}` : undefined
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    // Validate via standard schema
    const schema = props.schema as Schema & { '~standard': { validate: (data: unknown) => Promise<{ value?: unknown, issues?: unknown[] }> } }
    const raw = Object.fromEntries(
      Object.entries(fieldStores).map(([name, store]) => [name, toRaw(store.input)]),
    )
    const result = await schema['~standard'].validate(raw)
    if (result.issues && result.issues.length > 0) {
      const errors: Record<string, string> = {}
      for (const issue of result.issues as Array<{ path?: Array<{ key: string }>, message: string }>) {
        const path = issue.path?.map(p => p.key).join('.') || 'unknown'
        errors[path] = issue.message
      }
      emit('error', errors)
    }
    else {
      emit('submit', (result as { value: unknown }).value as Record<string, unknown>)
    }
  }
  catch (err) {
    emit('error', { _form: err instanceof Error ? err.message : 'Validation failed' })
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div :class="slots.root">
      <template
        v-for="[sectionName, sectionFields] in sections"
        :key="sectionName"
      >
        <slot
          :name="`section:${sectionName}`"
          :fields="sectionFields"
        >
          <div :class="slots.section">
            <h3
              v-if="sectionName"
              :class="slots.sectionTitle"
            >
              {{ sectionName }}
            </h3>
            <div :class="slots.grid">
              <template
                v-for="field in sectionFields"
                :key="field.name"
              >
                <slot
                  :name="`field:${field.name}`"
                  :field="field"
                  :store="fieldStores[field.name]"
                >
                  <!-- Nested object -->
                  <AutoFormObject
                    v-if="field.type === 'object' && field.children"
                    :field="field"
                    :model-value="(fieldStores[field.name]?.input as Record<string, unknown>) || {}"
                    :errors="flatErrors"
                    :disabled="disabled"
                    :field-config="fieldConfig"
                    :columns="columns"
                    :style="colSpanStyle(field)"
                    @update:model-value="fieldStores[field.name].input = $event"
                  />

                  <!-- Array -->
                  <AutoFormArray
                    v-else-if="field.type === 'array' && field.itemSchema"
                    :field="field"
                    :model-value="(fieldStores[field.name]?.input as unknown[]) || []"
                    :errors="flatErrors"
                    :disabled="disabled"
                    :field-config="fieldConfig"
                    :columns="columns"
                    :style="colSpanStyle(field)"
                    @update:model-value="fieldStores[field.name].input = $event"
                  />

                  <!-- Leaf field -->
                  <AutoFormField
                    v-else
                    :field="field"
                    :model-value="fieldStores[field.name]?.input"
                    :error="flatErrors[field.name]"
                    :disabled="disabled"
                    :field-config="fieldConfig?.[field.name]"
                    :style="colSpanStyle(field)"
                    @update:model-value="fieldStores[field.name].input = $event"
                  />
                </slot>
              </template>
            </div>
          </div>
        </slot>
      </template>

      <slot
        name="actions"
        :is-dirty="isDirty"
        :is-submitting="isSubmitting"
        :reset="reset"
      />
    </div>
  </form>
</template>
