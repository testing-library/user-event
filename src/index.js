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
  fireEvent.click(label);

  if (label.htmlFor) {
    const input = document.getElementById(label.htmlFor);
    input.focus();
    fireEvent.click(label);
  } else {
    const input = label.querySelector("input,textarea");
    input.focus();
    label.focus();
    fireEvent.click(input);
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
  }
};

export default userEvent;
