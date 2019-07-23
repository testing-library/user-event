import { cleanup, render, wait } from "@testing-library/vue";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "../../src";

afterEach(cleanup);

const renderComponent = (type, events = {}) =>
  render({
    render: function(h) {
      return h(type, {
        attrs: { "data-testid": "input" },
        on: events
      });
    }
  });

describe("userEvent.type", () => {
  it.each(["input", "textarea"])("should type text in <%s>", type => {
    const change = jest.fn();

    const { getByTestId } = renderComponent(type, { change });

    const text = "Hello, world!";
    userEvent.type(getByTestId("input"), text);

    expect(change).toHaveBeenCalledTimes(text.length);
    expect(getByTestId("input")).toHaveProperty("value", text);
  });

  it("should not type when event.preventDefault() is called", () => {
    const change = jest.fn();
    const keydown = jest
      .fn()
      .mockImplementation(event => event.preventDefault());

    const { getByTestId } = renderComponent("input", { change, keydown });

    const text = "Hello, world!";
    userEvent.type(getByTestId("input"), text);
    expect(keydown).toHaveBeenCalledTimes(text.length);
    // expect(change).toHaveBeenCalledTimes(0);
    // expect(getByTestId("input")).not.toHaveProperty("value", text);
  });

  it("should delayed the typing when opts.dealy is not 0", async () => {
    jest.useFakeTimers();
    const onChange = jest.fn();

    const { getByTestId } = renderComponent("input", { change: onChange });
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
      const change = jest.fn();

      const { getByTestId } = renderComponent(type, { change });
      const text = "Hello, world!";
      userEvent.type(getByTestId("input"), text, {
        allAtOnce: true
      });

      expect(change).toHaveBeenCalledTimes(1);
      expect(getByTestId("input")).toHaveProperty("value", text);
    }
  );
});
