import {IncomingMessage} from "http";

export interface ITalk {
    title: string;
    presenter: string;
    summary: string;
    comments: IComment[];
}

export interface ISkillShareServer {
    readonly talks: {[title: string]: ITalk};
    version: number;
    updated(): void;
    start(port: number): void;
    stop(): void;
    talkResponse(): Pick<Required<IResponse>, "body" | "headers">;
    waitForChanges(time: number): Promise<IResponse>;
}

export interface IResponse {
    status?: number;
    body?: string;
    headers?: {[header: string]: string};
}

export type RouteHandler = (
    server: ISkillShareServer,
    request: IncomingMessage,
    ...urlParts: string[]
) => Promise<IResponse>;

export interface IRoute {
    method: string;
    url: RegExp;
    handler: RouteHandler;
}

export interface IComment {
    author: string;
    message: string;
}
