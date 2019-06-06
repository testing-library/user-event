import React from "react";
import { cleanup, render, wait } from "@testing-library/react";
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

  it("should delayed the typing when opts.dealy is not 0", async () => {
    jest.useFakeTimers();
    const onChange = jest.fn();
    const { getByTestId } = render(
      React.createElement("input", {
        "data-testid": "input",
        onChange: onChange
      })
    );
    const text = "Hello, world!";
    const delay = 10;
    userEvent.type(getByTestId("input"), text, {
      delay
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(getByTestId("input")).not.toHaveProperty("value", text);

    for (let i = 0; i < text.length; i++) {
      jest.advanceTimersByTime(delay);
      await wait(() => expect(onChange).toHaveBeenCalledTimes(i + 1));
      expect(getByTestId("input")).toHaveProperty(
        "value",
        text.slice(0, i + 1)
      );
    }
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
