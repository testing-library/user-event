import * as React from "react";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "../../src";

afterEach(cleanup);

describe("userEvent.toggleOptions", () => {
  it("should fire the correct events for multiple select", () => {
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
      <select {...{ ...eventHandlers }} data-testid="element" multiple>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    );

    userEvent.toggleOptions(getByTestId("element"), "1");

    expect(events).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click",
      "mouseover", // The events repeat because we click on the child OPTION too
      "mousemove", // But these specifically are the events bubbling up to the <select>
      "mousedown",
      "focus",
      "mouseup",
      "click",
    ]);
  });

  it("should fire the correct events on selected OPTION child with <select>", () => {
    function handleEvent(evt) {
      const optValue = parseInt(evt.target.value);
      events[optValue] = [...(events[optValue] || []), evt.type];
    }

    const events = [];
    const eventsHandler = jest.fn(handleEvent);
    const eventHandlers = {
      onMouseOver: eventsHandler,
      onMouseMove: eventsHandler,
      onMouseDown: eventsHandler,
      onFocus: eventsHandler,
      onMouseUp: eventsHandler,
      onClick: eventsHandler,
    };

    const { getByTestId } = render(
      <select data-testid="element" multiple>
        <option {...eventHandlers} value="1">
          1
        </option>
        <option {...eventHandlers} value="2">
          2
        </option>
        <option {...eventHandlers} value="3">
          3
        </option>
      </select>
    );

    userEvent.toggleOptions(getByTestId("element"), ["2"]);

    expect(events[1]).toBe(undefined);
    expect(events[3]).toBe(undefined);
    expect(events[2]).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click",
    ]);
  });

  it("should fire the correct events on selected OPTION children with <select multiple>", () => {
    function handleEvent(evt) {
      const optValue = parseInt(evt.target.value);
      events[optValue] = [...(events[optValue] || []), evt.type];
    }

    const events = [];
    const eventsHandler = jest.fn(handleEvent);
    const eventHandlers = {
      onMouseOver: eventsHandler,
      onMouseMove: eventsHandler,
      onMouseDown: eventsHandler,
      onFocus: eventsHandler,
      onMouseUp: eventsHandler,
      onClick: eventsHandler,
    };

    const { getByTestId } = render(
      <select multiple data-testid="element">
        <option {...eventHandlers} value="1">
          1
        </option>
        <option {...eventHandlers} value="2">
          2
        </option>
        <option {...eventHandlers} value="3">
          3
        </option>
      </select>
    );

    userEvent.toggleOptions(getByTestId("element"), ["1", "3"]);

    expect(events[2]).toBe(undefined);
    expect(events[1]).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click",
    ]);

    expect(events[3]).toEqual([
      "mouseover",
      "mousemove",
      "mousedown",
      "focus",
      "mouseup",
      "click",
    ]);
  });

  it("sets the selected prop on the selected OPTION", () => {
    const onSubmit = jest.fn();

    const { getByTestId } = render(
      <form onSubmit={onSubmit}>
        <select multiple data-testid="element">
          <option data-testid="val1" value="1">
            1
          </option>
          <option data-testid="val2" value="2">
            2
          </option>
          <option data-testid="val3" value="3">
            3
          </option>
        </select>
      </form>
    );

    userEvent.toggleOptions(getByTestId("element"), ["1", "3"]);

    expect(getByTestId("val1").selected).toBe(true);
    expect(getByTestId("val2").selected).toBe(false);
    expect(getByTestId("val3").selected).toBe(true);
  });

  it("sets the selected prop on the selected OPTION using htmlFor", () => {
    const onSubmit = jest.fn();

    const { getByTestId } = render(
      <form onSubmit={onSubmit}>
        <label htmlFor="select">Example Select</label>
        <select id="select" data-testid="element" multiple>
          <option data-testid="val1" value="1">
            1
          </option>
          <option data-testid="val2" value="2">
            2
          </option>
          <option data-testid="val3" value="3">
            3
          </option>
        </select>
      </form>
    );

    userEvent.toggleOptions(getByTestId("element"), "2");

    expect(getByTestId("val1").selected).toBe(false);
    expect(getByTestId("val2").selected).toBe(true);
    expect(getByTestId("val3").selected).toBe(false);
  });

  it("should fire onChange event on a SELECT element", () => {
    const onChangeHandler = jest.fn();

    const { getByTestId } = render(
      <select data-testid="element" onChange={onChangeHandler} multiple>
        <option data-testid="val1" value="1">
          1
        </option>
        <option data-testid="val2" value="2">
          2
        </option>
        <option data-testid="val3" value="3">
          3
        </option>
      </select>
    );

    userEvent.toggleOptions(getByTestId("element"), "2");

    expect(onChangeHandler).toBeCalled();
  });

  it("sets the selected prop on the selected OPTION using nested SELECT", () => {
    const onSubmit = jest.fn();

    const { getByTestId } = render(
      <form onSubmit={onSubmit}>
        <label>
          Example Select
          <select data-testid="element" multiple>
            <option data-testid="val1" value="1">
              1
            </option>
            <option data-testid="val2" value="2">
              2
            </option>
            <option data-testid="val3" value="3">
              3
            </option>
          </select>
        </label>
      </form>
    );

    userEvent.toggleOptions(getByTestId("element"), "2");

    expect(getByTestId("val1").selected).toBe(false);
    expect(getByTestId("val2").selected).toBe(true);
    expect(getByTestId("val3").selected).toBe(false);
  });

  it("sets the selected prop on the selected OPTION using OPTGROUPS", () => {
    const { getByTestId } = render(
      <form>
        <select multiple data-testid="element">
          <optgroup label="test optgroup 1">
            <option data-testid="val1" value="1">
              1
            </option>
          </optgroup>
          <optgroup label="test optgroup 2">
            <option data-testid="val2" value="2">
              2
            </option>
          </optgroup>
          <optgroup label="test optgroup 1">
            <option data-testid="val3" value="3">
              3
            </option>
          </optgroup>
        </select>
      </form>
    );

    userEvent.toggleOptions(getByTestId("element"), ["1", "3"]);

    expect(getByTestId("val1").selected).toBe(true);
    expect(getByTestId("val2").selected).toBe(false);
    expect(getByTestId("val3").selected).toBe(true);
  });

  it("toggle options as expected", () => {
    const TestBed = () => {
      const [selected, setSelected] = React.useState([]);

      return (
        <>
          <select
            value={selected}
            onChange={(ev) => {
              const options = ev.target.options;
              const result = [];

              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  result.push(options[i].value);
                }
              }

              setSelected(result);
            }}
            data-testid="element"
            multiple
          >
            <option value="1">One</option>
            <option value="2">Two</option>
          </select>
          <span data-testid="selected">{selected.join(", ")}</span>
        </>
      );
    };

    const { getByTestId } = render(<TestBed />);

    // select one
    userEvent.toggleOptions(getByTestId("element"), ["1"]);
    expect(getByTestId("selected").textContent).toBe("1");

    // unselect one and select two
    userEvent.toggleOptions(getByTestId("element"), ["1", "2"]);
    expect(getByTestId("selected").textContent).toBe("2");

    // select one
    userEvent.toggleOptions(getByTestId("element"), ["1"]);
    expect(getByTestId("selected").textContent).toBe("1, 2");
  });

  it("throws error when provided element is not a multiple select", () => {
    const { getByTestId } = render(
      <select data-testid="element">
        <option value="one">1</option>
      </select>
    );

    expect(() => {
      userEvent.toggleOptions(getByTestId("element"));
    }).toThrowErrorMatchingInlineSnapshot(
      `"Unable to toggleOptions - please provide a select element with multiple=true"`
    );
  });
});
