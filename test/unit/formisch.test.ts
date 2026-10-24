import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as formischVue from '@formisch/vue'
import { formisch } from '../../src/formisch'

describe('formisch export list', () => {
  it('matches every runtime export of @formisch/vue', () => {
    const listed = [...formisch.components, ...formisch.composables, ...formisch.methods].toSorted()
    expect(listed).toEqual(Object.keys(formischVue).toSorted())
  })

  it('lists every exported type except per-method *Config types', () => {
    const entry = fileURLToPath(import.meta.resolve('@formisch/vue'))
    const dts = readFileSync(entry.replace(/\.js$/, '.d.ts'), 'utf8')
    const exported = dts.match(/export \{([^}]+)\};?\s*$/)![1]!
      .split(',')
      .map(name => name.trim().replace(/^type /, '').split(' as ').at(-1)!)
    const values = new Set<string>(Object.keys(formischVue))
    // FormConfig is the useForm() argument, so it stays even though it ends in Config.
    const types = exported.filter(name => !values.has(name) && (name === 'FormConfig' || !name.endsWith('Config')))
    expect([...formisch.types].toSorted()).toEqual(types.toSorted())
  })
})
