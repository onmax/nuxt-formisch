<template>
  <div>
    <!-- Test 1: Flat schema with all leaf types -->
    <section id="flat">
      <h2>Flat Schema</h2>
      <FAutoForm
        :schema="flatSchema"
        :initial-values="flatValues"
        :columns="2"
      />
    </section>

    <!-- Test 2: Nested object -->
    <section id="nested">
      <h2>Nested Object</h2>
      <FAutoForm
        :schema="nestedSchema"
        :initial-values="nestedValues"
      />
    </section>

    <!-- Test 3: Array of objects -->
    <section id="array">
      <h2>Array Schema</h2>
      <FAutoForm
        :schema="arraySchema"
        :initial-values="arrayValues"
      />
    </section>

    <!-- Test 4: jsonToValibotSchema inferred -->
    <section id="inferred">
      <h2>Inferred Schema</h2>
      <FAutoForm
        :schema="inferredSchema"
        :initial-values="rawJson"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import * as v from 'valibot'
import { jsonToValibotSchema } from '../../../src/runtime/composables/useJsonToSchema'

// --- Flat: string, number, boolean, picklist, email ---
const flatSchema = v.object({
  username: v.pipe(v.string(), v.minLength(2), v.title('Username')),
  email: v.pipe(v.string(), v.email(), v.title('Email Address')),
  age: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(120), v.title('Age'), v.metadata({ unit: 'years' })),
  role: v.pipe(v.picklist(['admin', 'editor', 'viewer']), v.title('Role')),
  active: v.pipe(v.boolean(), v.title('Active')),
  bio: v.pipe(v.optional(v.string()), v.title('Bio')),
})

const flatValues = { username: 'john', email: 'john@test.com', age: 30, role: 'editor' as const, active: true, bio: 'Hello' }

// --- Nested object ---
const nestedSchema = v.object({
  name: v.pipe(v.string(), v.title('Name')),
  address: v.object({
    street: v.pipe(v.string(), v.title('Street')),
    city: v.pipe(v.string(), v.title('City')),
    zip: v.pipe(v.string(), v.title('ZIP Code')),
  }),
})

const nestedValues = { name: 'Jane', address: { street: '123 Main St', city: 'Copenhagen', zip: '1000' } }

// --- Array of objects ---
const arraySchema = v.object({
  team_name: v.pipe(v.string(), v.title('Team Name')),
  members: v.array(v.object({
    name: v.pipe(v.string(), v.title('Member Name')),
    role: v.pipe(v.picklist(['lead', 'dev', 'design']), v.title('Member Role')),
  })),
})

const arrayValues = { team_name: 'Alpha', members: [{ name: 'Alice', role: 'lead' as const }, { name: 'Bob', role: 'dev' as const }] }

// --- Inferred from raw JSON ---
const rawJson = { count: 42, label: 'test', enabled: true, tags: ['a', 'b'], nested: { x: 1, y: 2 } }
const inferredSchema = jsonToValibotSchema(rawJson)
</script>
