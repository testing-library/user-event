import { fireEvent } from "@testing-library/dom";

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
    const input = label.querySelector("input,textarea,select");
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
  fireEvent.focus(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
}

function clickElement(element, previousElement) {
  fireEvent.mouseOver(element);
  fireEvent.mouseMove(element);
  const continueDefaultHandling = fireEvent.mouseDown(element);
  if (continueDefaultHandling) {
    previousElement && previousElement.blur();
    element.focus();
  }
  fireEvent.mouseUp(element);
  fireEvent.click(element);

  const labelAncestor = findTagInParents(element, "LABEL");
  labelAncestor && clickLabel(labelAncestor);
}

function dblClickElement(element, previousElement) {
  fireEvent.mouseOver(element);
  fireEvent.mouseMove(element);
  const continueDefaultHandling = fireEvent.mouseDown(element);
  if (continueDefaultHandling) {
    previousElement && previousElement.blur();
    element.focus();
  }
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
  fireEvent.focus(checkbox);
  fireEvent.mouseUp(checkbox);
  fireEvent.click(checkbox);
  fireEvent.mouseDown(checkbox);
  fireEvent.mouseUp(checkbox);
  fireEvent.click(checkbox);
}

function selectOption(select, option) {
  fireEvent.mouseOver(option);
  fireEvent.mouseMove(option);
  fireEvent.mouseDown(option);
  fireEvent.focus(option);
  fireEvent.mouseUp(option);
  fireEvent.click(option);

  option.selected = true;

  fireEvent.change(select);
}

function fireChangeEvent(event) {
  fireEvent.change(event.target);
  event.target.removeEventListener("blur", fireChangeEvent);
}

function getSelectionBounds(element) {
  return {
    start: element.selectionStart,
    end: element.selectionEnd
  };
}

function deleteLeftOfCursor(element) {
  const { start, end } = getSelectionBounds(element);
  if (start === end) {
    if (start === 0) {
      // there's nothing left of cursor
      return;
    }
    element.setSelectionRange(start - 1, end);
  }

  const value = element.value || "";
  const updatedValue = value.substring(0, start) + value.substring(end);
  element.value = updatedValue;

  element.setSelectionRange(start, start);
}

const Keys = {
  Backspace: { keyCode: 8, code: "Backspace", key: "Backspace" }
};

function backspace(element) {
  const eventOptions = {
    key: Keys.Backspace.key,
    keyCode: Keys.Backspace.keyCode,
    which: Keys.Backspace.keyCode
  };
  fireEvent.keyDown(element, eventOptions);
  fireEvent.keyUp(element, eventOptions);

  if (!element.readOnly) {
    fireEvent.input(element, {
      inputType: "deleteContentBackward"
    });
    deleteLeftOfCursor(element);
  }
}

function selectAll(element) {
  userEvent.dblClick(element); // simulate events (will not actually select)
  element.setSelectionRange(0, element.value.length);
}

const userEvent = {
  click(element) {
    const focusedElement = element.ownerDocument.activeElement;
    const wasAnotherElementFocused =
      focusedElement !== element.ownerDocument.body &&
      focusedElement !== element;
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
        clickElement(element, wasAnotherElementFocused && focusedElement);
    }
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
          dblClickCheckbox(element, wasAnotherElementFocused && focusedElement);
          break;
        }
      default:
        dblClickElement(element, wasAnotherElementFocused && focusedElement);
    }
  },

  selectOptions(element, values) {
    const focusedElement = document.activeElement;
    const wasAnotherElementFocused =
      focusedElement !== document.body && focusedElement !== element;
    if (wasAnotherElementFocused) {
      fireEvent.mouseMove(focusedElement);
      fireEvent.mouseLeave(focusedElement);
    }

    clickElement(element, wasAnotherElementFocused && focusedElement);

    const valArray = Array.isArray(values) ? values : [values];
    const selectedOptions = Array.from(
      element.querySelectorAll("option")
    ).filter(opt => valArray.includes(opt.value));

    if (selectedOptions.length > 0) {
      if (element.multiple) {
        selectedOptions.forEach(option => selectOption(element, option));
      } else {
        selectOption(element, selectedOptions[0]);
      }
    }
  },

  clear(element) {
    if (element.disabled) return;

    selectAll(element);
    backspace(element);
    element.addEventListener("blur", fireChangeEvent);
  },

  async type(element, text, userOpts = {}) {
    if (element.disabled) return;
    const defaultOpts = {
      allAtOnce: false,
      delay: 0
    };
    const opts = Object.assign(defaultOpts, userOpts);

    const computedText = text.slice(0, element.maxLength || text.length);

    const previousText = element.value;

    if (opts.allAtOnce) {
      if (element.readOnly) return;
      fireEvent.input(element, {
        target: { value: previousText + computedText }
      });
    } else {
      let actuallyTyped = previousText;
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
            charCode: keyCode
          });

          const isTextPastThreshold =
            (actuallyTyped + key).length > (previousText + computedText).length;

          if (pressEvent && !isTextPastThreshold) {
            actuallyTyped += key;
            if (!element.readOnly)
              fireEvent.input(element, {
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
    element.addEventListener("blur", fireChangeEvent);
  },

  tab({ shift = false, focusTrap = document } = {}) {
    const focusableElements = focusTrap.querySelectorAll(
      "input, button, select, textarea, a[href], [tabindex]"
    );

    let list = Array.prototype.filter
      .call(focusableElements, function(item) {
        return item.getAttribute("tabindex") !== "-1" && !item.disabled;
      })
      .map((el, idx) => ({ el, idx }))
      .sort((a, b) => {
        const tabIndexA = a.el.getAttribute("tabindex");
        const tabIndexB = b.el.getAttribute("tabindex");

        const diff = tabIndexA - tabIndexB;

        return diff !== 0 ? diff : a.idx - b.idx;
      });

    const index = list.findIndex(({ el }) => el === document.activeElement);

    let nextIndex = shift ? index - 1 : index + 1;
    let defaultIndex = shift ? list.length - 1 : 0;

    const { el: next } = list[nextIndex] || list[defaultIndex];

    if (next.getAttribute("tabindex") === null) {
      next.setAttribute("tabindex", "0"); // jsdom requires tabIndex=0 for an item to become 'document.activeElement' (the browser does not)
      next.focus();
      next.removeAttribute("tabindex"); // leave no trace. :)
    } else {
      next.focus();
    }
  }
};

export default userEvent;
