import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('auto-form', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/auto-form', import.meta.url)),
  })

  let html: string
  it('renders the page', async () => {
    html = await $fetch('/')
    expect(html).toContain('Flat Schema')
  })

  // --- Flat schema: leaf field types ---

  describe('flat schema', () => {
    it('renders text input for string field', () => {
      // UInput renders as <input>
      expect(html).toContain('Username')
    })

    it('renders email input', () => {
      expect(html).toContain('Email Address')
    })

    it('renders number input with unit', () => {
      expect(html).toContain('Age')
      expect(html).toContain('years')
    })

    it('renders select for picklist', () => {
      expect(html).toContain('Role')
    })

    it('renders switch for boolean', () => {
      expect(html).toContain('Active')
    })

    it('renders optional field', () => {
      expect(html).toContain('Bio')
    })
  })

  // --- Nested object ---

  describe('nested object', () => {
    it('renders parent field', () => {
      expect(html).toContain('Name')
    })

    it('renders nested object as fieldset', () => {
      // AutoFormObject wraps in <fieldset> with <legend>
      expect(html).toContain('Address')
    })

    it('renders nested children', () => {
      expect(html).toContain('Street')
      expect(html).toContain('City')
      expect(html).toContain('ZIP Code')
    })
  })

  // --- Array ---

  describe('array schema', () => {
    it('renders array container', () => {
      expect(html).toContain('Team Name')
      expect(html).toContain('Members')
    })

    it('renders array items', () => {
      expect(html).toContain('Member Name')
      expect(html).toContain('Member Role')
    })
  })

  // --- jsonToValibotSchema ---

  describe('inferred schema (jsonToValibotSchema)', () => {
    it('renders section', () => {
      expect(html).toContain('Inferred Schema')
    })

    it('infers number fields', () => {
      // "count" key → number input with label "Count"
      expect(html).toContain('Count')
    })

    it('infers string fields', () => {
      expect(html).toContain('Label')
    })

    it('infers boolean fields', () => {
      expect(html).toContain('Enabled')
    })

    it('infers nested object', () => {
      expect(html).toContain('Nested')
    })

    it('infers array field', () => {
      expect(html).toContain('Tags')
    })
  })
})
