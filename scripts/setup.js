import fs from 'fs/promises'
import path from 'path'
import { createBundleBuilder } from '@ph.fritsche/toolbox/dist/builder/index.js'
import { spawn } from 'child_process'

const dirname = path.dirname(new URL(import.meta.url).pathname)
const indexDirLib = path.join(dirname, '../testenv/libs')
const indexDirEnv = path.join(dirname, '../testenv')

const ignoreEnv = ['node.js', 'jest.js']

const cmd = process.argv[2]
const names = process.argv.length > 3 ? process.argv.slice(3) : undefined

if (cmd === 'install-lib') {
    await Promise.all(
        (await getLibDirs(names))
            .map(([name, dir]) => installLib(name, dir))
    )
} else if (cmd === 'bundle-lib') {
    await Promise.all(
        (await getLibDirs(names))
            .map(([name, dir]) => buildLib(name, dir))
    )
} else if (cmd === 'bundle-env') {
    await Promise.all(
        (await getEnvFiles(names))
            .map(([name, file]) => buildEnv(name, file))
    )
} else if (!cmd) {
    await Promise.all([
        ...(await getLibDirs()).map(([name, dir]) => installLib(name, dir).then(() => buildLib(name, dir))),
        ...(await getEnvFiles()).map(([name, file]) => buildEnv(name, file)),
    ])
}

async function getLibDirs(names) {
    names ??= (await fs.readdir(indexDirLib)).filter(n => !n.startsWith('.'))

    return await Promise.all(names.map(name => {
        const dir = `${indexDirLib}/${name}`

        return fs.stat(`${dir}/index.js`).then(
            () => [name, dir],
            () => {throw new Error(`${dir}/index.js could not be found.`)}
        )
    }))
}

async function getEnvFiles(names) {
    names ??= (await fs.readdir(indexDirEnv))
        .filter(n => /^\w+\.js$/.test(n))
        .filter(n => !ignoreEnv.includes(n))
        .map(f => f.slice(0, f.length - 3))

    return await Promise.all(names.map(async name => {
        const file = `${indexDirEnv}/${name}.js`

        return fs.stat(file).then(
            () => [name, file],
            () => { throw new Error(`${file} could not be found.`)}
        )
    }))
}

async function installLib(name, dir) {
    return new Promise((res, rej) => {
        const child = spawn('npm', ['i'], {cwd: dir})

        process.stdout.write(`Installing library "${name}" at ${dir}\n`)

        child.on('error', e => {
            process.stdout.write(`${e.stack ?? String(e)}\n`)
        })
        child.on('exit', (code, signal) => {
            (code || signal ? rej(code) : res())
        })
    })
}

async function buildLib(name, dir) {
    const { globals } = JSON.parse(await fs.readFile(`${dir}/package.json`))

    process.stdout.write(`Bundling library "${name}" at ${dir}/index.js\n`)

    const builder = createBundleBuilder({
        basePath: `${dir}/`,
        globals,
    })
    builder.inputFiles.set(`${dir}/index.js`, undefined)

    builder.emitter.addListener('complete', e => {
        const content = String(e.outputFiles.get('index.js')?.content)
        fs.writeFile(`${dir}/index.bundle.js`, content)
            .then(() => process.stdout.write([
                '<<<',
                `Wrote ${dir}/index.bundle.js`,
                `[${content.length} bytes]`,
                ...((globals && Object.keys(globals).length)
                    ? [
                        `  Depending on:`,
                        ...Object.entries(globals).map(([module, name]) => `  ${name} => ${module}`),
                    ]
                    : []),
                '>>>',
                '',
            ].join('\n')))
    })

    builder.build()
}

async function buildEnv(name, file) {
    process.stdout.write(`Bundling environment "${name}" at ${file}\n`)

    const builder = createBundleBuilder({
        basePath: `${indexDirEnv}/`,
    })
    const basename = path.basename(file, '.js')
    builder.inputFiles.set(file, undefined)

    builder.emitter.addListener('complete', e => {
        const content = String(e.outputFiles.get(`${basename}.js`)?.content)
        fs.writeFile(`${indexDirEnv}/${basename}.bundle.js`, content)
            .then(() => process.stdout.write([
                '<<<',
                `Wrote ${indexDirEnv}/${basename}.bundle.js`,
                `[${content.length} bytes]`,
                '>>>',
                '',
            ].join('\n')))
    })

    builder.build()
}

