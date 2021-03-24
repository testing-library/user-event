import {createEvent, getConfig, fireEvent} from '@testing-library/dom'
import {isDisabled, isElementType} from './utils'
import {click} from './click'
import {focus} from './focus'
import {hover, unhover} from './hover'

function selectOptionsBase(
  newValue: boolean,
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  init?: MouseEventInit,
) {
  if (!newValue && !(select as HTMLSelectElement).multiple) {
    throw getConfig().getElementError(
      `Unable to deselect an option in a non-multiple select. Use selectOptions to change the selection instead.`,
      select,
    )
  }
  const valArray = Array.isArray(values) ? values : [values]
  const allOptions = Array.from(
    select.querySelectorAll('option, [role="option"]'),
  )
  const selectedOptions = valArray
    .map(val => {
      if (typeof val !== 'string' && allOptions.includes(val)) {
        return val
      } else {
        const matchingOption = allOptions.find(
          o =>
            (o as HTMLInputElement | HTMLTextAreaElement).value === val ||
            o.innerHTML === val,
        )
        if (matchingOption) {
          return matchingOption
        } else {
          throw getConfig().getElementError(
            `Value "${String(val)}" not found in options`,
            select,
          )
        }
      }
    })
    .filter(option => !isDisabled(option))

  if (isDisabled(select) || !selectedOptions.length) return

  if (isElementType(select, 'select')) {
    if (select.multiple) {
      for (const option of selectedOptions) {
        // events fired for multiple select are weird. Can't use hover...
        fireEvent.pointerOver(option, init)
        fireEvent.pointerEnter(select, init)
        fireEvent.mouseOver(option)
        fireEvent.mouseEnter(select)
        fireEvent.pointerMove(option, init)
        fireEvent.mouseMove(option, init)
        fireEvent.pointerDown(option, init)
        fireEvent.mouseDown(option, init)
        focus(select)
        fireEvent.pointerUp(option, init)
        fireEvent.mouseUp(option, init)
        selectOption(option as HTMLOptionElement)
        fireEvent.click(option, init)
      }
    } else if (selectedOptions.length === 1) {
      // the click to open the select options
      click(select, init)

      selectOption(selectedOptions[0] as HTMLOptionElement)

      // the browser triggers another click event on the select for the click on the option
      // this second click has no 'down' phase
      fireEvent.pointerOver(select, init)
      fireEvent.pointerEnter(select, init)
      fireEvent.mouseOver(select)
      fireEvent.mouseEnter(select)
      fireEvent.pointerUp(select, init)
      fireEvent.mouseUp(select, init)
      fireEvent.click(select, init)
    } else {
      throw getConfig().getElementError(
        `Cannot select multiple options on a non-multiple select`,
        select,
      )
    }
  } else if (select.getAttribute('role') === 'listbox') {
    selectedOptions.forEach(option => {
      hover(option, init)
      click(option, init)
      unhover(option, init)
    })
  } else {
    throw getConfig().getElementError(
      `Cannot select options on elements that are neither select nor listbox elements`,
      select,
    )
  }

  function selectOption(option: HTMLOptionElement) {
    option.selected = newValue
    fireEvent(
      select,
      createEvent('input', select, {
        bubbles: true,
        cancelable: false,
        composed: true,
        ...init,
      }),
    )
    fireEvent.change(select, init)
  }
}

const selectOptions = selectOptionsBase.bind(null, true)
const deselectOptions = selectOptionsBase.bind(null, false)

export {selectOptions, deselectOptions}
