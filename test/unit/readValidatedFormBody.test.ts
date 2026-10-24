import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { createApp, defineEventHandler, toWebHandler } from 'h3'
import { readValidatedFormBody } from '../../src/runtime/server/utils/readValidatedFormBody'

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  age: v.pipe(v.string(), v.toNumber(), v.minValue(18, 'Too young')),
})

const handler = toWebHandler(createApp().use(defineEventHandler(event => readValidatedFormBody(event, schema))))

function post(body: string, type: string) {
  return handler(new Request('http://localhost/', { method: 'POST', headers: { 'content-type': type }, body }))
}

describe('readValidatedFormBody', () => {
  it('returns the schema output for a JSON body', async () => {
    const response = await post(JSON.stringify({ email: 'ada@example.com', age: '36' }), 'application/json')
    expect(await response.json()).toEqual({ email: 'ada@example.com', age: 36 })
  })

  it('reads URL-encoded bodies from native form posts', async () => {
    const response = await post('email=ada%40example.com&age=40', 'application/x-www-form-urlencoded')
    expect(await response.json()).toEqual({ email: 'ada@example.com', age: 40 })
  })

  it('throws a 400 with plain issues', async () => {
    const response = await post(JSON.stringify({ email: 'nope', age: '3' }), 'application/json')
    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.statusMessage).toBe('Validation Error')
    expect(error.data.issues).toEqual([
      { message: 'Invalid email', path: ['email'] },
      { message: 'Too young', path: ['age'] },
    ])
  })
})
