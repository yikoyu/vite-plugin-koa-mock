import { compact, flatten, values } from 'lodash-es'

import os from 'os'

export function getIpv4() {
  const ifaces = os.networkInterfaces()
  const networks = compact(flatten(values(ifaces)))
  const Network = networks.find(item => item.family === 'IPv4' && item.internal === false)
  const Local = networks.find(item => item.family === 'IPv4' && item.internal === true)
  return {
    network: Network?.address,
    local: Local?.address
  }
}
