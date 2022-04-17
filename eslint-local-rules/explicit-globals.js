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
          // ignore `undefined`
          if (variable.name === 'undefined') {
            return
          }
          variable.references.forEach(ref => {
            // Ignore types and global standard variables like `Object`
            if (ref.resolved.constructor.name === 'ImplicitLibVariable') {
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
