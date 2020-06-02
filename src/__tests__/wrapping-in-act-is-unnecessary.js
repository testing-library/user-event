import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '..'

test('act necessitating side effect', () => {
  const effectCallback = jest.fn()
  function TestComponent() {
    const [clicked, setClicked] = React.useState(false)
    React.useEffect(() => {
      if (clicked) {
        effectCallback()
      }
    }, [clicked])
    return <button onClick={() => setClicked(true)}>click me</button>
  }
  render(<TestComponent />)

  // https://github.com/testing-library/dom-testing-library/pull/600
  // before our fixes in DOM Testing Library, we had to wrap
  // this next line in act for this test to pass.
  userEvent.click(screen.getByRole('button', {name: /click me/i}))

  expect(effectCallback).toHaveBeenCalledTimes(1)
})

test('act necessitating async side effect', async () => {
  function TestComponent() {
    const [renderMessage, setRenderMessage] = React.useState(false)
    function handleChange() {
      Promise.resolve().then(() => {
        setRenderMessage(true)
      })
    }
    return (
      <div>
        <input type="text" onChange={handleChange} />
        <div>{renderMessage ? 'MESSAGE' : null}</div>
      </div>
    )
  }
  render(<TestComponent />)

  // https://github.com/testing-library/dom-testing-library/pull/602
  // before our fixes in DOM Testing Library, we had to wrap
  // this next line in act for this test to pass.
  await userEvent.type(screen.getByRole('textbox'), 'a')

  expect(await screen.findByText('MESSAGE')).toBeInTheDocument()

  expect(console.error).not.toHaveBeenCalled()
})
