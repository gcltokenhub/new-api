import { afterEach, expect, it } from 'vitest'

import { STORAGE_KEYS } from '../../../constants'
import { loadMessages, saveMessages } from '../storage'

afterEach(() => {
  localStorage.clear()
})

it('keeps playground messages separate when the signed-in user changes', () => {
  const firstUserMessages = [
    {
      key: 'first',
      from: 'user' as const,
      versions: [{ id: 'v1', content: 'private message' }],
    },
  ]
  const secondUserMessages = [
    {
      key: 'second',
      from: 'user' as const,
      versions: [{ id: 'v2', content: 'another private message' }],
    },
  ]

  saveMessages(101, firstUserMessages)

  expect(loadMessages(202)).toBeNull()
  saveMessages(202, secondUserMessages)
  expect(loadMessages(101)).toEqual(firstUserMessages)
  expect(loadMessages(202)).toEqual(secondUserMessages)
})

it('does not show messages stored before user ownership was recorded', () => {
  localStorage.setItem(
    STORAGE_KEYS.MESSAGES,
    JSON.stringify([
      {
        key: 'legacy',
        from: 'user',
        versions: [{ id: 'v1', content: 'old message' }],
      },
    ])
  )

  expect(loadMessages(202)).toBeNull()
})
