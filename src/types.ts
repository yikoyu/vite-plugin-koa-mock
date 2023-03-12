import type { Middleware } from 'koa'

export type RequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type MethodUrl<U extends string = string, M extends RequestType = RequestType> = `${Uppercase<M>} ${U}`

export interface Options {
  cwd?: string
  port?: number
  prefix?: string
  mockPath?: string
  watchPath?: string
  ignore?: string[]
}

export interface MockItem {
  url: string
  type: RequestType
  response: Middleware | Record<string, any>
}

export type MockObject<U extends string = string> = {
  [x in MethodUrl<U>]?: Middleware | Record<string, any>
}
