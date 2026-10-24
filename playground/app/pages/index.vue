<script setup lang="ts">
import * as v from 'valibot'
import { profileSchema } from '#shared/utils/schemas'

defineOptions({ name: 'ProfilePage' })

useSeoMeta({ title: 'Formisch + Nuxt UI', description: 'A Formisch form with Nuxt UI inputs and server-side validation' })

const form = useForm({
  schema: profileSchema,
  initialInput: { name: 'Ada', email: 'taken@example.com', role: 'developer', age: 36, newsletter: true },
})
const name = useField(form, { path: ['name'] })
const email = useField(form, { path: ['email'] })
const role = useField(form, { path: ['role'] })
const age = useField(form, { path: ['age'] })
const newsletter = useField(form, { path: ['newsletter'] })

const roles = ['developer', 'designer', 'manager']
const saved = ref<unknown>()

/** Shape of the 400 error `readValidatedFormBody()` throws, as `$fetch` hands it to us. */
const validationError = v.object({
  data: v.object({
    data: v.object({
      issues: v.array(v.object({ message: v.string(), path: v.array(v.keyof(profileSchema)) })),
    }),
  }),
})

async function onSubmit(output: v.InferOutput<typeof profileSchema>) {
  saved.value = undefined
  try {
    saved.value = await $fetch('/api/profile', { method: 'POST', body: output })
  }
  catch (error) {
    const result = v.safeParse(validationError, error)
    if (!result.success) throw error
    // Show the server's issues on the matching fields.
    for (const { path: [key], message } of result.output.data.data.issues) {
      if (key) setErrors(form, { path: [key], errors: [message] })
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        Profile
      </h1>
      <p class="text-muted">
        Formisch handles state and validation, Nuxt UI renders the inputs. Submit as is: the server rejects <code>taken@example.com</code> and the error lands on the field.
      </p>
    </div>

    <FForm
      :of="form"
      class="space-y-4"
      @submit="onSubmit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Name"
          :error="name.errors?.[0]"
        >
          <UInput
            v-model="name.input"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Email"
          :error="email.errors?.[0]"
        >
          <UInput
            v-model="email.input"
            type="email"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Role"
          :error="role.errors?.[0]"
        >
          <USelect
            v-model="role.input"
            :items="roles"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Age"
          :error="age.errors?.[0]"
        >
          <UInput
            v-model="age.input"
            type="number"
            class="w-full"
          />
        </UFormField>
      </div>
      <UCheckbox
        v-model="newsletter.input"
        label="Subscribe to the newsletter"
      />
      <p
        v-if="form.errors"
        class="text-sm text-error"
      >
        {{ form.errors[0] }}
      </p>
      <div class="flex gap-2">
        <UButton
          type="submit"
          :loading="form.isSubmitting"
        >
          Save
        </UButton>
        <UButton
          variant="outline"
          :disabled="!form.isDirty"
          @click="reset(form)"
        >
          Reset
        </UButton>
      </div>
    </FForm>

    <UAlert
      v-if="saved"
      color="success"
      variant="soft"
      title="Saved"
    >
      <template #description>
        <pre class="text-xs">{{ saved }}</pre>
      </template>
    </UAlert>
  </div>
</template>
