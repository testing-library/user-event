import "jest-dom/extend-expect";

import { cleanup, render } from "react-testing-library";

import React from "react";
import userEvent from "../src";

afterEach(cleanup);

describe("userEvent.type", () => {
  it.each(["input", "textarea"])("should type text in <%s>", async type => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      React.createElement(type, {
        "data-testid": "input",
        onChange: onChange
      })
    );
    const text = "Hello, world!";
    await userEvent.type(getByTestId("input"), text);
    expect(onChange).toHaveBeenCalledTimes(text.length);
    expect(getByTestId("input")).toHaveProperty("value", text);
  });

  it.each(["input", "textarea"])(
    "should not type <%s> when prevented",
    async type => {
      const onChange = jest.fn();
      const onKeydown = jest
        .fn()
        .mockImplementation(event => event.preventDefault());
      const { getByTestId } = render(
        React.createElement(type, {
          "data-testid": "input",
          onKeyDown: onKeydown,
          onChange: onChange
        })
      );
      const text = "Hello, world!";
      await userEvent.type(getByTestId("input"), text);
      expect(onKeydown).toHaveBeenCalledTimes(text.length);
      expect(onChange).toHaveBeenCalledTimes(0);
      expect(getByTestId("input")).not.toHaveProperty("value", text);
    }
  );

  it("test delayed typing of text", async () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      React.createElement("input", {
        "data-testid": "input",
        onChange: onChange
      })
    );
    const text = "Hello, world!";
    await userEvent.type(getByTestId("input"), text, {
      allAtOnce: false,
      delay: 10
    });

    expect(onChange).toHaveBeenCalledTimes(text.length);
    expect(getByTestId("input")).toHaveProperty("value", text);
  });

  it.each(["input", "textarea"])(
    "should type text in <%s> all at once",
    async type => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        React.createElement(type, {
          "data-testid": "input",
          onChange: onChange
        })
      );
      const text = "Hello, world!";
      await userEvent.type(getByTestId("input"), text, {
        allAtOnce: true
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(getByTestId("input")).toHaveProperty("value", text);
    }
  );
});
