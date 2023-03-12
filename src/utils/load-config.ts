import { lilconfig } from 'lilconfig'

import { Log } from './log'

interface LoadConfigParams {
  configPath?: string
  cwd: string
}

export const searchPlaces = ['package.json', '.koamockrc', '.koamockrc.json', '.koamockrc.js']

const explorer = lilconfig('koa-mock', { searchPlaces })

export async function loadConfig({ configPath, cwd }: LoadConfigParams) {
  try {
    const result = await (configPath ? explorer.load(configPath) : explorer.search(cwd))

    if (!result) return {}

    const config = await result.config
    const filepath = result.filepath

    return { config, filepath }
  } catch (error) {
    Log.changeCustomizeLog('Failed to load configuration:', error)
    return {}
  }
}
