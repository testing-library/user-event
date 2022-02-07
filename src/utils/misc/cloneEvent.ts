interface EventConstructor<E extends Event> {
  new (type: string, init: EventInit): E
}

export function cloneEvent<E extends Event>(event: E) {
  return new (event.constructor as EventConstructor<E>)(event.type, event)
}
