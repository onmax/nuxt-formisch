<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  runs: v.array(v.object({
    name: v.string(),
    config: v.object({
      windowSize: v.number(),
    }),
  })),
})

const form = useForm({
  schema,
  initialInput: {
    runs: [
      { name: 'Run 1', config: { windowSize: 1 } },
      { name: 'Run 2', config: { windowSize: 2 } },
    ],
  },
})

const submittedOutput = ref('')

function duplicateRun(index: number) {
  const run = getInput(form, { path: ['runs', index] })
  insert(form, {
    path: ['runs'],
    at: index + 1,
    initialInput: structuredClone(run),
  })
}

function removeRun(index: number) {
  remove(form, {
    path: ['runs'],
    at: index,
  })
}

function onSubmit(values: v.InferOutput<typeof schema>) {
  submittedOutput.value = JSON.stringify(values)
}
</script>

<template>
  <div class="space-y-4 p-6">
    <h1 class="text-xl font-semibold">
      Array Mutation Regression
    </h1>

    <FForm
      :of="form"
      class="space-y-4"
      :on-submit="onSubmit"
    >
      <FFieldArray
        v-slot="{ items }"
        :of="form"
        :path="['runs']"
      >
        <div class="space-y-3">
          <div
            v-for="(item, index) in items"
            :key="item"
            :data-testid="`run-${index}`"
            class="rounded-lg border border-neutral-200 p-4"
          >
            <div class="grid gap-3 md:grid-cols-2">
              <FField
                v-slot="field"
                :of="form"
                :path="['runs', index, 'name']"
              >
                <label class="block space-y-1">
                  <span class="text-sm font-medium">Name</span>
                  <input
                    v-model="field.input"
                    v-bind="field.props"
                    :data-testid="`name-${index}`"
                    class="w-full rounded border border-neutral-300 px-3 py-2"
                  >
                </label>
              </FField>

              <FField
                v-slot="field"
                :of="form"
                :path="['runs', index, 'config', 'windowSize']"
              >
                <label class="block space-y-1">
                  <span class="text-sm font-medium">Window size</span>
                  <input
                    v-model.number="field.input"
                    v-bind="field.props"
                    :data-testid="`window-size-${index}`"
                    type="number"
                    class="w-full rounded border border-neutral-300 px-3 py-2"
                  >
                </label>
              </FField>
            </div>

            <div class="mt-3 flex gap-2">
              <button
                type="button"
                :data-testid="`duplicate-${index}`"
                class="rounded border border-neutral-300 px-3 py-2 text-sm"
                @click="duplicateRun(index)"
              >
                Duplicate
              </button>
              <button
                type="button"
                :data-testid="`delete-${index}`"
                class="rounded border border-neutral-300 px-3 py-2 text-sm"
                @click="removeRun(index)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </FFieldArray>

      <button
        type="submit"
        data-testid="submit"
        class="rounded bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Submit
      </button>
    </FForm>

    <pre data-testid="output">{{ submittedOutput }}</pre>
  </div>
</template>
