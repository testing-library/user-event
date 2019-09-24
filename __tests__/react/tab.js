import React from "react";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "../../src";

afterEach(cleanup);

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

        expect(document.activeElement).toBe(document.body);

        userEvent.tab();

        expect(document.activeElement).toBe(checkbox);

        userEvent.tab();

        expect(document.activeElement).toBe(radio);

        userEvent.tab();

        expect(document.activeElement).toBe(number);

        userEvent.tab();

        expect(document.activeElement).toBe(checkbox);
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

        expect(document.activeElement).toBe(checkbox);

        userEvent.tab({ shift: true });

        expect(document.activeElement).toBe(number);
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

        expect(document.activeElement).toBe(radio);

        userEvent.tab();

        expect(document.activeElement).toBe(checkbox);

        userEvent.tab();

        expect(document.activeElement).toBe(number);

        userEvent.tab();

        expect(document.activeElement).toBe(radio);
    });

    it('should respect dom order when tabindex are all the same', () => {
        const { getAllByTestId } = render(
            <div>
                <input data-testid="element" tabIndex={0} type="checkbox" />
                <input data-testid="element" tabIndex={1} type="radio" />
                <input data-testid="element" tabIndex={0} type="number" />
            </div>
        );

        const [checkbox, radio, number] = getAllByTestId("element");

        userEvent.tab();

        expect(document.activeElement).toBe(checkbox);

        userEvent.tab();

        expect(document.activeElement).toBe(number);

        userEvent.tab();

        expect(document.activeElement).toBe(radio);

        userEvent.tab();

        expect(document.activeElement).toBe(checkbox);
    });

    it('should suport a mix of elements with/without tab index', () => {
        const { getAllByTestId } = render(
            <div>
                <input data-testid="element" tabIndex={0} type="checkbox" />
                <input data-testid="element" tabIndex={1} type="radio" />
                <input data-testid="element" type="number" />
            </div>
        );

        const [checkbox, radio, number] = getAllByTestId("element");

        userEvent.tab();

        expect(document.activeElement).toBe(checkbox);
        userEvent.tab();

        expect(document.activeElement).toBe(number);
        userEvent.tab();

        expect(document.activeElement).toBe(radio);

    });

    it('should not tab to <a> with no href', () => {
        const { getAllByTestId } = render(
            <div>
                <input data-testid="element" tabIndex={0} type="checkbox" />
                <a>ignore this</a>
                <a data-testid="element" href="http://www.testingjavascript.com">a link</a>
            </div>
        );

        const [checkbox, link] = getAllByTestId("element");

        userEvent.tab();

        expect(document.activeElement).toBe(checkbox);

        userEvent.tab();

        expect(document.activeElement).toBe(link);
    });

});
