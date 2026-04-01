import {
  focus as rawFocus,
  getAllErrors as rawGetAllErrors,
  getErrors as rawGetErrors,
  getInput as rawGetInput,
  handleSubmit as rawHandleSubmit,
  insert as rawInsert,
  move as rawMove,
  remove as rawRemove,
  replace as rawReplace,
  reset as rawReset,
  setErrors as rawSetErrors,
  setInput as rawSetInput,
  submit as rawSubmit,
  swap as rawSwap,
  validate as rawValidate,
} from '@formisch/vue'

type AnyForm = Parameters<typeof rawSetInput>[0]
type SetInputConfig = Parameters<typeof rawSetInput>[1]
type InsertConfig = Parameters<typeof rawInsert>[1]
type MoveConfig = Parameters<typeof rawMove>[1]
type RemoveConfig = Parameters<typeof rawRemove>[1]
type ReplaceConfig = Parameters<typeof rawReplace>[1]
type SwapConfig = Parameters<typeof rawSwap>[1]

function cloneInput<T>(value: T): T {
  return structuredClone(value)
}

function readArrayInput(
  form: AnyForm,
  path: NonNullable<SetInputConfig['path']>,
) {
  const input = rawGetInput(form, { path })
  return Array.isArray(input) ? [...input] : null
}

export const focus = rawFocus
export const getAllErrors = rawGetAllErrors
export const getErrors = rawGetErrors
export const getInput = rawGetInput
export const handleSubmit = rawHandleSubmit
export const reset = rawReset
export const setErrors = rawSetErrors
export const setInput = rawSetInput
export const submit = rawSubmit
export const validate = rawValidate

export function insert(form: AnyForm, config: InsertConfig) {
  const nextInput = readArrayInput(form, config.path)
  if (!nextInput)
    return rawInsert(form, config)

  const insertIndex = config.at ?? nextInput.length
  if (insertIndex < 0 || insertIndex > nextInput.length)
    return

  nextInput.splice(insertIndex, 0, cloneInput(config.initialInput))
  rawSetInput(form, { path: config.path, input: nextInput })
}

export function move(form: AnyForm, config: MoveConfig) {
  const nextInput = readArrayInput(form, config.path)
  if (!nextInput)
    return rawMove(form, config)

  if (
    config.from < 0
    || config.from >= nextInput.length
    || config.to < 0
    || config.to >= nextInput.length
    || config.from === config.to
  ) {
    return
  }

  nextInput.splice(config.to, 0, nextInput.splice(config.from, 1)[0]!)
  rawSetInput(form, { path: config.path, input: nextInput })
}

export function remove(form: AnyForm, config: RemoveConfig) {
  const nextInput = readArrayInput(form, config.path)
  if (!nextInput)
    return rawRemove(form, config)

  if (config.at < 0 || config.at >= nextInput.length)
    return

  nextInput.splice(config.at, 1)
  rawSetInput(form, { path: config.path, input: nextInput })
}

export function replace(form: AnyForm, config: ReplaceConfig) {
  const nextInput = readArrayInput(form, config.path)
  if (!nextInput)
    return rawReplace(form, config)

  if (config.at < 0 || config.at >= nextInput.length)
    return

  nextInput[config.at] = cloneInput(config.initialInput)
  rawSetInput(form, { path: config.path, input: nextInput })
}

export function swap(form: AnyForm, config: SwapConfig) {
  const nextInput = readArrayInput(form, config.path)
  if (!nextInput)
    return rawSwap(form, config)

  if (
    config.at < 0
    || config.at >= nextInput.length
    || config.and < 0
    || config.and >= nextInput.length
    || config.at === config.and
  ) {
    return
  }

  const current = nextInput[config.at]
  nextInput[config.at] = nextInput[config.and]
  nextInput[config.and] = current
  rawSetInput(form, { path: config.path, input: nextInput })
}
