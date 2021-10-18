export const hasFormSubmit = (
  form: HTMLFormElement | null,
): form is HTMLFormElement =>
  !!(
    form &&
    (form.querySelector('input[type="submit"]') ||
      form.querySelector('button[type="submit"]'))
  )
