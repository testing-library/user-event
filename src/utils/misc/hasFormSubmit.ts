export const hasFormSubmit = (
  form: HTMLFormElement | null,
): form is HTMLFormElement =>
  !!form?.querySelector(
    'input[type="submit"], button:not([type]), button[type="submit"]',
  )
