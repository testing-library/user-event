import React from "react";
import { cleanup, render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "../../src";

afterEach(cleanup);

describe("userEvent.upload", () => {
  it("should fire the correct events for input", () => {
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const events = [];
    const eventsHandler = jest.fn((evt) => events.push(evt.type));
    const eventHandlers = {
      onMouseOver: eventsHandler,
      onMouseMove: eventsHandler,
      onMouseDown: eventsHandler,
      onFocus: eventsHandler,
      onMouseUp: eventsHandler,
      onClick: eventsHandler,
    };

    const { getByTestId } = render(
      <input type="file" data-testid="element" {...eventHandlers} />
    );

    userEvent.upload(getByTestId("element"), file);

    expect(events).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click",
    ]);
  });

  it("should fire the correct events with label", () => {
    const file = new File(["hello"], "hello.png", { type: "image/png" });

    const inputEvents = [];
    const labelEvents = [];
    const eventsHandler = (events) => jest.fn((evt) => events.push(evt.type));

    const getEventHandlers = (events) => ({
      onMouseOver: eventsHandler(events),
      onMouseMove: eventsHandler(events),
      onMouseDown: eventsHandler(events),
      onFocus: eventsHandler(events),
      onMouseUp: eventsHandler(events),
      onClick: eventsHandler(events),
    });

    const { getByTestId } = render(
      <>
        <label
          htmlFor="element"
          data-testid="label"
          {...getEventHandlers(labelEvents)}
        >
          Element
        </label>
        <input type="file" id="element" {...getEventHandlers(inputEvents)} />
      </>
    );

    userEvent.upload(getByTestId("label"), file);

    expect(inputEvents).toEqual(["focus", "click"]);
    expect(labelEvents).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "mouseup",
      "click",
    ]);
  });

  it("should upload the file", () => {
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const { getByTestId } = render(<input type="file" data-testid="element" />);
    const input = getByTestId("element");

    userEvent.upload(input, file);

    expect(input.files[0]).toStrictEqual(file);
    expect(input.files.item(0)).toStrictEqual(file);
    expect(input.files).toHaveLength(1);

    fireEvent.change(input, {
      target: { files: { item: () => {}, length: 0 } },
    });

    expect(input.files[0]).toBeUndefined();
    expect(input.files.item[0]).toBeUndefined();
    expect(input.files).toHaveLength(0);
  });

  it("should upload multiple files", () => {
    const files = [
      new File(["hello"], "hello.png", { type: "image/png" }),
      new File(["there"], "there.png", { type: "image/png" }),
    ];
    const { getByTestId } = render(
      <input type="file" multiple data-testid="element" />
    );
    const input = getByTestId("element");

    userEvent.upload(input, files);

    expect(input.files[0]).toStrictEqual(files[0]);
    expect(input.files.item(0)).toStrictEqual(files[0]);
    expect(input.files[1]).toStrictEqual(files[1]);
    expect(input.files.item(1)).toStrictEqual(files[1]);
    expect(input.files).toHaveLength(2);

    fireEvent.change(input, {
      target: { files: { item: () => {}, length: 0 } },
    });

    expect(input.files[0]).toBeUndefined();
    expect(input.files.item[0]).toBeUndefined();
    expect(input.files).toHaveLength(0);
  });

  it("should not upload when is disabled", () => {
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const { getByTestId } = render(
      <input type="file" data-testid="element" disabled />
    );

    const input = getByTestId("element");

    userEvent.upload(input, file);

    expect(input.files[0]).toBeUndefined();
    expect(input.files.item[0]).toBeUndefined();
    expect(input.files).toHaveLength(0);
  });
});
