import chalk from 'chalk'

export class Log {
  static mark() {
    return chalk.cyanBright('[mock]')
  }

  static startLog(network: string = '', local: string = '', port: number) {
    const run = chalk.greenBright('mock server running at:')
    const networkIp = `Network: ${chalk.cyanBright(`http://${network}:${port}`)}`
    const localIp = `Local:   ${chalk.cyanBright(`http://${local}:${port}`)}`

    console.log(`${this.mark()} ${run}\n\n > ${networkIp}\n > ${localIp}\n`)
  }

  static apiListLog(apis: string[]) {
    console.log(`${this.mark()} mock api list: \n${apis.map(k => chalk.cyanBright(k)).join('\n')}`)
  }

  static responseLog(method: string, path: string) {
    console.log(`${this.mark()} ${chalk.greenBright('request invoke:')} ${chalk.redBright(method)} ${path}`)
  }

  static changeFileLog(path: string) {
    console.log(`${this.mark()} ${chalk.magentaBright('mock file:')} ${path}`)
  }

  static changeFileErrorLog(error: unknown) {
    console.log(`${this.mark()} ${chalk.redBright('mock reload error:')} ${error}`)
  }

  static changeCustomizeLog(title: string, error: unknown) {
    console.log(`${this.mark()} ${chalk.redBright(title)} ${error}`)
  }
}
