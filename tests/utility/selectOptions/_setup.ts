import {addListeners} from '#testHelpers'

export function setupSelect({
  disabled = false,
  disabledOptions = false,
  multiple = false,
  pointerEvents = 'auto',
} = {}) {
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
  }
}
