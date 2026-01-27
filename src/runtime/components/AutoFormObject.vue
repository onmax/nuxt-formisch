<script setup lang="ts">
import { computed } from 'vue'
import type { ResolvedField, FieldConfig } from '../composables/useSchemaIntrospection'
import { formatLabel } from '../utils/formatLabel'
import AutoFormField from './AutoFormField.vue'

const props = defineProps<{
  field: ResolvedField
  modelValue: Record<string, unknown>
  errors?: Record<string, string>
  disabled?: boolean
  fieldConfig?: Record<string, FieldConfig>
  columns?: number
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

const GRID_COLS: Record<number, string> = { 1: 'grid gap-4 grid-cols-1', 2: 'grid gap-4 grid-cols-2', 3: 'grid gap-4 grid-cols-3', 4: 'grid gap-4 grid-cols-4' }
const gridClass = computed(() => GRID_COLS[props.columns || 1] || GRID_COLS[1])
</script>

<template>
  <fieldset class="border border-default rounded-lg p-4 space-y-4">
    <legend class="text-sm font-medium px-2">
      {{ label }}
    </legend>
    <div :class="gridClass">
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
