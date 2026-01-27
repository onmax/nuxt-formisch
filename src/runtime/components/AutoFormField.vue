<script setup lang="ts">
import { computed, resolveComponent, h } from 'vue'
import type { ResolvedField, FieldConfig } from '../composables/useSchemaIntrospection'

const props = defineProps<{
  field: ResolvedField
  modelValue: unknown
  error?: string
  disabled?: boolean
  fieldConfig?: FieldConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const value = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const inputType = computed(() => {
  if (props.field.type === 'number') return 'number'
  if (props.field.constraints.email) return 'email'
  return 'text'
})

const label = computed(() => props.fieldConfig?.label || props.field.ui.label || formatLabel(props.field.name))
const description = computed(() => props.fieldConfig?.description || props.field.ui.description)
const placeholder = computed(() => props.fieldConfig?.placeholder || props.field.ui.placeholder)
const unit = computed(() => props.fieldConfig?.unit || props.field.ui.unit)
const isDisabled = computed(() => props.disabled || props.fieldConfig?.disabled)

function formatLabel(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function renderInput() {
  // Custom component override
  if (props.fieldConfig?.component) {
    return h(props.fieldConfig.component, {
      'modelValue': value.value,
      'onUpdate:modelValue': (v: unknown) => { value.value = v },
      'disabled': isDisabled.value,
      ...props.fieldConfig?.componentProps,
    })
  }

  const f = props.field

  if (f.type === 'boolean') {
    const USwitch = resolveComponent('USwitch')
    return h(USwitch, {
      'modelValue': value.value,
      'onUpdate:modelValue': (v: unknown) => { value.value = v },
      'disabled': isDisabled.value,
    })
  }

  if (f.type === 'picklist' || f.type === 'enum') {
    const USelect = resolveComponent('USelect')
    return h(USelect, {
      'modelValue': value.value,
      'onUpdate:modelValue': (v: unknown) => { value.value = v },
      'placeholder': placeholder.value,
      'disabled': isDisabled.value,
      'items': f.options || [],
    })
  }

  // Default: UInput
  const UInput = resolveComponent('UInput')
  const inputProps: Record<string, unknown> = {
    'modelValue': value.value,
    'onUpdate:modelValue': (v: unknown) => {
      value.value = f.type === 'number' ? Number(v) : v
    },
    'type': inputType.value,
    'placeholder': placeholder.value,
    'disabled': isDisabled.value,
  }
  if (f.type === 'number') {
    if (f.constraints.min !== undefined) inputProps.min = f.constraints.min
    if (f.constraints.max !== undefined) inputProps.max = f.constraints.max
  }
  if (f.constraints.minLength !== undefined) inputProps.minlength = f.constraints.minLength
  if (f.constraints.maxLength !== undefined) inputProps.maxlength = f.constraints.maxLength

  return h(UInput, inputProps)
}
</script>

<template>
  <component
    :is="resolveComponent('UFormField')"
    :label="label"
    :description="description"
    :error="error"
    :required="field.required"
  >
    <template #default>
      <div class="flex items-center gap-2">
        <component :is="renderInput" />
        <span
          v-if="unit"
          class="text-sm text-muted"
        >{{ unit }}</span>
      </div>
    </template>
  </component>
</template>
