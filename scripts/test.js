import { createProjectBuildProvider, serveDir, serveToolboxRunner } from '@ph.fritsche/toolbox'
import { NodeTestConductor } from '@ph.fritsche/toolbox/dist/conductor/NodeTestConductor.js'
import { ChromeTestConductor } from '@ph.fritsche/toolbox/dist/conductor/ChromeTestConductor.js'
import { ConsoleReporter } from '@ph.fritsche/toolbox/dist/reporter/ConsoleReporter.js'
import { ReporterServer } from '@ph.fritsche/toolbox/dist/reporter/ReporterServer.js'
import { TestRunStack } from '@ph.fritsche/toolbox/dist/reporter/TestRunStack.js'

import IstanbulLibCoverage from 'istanbul-lib-coverage'
import IstanbulLibReport from 'istanbul-lib-report'
import IstanbulLibSourceMaps from 'istanbul-lib-source-maps'
import IstanbulReports from 'istanbul-reports'

const tsConfigFile = './tests/tsconfig.json'

const toolbox = await serveToolboxRunner()
const env = await serveDir('testenv')

const { buildProvider, fileProvider, fileServer, onBuildDone } = createProjectBuildProvider([
    'src',
    'tests',
], {
    tsConfigFile,
    globals: {
        '@testing-library/dom': 'DomTestingLibrary',
        '@testing-library/react': 'ReactTestingLibrary',
        'react': 'React',
        'react-dom': 'ReactDom',
    }
})

for (const { builder } of buildProvider.builders) {
    builder.emitter.addListener('start', ({ type, buildId, inputFiles }) => console.log(builder.id, { type, buildId, inputFiles: inputFiles.size }))
    builder.emitter.addListener('complete', ({ type, buildId, inputFiles, outputFiles }) => console.log(builder.id, { type, buildId, inputFiles: inputFiles.size, outputFiles: outputFiles.size }))
    builder.emitter.addListener('error', ({ type, buildId, error }) => console.log(builder.id, { type, buildId, error }))
    builder.emitter.addListener('done', ({ type, buildId }) => console.log(builder.id, { type, buildId }))
}
buildProvider.getBuilder('dependencies').builder.emitter.addListener('start', ({inputFiles}) => console.log('dependencies', inputFiles.keys()))

const filter = (f) => f.startsWith('tests')
    && /(?<!\.json)\.js$/.test(f)
    && !/\/_.+(?<!\.test)\.[jt]sx?$/.test(f)

const reporterServer = new ReporterServer()
await reporterServer.registerFileServer(toolbox.server)
await reporterServer.registerFileServer(env.server)
await reporterServer.registerFileServer(fileServer)

const consoleReporter = new ConsoleReporter()
consoleReporter.config.result = !!process.env.CI
consoleReporter.connect(reporterServer)

const conductors = [
    new ChromeTestConductor(reporterServer, toolbox.url, 'Chrome, DTL8, React18', [
        {server: env.url, paths: ['browser.bundle.js']},
        {server: env.url, paths: [
            'libs/dom8/index.bundle.js',
            'libs/react18/index.bundle.js',
        ]}
    ]),
    new NodeTestConductor(reporterServer, toolbox.url, 'Node, DTL8, React18', [
        {server: new URL(`file://${env.provider.origin}`), paths: ['node.js']},
        {server: env.url, paths: [
            'libs/dom8/index.bundle.js',
            'libs/react18/index.bundle.js',
        ]},
    ]),
]

if (process.env.CI) {
    conductors.push(
        new NodeTestConductor(reporterServer, toolbox.url, 'Node, DTL8, React17', [
            {server: new URL(`file://${env.provider.origin}`), paths: ['node.js'] },
            {server: env.url, paths: [
                'libs/dom8/index.bundle.js',
                'libs/react17/index.bundle.js',
            ]},
        ])
    )
}

onBuildDone(async () => {
    const files = {
        server: await fileServer.url,
        paths: Array.from(fileProvider.files.keys()).filter(filter),
    }
    const runs = conductors.map(c => c.createTestRun(files))
    const stack = new TestRunStack(runs.map(r => r.run))

    runs.forEach(r => r.exec())

    await stack.then()

    const coverageMap = IstanbulLibCoverage.createCoverageMap()
    for (const run of stack.runs) {
        for (const coverage of run.coverage.values()) {
            coverageMap.merge(coverage)
        }
    }
    
    const sourceStore = IstanbulLibSourceMaps.createSourceMapStore()
    const reportContext = IstanbulLibReport.createContext({
        coverageMap: await sourceStore.transformCoverage(coverageMap),
        dir: fileProvider.origin,
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

    if (process.env.CI) {
        process.exit(0)
    }
})
