import {behavior} from './registry'

behavior.mouseenter = (_, target, instance) => {
  const className = instance.config.hoverClass
  if (className == null) return
  target.classList.add(className)
}
