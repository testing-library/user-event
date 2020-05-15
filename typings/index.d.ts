// Definitions by: Wu Haotian <https://github.com/whtsky>
export interface IUserOptions {
    allAtOnce?: boolean;
    delay?: number;
}

export interface ITabUserOptions {
    shift?: boolean;
    focusTrap?: Document | Element;
}

export type TargetElement = Element | Window;

declare const userEvent: {
    clear: (element: TargetElement) => void;
    click: (element: TargetElement, init?: MouseEventInit) => void;
    dblClick: (element: TargetElement) => void;
    selectOptions: (element: TargetElement, values: string | string[]) => void;
    type: (
        element: TargetElement,
        text: string,
        userOpts?: IUserOptions
    ) => Promise<void>;
    tab: (userOpts?: ITabUserOptions) => void;
};

export default userEvent;
