import userEvent, {TargetElement} from '.'

declare const element: TargetElement
type NotVoid = string | number | boolean | object | null

userEvent.type(element, 'foo', {delay: 1}) as Promise<void>
// @ts-expect-error No delay returns void
userEvent.type(element, 'foo') as NotVoid
