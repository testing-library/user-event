import {behavior} from './registry'

behavior.mouseleave = (_, target, instance) => {
  const className = instance.config.hoverClass
  if (className == null) return
  target.classList.remove(className)
}
