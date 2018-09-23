import React from "react";
import { render, cleanup } from "react-testing-library";
import "jest-dom/extend-expect";
import userEvent from "../src";

afterEach(cleanup);

describe("userEvent.type", () => {
  it.each(["input", "textarea"])("should type text in <%s>", type => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      React.createElement(type, { "data-testid": "input", onChange: onChange })
    );
    const text = "Hello, world!";
    userEvent.type(getByTestId("input"), text);

    expect(onChange).toHaveBeenCalledTimes(text.length);
    expect(getByTestId("input")).toHaveProperty("value", text);
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
      userEvent.type(getByTestId("input"), text, { allAtOnce: true });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(getByTestId("input")).toHaveProperty("value", text);
    }
  );
});
