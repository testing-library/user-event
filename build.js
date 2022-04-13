;(async () => {
  const child = require('child_process')
  const {build} = require('esbuild')
  const fs = require('fs')

  // put the ESM output in a separate directory to avoid using the .mjs extension
  await build({
    outfile: 'dist/esm/index.js',
    format: 'esm',
    target: 'es6',
    bundle: true,
    external: ['@testing-library/dom'],
    entryPoints: ['src/index.ts'],
  })

  // Node will interpret the JS output as CommonJS without a specific type declaration
  // see https://nodejs.org/dist/latest/docs/api/packages.html#packagejson-and-file-extensions
  fs.writeFileSync('dist/esm/package.json', '{ "type": "module" }')

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
