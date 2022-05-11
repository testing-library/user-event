if (global.REACT_VERSION) {
  jest.mock('@testing-library/react', () =>
    jest.requireActual(`reactTesting${global.REACT_VERSION}`),
  )
  jest.mock('react', () => jest.requireActual(`react${global.REACT_VERSION}`))
  jest.mock('react-dom', () =>
    jest.requireActual(`reactDom${global.REACT_VERSION}`),
  )
  jest.mock('react-dom/test-utils', () =>
    jest.requireActual(`reactDom${global.REACT_VERSION}/test-utils`),
  )
  jest.mock('react-is', () =>
    jest.requireActual(`reactIs${global.REACT_VERSION}`),
  )
}
