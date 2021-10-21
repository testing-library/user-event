declare module '@testing-library/dom/dist/event-map' {
  export const eventMap: Record<
    string,
    {
      EventType: string
      defaultInit: EventInit
    }
  >
}
