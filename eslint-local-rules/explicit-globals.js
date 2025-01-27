// ignore standard built-in objects
const whitelist = [
  'Infinity',
  'NaN',
  'undefined',
  'Object',
  'Function',
  'Boolean',
  'Symbol',
  'Error',
  'EvalError',
  'InternalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
  'Number',
  'Math',
  'Date',
  'String',
  'RegExp',
  'Array',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'ArrayBuffer',
  'DataView',
  'JSON',
  'Promise',
  'Generator',
  'GeneratorFunction',
  'Reflect',
  'Proxy',
  'Intl',
  'Intl.Collator',
  'Intl.DateTimeFormat',
  'Intl.NumberFormat',
]

module.exports = {
  meta: {
    type: 'suggestion',
    messages: {
      implicitGlobal: 'implicit global "{{name}}"',
    },
  },

  create(context) {
    return {
      Program() {
        const scope = context.getScope()

        // `scope` is `GlobalScope` and `scope.variables` are the global variables
        scope.variables.forEach(variable => {
          if (variable.name === 'globalThis' || whitelist.includes(variable.name)) {
            return
          }

          variable.references.forEach(ref => {
            if (ref.identifier.parent.type.startsWith('TS')) {
              return
            }

            context.report({
              node: ref.identifier,
              messageId: 'implicitGlobal',
              data: {
                name: ref.identifier.name,
              },
            })
          })
        })
      },
    }
  },
}
