<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold mb-2">
        Profile Form
      </h1>
      <p class="text-gray-600 mb-4">
        Demo: Formisch + Nuxt with server-side validation
      </p>

      <div class="mb-6 p-4 bg-gray-100 rounded-lg flex items-center justify-between">
        <div>
          <p class="font-medium text-sm">
            Validation Mode
          </p>
          <p class="text-xs text-gray-600">
            {{ serverOnlyValidation ? 'Server-only validation' : 'Frontend + Server validation' }}
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="serverOnlyValidation"
            type="checkbox"
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
        </label>
      </div>

      <FForm
        :of="form"
        class="space-y-6"
        :on-submit="(values) => onSubmit(values as ProfileOutput)"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="name"
              class="block text-sm font-medium mb-1"
            >Name</label>
            <input
              id="name"
              v-model="nameField.input"
              type="text"
              class="w-full px-3 py-2 border rounded-lg"
            >
            <p
              v-if="nameField.errors"
              class="text-red-500 text-sm mt-1"
            >
              {{ nameField.errors[0] }}
            </p>
          </div>

          <div>
            <label
              for="email"
              class="block text-sm font-medium mb-1"
            >Email</label>
            <input
              id="email"
              v-model="emailField.input"
              type="email"
              class="w-full px-3 py-2 border rounded-lg"
            >
            <p
              v-if="emailField.errors"
              class="text-red-500 text-sm mt-1"
            >
              {{ emailField.errors[0] }}
            </p>
          </div>
        </div>

        <div>
          <label
            for="role"
            class="block text-sm font-medium mb-1"
          >Role</label>
          <select
            id="role"
            v-model="roleField.input"
            class="w-full px-3 py-2 border rounded-lg"
          >
            <option value="developer">
              Developer
            </option>
            <option value="designer">
              Designer
            </option>
            <option value="manager">
              Product Manager
            </option>
            <option value="other">
              Other
            </option>
          </select>
          <p
            v-if="roleField.errors"
            class="text-red-500 text-sm mt-1"
          >
            {{ roleField.errors[0] }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Experience Level</label>
          <div class="flex gap-4">
            <label class="flex items-center">
              <input
                v-model="experienceField.input"
                type="radio"
                value="junior"
                class="mr-2"
              >
              Junior
            </label>
            <label class="flex items-center">
              <input
                v-model="experienceField.input"
                type="radio"
                value="mid"
                class="mr-2"
              >
              Mid
            </label>
            <label class="flex items-center">
              <input
                v-model="experienceField.input"
                type="radio"
                value="senior"
                class="mr-2"
              >
              Senior
            </label>
            <label class="flex items-center">
              <input
                v-model="experienceField.input"
                type="radio"
                value="lead"
                class="mr-2"
              >
              Lead
            </label>
          </div>
          <p
            v-if="experienceField.errors"
            class="text-red-500 text-sm mt-1"
          >
            {{ experienceField.errors[0] }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="age"
              class="block text-sm font-medium mb-1"
            >Age</label>
            <input
              id="age"
              v-model.number="ageField.input"
              type="number"
              class="w-full px-3 py-2 border rounded-lg"
            >
            <p
              v-if="ageField.errors"
              class="text-red-500 text-sm mt-1"
            >
              {{ ageField.errors[0] }}
            </p>
          </div>

          <div>
            <label
              for="startDate"
              class="block text-sm font-medium mb-1"
            >Start Date</label>
            <input
              id="startDate"
              v-model="startDateField.input"
              type="date"
              class="w-full px-3 py-2 border rounded-lg"
            >
            <p
              v-if="startDateField.errors"
              class="text-red-500 text-sm mt-1"
            >
              {{ startDateField.errors[0] }}
            </p>
          </div>
        </div>

        <div>
          <label
            for="avatar"
            class="block text-sm font-medium mb-1"
          >Avatar URL (optional)</label>
          <input
            id="avatar"
            v-model="avatarField.input"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            class="w-full px-3 py-2 border rounded-lg"
          >
          <p
            v-if="avatarField.errors"
            class="text-red-500 text-sm mt-1"
          >
            {{ avatarField.errors[0] }}
          </p>
          <p
            v-if="avatarField.input"
            class="text-sm text-gray-500 mt-2"
          >
            Preview: <img
              :src="avatarField.input"
              alt="Avatar preview"
              class="inline-block size-10 rounded-full ml-2"
            >
          </p>
        </div>

        <div>
          <label
            for="bio"
            class="block text-sm font-medium mb-1"
          >Bio</label>
          <textarea
            id="bio"
            v-model="bioField.input"
            rows="4"
            class="w-full px-3 py-2 border rounded-lg"
          />
          <p
            v-if="bioField.errors"
            class="text-red-500 text-sm mt-1"
          >
            {{ bioField.errors[0] }}
          </p>
        </div>

        <div class="flex items-center">
          <input
            id="newsletter"
            v-model="newsletterField.input"
            type="checkbox"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded"
          >
          <label
            for="newsletter"
            class="ml-2 block text-sm"
          >
            Subscribe to newsletter
          </label>
        </div>

        <button
          type="submit"
          :disabled="form.isSubmitting"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
        >
          {{ form.isSubmitting ? 'Saving...' : 'Save Profile' }}
        </button>
      </FForm>

      <div
        v-if="error"
        class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
      >
        <p class="text-red-800 font-semibold">
          Error!
        </p>
        <pre class="text-sm mt-2 text-red-700">{{ error }}</pre>
      </div>

      <div
        v-if="submitted"
        class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
      >
        <p class="text-green-800 font-semibold mb-2">
          ✓ Profile saved successfully!
        </p>
        <pre class="text-sm text-gray-700 bg-white p-3 rounded border">{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { profileSchema, type ProfileOutput } from '#shared/utils/schemas'

useHead({ title: 'Formisch + Nuxt Demo' })

const submitted = ref(false)
const submittedData = ref()
const error = ref('')
const serverOnlyValidation = ref(false)

const form = useForm({
  schema: profileSchema as typeof profileSchema,
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

const nameField = useField(() => form, () => ({ path: ['name'] as const }))
const emailField = useField(() => form, () => ({ path: ['email'] as const }))
const roleField = useField(() => form, () => ({ path: ['role'] as const }))
const experienceField = useField(() => form, () => ({ path: ['experience'] as const }))
const ageField = useField(() => form, () => ({ path: ['age'] as const }))
const startDateField = useField(() => form, () => ({ path: ['startDate'] as const }))
const avatarField = useField(() => form, () => ({ path: ['avatar'] as const }))
const bioField = useField(() => form, () => ({ path: ['bio'] as const }))
const newsletterField = useField(() => form, () => ({ path: ['newsletter'] as const }))

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
