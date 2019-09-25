import { IncomingMessage } from "http";
import {parse} from "url";
import {IRoute, ISkillShareServer, RouteHandler} from "./interfaces";

export default class Router {
    private readonly routes: IRoute[];

    constructor() {
        this.routes = [];
    }

    public add(method: string, url: RegExp, handler: RouteHandler) {
        this.routes.push({method, url, handler});
    }

    public resolve(context: ISkillShareServer, request: IncomingMessage) {
        if (request.url) {
            const path = parse(request.url).pathname;

            if (path) {
                for (const {method, url, handler} of this.routes) {
                    const match = url.exec(path);
                    if (!match || request.method !== method) {
                        continue;
                    }
                    const urlParts = match.slice(1).map(decodeURIComponent);
                    return handler(context, request, ...urlParts);
                }
            }
        }
        return null;
    }
}
