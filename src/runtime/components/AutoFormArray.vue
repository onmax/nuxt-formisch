<script setup lang="ts">
import { computed, ref, resolveComponent, watch, useAppConfig, useId } from '#imports'
import type { ResolvedField, FieldConfig } from '../composables/useSchemaIntrospection'
import { formatLabel } from '../utils/formatLabel'
import theme from '../theme/autoFormArray'
import AutoFormField from './AutoFormField.vue'

type SlotKeys = 'root' | 'legend' | 'item' | 'removeButton' | 'addButton' | 'grid'

const props = defineProps<{
  field: ResolvedField
  modelValue: unknown[]
  errors?: Record<string, string>
  disabled?: boolean
  fieldConfig?: Record<string, FieldConfig>
  columns?: 1 | 2 | 3 | 4
  class?: string
  ui?: Partial<Record<SlotKeys, string>>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown[]]
}>()

// Resolve UButton once at setup time
const UButton = resolveComponent('UButton')
if (import.meta.dev && typeof UButton === 'string') {
  console.warn('[formisch] UButton not found. Install @nuxt/ui')
}

// SSR-safe ID generation
const baseId = useId()
let idCounter = 0
function generateId() {
  return `${baseId}-${idCounter++}`
}

const label = computed(() => props.fieldConfig?.[props.field.name]?.label || props.field.ui.label || formatLabel(props.field.name))

const items = computed(() => props.modelValue || [])

// Stable IDs for v-for key (avoid index-based keys)
const itemIds = ref<string[]>([])
watch(() => props.modelValue, (newItems: unknown[] | undefined) => {
  const newIds = [...itemIds.value]
  while (newIds.length < (newItems?.length || 0)) {
    newIds.push(generateId())
  }
  newIds.length = newItems?.length || 0
  itemIds.value = newIds
}, { immediate: true })
const isObjectArray = computed(() => {
  if (!props.field.itemSchema?.length) return false
  // Object array if first item is object type OR has multiple fields
  const first = props.field.itemSchema[0]
  return first?.type === 'object' || props.field.itemSchema.length > 1
})

function addItem() {
  const newItem = isObjectArray.value
    ? Object.fromEntries((props.field.itemSchema || []).map(f => [f.name, getDefault(f)]))
    : getDefault(props.field.itemSchema?.[0])
  emit('update:modelValue', [...items.value, newItem])
}

function removeItem(index: number) {
  emit('update:modelValue', items.value.filter((_: unknown, i: number) => i !== index))
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

const appConfig = useAppConfig()
const slots = computed(() => {
  const tv = theme({ columns: props.columns || 1 })
  const appUi = (appConfig.ui as { autoFormArray?: Partial<Record<SlotKeys, string>> } | undefined)?.autoFormArray
  return {
    root: [tv.root(), appUi?.root, props.ui?.root, props.class].filter(Boolean).join(' '),
    legend: [tv.legend(), appUi?.legend, props.ui?.legend].filter(Boolean).join(' '),
    item: [tv.item(), appUi?.item, props.ui?.item].filter(Boolean).join(' '),
    removeButton: [tv.removeButton(), appUi?.removeButton, props.ui?.removeButton].filter(Boolean).join(' '),
    addButton: [tv.addButton(), appUi?.addButton, props.ui?.addButton].filter(Boolean).join(' '),
    grid: [tv.grid(), appUi?.grid, props.ui?.grid].filter(Boolean).join(' '),
  }
})
</script>

<template>
  <div :class="slots.root">
    <div :class="slots.legend">
      {{ label }}
    </div>

    <div
      v-for="(item, index) in items"
      :key="itemIds[index]"
      :class="slots.item"
    >
      <!-- Object array: render fields for each property -->
      <div
        v-if="isObjectArray"
        :class="slots.grid"
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
        class="flex-1"
        @update:model-value="updateItem(index, $event)"
      />

      <component
        :is="UButton"
        variant="ghost"
        color="error"
        size="xs"
        icon="i-lucide-trash-2"
        :class="slots.removeButton"
        :disabled="disabled"
        @click="removeItem(index)"
      />
    </div>

    <component
      :is="UButton"
      variant="outline"
      size="sm"
      icon="i-lucide-plus"
      :class="slots.addButton"
      :disabled="disabled"
      @click="addItem"
    >
      Add {{ field.ui.label || formatLabel(field.name).replace(/s$/, '') }}
    </component>
  </div>
</template>
