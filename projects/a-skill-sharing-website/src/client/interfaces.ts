export interface IAction {
    type: string;
    user?: string;
    talks?: ITalk[];
    title?: string;
    summary?: string;
    talk?: string;
    message?: string;
}
export type ISetUserAction = Required<Pick<IAction, "type" | "user">>;
export type ISetTalksAction = Required<Pick<IAction, "type" | "talks">>;
export type INewTalkAction = Required<Pick<IAction, "type" | "title" | "summary">>;
export type IDeleteTalkAction = Required<Pick<IAction, "type" | "talk">>;
export type INewCommentAction = Required<Pick<IAction, "type" | "talk" | "message">>;

export interface ITalk {
    title: string;
    presenter: string;
    summary: string;
    comments: IComment[];
}

export interface ITalkDOM {
    dom: HTMLElement;
    syncstate: (talk: ITalk) => void;
}

export interface IComment {
    author: string;
    message: string;
}

export interface IState {
    user: string;
    talks: ITalk[];
}

export interface IFormElements extends HTMLFormControlsCollection {
    comment: HTMLInputElement;
}
