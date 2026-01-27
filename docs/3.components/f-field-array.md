---
icon: ph:list-plus-duotone
---

# FFieldArray

A scoped slot component that provides array field state without requiring the `useFieldArray` composable in your script. Use this for dynamic lists where items can be added, removed, or reordered.

## Usage

```vue [components/TagsForm.vue]
<template>
  <FForm :of="form" :on-submit="onSubmit">
    <FFieldArray v-slot="tags" :of="form" :path="['tags']">
      <div v-for="(key, index) in tags.items" :key="key">
        <FField v-slot="tag" :of="form" :path="['tags', index]">
          <input v-model="tag.input" />
        </FField>
        <button @click="remove(form, { path: ['tags'], index })">Remove</button>
      </div>
    </FFieldArray>
    <button @click="insert(form, { path: ['tags'], value: '' })">Add Tag</button>
  </FForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  tags: v.array(v.string())
})

const form = useForm({ schema, initialInput: { tags: [''] } })

function onSubmit(values: v.InferOutput<typeof schema>) {
  console.log(values.tags)
}
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `of` | `FormStore<TSchema>` | **Required.** The form store from `useForm` |
| `path` | `ValidArrayPath<...>` | **Required.** Path tuple to the array field |

### of

The form store returned by `useForm`.

### path

A tuple of keys pointing to an array field in your schema.

```vue
<!-- Root-level array -->
<FFieldArray :of="form" :path="['items']" v-slot="array">

<!-- Nested array -->
<FFieldArray :of="form" :path="['order', 'lineItems']" v-slot="array">
```

## Slot Props

The default slot receives the full `FieldArrayStore` as props.

```ts
interface FieldArrayStore {
  path: ValidArrayPath<...>
  items: string[]
  errors: string[] | null
  isTouched: boolean
  isDirty: boolean
  isValid: boolean
}
```

### items

Array of unique string keys for each item. Use these as `key` in `v-for` for proper Vue reactivity.

```vue
<div v-for="(key, index) in array.items" :key="key">
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

Use these auto-imported methods to manipulate array fields.

```ts
// Add item
insert(form, { path: ['items'], value: { name: '' } })

// Add at specific index
insert(form, { path: ['items'], value: { name: '' }, index: 0 })

// Remove item
remove(form, { path: ['items'], index: 2 })

// Move item
move(form, { path: ['items'], from: 0, to: 2 })

// Swap items
swap(form, { path: ['items'], indexA: 0, indexB: 1 })

// Replace item
replace(form, { path: ['items'], index: 0, value: { name: 'New' } })
```

## Complete Example

```vue [components/ItemsForm.vue]
<template>
  <FForm :of="form" :on-submit="onSubmit" class="space-y-4">
    <FFieldArray v-slot="items" :of="form" :path="['items']">
      <div
        v-for="(key, index) in items.items"
        :key="key"
        class="flex gap-2"
      >
        <FField v-slot="name" :of="form" :path="['items', index, 'name']">
          <UFormField :error="name.errors?.[0]">
            <UInput v-model="name.input" placeholder="Name" />
          </UFormField>
        </FField>

        <FField v-slot="qty" :of="form" :path="['items', index, 'quantity']">
          <UFormField :error="qty.errors?.[0]">
            <UInput v-model.number="qty.input" type="number" />
          </UFormField>
        </FField>

        <UButton
          color="error"
          variant="ghost"
          @click="remove(form, { path: ['items'], index })"
        >
          Remove
        </UButton>
      </div>

      <p v-if="items.errors" class="text-red-500">
        {{ items.errors[0] }}
      </p>
    </FFieldArray>

    <div class="flex gap-2">
      <UButton
        variant="outline"
        @click="insert(form, { path: ['items'], value: { name: '', quantity: 1 } })"
      >
        Add Item
      </UButton>

      <UButton type="submit" :loading="form.isSubmitting">
        Submit
      </UButton>
    </div>
  </FForm>
</template>

<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  items: v.pipe(
    v.array(v.object({
      name: v.pipe(v.string(), v.minLength(1, 'Required')),
      quantity: v.pipe(v.number(), v.minValue(1))
    })),
    v.minLength(1, 'At least one item required')
  )
})

const form = useForm({
  schema,
  initialInput: {
    items: [{ name: '', quantity: 1 }]
  }
})

function onSubmit(values: v.InferOutput<typeof schema>) {
  console.log(values.items)
}
</script>
```

## FFieldArray vs useFieldArray

Both provide identical functionality.

**Use `FFieldArray`** when:
- You want array logic scoped in the template
- You prefer component-based patterns

**Use `useFieldArray`** when:
- You need array state in script
- You have complex array manipulation logic
