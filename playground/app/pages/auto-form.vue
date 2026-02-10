<template>
  <UApp>
    <UContainer class="min-h-screen py-8 space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">
          Auto Form Demo
        </h1>
        <p class="text-gray-500">
          Valibot schema → auto-generated Nuxt UI form
        </p>
      </div>

      <!-- Flat schema -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">
            Reorder Point Config
          </h2>
        </template>
        <FAutoForm
          :schema="reorderPointSchema"
          :initial-values="reorderPointValues"
          :field-config="reorderPointFieldConfig"
          :columns="2"
          @submit="onSubmit('reorderPoint', $event)"
        >
          <template #actions="{ isDirty, reset }">
            <div class="flex gap-2 pt-4">
              <UButton
                variant="outline"
                :disabled="!isDirty"
                @click="reset"
              >
                Reset
              </UButton>
              <UButton
                type="submit"
                :disabled="!isDirty"
              >
                Save
              </UButton>
            </div>
          </template>
        </FAutoForm>
      </UCard>

      <!-- Schema with picklist + boolean -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">
            Profile Settings
          </h2>
        </template>
        <FAutoForm
          :schema="profileSettingsSchema"
          :initial-values="profileValues"
          :columns="2"
          @submit="onSubmit('profileSettings', $event)"
        >
          <template #actions="{ isDirty, reset }">
            <div class="flex gap-2 pt-4">
              <UButton
                variant="outline"
                :disabled="!isDirty"
                @click="reset"
              >
                Reset
              </UButton>
              <UButton
                type="submit"
                :disabled="!isDirty"
              >
                Save
              </UButton>
            </div>
          </template>
        </FAutoForm>
      </UCard>

      <!-- Nested object schema -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">
            Warehouse Config (nested)
          </h2>
        </template>
        <FAutoForm
          :schema="warehouseSchema"
          :initial-values="warehouseValues"
          @submit="onSubmit('warehouse', $event)"
        >
          <template #actions="{ isDirty, reset }">
            <div class="flex gap-2 pt-4">
              <UButton
                variant="outline"
                :disabled="!isDirty"
                @click="reset"
              >
                Reset
              </UButton>
              <UButton
                type="submit"
                :disabled="!isDirty"
              >
                Save
              </UButton>
            </div>
          </template>
        </FAutoForm>
      </UCard>

      <!-- Array schema -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">
            Team Members (array)
          </h2>
        </template>
        <FAutoForm
          :schema="teamSchema"
          :initial-values="teamValues"
          @submit="onSubmit('team', $event)"
        >
          <template #actions="{ isDirty, reset }">
            <div class="flex gap-2 pt-4">
              <UButton
                variant="outline"
                :disabled="!isDirty"
                @click="reset"
              >
                Reset
              </UButton>
              <UButton
                type="submit"
                :disabled="!isDirty"
              >
                Save
              </UButton>
            </div>
          </template>
        </FAutoForm>
      </UCard>

      <!-- JSON field schema -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">
            JSON Field Demo
          </h2>
        </template>
        <FAutoForm
          :schema="jsonConfigSchema"
          :initial-values="jsonConfigValues"
          @submit="onSubmit('jsonConfig', $event)"
        >
          <template #actions="{ isDirty, reset }">
            <div class="flex gap-2 pt-4">
              <UButton
                variant="outline"
                :disabled="!isDirty"
                @click="reset"
              >
                Reset
              </UButton>
              <UButton
                type="submit"
                :disabled="!isDirty"
              >
                Save
              </UButton>
            </div>
          </template>
        </FAutoForm>
      </UCard>

      <!-- Result output -->
      <UAlert
        v-if="lastSubmit"
        color="success"
        variant="soft"
        title="Submitted"
      >
        <template #description>
          <pre class="text-sm whitespace-pre-wrap">{{ JSON.stringify(lastSubmit, null, 2) }}</pre>
        </template>
      </UAlert>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
import * as v from 'valibot'
import type { FieldConfig } from '../../../src/runtime/composables/useSchemaIntrospection'

// --- Flat schema with metadata ---
const reorderPointSchema = v.object({
  ordering_cost: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(10000), v.title('Ordering Cost'), v.metadata({ unit: 'DKK' })),
  holding_cost: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(200), v.title('Holding Cost'), v.metadata({ unit: '%' })),
  lead_time_days: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(365), v.title('Lead Time'), v.metadata({ unit: 'days' })),
  safety_stock: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(10000), v.title('Safety Stock'), v.metadata({ unit: 'units' })),
})

const reorderPointValues = { ordering_cost: 150, holding_cost: 25, lead_time_days: 14, safety_stock: 100 }
const reorderPointFieldConfig: Record<string, FieldConfig> = { ordering_cost: { colSpan: 2 } }

// --- Picklist + boolean ---
const profileSettingsSchema = v.object({
  display_name: v.pipe(v.string(), v.minLength(2), v.maxLength(50), v.title('Display Name')),
  email: v.pipe(v.string(), v.email(), v.title('Email')),
  role: v.pipe(v.picklist(['admin', 'editor', 'viewer']), v.title('Role')),
  notifications: v.pipe(v.boolean(), v.title('Email Notifications')),
  theme: v.pipe(v.picklist(['light', 'dark', 'system']), v.title('Theme'), v.description('Choose your preferred theme')),
})

const profileValues = { display_name: 'John Doe', email: 'john@example.com', role: 'editor' as const, notifications: true, theme: 'system' as const }

// --- Nested object ---
const warehouseSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.title('Warehouse Name')),
  location: v.object({
    city: v.pipe(v.string(), v.minLength(1), v.title('City')),
    country: v.pipe(v.string(), v.minLength(1), v.title('Country')),
    postal_code: v.pipe(v.string(), v.minLength(1), v.title('Postal Code')),
  }),
  capacity: v.pipe(v.number(), v.integer(), v.minValue(1), v.title('Capacity'), v.metadata({ unit: 'pallets' })),
})

const warehouseValues = { name: 'Main Warehouse', location: { city: 'Copenhagen', country: 'Denmark', postal_code: '1000' }, capacity: 5000 }

// --- Array of objects ---
const teamSchema = v.object({
  team_name: v.pipe(v.string(), v.minLength(1), v.title('Team Name')),
  members: v.array(v.object({
    name: v.pipe(v.string(), v.minLength(1), v.title('Name')),
    role: v.pipe(v.picklist(['lead', 'developer', 'designer']), v.title('Role')),
  })),
})

const teamValues = { team_name: 'Engineering', members: [{ name: 'Alice', role: 'lead' as const }, { name: 'Bob', role: 'developer' as const }] }

// --- JSON field ---
const jsonConfigSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.title('Config Name')),
  mappings: v.pipe(v.record(v.string(), v.string()), v.title('Mappings'), v.description('Key-value mappings as JSON'), v.metadata({ fieldType: 'json' })),
  settings: v.pipe(v.unknown(), v.title('Custom Settings'), v.metadata({ fieldType: 'json' })),
})

const jsonConfigValues = { name: 'PLC Mappings', mappings: { active: 'ACTIVE', discontinued: 'DISCONTINUED' }, settings: { enabled: true, threshold: 100 } }

// --- Submit handlers ---
const lastSubmit = ref<Record<string, unknown>>()

function onSubmit(form: string, data: Record<string, unknown>) {
  lastSubmit.value = { form, ...data }
}
</script>
