import IstanbulLibReport from 'istanbul-lib-report'
import IstanbulLibSourceMaps from 'istanbul-lib-source-maps'
import IstanbulReports from 'istanbul-reports'
import {
  serveDir,
  setupChromeConductor,
  setupNodeConductor,
  setupSourceModuleLoader,
  setupToolboxTester,
} from '@ph.fritsche/toolbox'

const env = await serveDir('testenv')

const {cli, connectCoverageReporter} = await setupToolboxTester(
  ['src', 'tests'],
  [
    setupNodeConductor('Node, DTL10, React18', [
      new URL('../testenv/node.js', import.meta.url),
      new URL('./libs/dom10/index.bundle.js', env.url),
      new URL('./libs/react18/index.bundle.js', env.url),
    ]),
    setupNodeConductor('Node, DTL8, React17', [
      new URL('../testenv/node.js', import.meta.url),
      new URL('./libs/dom8/index.bundle.js', env.url),
      new URL('./libs/react17/index.bundle.js', env.url),
    ]),
    setupChromeConductor('Chrome, DTL10, React18', [
      new URL('./browser.bundle.js', env.url),
      new URL('./libs/dom10/index.bundle.js', env.url),
      new URL('./libs/react18/index.bundle.js', env.url),
    ]),
  ],
  [
    await setupSourceModuleLoader({
      globals: {
        '@testing-library/dom': 'DomTestingLibrary',
        '@testing-library/react': 'ReactTestingLibrary',
        react: 'React',
        'react-dom': 'ReactDom',
      },
    }),
  ],
  {
    setExitCode: false,
  },
)

connectCoverageReporter(async map => {
  const sourceStore = IstanbulLibSourceMaps.createSourceMapStore()
  const reportContext = IstanbulLibReport.createContext({
    coverageMap: await sourceStore.transformCoverage(map),
    sourceFinder: sourceStore.sourceFinder,
    defaultSummarizer: 'nested',
    watermarks: {
      branches: [80, 100],
      functions: [80, 100],
      lines: [80, 100],
      statements: [80, 100],
    },
  })

  IstanbulReports.create('text').execute(reportContext)
})

cli.onClose(() => env.server.close())

await cli.open()
