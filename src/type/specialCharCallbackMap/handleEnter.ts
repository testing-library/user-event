import {fireEvent} from '@testing-library/dom'
import {
  calculateNewValue,
  isClickableInput,
  isInstanceOfElement,
} from '../../utils/'
import {setSelectionRange} from '../shared'
import {callbackPayload} from '../callbacks'

export function handleEnter({currentElement, eventOverrides}: callbackPayload) {
  const key = 'Enter'
  const keyCode = 13

  const keyDownDefaultNotPrevented = fireEvent.keyDown(
    currentElement() as Element,
    {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
    },
  )

  if (keyDownDefaultNotPrevented) {
    const keyPressDefaultNotPrevented = fireEvent.keyPress(
      currentElement() as Element,
      {
        key,
        keyCode,
        charCode: keyCode,
        ...eventOverrides,
      },
    )

    if (keyPressDefaultNotPrevented) {
      if (
        isClickableInput(currentElement() as Element) ||
        // Links with href defined should handle Enter the same as a click
        (isInstanceOfElement(
          currentElement() as Element,
          'HTMLAnchorElement',
        ) &&
          (currentElement() as HTMLAnchorElement).href)
      ) {
        fireEvent.click(currentElement() as Element, {
          ...eventOverrides,
        })
      }

      if ((currentElement() as Element).tagName === 'TEXTAREA') {
        const {newValue, newSelectionStart} = calculateNewValue(
          '\n',
          currentElement() as HTMLElement,
        )
        fireEvent.input(currentElement() as Element, {
          target: {value: newValue},
          inputType: 'insertLineBreak',
          ...eventOverrides,
        })
        setSelectionRange({
          currentElement,
          newValue,
          newSelectionStart,
        })
      }

      const el = currentElement()
      const form = el?.tagName === 'INPUT' && (el as HTMLInputElement).form
      if (
        form &&
        (form.querySelectorAll('input').length === 1 ||
          form.querySelector('input[type="submit"]') ||
          form.querySelector('button[type="submit"]'))
      ) {
        fireEvent.submit(form)
      }
    }
  }

  fireEvent.keyUp(currentElement() as Element, {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  return undefined
}
