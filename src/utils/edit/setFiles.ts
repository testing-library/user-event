// It is not possible to create a real FileList programmatically.
// Therefore assigning `files` property with a programmatically created FileList results in an error.
// Just assigning the property (as per fireEvent) breaks the interweaving with the `value` property.

const fakeFiles = Symbol('files and value properties are mocked')

declare global {
  interface HTMLInputElement {
    [fakeFiles]?: {
      restore: () => void
    }
  }
}

export function setFiles(
  el: HTMLInputElement & {type: 'file'},
  files: FileList,
) {
  el[fakeFiles]?.restore()

  const objectDescriptors = Object.getOwnPropertyDescriptors(el)
  const prototypeDescriptors = Object.getOwnPropertyDescriptors(
    Object.getPrototypeOf(el),
  )

  function restore() {
    Object.defineProperties(el, {
      files: {
        ...prototypeDescriptors.files,
        ...objectDescriptors.files,
      },
      value: {
        ...prototypeDescriptors.value,
        ...objectDescriptors.value,
      },
      type: {
        ...prototypeDescriptors.type,
        ...objectDescriptors.type,
      },
    })
  }
  el[fakeFiles] = {restore}

  Object.defineProperties(el, {
    files: {
      ...prototypeDescriptors.files,
      ...objectDescriptors.files,
      get: () => files,
    },
    value: {
      ...prototypeDescriptors.value,
      ...objectDescriptors.value,
      get: () => (files.length ? `C:\\fakepath\\${files[0].name}` : ''),
      set(v: string) {
        if (v === '') {
          restore()
        } else {
          objectDescriptors.value.set?.call(el, v)
        }
      },
    },
    // eslint-disable-next-line accessor-pairs
    type: {
      ...prototypeDescriptors.type,
      ...objectDescriptors.type,
      set(v: string) {
        if (v !== 'file') {
          restore()
          // In the browser the value will be empty.
          // In Jsdom the value will be the same as
          // before this element became file input - which might be empty.
          ;(el as HTMLInputElement).type = v
        }
      },
    },
  })
}
