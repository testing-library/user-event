import React from "react";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "../../src";

afterEach(cleanup);

describe("userEvent.dblClick", () => {
  it.each(["input", "textarea"])(
    "should fire the correct events for <%s>",
    type => {
      const events = [];
      const eventsHandler = jest.fn(evt => events.push(evt.type));
      const { getByTestId } = render(
        React.createElement(type, {
          "data-testid": "element",
          onMouseOver: eventsHandler,
          onMouseMove: eventsHandler,
          onMouseDown: eventsHandler,
          onFocus: eventsHandler,
          onMouseUp: eventsHandler,
          onClick: eventsHandler,
          onDoubleClick: eventsHandler
        })
      );

      userEvent.dblClick(getByTestId("element"));

      expect(events).toEqual([
        "mouseover",
        "mousemove",
        "mousedown",
        "focus",
        "mouseup",
        "click",
        "mousedown",
        "mouseup",
        "click",
        "dblclick"
      ]);
    }
  );

  it('should fire the correct events for <input type="checkbox">', () => {
    const events = [];
    const eventsHandler = jest.fn(evt => events.push(evt.type));
    const { getByTestId } = render(
      <input
        data-testid="element"
        type="checkbox"
        onMouseOver={eventsHandler}
        onMouseMove={eventsHandler}
        onMouseDown={eventsHandler}
        onFocus={eventsHandler}
        onMouseUp={eventsHandler}
        onClick={eventsHandler}
        onChange={eventsHandler}
      />
    );

    userEvent.dblClick(getByTestId("element"));

    expect(events).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click",
      "change",
      "mousedown",
      "mouseup",
      "click",
      "change"
    ]);

    expect(getByTestId("element")).toHaveProperty("checked", false);
  });

  it("should fire the correct events for <div>", () => {
    const events = [];
    const eventsHandler = jest.fn(evt => events.push(evt.type));
    const { getByTestId } = render(
      <div
        data-testid="div"
        onMouseOver={eventsHandler}
        onMouseMove={eventsHandler}
        onMouseDown={eventsHandler}
        onFocus={eventsHandler}
        onMouseUp={eventsHandler}
        onClick={eventsHandler}
      />
    );

    userEvent.dblClick(getByTestId("div"));
    expect(events).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "mouseup",
      "click",
      "mousedown",
      "mouseup",
      "click"
    ]);
  });

  it("should not blur when mousedown prevents default", () => {
    let events = [];
    const eventsHandler = jest.fn(evt => events.push(evt.type));
    const commonEvents = {
      onBlur: eventsHandler,
      onMouseOver: eventsHandler,
      onMouseMove: eventsHandler,
      onMouseDown: eventsHandler,
      onFocus: eventsHandler,
      onMouseUp: eventsHandler,
      onClick: eventsHandler,
      onChange: eventsHandler
    };

    const { getByTestId } = render(
      <React.Fragment>
        <input data-testid="A" {...commonEvents} />
        <input
          data-testid="B"
          {...commonEvents}
          onMouseDown={e => {
            e.preventDefault();
            eventsHandler(e);
          }}
        />
        <input data-testid="C" {...commonEvents} />
      </React.Fragment>
    );

    const a = getByTestId("A");
    const b = getByTestId("B");
    const c = getByTestId("C");

    expect(a).not.toHaveFocus();
    expect(b).not.toHaveFocus();
    expect(c).not.toHaveFocus();

    userEvent.dblClick(a);
    expect(a).toHaveFocus();
    expect(b).not.toHaveFocus();
    expect(c).not.toHaveFocus();

    expect(events).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click",
      "mousedown",
      "mouseup",
      "click"
    ]);

    events = [];

    userEvent.dblClick(b);
    expect(a).toHaveFocus();
    expect(b).not.toHaveFocus();
    expect(c).not.toHaveFocus();

    expect(events).toEqual([
      "mousemove",
      "mouseover",
      "mousemove",
      "mousedown",
      "mouseup",
      "click",
      "mousedown",
      "mouseup",
      "click"
    ]);

    events = [];

    userEvent.dblClick(c);
    expect(a).not.toHaveFocus();
    expect(b).not.toHaveFocus();
    expect(c).toHaveFocus();

    expect(events).toEqual([
      "mousemove",
      "mouseover",
      "mousemove",
      "mousedown",
      "blur",
      "focus",
      "mouseup",
      "click",
      "mousedown",
      "mouseup",
      "click"
    ]);
  });
});
