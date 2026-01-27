<template>
  <UApp>
    <UContainer class="min-h-screen flex items-center justify-center py-8">
      <UCard class="w-full max-w-2xl">
        <h1 class="text-3xl font-bold mb-2">
          Profile Form
        </h1>
        <p class="text-gray-600 mb-4">
          Demo: Formisch + Nuxt with server-side validation
        </p>

        <UCard class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-sm">
                Validation Mode
              </p>
              <p class="text-xs text-gray-500">
                {{ serverOnlyValidation ? 'Server-only validation' : 'Frontend + Server validation' }}
              </p>
            </div>
            <UToggle v-model="serverOnlyValidation" />
          </div>
        </UCard>

        <FForm
          :of="form"
          class="space-y-6"
          :on-submit="(values) => onSubmit(values as ProfileOutput)"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField
              label="Name"
              :error="nameField.errors?.[0]"
            >
              <UInput v-model="nameField.input" />
            </UFormField>

            <UFormField
              label="Email"
              :error="emailField.errors?.[0]"
            >
              <UInput
                v-model="emailField.input"
                type="email"
              />
            </UFormField>
          </div>

          <UFormField
            label="Role"
            :error="roleField.errors?.[0]"
          >
            <USelect
              v-model="roleField.input"
              :items="roleOptions"
            />
          </UFormField>

          <UFormField
            label="Experience Level"
            :error="experienceField.errors?.[0]"
          >
            <URadioGroup
              v-model="experienceField.input"
              :items="experienceOptions"
              orientation="horizontal"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField
              label="Age"
              :error="ageField.errors?.[0]"
            >
              <UInput
                v-model.number="ageField.input"
                type="number"
              />
            </UFormField>

            <UFormField
              label="Start Date"
              :error="startDateField.errors?.[0]"
            >
              <UInput
                v-model="startDateField.input"
                type="date"
              />
            </UFormField>
          </div>

          <UFormField
            label="Avatar URL (optional)"
            :error="avatarField.errors?.[0]"
          >
            <UInput
              v-model="avatarField.input"
              type="url"
              placeholder="https://example.com/avatar.jpg"
            />
            <template
              v-if="avatarField.input"
              #hint
            >
              <div class="flex items-center gap-2">
                <span>Preview:</span>
                <img
                  :src="avatarField.input"
                  alt="Avatar preview"
                  class="size-8 rounded-full"
                >
              </div>
            </template>
          </UFormField>

          <UFormField
            label="Bio"
            :error="bioField.errors?.[0]"
          >
            <UTextarea
              v-model="bioField.input"
              :rows="4"
            />
          </UFormField>

          <UCheckbox
            v-model="newsletterField.input"
            label="Subscribe to newsletter"
          />

          <UButton
            type="submit"
            :loading="form.isSubmitting"
            block
          >
            Save Profile
          </UButton>
        </FForm>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          title="Error!"
          class="mt-6"
        >
          <template #description>
            <pre class="text-sm whitespace-pre-wrap">{{ error }}</pre>
          </template>
        </UAlert>

        <UAlert
          v-if="submitted"
          color="success"
          variant="soft"
          title="Profile saved successfully!"
          class="mt-6"
        >
          <template #description>
            <pre class="text-sm whitespace-pre-wrap">{{ JSON.stringify(submittedData, null, 2) }}</pre>
          </template>
        </UAlert>

        <div class="mt-6 pt-6 border-t text-center text-sm text-gray-500">
          <a
            href="https://github.com/onmax/nuxt-formisch"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-blue-600 transition-colors"
          >
            View on GitHub →
          </a>
        </div>
      </UCard>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
import { profileSchema, type ProfileOutput } from '#shared/utils/schemas'

useHead({ title: 'Formisch + Nuxt Demo' })

const submitted = ref(false)
const submittedData = ref()
const error = ref('')
const serverOnlyValidation = ref(false)

const roleOptions = [{ label: 'Developer', value: 'developer' }, { label: 'Designer', value: 'designer' }, { label: 'Product Manager', value: 'manager' }, { label: 'Other', value: 'other' }]
const experienceOptions = ['junior', 'mid', 'senior', 'lead']

const form = useForm({
  schema: profileSchema,
  initialValues: {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'developer' as const,
    experience: 'mid' as const,
    age: 25,
    startDate: '2024-01-15',
    avatar: 'https://i.pravatar.cc/150?img=68',
    bio: 'I love building forms with Formisch!',
    newsletter: true,
  },
})

const { field } = useFormFields(form)
const nameField = field('name')
const emailField = field('email')
const roleField = field('role')
const experienceField = field('experience')
const ageField = field('age')
const startDateField = field('startDate')
const avatarField = field('avatar')
const bioField = field('bio')
const newsletterField = field('newsletter')

async function onSubmit(values: ProfileOutput) {
  try {
    error.value = ''
    submitted.value = false
    const response = await $fetch('/api/login', { method: 'POST', body: values })
    submittedData.value = response
    submitted.value = true
  }
  catch (e) {
    if (e && typeof e === 'object' && 'data' in e) {
      const data = e.data as { errors?: Record<string, string>, message?: string }
      if (data.errors) {
        error.value = Object.entries(data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n')
      }
      else if (data.message) {
        error.value = data.message
      }
      else {
        error.value = 'Submission failed'
      }
    }
    else {
      error.value = 'Submission failed'
    }
  }
}
</script>
