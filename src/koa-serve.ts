import Router from '@koa/router'
import { watch } from 'chokidar'
import fg from 'fast-glob'
import Koa from 'koa'
import { isArray, isFunction, isObject } from 'lodash-es'
import type { AddressInfo } from 'net'

import path from 'path'
import type { MockItem, Options, RequestType } from './types'
import { getIpv4, Log, resolveModule, transform } from './utils'

export class KoaServe extends Log {
  options: Required<Options>

  constructor(options?: Options) {
    super()
    this.options = {
      cwd: process.cwd(),
      port: 3000,
      prefix: '',
      mockPath: 'mock/**/*.{ts,js}',
      watchPath: 'mock',
      ignore: ['**/_*.{ts,js}', '**/node_modules/**'],
      ...options
    }
  }

  /**
   * 初始化 mock 服务器
   * @return {*}  {{ app: Koa, router: Router }}
   * @memberof StartService
   */
  init(): { app: Koa; router: Router } {
    const app = new Koa()
    const router = new Router()

    app.use(router.routes())
    app.use(router.allowedMethods())

    return {
      app,
      router
    }
  }

  /**
   * 启动服务器
   * @memberof App
   */
  start(app: Koa) {
    const { port } = this.options

    // 启动服务器，监听端口
    const server = app.listen(port, () => {
      const { port } = server.address() as AddressInfo
      const { network, local } = getIpv4()
      Log.startLog(network, local, port)
    })
  }

  /**
   * 自动加载模块
   * @memberof StartService
   */
  private async loadModules() {
    const { mockPath, ignore, cwd } = this.options

    let ret: MockItem[] = []

    const entries = await fg([mockPath], { dot: true, ignore })
    const loadAllResult = await Promise.all(entries.map(k => resolveModule(path.join(cwd, k))))

    try {
      for (const resultModule of loadAllResult) {
        let mod = isFunction(resultModule) ? resultModule() : resultModule
        if (isObject(mod) && !isArray(mod)) {
          mod = transform(mod)
        }
        if (!isArray(mod)) {
          mod = [mod]
        }
        ret = [...ret, ...mod]
      }
    } catch (error) {
      Log.changeCustomizeLog('mock load result error', error)
      ret = []
    }

    return ret
  }

  /**
   * 注册路由
   * @private
   * @param {Router} router
   * @memberof StartService
   */
  private async registerRoutes(router: Router) {
    const { prefix } = this.options

    const entries = await this.loadModules()

    const mocksForServer = entries.filter(isObject).map(route => ({
      url: prefix ? `${prefix}${route.url}` : route.url,
      type: route.type || 'GET',
      async response(ctx: Koa.ParameterizedContext, next: Koa.Next) {
        Log.responseLog(ctx.method.toUpperCase(), ctx.path)

        const response = isFunction(route.response) ? await route.response(ctx, next) : route.response

        if (isFunction(route.response) && !response) {
          return response?.(ctx, next)
        }

        ctx.body = response
      }
    }))

    mocksForServer.forEach(mock => {
      const method = mock.type.toLowerCase() as Lowercase<RequestType>
      return router[method](mock.url, mock.response)
    })

    const mockLastIndex = router.stack.length
    const mockRoutesLength = Object.keys(mocksForServer).length

    return {
      mockData: mocksForServer,
      mockRoutesLength,
      mockStartIndex: mockLastIndex - mockRoutesLength
    }
  }

  /**
   * 注销路由
   * @private
   * @memberof StartService
   */
  private unregisterRoutes() {
    const { cwd } = this.options

    Object.keys(require.cache).forEach(i => {
      if (i.includes(cwd)) {
        delete require.cache[require.resolve(i)]
      }
    })
  }

  /**
   * 监听 mock内容文件变化，执行更新
   * @param {Router} router
   * @param {(mockData: MockItem[]) => void} [hook]
   * @return {*}  {Promise<void>}
   * @memberof StartService
   */
  async watch(router: Router, hook?: (mockData: MockItem[]) => void): Promise<void> {
    const { watchPath } = this.options

    const mockRoutes = await this.registerRoutes(router)
    Log.apiListLog(mockRoutes.mockData.map(item => item.url))

    let mockRoutesLength = mockRoutes.mockRoutesLength
    let mockStartIndex = mockRoutes.mockStartIndex

    const mockWatch = watch(watchPath, {
      ignored: ['**/node_modules/**', '**/.git/**'],
      ignoreInitial: true
    })

    hook?.(mockRoutes.mockData)

    mockWatch.on('all', async (event, path) => {
      if (event === 'change' || event === 'add') {
        try {
          // remove mock routes stack
          router.stack.splice(mockStartIndex, mockRoutesLength)

          // clear routes cache
          this.unregisterRoutes()

          const mockRoutes = await this.registerRoutes(router)
          mockRoutesLength = mockRoutes.mockRoutesLength
          mockStartIndex = mockRoutes.mockStartIndex
          hook?.(mockRoutes.mockData)

          Log.changeFileLog(path)
        } catch (error) {
          Log.changeFileErrorLog(error)
        }
      }
    })
  }
}
