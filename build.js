;(async () => {
  const child = require('child_process')
  const fs = require('fs')
  const {build} = require('esbuild')

  await build({
    outdir: 'dist',
    format: 'esm',
    target: 'es6',
    bundle: true,
    external: ['@testing-library/dom'],
    entryPoints: ['src/index.ts'],
  })

  fs.writeFileSync(
    'dist/package.json',
    JSON.stringify({
      type: 'module',
    }),
  )

  child.execSync('yarn tsc -p tsconfig.build.json')
})()
