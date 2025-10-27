<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold mb-6">
        Formisch + Nuxt
      </h1>

      <FormischForm
        :of="form"
        class="space-y-4"
        :on-submit="onSubmit"
      >
        <FormischField
          v-slot="field"
          :of="form"
          :path="['email']"
        >
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              v-bind="field.props"
              type="email"
              class="w-full px-3 py-2 border rounded-lg"
            >
            <p
              v-if="field.errors"
              class="text-red-500 text-sm mt-1"
            >
              {{ field.errors[0] }}
            </p>
          </div>
        </FormischField>

        <FormischField
          v-slot="field"
          :of="form"
          :path="['password']"
        >
          <div>
            <label class="block text-sm font-medium mb-1">Password</label>
            <input
              v-bind="field.props"
              type="password"
              class="w-full px-3 py-2 border rounded-lg"
            >
            <p
              v-if="field.errors"
              class="text-red-500 text-sm mt-1"
            >
              {{ field.errors[0] }}
            </p>
          </div>
        </FormischField>

        <button
          type="submit"
          :disabled="form.isSubmitting"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {{ form.isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
      </FormischForm>

      <div
        v-if="error"
        class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
      >
        <p class="text-red-800 font-semibold">
          Error!
        </p>
        <pre class="text-sm mt-2">{{ error }}</pre>
      </div>

      <div
        v-if="submitted"
        class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
      >
        <p class="text-green-800 font-semibold">
          Form submitted!
        </p>
        <pre class="text-sm mt-2">{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SubmitHandler } from '@formisch/vue'

// loginSchema is auto-imported
const submitted = ref(false)
const submittedData = ref()
const error = ref('')

const form = useForm({ schema: loginSchema })

const onSubmit: SubmitHandler<typeof loginSchema> = async (values) => {
  try {
    error.value = ''
    const response = await $fetch('/api/login', { method: 'POST', body: values })
    submittedData.value = response
    submitted.value = true
  }
  catch (e) {
    if (e && typeof e === 'object' && 'data' in e) {
      const data = e.data as { errors?: Record<string, string> }
      error.value = data.errors ? JSON.stringify(data.errors) : 'Submission failed'
    }
    else {
      error.value = 'Submission failed'
    }
  }
}
</script>
