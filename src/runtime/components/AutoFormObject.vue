<script setup lang="ts">
import { computed, useAppConfig } from '#imports'
import type { ResolvedField, FieldConfig } from '../composables/useSchemaIntrospection'
import { formatLabel } from '../utils/formatLabel'
import theme from '../theme/autoFormObject'
import AutoFormField from './AutoFormField.vue'

type SlotKeys = 'root' | 'legend' | 'grid'

const props = defineProps<{
  field: ResolvedField
  modelValue: Record<string, unknown>
  errors?: Record<string, string>
  disabled?: boolean
  fieldConfig?: Record<string, FieldConfig>
  columns?: 1 | 2 | 3 | 4
  class?: string
  ui?: Partial<Record<SlotKeys, string>>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

const label = computed(() => props.fieldConfig?.[props.field.name]?.label || props.field.ui.label || formatLabel(props.field.name))

function updateChild(key: string, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const visibleChildren = computed(() => {
  if (!props.field.children) return []
  return props.field.children
    .filter(c => !props.fieldConfig?.[c.name]?.hidden)
    .sort((a, b) => (props.fieldConfig?.[a.name]?.order ?? 0) - (props.fieldConfig?.[b.name]?.order ?? 0))
})

const appConfig = useAppConfig()
const slots = computed(() => {
  const tv = theme({ columns: props.columns || 1 })
  const appUi = (appConfig.ui as { autoFormObject?: Partial<Record<SlotKeys, string>> } | undefined)?.autoFormObject
  return {
    root: [tv.root(), appUi?.root, props.ui?.root, props.class].filter(Boolean).join(' '),
    legend: [tv.legend(), appUi?.legend, props.ui?.legend].filter(Boolean).join(' '),
    grid: [tv.grid(), appUi?.grid, props.ui?.grid].filter(Boolean).join(' '),
  }
})
</script>

<template>
  <fieldset :class="slots.root">
    <legend :class="slots.legend">
      {{ label }}
    </legend>
    <div :class="slots.grid">
      <template
        v-for="child in visibleChildren"
        :key="child.name"
      >
        <AutoFormObject
          v-if="child.type === 'object' && child.children"
          :field="child"
          :model-value="(modelValue[child.name] as Record<string, unknown>) || {}"
          :errors="errors"
          :disabled="disabled"
          :field-config="fieldConfig"
          :columns="columns"
          :style="fieldConfig?.[child.name]?.colSpan ? `grid-column: span ${fieldConfig[child.name]!.colSpan}` : undefined"
          @update:model-value="updateChild(child.name, $event)"
        />
        <AutoFormField
          v-else
          :field="child"
          :model-value="modelValue[child.name]"
          :error="errors?.[child.path.join('.')]"
          :disabled="disabled"
          :field-config="fieldConfig?.[child.name]"
          :style="fieldConfig?.[child.name]?.colSpan ? `grid-column: span ${fieldConfig[child.name]!.colSpan}` : undefined"
          @update:model-value="updateChild(child.name, $event)"
        />
      </template>
    </div>
  </fieldset>
</template>
