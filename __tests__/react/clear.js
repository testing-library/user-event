import React from "react";
import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "../../src";

afterEach(cleanup);

describe("userEvent.clear", () => {
  it.each(["input", "textarea"])("should clear text in <%s>", (type) => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      React.createElement(type, {
        "data-testid": "input",
        onChange: onChange,
        value: "Hello, world!",
      })
    );

    const input = getByTestId("input");
    userEvent.clear(input);
    expect(input.value).toBe("");
  });

  it.each(["input", "textarea"])(
    "should not clear when <%s> is disabled",
    (type) => {
      const text = "Hello, world!";
      const onChange = jest.fn();
      const { getByTestId } = render(
        React.createElement(type, {
          "data-testid": "input",
          onChange: onChange,
          value: text,
          disabled: true,
        })
      );

      const input = getByTestId("input");
      userEvent.clear(input);
      expect(input).toHaveProperty("value", text);
    }
  );

  it.each(["input", "textarea"])(
    "should not clear when <%s> is readOnly",
    (type) => {
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
          readOnly: true,
        })
      );

      const input = getByTestId("input");
      userEvent.clear(input);
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyUp).toHaveBeenCalledTimes(1);
      expect(input).toHaveProperty("value", text);
    }
  );

  ["email", "password", "number", "text"].forEach((type) => {
    it.each(["input", "textarea"])(
      `should clear when <%s> is of type="${type}"`,
      (inputType) => {
        const value = "12345";
        const placeholder = "Enter password";

        const element = React.createElement(inputType, {
          value,
          placeholder,
          type,
          onChange: jest.fn(),
        });

        const { getByPlaceholderText } = render(element);

        const input = getByPlaceholderText(placeholder);
        expect(input.value).toBe(value);
        userEvent.clear(input);
        expect(input.value).toBe("");
      }
    );
  });

  it(`should remove file`, () => {
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const { getByTestId } = render(<input type="file" data-testid="element" />);

    const input = getByTestId("element");

    userEvent.upload(input, file);

    expect(input.files[0]).toStrictEqual(file);
    expect(input.files.item(0)).toStrictEqual(file);
    expect(input.files).toHaveLength(1);

    userEvent.clear(input);

    expect(input.files[0]).toBeUndefined();
    expect(input.files.item[0]).toBeUndefined();
    expect(input.files).toHaveLength(0);
  });
});
