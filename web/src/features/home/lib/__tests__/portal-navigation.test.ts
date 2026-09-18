/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { describe, expect, it } from 'vitest'

import { portalNavigation } from '../portal-navigation'

describe('portalNavigation', () => {
  it('keeps pre-release product destinations on the portal page', () => {
    expect(portalNavigation).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '#products' }),
        expect.objectContaining({ href: '#models' }),
        expect.objectContaining({ href: '#compute' }),
        expect.objectContaining({ href: '#solutions' }),
      ])
    )
  })

  it('links the console to the existing authenticated entry point', () => {
    expect(portalNavigation).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/dashboard' }),
      ])
    )
  })

  it('omits the hidden developer access section from navigation', () => {
    expect(portalNavigation.map((item) => item.href)).not.toContain('#developers')
  })
})
