import userEvent, {TargetElement} from '.'

declare const element: TargetElement

userEvent.type(element, 'foo', {delay: 1}).then(
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  function handleSucces(_nothing: void) {},
  function handleError(_error: Error) {},
)
userEvent.type(element, 'foo') as undefined
