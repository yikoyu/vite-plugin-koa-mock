import { MockObject } from '../../../src/types'

type Urls = '/test'

export default (): MockObject<Urls> => ({
  'GET /test': () => ({
    test: 'hello mock!!!!'
  })
})
