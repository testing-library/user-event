import {createEvent, getConfig, fireEvent} from '@testing-library/dom'
import {focus, hasPointerEvents, isDisabled, isElementType} from '../utils'
import {Config, UserEvent} from '../setup'

export async function selectOptions(
  this: UserEvent,
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
) {
  return selectOptionsBase.call(this, true, select, values)
}

export async function deselectOptions(
  this: UserEvent,
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
) {
  return selectOptionsBase.call(this, false, select, values)
}

async function selectOptionsBase(
  this: UserEvent,
  newValue: boolean,
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
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
        const withPointerEvents = this[Config].skipPointerEventsCheck
          ? true
          : hasPointerEvents(option)

        // events fired for multiple select are weird. Can't use hover...
        if (withPointerEvents) {
          fireEvent.pointerOver(option)
          fireEvent.pointerEnter(select)
          fireEvent.mouseOver(option)
          fireEvent.mouseEnter(select)
          fireEvent.pointerMove(option)
          fireEvent.mouseMove(option)
          fireEvent.pointerDown(option)
          fireEvent.mouseDown(option)
        }

        focus(select)

        if (withPointerEvents) {
          fireEvent.pointerUp(option)
          fireEvent.mouseUp(option)
        }

        selectOption(option as HTMLOptionElement)

        if (withPointerEvents) {
          fireEvent.click(option)
        }
      }
    } else if (selectedOptions.length === 1) {
      const withPointerEvents = this[Config].skipPointerEventsCheck
        ? true
        : hasPointerEvents(select)
      // the click to open the select options
      if (withPointerEvents) {
        await this.click(select)
      } else {
        focus(select)
      }

      selectOption(selectedOptions[0] as HTMLOptionElement)

      if (withPointerEvents) {
        // the browser triggers another click event on the select for the click on the option
        // this second click has no 'down' phase
        fireEvent.pointerOver(select)
        fireEvent.pointerEnter(select)
        fireEvent.mouseOver(select)
        fireEvent.mouseEnter(select)
        fireEvent.pointerUp(select)
        fireEvent.mouseUp(select)
        fireEvent.click(select)
      }
    } else {
      throw getConfig().getElementError(
        `Cannot select multiple options on a non-multiple select`,
        select,
      )
    }
  } else if (select.getAttribute('role') === 'listbox') {
    for (const option of selectedOptions) {
      await this.click(option)
      await this.unhover(option)
    }
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
      }),
    )
    fireEvent.change(select)
  }
}
