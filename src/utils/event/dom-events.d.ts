declare module '@testing-library/dom/dist/event-map.js' {
  export const eventMap: Record<
    string,
    {
      EventType: string
      defaultInit: EventInit
    }
  >
}
