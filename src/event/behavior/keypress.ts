import {isContentEditable, isEditable, isElementType} from '../../utils'
import {input} from '../input'
import {behavior} from './registry'

behavior.keypress = (event, target, instance) => {
  if (event.key === 'Enter') {
    if (
      isElementType(target, 'button') ||
      (isElementType(target, 'input') &&
        ClickInputOnEnter.includes(target.type)) ||
        (isElementType(target, 'a') && Boolean(target.href))
    ) {
      return () => {
        instance.dispatchUIEvent(target, 'click')
      }
    } else if (isElementType(target, 'input')) {
      const form = target.form
      const submit =
        form?.querySelector(
          'input[type="submit"], button:not([type]), button[type="submit"]',
        ) ??
        (form?.id &&
          document.querySelector(
            `input[form="${form.id}"][type="submit"], button[form="${form.id}"]:not([type]), button[form="${form?.id}"][type="submit"]`,
          ))
      if (submit) {
        return () => instance.dispatchUIEvent(submit, 'click')
      } else if (
        form &&
        SubmitSingleInputOnEnter.includes(target.type) &&
        form.querySelectorAll('input').length === 1
      ) {
        return () => instance.dispatchUIEvent(form, 'submit')
      } else {
        return
      }
    }
  }

  if (isEditable(target)) {
    const inputType =
      event.key === 'Enter'
        ? isContentEditable(target) && !instance.system.keyboard.modifiers.Shift
          ? 'insertParagraph'
          : 'insertLineBreak'
        : 'insertText'
    const inputData = event.key === 'Enter' ? '\n' : event.key

    return () => input(instance, target, inputData, inputType)
  }
}

const ClickInputOnEnter = [
  'button',
  'color',
  'file',
  'image',
  'reset',
  'submit',
]

const SubmitSingleInputOnEnter = [
  'email',
  'month',
  'password',
  'search',
  'tel',
  'text',
  'url',
  'week',
]
