import type { MockItem, MockObject } from './types'

export { KoaServe } from './koa-serve'
export { createKoaMock } from './serve'
export { viteKoaMockPlugin } from './vite'
export { MockItem, MockObject }

export const defineMock = (items: MockItem[]): MockItem[] => items
