export interface callbackPayload {
  currentElement: () => Element | null
  prevWasMinus?: boolean
  prevWasPeriod?: boolean
  prevValue?: string
  typedValue?: string
  eventOverrides?: {[k: string]: unknown}
}

export interface callback {
  (callbackPayload: callbackPayload): Partial<callbackPayload> | undefined
  closeName?: string
}
