/* eslint-disable @typescript-eslint/no-use-before-define */

import {dispatchUIEvent} from '..'
import {input, isContentEditable, isEditable, isElementType} from '../../utils'
import {behavior} from './registry'

behavior.keypress = (event, target, config) => {
  if (event.key === 'Enter') {
    if (
      isElementType(target, 'button') ||
      (isElementType(target, 'input') &&
        ClickInputOnEnter.includes(target.type)) ||
      (isElementType(target, 'a') && Boolean(target.href))
    ) {
      return () => {
        dispatchUIEvent(config, target, 'click')
      }
    } else if (isElementType(target, 'input')) {
      const form = target.form
      const submit = form?.querySelector(
        'input[type="submit"], button:not([type]), button[type="submit"]',
      )
      if (submit) {
        return () => dispatchUIEvent(config, submit, 'click')
      } else if (
        form &&
        SubmitSingleInputOnEnter.includes(target.type) &&
        form.querySelectorAll('input').length === 1
      ) {
        return () => dispatchUIEvent(config, form, 'submit')
      } else {
        return
      }
    }
  }

  if (isEditable(target)) {
    const inputType =
      event.key === 'Enter'
        ? isContentEditable(target) && !config.system.keyboard.modifiers.Shift
          ? 'insertParagraph'
          : 'insertLineBreak'
        : 'insertText'
    const inputData = event.key === 'Enter' ? '\n' : event.key

    return () => input(config, target, inputData, inputType)
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
