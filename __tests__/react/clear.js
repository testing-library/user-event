import React from "react";
import { cleanup, render, wait, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "../../src";

afterEach(cleanup);

describe("userEvent.clear", () => {
  it.each(["input", "textarea"])("should clear text in <%s>", type => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      React.createElement(type, {
        "data-testid": "input",
        onChange: onChange,
        value: "Hello, world!"
      })
    );

    const input = getByTestId("input");
    userEvent.clear(input);
    expect(input.value).toBe("");
  });

  it.each(["input", "textarea"])(
    "should not clear when <%s> is disabled",
    type => {
      const text = "Hello, world!";
      const onChange = jest.fn();
      const { getByTestId } = render(
        React.createElement(type, {
          "data-testid": "input",
          onChange: onChange,
          value: text,
          disabled: true
        })
      );

      const input = getByTestId("input");
      userEvent.clear(input);
      expect(input).toHaveProperty("value", text);
    }
  );

  it.each(["input", "textarea"])(
    "should not clear when <%s> is readOnly",
    type => {
      const onChange = jest.fn();
      const onKeyDown = jest.fn();
      const onKeyUp = jest.fn();

      const text = "Hello, world!";
      const { getByTestId } = render(
        React.createElement(type, {
          "data-testid": "input",
          onChange,
          onKeyDown,
          onKeyUp,
          value: text,
          readOnly: true
        })
      );

      const input = getByTestId("input");
      userEvent.clear(input);
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyUp).toHaveBeenCalledTimes(1);
      expect(input).toHaveProperty("value", text);
    }
  );
});
