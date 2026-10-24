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

// Regression for #7: duplicating a row with an object `initialInput`, editing the
// copy and removing another row must keep every row's state separate.
function duplicateRun(index: number) {
  const run = getInput(form, { path: ['runs', index] })
  insert(form, { path: ['runs'], at: index + 1, initialInput: structuredClone(run) })
}

function removeRun(index: number) {
  remove(form, { path: ['runs'], at: index })
}

function onSubmit(values: v.InferOutput<typeof schema>) {
  submittedOutput.value = JSON.stringify(values)
}
</script>

<template>
  <div>
    <h1>Array Mutation Regression</h1>

    <FForm
      :of="form"
      :on-submit="onSubmit"
    >
      <FFieldArray
        v-slot="{ items }"
        :of="form"
        :path="['runs']"
      >
        <div>
          <div
            v-for="(item, index) in items"
            :key="item"
            :data-testid="`run-${index}`"
          >
            <div>
              <FField
                v-slot="field"
                :of="form"
                :path="['runs', index, 'name']"
              >
                <label>
                  <span>Name</span>
                  <input
                    v-model="field.input"
                    v-bind="field.props"
                    :data-testid="`name-${index}`"
                  >
                </label>
              </FField>

              <FField
                v-slot="field"
                :of="form"
                :path="['runs', index, 'config', 'windowSize']"
              >
                <label>
                  <span>Window size</span>
                  <input
                    v-model.number="field.input"
                    v-bind="field.props"
                    :data-testid="`window-size-${index}`"
                    type="number"
                  >
                </label>
              </FField>
            </div>

            <div>
              <button
                type="button"
                :data-testid="`duplicate-${index}`"
                @click="duplicateRun(index)"
              >
                Duplicate
              </button>
              <button
                type="button"
                :data-testid="`delete-${index}`"
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
      >
        Submit
      </button>
    </FForm>

    <pre data-testid="output">{{ submittedOutput }}</pre>
  </div>
</template>
