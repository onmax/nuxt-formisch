<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useField } from '@formisch/vue'
import UFormField from '@nuxt/ui/components/FormField.vue'
import UInput from '@nuxt/ui/components/Input.vue'
import USelect from '@nuxt/ui/components/Select.vue'
import USwitch from '@nuxt/ui/components/Switch.vue'
import UTextarea from '@nuxt/ui/components/Textarea.vue'
import type { ResolvedField } from '../utils/introspectSchema'
import { colSpan, formPath, useAutoForm } from '../utils/autoForm'
import type { FieldPath } from '../utils/autoForm'
import AutoFormArray from './AutoFormArray.vue'

const { field, path } = defineProps<{
  field: ResolvedField
  path: FieldPath
}>()

const { form, disabled, ui, hasFieldSlot, renderFieldSlot } = useAutoForm()

const isLeaf = field.type !== 'object' && field.type !== 'array'
// The getter keeps array items pointing at the right index after a removal.
const store = isLeaf ? useField(form, () => ({ path: formPath(path) })) : undefined
const isDisabled = computed(() => disabled.value || Boolean(field.disabled))

/**
 * The field's input. Formisch types it as `unknown` here because the schema is
 * only known at runtime; `field.type` picks an input that matches it.
 */
const input = computed(() => store?.input)
const text = computed(() => input.value === undefined || input.value === null ? undefined : String(input.value))
const option = computed(() => field.options?.find(option => option.value === input.value)?.value)

function update(value: unknown) {
  if (!store) return
  const next = field.type === 'number' && (value === '' || value === null) ? undefined : value
  // SAFETY: Formisch can't type a runtime path. `field.type` picked an input that emits the schema's type.
  store.input = next as never
}

const inputType = computed(() => {
  if (field.type === 'number') return 'number'
  return field.constraints.format ?? 'text'
})

// `json` fields keep their own text so half-typed JSON isn't reformatted on every keystroke.
const jsonText = ref('')
const jsonError = ref<string>()
if (field.type === 'json') {
  watch(input, (value) => {
    if (jsonError.value === undefined && jsonText.value && sameJson(jsonText.value, value)) return
    jsonText.value = JSON.stringify(value ?? null, null, 2)
    jsonError.value = undefined
  }, { immediate: true })
}

function sameJson(text: string, value: unknown) {
  try {
    return JSON.stringify(JSON.parse(text)) === JSON.stringify(value)
  }
  catch {
    return false
  }
}

function setJson(text: string) {
  jsonText.value = text
  try {
    update(JSON.parse(text))
    jsonError.value = undefined
  }
  catch {
    jsonError.value = 'Invalid JSON'
  }
}

const error = computed(() => jsonError.value ?? store?.errors?.[0])

function FieldSlot() {
  return renderFieldSlot(field, path)
}
</script>

<template>
  <FieldSlot v-if="hasFieldSlot(field.key)" />

  <fieldset
    v-else-if="field.type === 'object'"
    :class="ui.object"
  >
    <legend :class="ui.objectLegend">
      {{ field.label }}
    </legend>
    <div :class="ui.grid">
      <AutoFormField
        v-for="child in field.fields"
        :key="child.key"
        :field="child"
        :path="[...path, child.name]"
        :style="colSpan(child.colSpan)"
      />
    </div>
  </fieldset>

  <AutoFormArray
    v-else-if="field.type === 'array'"
    :field
    :path
  />

  <UFormField
    v-else-if="store"
    :label="field.label || undefined"
    :description="field.description"
    :required="field.required && field.type !== 'boolean'"
    :error
  >
    <component
      :is="field.component"
      v-if="field.component"
      v-bind="field.componentProps"
      :model-value="input"
      :disabled="isDisabled"
      @update:model-value="update"
    />
    <USwitch
      v-else-if="field.type === 'boolean'"
      :model-value="input === true"
      :disabled="isDisabled"
      @update:model-value="update"
      @focus="store.props.onFocus"
      @blur="store.props.onBlur"
      @change="store.props.onChange"
    />
    <USelect
      v-else-if="field.type === 'enum'"
      :model-value="option"
      :items="field.options"
      :placeholder="field.placeholder ?? 'Select…'"
      :disabled="isDisabled"
      :class="ui.input"
      @update:model-value="update"
      @focus="store.props.onFocus"
      @blur="store.props.onBlur"
      @change="store.props.onChange"
    />
    <UTextarea
      v-else-if="field.type === 'json'"
      :model-value="jsonText"
      :placeholder="field.placeholder ?? '{}'"
      :disabled="isDisabled"
      :rows="3"
      :maxrows="15"
      autoresize
      :class="ui.json"
      @update:model-value="setJson"
      @focus="store.props.onFocus"
      @blur="store.props.onBlur"
    />
    <UTextarea
      v-else-if="field.type === 'textarea'"
      :model-value="text"
      :placeholder="field.placeholder"
      :disabled="isDisabled"
      :minlength="field.constraints.minLength"
      :maxlength="field.constraints.maxLength"
      :class="ui.input"
      @update:model-value="update"
      @focus="store.props.onFocus"
      @blur="store.props.onBlur"
      @change="store.props.onChange"
    />
    <UInput
      v-else
      :model-value="text"
      :type="inputType"
      :placeholder="field.placeholder"
      :disabled="isDisabled"
      :min="field.constraints.min"
      :max="field.constraints.max"
      :step="field.type === 'number' ? (field.constraints.integer ? 1 : 'any') : undefined"
      :minlength="field.constraints.minLength"
      :maxlength="field.constraints.maxLength"
      :class="ui.input"
      @update:model-value="update"
      @focus="store.props.onFocus"
      @blur="store.props.onBlur"
      @change="store.props.onChange"
    >
      <template
        v-if="field.unit"
        #trailing
      >
        <span :class="ui.unit">{{ field.unit }}</span>
      </template>
    </UInput>
  </UFormField>
</template>
