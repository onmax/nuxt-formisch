<script setup lang="ts">
import { computed } from 'vue'
import { insert, remove, useFieldArray } from '@formisch/vue'
import UButton from '@nuxt/ui/components/Button.vue'
import type { ResolvedField } from '../utils/introspectSchema'
import { colSpan, formPath, useAutoForm } from '../utils/autoForm'
import type { FieldPath } from '../utils/autoForm'
import AutoFormField from './AutoFormField.vue'

const { field, path } = defineProps<{
  field: ResolvedField
  path: FieldPath
}>()

const { form, disabled, ui } = useAutoForm()

const array = useFieldArray(form, () => ({ path: formPath(path) }))
const item = computed(() => field.item)
const isDisabled = computed(() => disabled.value || Boolean(field.disabled))
const addLabel = computed(() => `Add ${field.label.replace(/s$/, '')}`)

function add() {
  insert(form, { path: formPath(path) })
}

function removeAt(at: number) {
  remove(form, { path: formPath(path), at })
}
</script>

<template>
  <div :class="ui.array">
    <div :class="ui.arrayLegend">
      {{ field.label }}
    </div>

    <div
      v-for="(id, index) in array.items"
      :key="id"
      :class="ui.arrayItem"
    >
      <div :class="ui.arrayItemFields">
        <template v-if="item?.type === 'object'">
          <AutoFormField
            v-for="child in item.fields"
            :key="child.key"
            :field="child"
            :path="[...path, index, child.name]"
            :style="colSpan(child.colSpan)"
          />
        </template>
        <AutoFormField
          v-else-if="item"
          :field="item"
          :path="[...path, index]"
        />
      </div>
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="sm"
        :aria-label="`Remove item ${index + 1}`"
        :class="ui.arrayRemove"
        :disabled="isDisabled"
        @click="removeAt(index)"
      />
    </div>

    <p
      v-if="array.errors"
      :class="ui.error"
    >
      {{ array.errors[0] }}
    </p>

    <UButton
      icon="i-lucide-plus"
      variant="outline"
      size="sm"
      :class="ui.arrayAdd"
      :disabled="isDisabled"
      @click="add"
    >
      {{ addLabel }}
    </UButton>
  </div>
</template>
