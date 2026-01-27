---
icon: ph:list-plus-duotone
---

# useFieldArray

Manages dynamic arrays of fields with add, remove, and reorder operations. Use this composable for repeatable form sections like lists of items.

## Usage

```vue [components/TagsInput.vue]
<template>
  <div v-for="(item, index) in tagsArray.items" :key="item">
    <input v-model="getTagField(index).input" />
    <button @click="remove(form, { path: ['tags'], index })">Remove</button>
  </div>
  <button @click="insert(form, { path: ['tags'], value: '' })">Add Tag</button>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  tags: v.array(v.string())
})

const form = useForm({ schema })
const tagsArray = useFieldArray(() => form, () => ({ path: ['tags'] as const }))

function getTagField(index: number) {
  return useField(() => form, () => ({ path: ['tags', index] as const }))
}
</script>
```

## Parameters

Both parameters are getter functions to support reactivity.

```ts
useFieldArray(
  () => form,                         // FormStore getter
  () => ({ path: ['items'] as const }) // Config getter
)
```

### form

A getter returning the `FormStore` from `useForm`.

### config

A getter returning the field array configuration.

```ts
interface UseFieldArrayConfig<TSchema, TFieldArrayPath> {
  path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>
}
```

The `path` must point to an array field in your schema.

## Return Value

```ts
interface FieldArrayStore<TSchema, TFieldArrayPath> {
  path: ValidArrayPath<...>
  items: string[]
  errors: string[] | null
  isTouched: boolean
  isDirty: boolean
  isValid: boolean
}
```

### path

The array field path as provided in config.

### items

Array of unique string keys for each item. Use these as `key` in `v-for` loops for proper reactivity.

```vue
<div v-for="(key, index) in array.items" :key="key">
  <!-- key is a stable unique identifier -->
</div>
```

### errors

Array-level validation errors, or `null` if valid.

### isTouched

True if any item in the array has been focused.

### isDirty

True if the array differs from its initial state.

### isValid

True when no array-level validation errors exist.

## Array Methods

These methods are auto-imported and operate on array fields.

### insert

Add a new item to the array.

```ts
// Append to end
insert(form, { path: ['items'], value: { name: '' } })

// Insert at specific index
insert(form, { path: ['items'], value: { name: '' }, index: 0 })
```

### remove

Remove an item from the array.

```ts
remove(form, { path: ['items'], index: 2 })
```

### move

Move an item from one position to another.

```ts
move(form, { path: ['items'], from: 0, to: 2 })
```

### swap

Swap two items in the array.

```ts
swap(form, { path: ['items'], indexA: 0, indexB: 1 })
```

### replace

Replace an item at a specific index.

```ts
replace(form, { path: ['items'], index: 0, value: { name: 'New' } })
```

## Complete Example

A form with dynamic list items.

```vue [components/ItemsForm.vue]
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <div v-for="(key, index) in itemsArray.items" :key="key" class="flex gap-2 mb-2">
      <UFormField :error="getItemField(index, 'name').errors?.[0]">
        <UInput v-model="getItemField(index, 'name').input" placeholder="Name" />
      </UFormField>

      <UFormField :error="getItemField(index, 'quantity').errors?.[0]">
        <UInput v-model.number="getItemField(index, 'quantity').input" type="number" />
      </UFormField>

      <UButton color="error" @click="remove(form, { path: ['items'], index })">
        Remove
      </UButton>
    </div>

    <UButton @click="insert(form, { path: ['items'], value: { name: '', quantity: 1 } })">
      Add Item
    </UButton>

    <UButton type="submit" :loading="form.isSubmitting">
      Submit
    </UButton>
  </FForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  items: v.array(v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Name required')),
    quantity: v.pipe(v.number(), v.minValue(1, 'Minimum 1'))
  }))
})

const form = useForm({
  schema,
  initialInput: {
    items: [{ name: '', quantity: 1 }]
  }
})

const itemsArray = useFieldArray(() => form, () => ({ path: ['items'] as const }))

function getItemField(index: number, field: 'name' | 'quantity') {
  return useField(() => form, () => ({ path: ['items', index, field] as const }))
}

function onSubmit(values: v.InferOutput<typeof schema>) {
  console.log(values.items)
}
</script>
```
