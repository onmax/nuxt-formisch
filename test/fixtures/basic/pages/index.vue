<script setup lang="ts">
import * as v from 'valibot'

defineOptions({ name: 'BasicPage' })

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
  tags: v.array(v.string()),
})

// useForm, useField, useFieldArray, getInput and jsonToValibotSchema are auto-imported
const form = useForm({ schema, initialInput: { email: 'ada@example.com', tags: ['math'] } })
const email = useField(form, { path: ['email'] })
const tags = useFieldArray(form, { path: ['tags'] })
const inferred = jsonToValibotSchema({ count: 1 })
</script>

<template>
  <div>
    <h1>Formisch Test</h1>
    <FForm
      :of="form"
      @submit="() => {}"
    >
      <FField
        v-slot="field"
        :of="form"
        :path="['email']"
      >
        <input
          v-model="field.input"
          v-bind="field.props"
          type="email"
        >
      </FField>
    </FForm>
    <p id="email">
      {{ email.input }}
    </p>
    <p id="tags">
      {{ tags.items.length }}
    </p>
    <p id="input">
      {{ JSON.stringify(getInput(form)) }}
    </p>
    <p id="inferred">
      {{ inferred.type }}
    </p>
  </div>
</template>
