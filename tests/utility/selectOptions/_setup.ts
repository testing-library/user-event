import userEvent from '#src'
import {Options} from '#src/options'
import {addListeners} from '#testHelpers'

export function setupSelect(
  {
    disabled = false,
    disabledOptions = false,
    multiple = false,
    pointerEvents = 'auto',
  } = {},
  setupOptions: Options = {},
) {
  const form = document.createElement('form')
  form.innerHTML = `
    <select
      name="select"
      style="pointer-events: ${pointerEvents}"
      ${disabled ? 'disabled' : ''}
      ${multiple ? 'multiple' : ''}
    >
      <option value="1" ${disabledOptions ? 'disabled' : ''}>1</option>
      <option value="2" ${disabledOptions ? 'disabled' : ''}>2</option>
      <option value="3" ${disabledOptions ? 'disabled' : ''}>3</option>
    </select>
  `
  document.body.append(form)
  const select = form.querySelector('select') as HTMLSelectElement
  const options = Array.from(form.querySelectorAll('option'))
  return {
    ...addListeners(select),
    form,
    select,
    options,
    user: userEvent.setup(setupOptions),
  }
}

export function setupListbox() {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `
    <button id="button" aria-haspopup="listbox">
      Some label
    </button>
    <ul
      role="listbox"
      name="listbox"
      aria-labelledby="button"
    >
      <li id="1" role="option" aria-selected="false">1</li>
      <li id="2" role="option" aria-selected="false">2</li>
      <li id="3" role="option" aria-selected="false">3</li>
    </ul>
  `
  document.body.append(wrapper)
  const listbox = wrapper.querySelector('[role="listbox"]') as HTMLUListElement
  const options = Array.from(
    wrapper.querySelectorAll<HTMLElement>('[role="option"]'),
  )

  // the user is responsible for handling aria-selected on listbox options
  options.forEach(el =>
    el.addEventListener('click', e => {
      const target = e.currentTarget as HTMLElement
      target.setAttribute(
        'aria-selected',
        JSON.stringify(
          !JSON.parse(String(target.getAttribute('aria-selected'))),
        ),
      )
    }),
  )

  return {
    ...addListeners(listbox),
    listbox,
    options,
    user: userEvent.setup(),
  }
}

export function setupListboxWithComplexOptions() {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `
    <button id="button" aria-haspopup="listbox">
      Some label
    </button>
    <ul
      role="listbox"
      name="listbox"
      aria-labelledby="button"
    >
      <li id="1" role="option" aria-selected="false">
        <span>1</span>
      </li>
      <li id="2" role="option" aria-selected="false">
        <span>2</span>
        <span aria-hidden="true">Not visible 1</span>
        <span style="display:none">Not visible 2</span>
        <span style="visibility:hidden">Not visible 3</span>
      </li>
      <li id="3" role="option" aria-selected="false">
        <span>3</span>
      </li>
    </ul>
  `
  document.body.append(wrapper)
  const listbox = wrapper.querySelector('[role="listbox"]') as HTMLUListElement
  const options = Array.from(
    wrapper.querySelectorAll<HTMLElement>('[role="option"]'),
  )

  // the user is responsible for handling aria-selected on listbox options
  options.forEach(el =>
    el.addEventListener('click', e => {
      const target = e.currentTarget as HTMLElement
      target.setAttribute(
        'aria-selected',
        JSON.stringify(
          !JSON.parse(String(target.getAttribute('aria-selected'))),
        ),
      )
    }),
  )

  return {
    ...addListeners(listbox),
    listbox,
    options,
    user: userEvent.setup(),
  }
}
