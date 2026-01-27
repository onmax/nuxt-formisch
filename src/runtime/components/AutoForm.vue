<script setup lang="ts">
import { computed, provide, ref, toRaw } from 'vue'
import { useForm, useField } from '@formisch/vue'
import type { Schema } from '@formisch/vue'
import { useSchemaIntrospection } from '../composables/useSchemaIntrospection'
import type { FieldConfig, ResolvedField } from '../composables/useSchemaIntrospection'
import AutoFormField from './AutoFormField.vue'
import AutoFormObject from './AutoFormObject.vue'
import AutoFormArray from './AutoFormArray.vue'

const props = withDefaults(defineProps<{
  schema: Schema
  initialValues?: Record<string, unknown>
  fieldConfig?: Record<string, FieldConfig>
  disabled?: boolean
  columns?: number
  validateOn?: 'blur' | 'input' | 'change'
}>(), { columns: 1, validateOn: 'blur' })

const emit = defineEmits<{
  submit: [data: Record<string, unknown>]
  error: [errors: Record<string, string>]
}>()

// Introspect schema into resolved fields
const resolvedFields = computed(() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSchemaIntrospection(props.schema as any, props.fieldConfig),
)

// Create formisch form store
const form = useForm({
  schema: props.schema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialInput: props.initialValues as any,
})

// Track fields reactively using useField per top-level key
function useAutoField(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (useField as any)(() => form, () => ({ path: [name] as const }))
}

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

// Collect errors from field stores
const fieldStores = computed(() => {
  const stores: Record<string, ReturnType<typeof useAutoField>> = {}
  for (const f of resolvedFields.value) {
    stores[f.name] = useAutoField(f.name)
  }
  return stores
})

const flatErrors = computed(() => {
  const errors: Record<string, string> = {}
  for (const [name, store] of Object.entries(fieldStores.value)) {
    if (store.errors?.[0]) errors[name] = store.errors[0]
  }
  return errors
})

provide('autoFormDisabled', computed(() => props.disabled))
provide('autoFormFieldConfig', computed(() => props.fieldConfig))

const gridClass = computed(() => `grid gap-4 grid-cols-${props.columns}`)

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
      Object.entries(fieldStores.value).map(([name, store]) => [name, toRaw(store.input)]),
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
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-6">
      <template
        v-for="[sectionName, sectionFields] in sections"
        :key="sectionName"
      >
        <slot
          :name="`section:${sectionName}`"
          :fields="sectionFields"
        >
          <div>
            <h3
              v-if="sectionName"
              class="text-lg font-medium mb-3"
            >
              {{ sectionName }}
            </h3>
            <div :class="gridClass">
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
