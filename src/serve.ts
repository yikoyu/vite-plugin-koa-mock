import { KoaServe } from './koa-serve'
import type { Options } from './types'

export function createKoaMock(options: Options) {
  const koa = new KoaServe(options)
  const { app, router } = koa.init()

  koa.start(app)
  koa.watch(router)

  return { app, router }
}
