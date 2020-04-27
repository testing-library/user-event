import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "../../src";

describe("userEvent.tab", () => {
  it("should cycle elements in document tab order", () => {
    const { getAllByTestId } = render(
      <div>
        <input data-testid="element" type="checkbox" />
        <input data-testid="element" type="radio" />
        <input data-testid="element" type="number" />
      </div>
    );

    const [checkbox, radio, number] = getAllByTestId("element");

    expect(document.body).toHaveFocus();

    userEvent.tab();

    expect(checkbox).toHaveFocus();

    userEvent.tab();

    expect(radio).toHaveFocus();

    userEvent.tab();

    expect(number).toHaveFocus();

    userEvent.tab();

    // cycle goes back to first element
    expect(checkbox).toHaveFocus();
  });

  it("should go backwards when shift = true", () => {
    const { getAllByTestId } = render(
      <div>
        <input data-testid="element" type="checkbox" />
        <input data-testid="element" type="radio" />
        <input data-testid="element" type="number" />
      </div>
    );

    const [checkbox, radio, number] = getAllByTestId("element");

    radio.focus();

    userEvent.tab({ shift: true });

    expect(checkbox).toHaveFocus();

    userEvent.tab({ shift: true });

    expect(number).toHaveFocus();
  });

  it("should respect tabindex, regardless of dom position", () => {
    const { getAllByTestId } = render(
      <div>
        <input data-testid="element" tabIndex={2} type="checkbox" />
        <input data-testid="element" tabIndex={1} type="radio" />
        <input data-testid="element" tabIndex={3} type="number" />
      </div>
    );

    const [checkbox, radio, number] = getAllByTestId("element");

    userEvent.tab();

    expect(radio).toHaveFocus();

    userEvent.tab();

    expect(checkbox).toHaveFocus();

    userEvent.tab();

    expect(number).toHaveFocus();

    userEvent.tab();

    expect(radio).toHaveFocus();
  });

  it("should respect dom order when tabindex are all the same", () => {
    const { getAllByTestId } = render(
      <div>
        <input data-testid="element" tabIndex={0} type="checkbox" />
        <input data-testid="element" tabIndex={1} type="radio" />
        <input data-testid="element" tabIndex={0} type="number" />
      </div>
    );

    const [checkbox, radio, number] = getAllByTestId("element");

    userEvent.tab();

    expect(checkbox).toHaveFocus();

    userEvent.tab();

    expect(number).toHaveFocus();

    userEvent.tab();

    expect(radio).toHaveFocus();

    userEvent.tab();

    expect(checkbox).toHaveFocus();
  });

  it("should suport a mix of elements with/without tab index", () => {
    const { getAllByTestId } = render(
      <div>
        <input data-testid="element" tabIndex={0} type="checkbox" />
        <input data-testid="element" tabIndex={1} type="radio" />
        <input data-testid="element" type="number" />
      </div>
    );

    const [checkbox, radio, number] = getAllByTestId("element");

    userEvent.tab();

    expect(checkbox).toHaveFocus();
    userEvent.tab();

    expect(number).toHaveFocus();
    userEvent.tab();

    expect(radio).toHaveFocus();
  });

  it("should not tab to <a> with no href", () => {
    const { getAllByTestId } = render(
      <div>
        <input data-testid="element" tabIndex={0} type="checkbox" />
        <a>ignore this</a>
        <a data-testid="element" href="http://www.testingjavascript.com">
          a link
        </a>
      </div>
    );

    const [checkbox, link] = getAllByTestId("element");

    userEvent.tab();

    expect(checkbox).toHaveFocus();

    userEvent.tab();

    expect(link).toHaveFocus();
  });

  it("should stay within a focus trap", () => {
    const { getAllByTestId, getByTestId } = render(
      <>
        <div data-testid="div1">
          <input data-testid="element" type="checkbox" />
          <input data-testid="element" type="radio" />
          <input data-testid="element" type="number" />
        </div>
        <div data-testid="div2">
          <input data-testid="element" foo="bar" type="checkbox" />
          <input data-testid="element" foo="bar" type="radio" />
          <input data-testid="element" foo="bar" type="number" />
        </div>
      </>
    );

    const [div1, div2] = [getByTestId("div1"), getByTestId("div2")];
    const [
      checkbox1,
      radio1,
      number1,
      checkbox2,
      radio2,
      number2,
    ] = getAllByTestId("element");

    expect(document.body).toHaveFocus();

    userEvent.tab({ focusTrap: div1 });

    expect(checkbox1).toHaveFocus();

    userEvent.tab({ focusTrap: div1 });

    expect(radio1).toHaveFocus();

    userEvent.tab({ focusTrap: div1 });

    expect(number1).toHaveFocus();

    userEvent.tab({ focusTrap: div1 });

    // cycle goes back to first element
    expect(checkbox1).toHaveFocus();

    userEvent.tab({ focusTrap: div2 });

    expect(checkbox2).toHaveFocus();

    userEvent.tab({ focusTrap: div2 });

    expect(radio2).toHaveFocus();

    userEvent.tab({ focusTrap: div2 });

    expect(number2).toHaveFocus();

    userEvent.tab({ focusTrap: div2 });

    // cycle goes back to first element
    expect(checkbox2).toHaveFocus();
  });

  // prior to node 11, Array.sort was unstable for arrays w/ length > 10.
  // https://twitter.com/mathias/status/1036626116654637057
  // for this reason, the tab() function needs to account for this in it's sorting.
  // for example under node 10 in this test:
  // > 'abcdefghijklmnopqrstuvwxyz'.split('').sort(() => 0).join('')
  // will give you 'nacdefghijklmbopqrstuvwxyz'
  it("should support unstable sorting environments like node 10", () => {
    const letters = "abcdefghijklmnopqrstuvwxyz";

    const { getByTestId } = render(
      <>
        {letters.split("").map((letter) => (
          <input key={letter} type="text" data-testid={letter} />
        ))}
      </>
    );

    expect.assertions(26);

    letters.split("").forEach((letter) => {
      userEvent.tab();
      expect(getByTestId(letter)).toHaveFocus();
    });
  });
});

it("should not focus disabled elements", () => {
  const { getByTestId } = render(
    <div>
      <input data-testid="one" />
      <input tabIndex={-1} />
      <button disabled>click</button>
      <input disabled />
      <input data-testid="five" />
    </div>
  );

  const [one, five] = [getByTestId("one"), getByTestId("five")];

  userEvent.tab();
  expect(one).toHaveFocus();

  userEvent.tab();
  expect(five).toHaveFocus();
});

it("should keep focus on the document if there are no enabled, focusable elements", () => {
  render(<button disabled>no clicky</button>);

  userEvent.tab();
  expect(document.body).toHaveFocus();

  userEvent.tab({ shift: true });
  expect(document.body).toHaveFocus();
});
