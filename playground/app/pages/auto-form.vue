<script setup lang="ts">
import * as v from 'valibot'

useSeoMeta({ title: 'AutoForm', description: 'Forms generated from Valibot schemas with FAutoForm and Nuxt UI' })

const submitted = ref<{ form: string, output: unknown }>()
function show(form: string, output: unknown) {
  submitted.value = { form, output }
}

// Labels from v.title(), units and sections from v.metadata(), inputs from the schema type.
const settingsSchema = v.object({
  displayName: v.pipe(v.string(), v.minLength(2), v.maxLength(40)),
  email: v.pipe(v.string(), v.email(), v.title('Email address')),
  theme: v.pipe(v.picklist(['light', 'dark', 'system']), v.description('Applies to every device')),
  notifications: v.boolean(),
  leadTime: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(365), v.metadata({ unit: 'days', section: 'Inventory' })),
  safetyStock: v.pipe(v.number(), v.integer(), v.minValue(0), v.metadata({ unit: 'units', section: 'Inventory' })),
  bio: v.pipe(v.optional(v.string()), v.metadata({ type: 'textarea' })),
})

// Nested objects, arrays of objects and records (edited as JSON).
const teamSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  address: v.object({
    city: v.pipe(v.string(), v.minLength(1)),
    country: v.pipe(v.string(), v.minLength(1)),
  }),
  members: v.pipe(v.array(v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    role: v.picklist(['lead', 'developer', 'designer']),
  })), v.minLength(1, 'Add at least one member')),
  labels: v.record(v.string(), v.string()),
})

// No schema at hand: infer one from data.
const legacyConfig = { retries: 3, endpoint: 'https://api.example.com', verbose: false, tags: ['beta'] }
const legacySchema = jsonToValibotSchema(legacyConfig)
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold">
        AutoForm
      </h1>
      <p class="text-muted">
        <code>&lt;FAutoForm&gt;</code> renders a Nuxt UI form from a Valibot schema. The submit handler gets the typed output.
      </p>
    </div>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Settings
        </h2>
      </template>
      <FAutoForm
        :schema="settingsSchema"
        :initial-input="{ displayName: 'Ada', email: 'ada@example.com', theme: 'system', notifications: true, leadTime: 14, safetyStock: 100 }"
        :columns="2"
        :field-config="{ bio: { colSpan: 2, placeholder: 'Tell us about yourself' } }"
        @submit="output => show('settings', output)"
      />
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Team
        </h2>
      </template>
      <FAutoForm
        :schema="teamSchema"
        :initial-input="{ name: 'Engineering', address: { city: 'Copenhagen', country: 'Denmark' }, members: [{ name: 'Alice', role: 'lead' }], labels: { area: 'core' } }"
        :columns="2"
        :field-config="{ 'members.role': { placeholder: 'Pick a role' } }"
        @submit="output => show('team', output)"
      >
        <template #actions="{ form, reset }">
          <UButton
            type="submit"
            :loading="form.isSubmitting"
          >
            Save team
          </UButton>
          <UButton
            variant="outline"
            :disabled="!form.isDirty"
            @click="reset"
          >
            Reset
          </UButton>
        </template>
      </FAutoForm>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Inferred from JSON
        </h2>
      </template>
      <FAutoForm
        :schema="legacySchema"
        :initial-input="legacyConfig"
        @submit="output => show('legacy', output)"
      />
    </UCard>

    <UAlert
      v-if="submitted"
      color="success"
      variant="soft"
      :title="`Submitted ${submitted.form}`"
    >
      <template #description>
        <pre class="text-xs">{{ submitted.output }}</pre>
      </template>
    </UAlert>
  </div>
</template>
