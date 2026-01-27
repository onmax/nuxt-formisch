<script setup lang="ts">
import { computed, resolveComponent, h, useAppConfig } from '#imports'
import type { ResolvedField, FieldConfig } from '../composables/useSchemaIntrospection'
import { formatLabel } from '../utils/formatLabel'
import theme from '../theme/autoFormField'

type SlotKeys = 'root' | 'wrapper' | 'unit'

const props = defineProps<{
  field: ResolvedField
  modelValue: unknown
  error?: string
  disabled?: boolean
  fieldConfig?: FieldConfig
  class?: string
  ui?: Partial<Record<SlotKeys, string>>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

// Resolve components once at setup time and warn if missing
const USwitch = resolveComponent('USwitch')
const USelect = resolveComponent('USelect')
const UInput = resolveComponent('UInput')
const UFormField = resolveComponent('UFormField')

if (import.meta.dev) {
  if (typeof USwitch === 'string') console.warn('[formisch] USwitch not found. Install @nuxt/ui')
  if (typeof USelect === 'string') console.warn('[formisch] USelect not found. Install @nuxt/ui')
  if (typeof UInput === 'string') console.warn('[formisch] UInput not found. Install @nuxt/ui')
  if (typeof UFormField === 'string') console.warn('[formisch] UFormField not found. Install @nuxt/ui')
}

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

const appConfig = useAppConfig()
const slots = computed(() => {
  const tv = theme()
  const appUi = (appConfig.ui as { autoFormField?: Partial<Record<SlotKeys, string>> } | undefined)?.autoFormField
  return {
    root: [tv.root(), appUi?.root, props.ui?.root, props.class].filter(Boolean).join(' '),
    wrapper: [tv.wrapper(), appUi?.wrapper, props.ui?.wrapper].filter(Boolean).join(' '),
    unit: [tv.unit(), appUi?.unit, props.ui?.unit].filter(Boolean).join(' '),
  }
})

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
    return h(USwitch, {
      'modelValue': value.value,
      'onUpdate:modelValue': (v: unknown) => { value.value = v },
      'disabled': isDisabled.value,
    })
  }

  if (f.type === 'picklist' || f.type === 'enum') {
    return h(USelect, {
      'modelValue': value.value,
      'onUpdate:modelValue': (v: unknown) => { value.value = v },
      'placeholder': placeholder.value,
      'disabled': isDisabled.value,
      'items': f.options || [],
    })
  }

  // Default: UInput
  const inputProps: Record<string, unknown> = {
    'modelValue': value.value,
    'onUpdate:modelValue': (v: unknown) => {
      const num = Number(v)
      value.value = f.type === 'number' ? (Number.isNaN(num) ? undefined : num) : v
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
    :is="UFormField"
    :label="label"
    :description="description"
    :error="error"
    :required="field.required"
    :class="slots.root"
  >
    <template #default>
      <div :class="slots.wrapper">
        <component :is="renderInput()" />
        <span
          v-if="unit"
          :class="slots.unit"
        >{{ unit }}</span>
      </div>
    </template>
  </component>
</template>
