import { cleanup, render, wait, fireEvent } from "@testing-library/vue";
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
    const input = jest.fn();

    const { getByTestId } = renderComponent(type, { input });

    const text = "Hello, world!";
    userEvent.type(getByTestId("input"), text);

    expect(input).toHaveBeenCalledTimes(text.length);
    expect(getByTestId("input")).toHaveProperty("value", text);
  });

  it("should not type when event.preventDefault() is called", () => {
    const input = jest.fn();
    const keydown = jest
      .fn()
      .mockImplementation(event => event.preventDefault());

    const { getByTestId } = renderComponent("input", { input, keydown });

    const text = "Hello, world!";
    userEvent.type(getByTestId("input"), text);
    expect(keydown).toHaveBeenCalledTimes(text.length);
    // expect(input).toHaveBeenCalledTimes(0);
    // expect(getByTestId("input")).not.toHaveProperty("value", text);
  });

  it("should delay the typing when opts.delay is not 0", async () => {
    jest.useFakeTimers();
    const change = jest.fn();
    const input = jest.fn();
    const { getByTestId } = renderComponent("input", { change, input });
    const text = "Hello, world!";
    const delay = 10;

    userEvent.type(getByTestId("input"), text, {
      delay
    });

    expect(input).not.toHaveBeenCalled();
    expect(getByTestId("input")).not.toHaveProperty("value", text);

    for (let i = 0; i < text.length; i++) {
      jest.advanceTimersByTime(delay);

      await wait(() => expect(input).toHaveBeenCalledTimes(i + 1));

      expect(getByTestId("input")).toHaveProperty(
        "value",
        text.slice(0, i + 1)
      );
    }

    // Vue's change event is emitted until blurring the input
    expect(change).not.toHaveBeenCalled();
    fireEvent.blur(getByTestId("input"));
    await wait(() => expect(change).toHaveBeenCalledTimes(1));
  });

  it.each(["input", "textarea"])(
    "should type text in <%s> all at once",
    type => {
      const input = jest.fn();

      const { getByTestId } = renderComponent(type, { input });
      const text = "Hello, world!";

      userEvent.type(getByTestId("input"), text, {
        allAtOnce: true
      });

      expect(getByTestId("input")).toHaveProperty("value", text);
      expect(input).toHaveBeenCalledTimes(1);
    }
  );
});
