---
icon: ph:form-duotone
---

# useForm

Creates and manages form state with schema-based validation. Returns a reactive store with form status and methods for form manipulation.

## Usage

```vue [components/LoginForm.vue]
<script setup lang="ts">
import * as v from 'valibot'

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8))
})

const form = useForm({ schema })
</script>
```

## Configuration

```ts
interface FormConfig<TSchema> {
  schema: TSchema
  initialInput?: DeepPartial<v.InferInput<TSchema>>
  validate?: ValidationMode
  revalidate?: Exclude<ValidationMode, 'initial'>
}
```

### schema

**Required.** A Valibot schema that defines the form structure and validation rules.

### initialInput

Optional initial values for form fields. Supports partial values for complex schemas.

```ts
const form = useForm({
  schema,
  initialInput: {
    email: 'user@example.com'
  }
})
```

### validate

When to run initial validation. Defaults to `'submit'`.

| Value | Description |
|-------|-------------|
| `'initial'` | Validate on mount |
| `'touch'` | Validate when field is focused |
| `'input'` | Validate on every input |
| `'change'` | Validate on change event |
| `'blur'` | Validate on blur |
| `'submit'` | Validate only on submit |

### revalidate

When to revalidate after initial validation. Same options as `validate` except `'initial'`.

## Return Value

```ts
interface FormStore<TSchema> {
  isSubmitting: boolean
  isSubmitted: boolean
  isValidating: boolean
  isTouched: boolean
  isDirty: boolean
  isValid: boolean
  errors: string[] | null
}
```

### isSubmitting

True while the submit handler is executing.

### isSubmitted

True after a successful form submission.

### isValidating

True while async validation is in progress.

### isTouched

True if any field has been focused.

### isDirty

True if any field value differs from its initial value.

### isValid

True when no validation errors exist.

### errors

Array of form-level error messages, or `null` if valid.

## Form Methods

These methods are auto-imported and operate on form stores.

### reset

Reset form to initial state or specific values.

```ts
// Reset entire form
reset(form)

// Reset specific field
reset(form, { path: ['email'] })
```

### validate

Manually trigger validation and get results.

```ts
const result = await validate(form)
if (result.success) {
  console.log(result.output)
}
```

### submit

Programmatically trigger form submission.

```ts
submit(form)
```

### handleSubmit

Create a submit handler for use with form elements.

```ts
const onSubmit = handleSubmit(form, (values) => {
  console.log(values)
})
```

### getInput

Get current form or field input values.

```ts
// Get all values
const values = getInput(form)

// Get specific field
const email = getInput(form, { path: ['email'] })
```

### setInput

Set form or field input values.

```ts
// Set entire form
setInput(form, { input: { email: 'new@example.com' } })

// Set specific field
setInput(form, { path: ['email'], input: 'new@example.com' })
```

### getErrors

Get form or field errors.

```ts
// Get all errors
const errors = getErrors(form)

// Get field errors
const emailErrors = getErrors(form, { path: ['email'] })
```

### getAllErrors

Get all errors from the form including nested fields.

```ts
const allErrors = getAllErrors(form)
```

### setErrors

Manually set validation errors.

```ts
setErrors(form, { path: ['email'], errors: ['Email already taken'] })
```

### focus

Focus a specific field element.

```ts
focus(form, { path: ['email'] })
```
