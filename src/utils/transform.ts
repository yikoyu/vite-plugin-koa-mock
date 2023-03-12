import { MethodUrl, MockItem, MockObject, RequestType } from '../types'

function parseKey(key: string) {
  let type: RequestType = 'GET'
  let url = key
  if (key.indexOf(' ') > -1) {
    const splited = key.split(' ')
    type = splited[0].toUpperCase() as RequestType
    url = splited[1]
  }
  return { type, url }
}

export function transform(mockObj: MockObject): MockItem[] {
  return Object.keys(mockObj).map(key => {
    const { type, url } = parseKey(key)
    const response = mockObj[key as MethodUrl] as MockItem['response']
    const routeConfig: MockItem = {
      url,
      type,
      response
    }
    return routeConfig
  })
}
