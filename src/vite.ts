import http from 'http'
import Koa from 'koa'
import { pathToRegexp } from 'path-to-regexp'
import type { Connect, Plugin } from 'vite'

import { KoaServe } from './koa-serve'
import type { MockItem, Options } from './types'

const createMiddleware = async (app: Koa, data: () => MockItem[]): Promise<Connect.HandleFunction> => {
  return async function (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: Connect.NextFunction
  ): Promise<void> {
    const results = data()
      .map(k => {
        const equalMethod = k.type.toUpperCase() === (req.method || 'GET').toUpperCase()
        const isMatchUrl = (req.url && pathToRegexp(k.url).test(req.url)) || false

        if (equalMethod && isMatchUrl) {
          return true
        }

        return false
      })
      .filter(k => k)

    if (results.length > 0) {
      app.callback()(req, res)
    } else {
      {
        next()
      }
    }
  }
}

export function viteKoaMockPlugin(options: Options): Plugin {
  return {
    name: 'vite:koa-mock',
    apply: 'serve',
    configureServer: async server => {
      const serve = new KoaServe(options)
      const { app, router } = serve.init()
      let items: MockItem[] = []

      server.middlewares.use(await createMiddleware(app, () => items))

      serve.watch(router, data => (items = data))
    }
  }
}
