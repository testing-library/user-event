// Definitions by: Wu Haotian <https://github.com/whtsky>
export interface IUserOptions {
    allAtOnce?: boolean;
    delay?: number;
}

export interface IUserSelectOptions {
    target?: string;
}

type TargetElement = Element | Window;

declare const userEvent: {
    click: (element: TargetElement) => void;
    dblClick: (element: TargetElement) => void;
    selectOptions: (
        element: TargetElement,
        values: string | string[],
        userOpts?: IUserSelectOptions
    ) => void;
    type: (
        element: TargetElement,
        text: string,
        userOpts?: IUserOptions
    ) => Promise<void>;
};

export default userEvent;
