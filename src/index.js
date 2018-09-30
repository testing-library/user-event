import { fireEvent } from "dom-testing-library";

function findTagInParents(element, tagName) {
  if (element.parentNode == null) return undefined;
  if (element.parentNode.tagName === tagName) return element.parentNode;
  return findTagInParents(element.parentNode, tagName);
}

function clickLabel(label) {
  fireEvent.mouseOver(label);
  fireEvent.mouseMove(label);
  fireEvent.mouseDown(label);
  fireEvent.mouseUp(label);

  if (label.htmlFor) {
    const input = document.getElementById(label.htmlFor);
    input.focus();
    fireEvent.click(label);
  } else {
    const input = label.querySelector("input,textarea");
    input.focus();
    label.focus();
    fireEvent.click(label);
  }
}

function clickCheckbox(checkbox) {
  fireEvent.mouseOver(checkbox);
  fireEvent.mouseMove(checkbox);
  fireEvent.mouseDown(checkbox);
  fireEvent.mouseUp(checkbox);
  fireEvent.click(checkbox);
  fireEvent.change(checkbox);
}

function clickElement(element) {
  fireEvent.mouseOver(element);
  fireEvent.mouseMove(element);
  fireEvent.mouseDown(element);
  element.focus();
  fireEvent.mouseUp(element);
  fireEvent.click(element);

  const labelAncestor = findTagInParents(element, "LABEL");
  labelAncestor && clickLabel(labelAncestor);
}

function dblClickElement(element) {
  fireEvent.mouseOver(element);
  fireEvent.mouseMove(element);
  fireEvent.mouseDown(element);
  element.focus();
  fireEvent.mouseUp(element);
  fireEvent.click(element);
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
  fireEvent.dblClick(element);

  const labelAncestor = findTagInParents(element, "LABEL");
  labelAncestor && clickLabel(labelAncestor);
}

function dblClickCheckbox(checkbox) {
  fireEvent.mouseOver(checkbox);
  fireEvent.mouseMove(checkbox);
  fireEvent.mouseDown(checkbox);
  fireEvent.mouseUp(checkbox);
  fireEvent.click(checkbox);
  fireEvent.change(checkbox);
  fireEvent.mouseDown(checkbox);
  fireEvent.mouseUp(checkbox);
  fireEvent.click(checkbox);
  fireEvent.change(checkbox);
}

const userEvent = {
  click(element) {
    const focusedElement = document.activeElement;
    const wasAnotherElementFocused =
      focusedElement !== document.body && focusedElement !== element;
    if (wasAnotherElementFocused) {
      fireEvent.mouseMove(focusedElement);
      fireEvent.mouseLeave(focusedElement);
    }

    switch (element.tagName) {
      case "LABEL":
        clickLabel(element);
        break;
      case "INPUT":
        if (element.type === "checkbox") {
          clickCheckbox(element);
          break;
        }
      default:
        clickElement(element);
    }

    wasAnotherElementFocused && focusedElement.blur();
  },

  dblClick(element) {
    const focusedElement = document.activeElement;
    const wasAnotherElementFocused =
      focusedElement !== document.body && focusedElement !== element;
    if (wasAnotherElementFocused) {
      fireEvent.mouseMove(focusedElement);
      fireEvent.mouseLeave(focusedElement);
    }

    switch (element.tagName) {
      case "INPUT":
        if (element.type === "checkbox") {
          dblClickCheckbox(element);
          break;
        }
      default:
        dblClickElement(element);
    }

    wasAnotherElementFocused && focusedElement.blur();
  },

  type(element, text, userOpts = {}) {
    const defaultOpts = { allAtOnce: false };
    const opts = Object.assign(defaultOpts, userOpts);

    this.click(element);
    if (opts.allAtOnce) {
      fireEvent.change(element, { target: { value: text } });
    } else {
      text
        .split("")
        .forEach((_, i) =>
          fireEvent.change(element, { target: { value: text.slice(0, i + 1) } })
        );
    }
  }
};

export default userEvent;
