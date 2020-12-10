import userEvent, {TargetElement} from '.'

declare const element: TargetElement
type NotVoid = string | number | boolean | object | null

userEvent.type(element, 'foo', {delay: 1}).then(
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  function handleSucces(_nothing: void) {},
  function handleError(_error: Error) {},
)
// @ts-expect-error No delay returns void
userEvent.type(element, 'foo') as NotVoid
