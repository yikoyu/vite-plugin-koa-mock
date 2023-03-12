import { build } from 'esbuild'
import module from 'module'
import path from 'path'

/**
 * require() does not exist for ESM, so we must create it to use require.resolve().
 * @see https://nodejs.org/api/module.html#modulecreaterequirefilename
 */
// const require = createRequire(import.meta.url)

export interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}

export async function resolveModule(p: string): Promise<any> {
  const result = await build({
    entryPoints: [p],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    bundle: true,
    format: 'cjs',
    metafile: true,
    target: 'es2015'
  })
  const { text } = result.outputFiles[0]

  return await loadConfigFromBundledFile(p, text)
}

export async function loadConfigFromBundledFile(fileName: string, bundledCode: string) {
  const extension = path.extname(fileName)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const extensions = module.Module._extensions
  let defaultLoader: any
  const isJs = extension === '.js'
  if (isJs) {
    defaultLoader = extensions[extension]!
  }

  extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === fileName) {
      ;(module as NodeModuleWithCompile)._compile(bundledCode, filename)
    } else {
      if (!isJs) {
        extensions[extension]!(module, filename)
      } else {
        defaultLoader(module, filename)
      }
    }
  }
  let config
  try {
    if (isJs && require && require.cache) {
      delete require.cache[fileName]
    }
    // const raw = await import(`file://${fileName}`)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const raw = require(fileName)
    config = raw.__esModule ? raw.default : raw
    if (defaultLoader && isJs) {
      extensions[extension] = defaultLoader
    }
  } catch (error) {
    console.error(error)
  }

  return config
}
