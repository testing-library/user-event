import { fireEvent } from "@testing-library/dom";

function wait(time) {
  return new Promise(function (resolve) {
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

function clickElement(element, previousElement, init) {
  fireEvent.mouseOver(element);
  fireEvent.mouseMove(element);
  const wasAnotherElementFocused =
    previousElement !== element.ownerDocument.body &&
    previousElement !== element;
  const continueDefaultHandling = fireEvent.mouseDown(element);
  if (continueDefaultHandling) {
    wasAnotherElementFocused && previousElement.blur();
    previousElement !== element && element.focus();
  }
  fireEvent.mouseUp(element);
  fireEvent.click(element, init);

  const labelAncestor = findTagInParents(element, "LABEL");
  labelAncestor && clickLabel(labelAncestor);
}

function dblClickElement(element, previousElement) {
  fireEvent.mouseOver(element);
  fireEvent.mouseMove(element);
  const wasAnotherElementFocused =
    previousElement !== element.ownerDocument.body &&
    previousElement !== element;
  const continueDefaultHandling = fireEvent.mouseDown(element);
  if (continueDefaultHandling) {
    wasAnotherElementFocused && previousElement.blur();
    previousElement !== element && element.focus();
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

const Keys = {
  Backspace: { keyCode: 8, code: "Backspace", key: "Backspace" },
};

function backspace(element) {
  const eventOptions = {
    key: Keys.Backspace.key,
    keyCode: Keys.Backspace.keyCode,
    which: Keys.Backspace.keyCode,
  };
  fireEvent.keyDown(element, eventOptions);
  fireEvent.keyUp(element, eventOptions);

  if (!element.readOnly) {
    fireEvent.input(element, {
      inputType: "deleteContentBackward",
    });
    element.value = ""; // when we add special keys to API, will need to respect selected range
  }
}

function selectAll(element) {
  userEvent.dblClick(element); // simulate events (will not actually select)
  const elementType = element.type;
  // type is a readonly property on textarea, so check if element is an input before trying to modify it
  if (isInputElement(element)) {
    // setSelectionRange is not supported on certain types of inputs, e.g. "number" or "email"
    element.type = "text";
  }
  element.setSelectionRange(0, element.value.length);
  if (isInputElement(element)) {
    element.type = elementType;
  }
}

function isInputElement(element) {
  return element.tagName.toLowerCase() === "input";
}

const userEvent = {
  click(element, init) {
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
        clickElement(element, focusedElement, init);
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
        dblClickElement(element, focusedElement);
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

    clickElement(element, focusedElement);

    const valArray = Array.isArray(values) ? values : [values];
    const selectedOptions = Array.from(
      element.querySelectorAll("option")
    ).filter((opt) => valArray.includes(opt.value));

    if (selectedOptions.length > 0) {
      if (element.multiple) {
        selectedOptions.forEach((option) => selectOption(element, option));
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
      delay: 0,
    };
    const opts = Object.assign(defaultOpts, userOpts);

    const computedText =
      element.maxLength > 0 ? text.slice(0, element.maxLength) : text;

    const previousText = element.value;

    if (opts.allAtOnce) {
      if (element.readOnly) return;
      fireEvent.input(element, {
        target: { value: previousText + computedText },
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
          which: keyCode,
        });

        if (downEvent) {
          const pressEvent = fireEvent.keyPress(element, {
            key: key,
            keyCode,
            charCode: keyCode,
          });

          const isTextPastThreshold =
            (actuallyTyped + key).length > (previousText + computedText).length;

          if (pressEvent && !isTextPastThreshold) {
            actuallyTyped += key;
            if (!element.readOnly)
              fireEvent.input(element, {
                target: {
                  value: actuallyTyped,
                },
                bubbles: true,
                cancelable: true,
              });
          }
        }

        fireEvent.keyUp(element, {
          key: key,
          keyCode: keyCode,
          which: keyCode,
        });
      }
    }
    element.addEventListener("blur", fireChangeEvent);
  },

  upload(element, fileOrFiles, init) {
    if (element.disabled) return;
    const focusedElement = element.ownerDocument.activeElement;

    let files;

    if (element.tagName === "LABEL") {
      clickLabel(element);
      const inputElement = element.htmlFor
        ? document.getElementById(element.htmlFor)
        : querySelector("input");
      files = inputElement.multiple ? fileOrFiles : [fileOrFiles];
    } else {
      files = element.multiple ? fileOrFiles : [fileOrFiles];
      clickElement(element, focusedElement, init);
    }

    fireEvent.change(element, {
      target: {
        files: {
          length: files.length,
          item: (index) => files[index],
          ...{ ...files },
        },
      },
    });
  },

  tab({ shift = false, focusTrap = document } = {}) {
    const focusableElements = focusTrap.querySelectorAll(
      "input, button, select, textarea, a[href], [tabindex]"
    );

    const enabledElements = Array.prototype.filter.call(
      focusableElements,
      function (el) {
        return el.getAttribute("tabindex") !== "-1" && !el.disabled;
      }
    );

    if (enabledElements.length === 0) return;

    const orderedElements = enabledElements
      .map((el, idx) => ({ el, idx }))
      .sort((a, b) => {
        const tabIndexA = a.el.getAttribute("tabindex");
        const tabIndexB = b.el.getAttribute("tabindex");

        const diff = tabIndexA - tabIndexB;

        return diff !== 0 ? diff : a.idx - b.idx;
      });

    const index = orderedElements.findIndex(
      ({ el }) => el === document.activeElement
    );

    let nextIndex = shift ? index - 1 : index + 1;
    let defaultIndex = shift ? orderedElements.length - 1 : 0;

    const { el: next } =
      orderedElements[nextIndex] || orderedElements[defaultIndex];

    if (next.getAttribute("tabindex") === null) {
      next.setAttribute("tabindex", "0"); // jsdom requires tabIndex=0 for an item to become 'document.activeElement' (the browser does not)
      next.focus();
      next.removeAttribute("tabindex"); // leave no trace. :)
    } else {
      next.focus();
    }
  },
};

export default userEvent;
