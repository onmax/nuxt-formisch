<script setup lang="ts">
import * as v from 'valibot'

const flatSchema = v.object({
  username: v.pipe(v.string(), v.minLength(2), v.title('Username')),
  email: v.pipe(v.string(), v.email(), v.title('Email Address')),
  age: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(120), v.metadata({ unit: 'years' })),
  role: v.picklist(['admin', 'editor', 'viewer']),
  active: v.boolean(),
  bio: v.pipe(v.optional(v.string()), v.title('Biography')),
  secret: v.pipe(v.string(), v.metadata({ hidden: true })),
})

const nestedSchema = v.object({
  address: v.object({
    street: v.string(),
    zip: v.pipe(v.string(), v.title('ZIP Code')),
  }),
  mappings: v.record(v.string(), v.string()),
  members: v.array(v.object({
    name: v.pipe(v.string(), v.title('Member Name')),
    filters: v.pipe(v.array(v.string()), v.title('Filters')),
  })),
})

// Dotted slot names need the dynamic slot syntax in templates.
const memberSlot = 'field:members.name'

const submitSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Too short')),
  tags: v.array(v.string()),
  settings: v.record(v.string(), v.number()),
})
const submitted = ref<v.InferOutput<typeof submitSchema>>()

const inferred = { count: 42, label: 'test', tags: ['a', 'b'] }
const inferredSchema = jsonToValibotSchema(inferred)
</script>

<template>
  <div>
    <FAutoForm
      :schema="flatSchema"
      :initial-input="{ username: 'ada', email: 'ada@example.com', age: 36, role: 'editor', active: true, secret: 'x' }"
      :columns="2"
      :field-config="{ username: { description: 'Shown publicly' } }"
      :ui="{ grid: 'prop-grid' }"
    />

    <FAutoForm
      :schema="nestedSchema"
      :initial-input="{ address: { street: 'Main St', zip: '1000' }, mappings: { a: 'A' }, members: [{ name: 'Alice', filters: ['x'] }] }"
      :field-config="{ 'address.street': { label: 'Street Name' } }"
    >
      <template #[memberSlot]="{ path }">
        <span class="custom-member-slot">{{ path.join('.') }}</span>
      </template>
      <template #actions>
        <button type="submit">
          Save nested
        </button>
      </template>
    </FAutoForm>

    <FAutoForm
      :schema="inferredSchema"
      :initial-input="inferred"
    />

    <section id="submit">
      <FAutoForm
        :schema="submitSchema"
        :initial-input="{ name: 'Ada', tags: [], settings: { retries: 1 } }"
        @submit="output => submitted = output"
      />
      <pre id="submitted">{{ submitted }}</pre>
    </section>
  </div>
</template>
