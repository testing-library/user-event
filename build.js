;(async () => {
  const child = require('child_process')
  const { build } = require('esbuild')

  await build({
    outfile: 'dist/esm/index.js',
    format: 'esm',
    target: 'es6',
    bundle: true,
    external: ['@testing-library/dom'],
    entryPoints: ['src/index.ts'],
  })

  await build({
    outfile: 'dist/index.js',
    format: 'cjs',
    target: 'node12',
    bundle: true,
    external: ['@testing-library/dom'],
    entryPoints: ['src/index.ts'],
  })

  child.execSync('yarn tsc -p tsconfig.build.json')
})()
