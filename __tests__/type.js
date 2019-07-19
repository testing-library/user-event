import React from "react";
import { cleanup, render, wait, fireEvent } from "@testing-library/react";
import "jest-dom/extend-expect";
import userEvent from "../src";

afterEach(cleanup);

describe("userEvent.type", () => {
  it.each(["input", "textarea"])("should type text in <%s>", type => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      React.createElement(type, {
        "data-testid": "input",
        onChange: onChange
      })
    );
    const text = "Hello, world!";
    userEvent.type(getByTestId("input"), text);
    expect(onChange).toHaveBeenCalledTimes(text.length);
    expect(getByTestId("input")).toHaveProperty("value", text);
  });

  it("should not type when event.preventDefault() is called", () => {
    const onChange = jest.fn();
    const onKeydown = jest
      .fn()
      .mockImplementation(event => event.preventDefault());
    const { getByTestId } = render(
      <input data-testid="input" onKeyDown={onKeydown} onChange={onChange} />
    );
    const text = "Hello, world!";
    userEvent.type(getByTestId("input"), text);
    expect(onKeydown).toHaveBeenCalledTimes(text.length);
    expect(onChange).toHaveBeenCalledTimes(0);
    expect(getByTestId("input")).not.toHaveProperty("value", text);
  });

  it("should delay the typing when opts.delay is not 0", async () => {
    jest.useFakeTimers();
    const onChange = jest.fn();
    const onInput = jest.fn();
    const { getByTestId } = render(
      React.createElement("input", {
        "data-testid": "input",
        onInput
      })
    );
    const text = "Hello, world!";
    const delay = 10;
    // Attach a native change listener because React cannot listen for text input change events
    getByTestId("input").addEventListener("change", onChange);
    userEvent.type(getByTestId("input"), text, {
      delay
    });
    expect(onInput).not.toHaveBeenCalled();
    expect(getByTestId("input")).not.toHaveProperty("value", text);

    for (let i = 0; i < text.length; i++) {
      jest.advanceTimersByTime(delay);
      await wait(() => expect(onInput).toHaveBeenCalledTimes(i + 1));
      expect(getByTestId("input")).toHaveProperty(
        "value",
        text.slice(0, i + 1)
      );
    }
    expect(onChange).not.toHaveBeenCalled();
    // Blurring the input "commits" the value, so the change event will fire
    fireEvent.blur(getByTestId("input"));
    await wait(() => expect(onChange).toHaveBeenCalled(), { timeout: 300 });
  });

  it.each(["input", "textarea"])(
    "should type text in <%s> all at once",
    type => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        React.createElement(type, {
          "data-testid": "input",
          onChange: onChange
        })
      );
      const text = "Hello, world!";
      userEvent.type(getByTestId("input"), text, {
        allAtOnce: true
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(getByTestId("input")).toHaveProperty("value", text);
    }
  );
});
