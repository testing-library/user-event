import { fireEvent } from "dom-testing-library";

function wait(time) {
  return new Promise(function(resolve) {
    setTimeout(() => resolve(), time);
  });
}

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

function clickBooleanElement(element) {
  if (element.disabled) return;

  fireEvent.mouseOver(element);
  fireEvent.mouseMove(element);
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
  fireEvent.change(element);
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

function selectOption(option) {
  fireEvent.mouseOver(option);
  fireEvent.mouseMove(option);
  fireEvent.mouseDown(option);
  fireEvent.focus(option);
  fireEvent.mouseUp(option);
  fireEvent.click(option);

  option.selected = true;
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
        if (element.type === "checkbox" || element.type === "radio") {
          clickBooleanElement(element);
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

  selectOptions(element, selectorFn) {
    const focusedElement = document.activeElement;
    const wasAnotherElementFocused =
      focusedElement !== document.body && focusedElement !== element;
    if (wasAnotherElementFocused) {
      fireEvent.mouseMove(focusedElement);
      fireEvent.mouseLeave(focusedElement);
    }

    clickElement(element);

    const selectedOptions = Array.from(element.children).filter(
      option => option.tagName === "OPTION" && selectorFn(option)
    );

    if (selectedOptions.length > 0) {
      if (element.multiple) {
        selectedOptions.forEach(option => selectOption(option));
      } else {
        selectOption(selectedOptions[selectedOptions.length - 1]);
      }
    }

    wasAnotherElementFocused && focusedElement.blur();
  },

  async type(element, text, userOpts = {}) {
    const defaultOpts = {
      allAtOnce: false,
      delay: 0
    };
    const opts = Object.assign(defaultOpts, userOpts);
    if (opts.allAtOnce) {
      fireEvent.change(element, { target: { value: text } });
    } else {
      const typedCharacters = text.split("");

      let actuallyTyped = "";
      for (let index = 0; index < text.length; index++) {
        const char = text[index];
        const key = char; // TODO: check if this also valid for characters with diacritic markers e.g. úé etc
        const keyCode = char.charCodeAt(0);

        if (opts.delay > 0) await wait(opts.delay);

        const downEvent = fireEvent.keyDown(element, {
          key: key,
          keyCode: keyCode,
          which: keyCode
        });
        if (downEvent) {
          const pressEvent = fireEvent.keyPress(element, {
            key: key,
            keyCode,
            charCode: keyCode,
            keyCode: keyCode
          });
          if (pressEvent) {
            actuallyTyped += key;
            fireEvent.change(element, {
              target: {
                value: actuallyTyped
              },
              bubbles: true,
              cancelable: true
            });
          }
        }

        fireEvent.keyUp(element, {
          key: key,
          keyCode: keyCode,
          which: keyCode
        });
      }
    }
  }
};

export default userEvent;
