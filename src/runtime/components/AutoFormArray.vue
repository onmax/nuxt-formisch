<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import type { ResolvedField, FieldConfig } from '../composables/useSchemaIntrospection'
import AutoFormField from './AutoFormField.vue'

const props = defineProps<{
  field: ResolvedField
  modelValue: unknown[]
  errors?: Record<string, string>
  disabled?: boolean
  fieldConfig?: Record<string, FieldConfig>
  columns?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown[]]
}>()

const label = computed(() => props.fieldConfig?.[props.field.name]?.label || props.field.ui.label || formatLabel(props.field.name))

function formatLabel(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const items = computed(() => props.modelValue || [])
const isObjectArray = computed(() => props.field.itemSchema && props.field.itemSchema.length > 1)

function addItem() {
  const newItem = isObjectArray.value
    ? Object.fromEntries((props.field.itemSchema || []).map(f => [f.name, getDefault(f)]))
    : getDefault(props.field.itemSchema?.[0])
  emit('update:modelValue', [...items.value, newItem])
}

function removeItem(index: number) {
  emit('update:modelValue', items.value.filter((_, i) => i !== index))
}

function updateItem(index: number, value: unknown) {
  const updated = [...items.value]
  updated[index] = value
  emit('update:modelValue', updated)
}

function updateItemField(index: number, key: string, value: unknown) {
  const updated = [...items.value]
  updated[index] = { ...(updated[index] as Record<string, unknown>), [key]: value }
  emit('update:modelValue', updated)
}

function getDefault(field?: ResolvedField): unknown {
  if (!field) return ''
  switch (field.type) {
    case 'number': return 0
    case 'boolean': return false
    case 'object': return {}
    case 'array': return []
    default: return ''
  }
}

const gridClass = computed(() => {
  const cols = props.columns || 1
  return `grid gap-4 grid-cols-${cols}`
})
</script>

<template>
  <fieldset class="border border-default rounded-lg p-4 space-y-4">
    <legend class="text-sm font-medium px-2">
      {{ label }}
    </legend>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="relative border border-default rounded-lg p-4"
    >
      <component
        :is="resolveComponent('UButton')"
        variant="ghost"
        color="error"
        size="xs"
        icon="i-lucide-trash-2"
        class="absolute top-2 right-2"
        :disabled="disabled"
        @click="removeItem(index)"
      />

      <!-- Object array: render fields for each property -->
      <div
        v-if="isObjectArray"
        :class="gridClass"
      >
        <AutoFormField
          v-for="childField in field.itemSchema"
          :key="childField.name"
          :field="childField"
          :model-value="(item as Record<string, unknown>)[childField.name]"
          :error="errors?.[`${field.name}.${index}.${childField.name}`]"
          :disabled="disabled"
          :field-config="fieldConfig?.[childField.name]"
          @update:model-value="updateItemField(index, childField.name, $event)"
        />
      </div>

      <!-- Scalar array: single input -->
      <AutoFormField
        v-else-if="field.itemSchema?.[0]"
        :field="field.itemSchema[0]"
        :model-value="item"
        :error="errors?.[`${field.name}.${index}`]"
        :disabled="disabled"
        @update:model-value="updateItem(index, $event)"
      />
    </div>

    <component
      :is="resolveComponent('UButton')"
      variant="outline"
      size="sm"
      icon="i-lucide-plus"
      :disabled="disabled"
      @click="addItem"
    >
      Add {{ field.ui.label || formatLabel(field.name).replace(/s$/, '') }}
    </component>
  </fieldset>
</template>
