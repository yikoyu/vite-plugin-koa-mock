import type { MockItem } from '../../src/types'

export default (): MockItem[] => [
  {
    url: '/test1',
    type: 'GET',
    response: {
      test1: 'hello mock test1!!!!'
    }
  },
  {
    url: '/test2',
    type: 'GET',
    response: ctx => {
      ctx.body = {
        test2: 'hello mock test2!!!!'
      }
    }
  },
  {
    url: '/test3',
    type: 'GET',
    response: () => ({
      test3: 'hello mock!!'
    })
  }
]
