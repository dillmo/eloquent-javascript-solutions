import ecstatic from "ecstatic";
import {promises as fsPromises} from "fs";
const {readFile, writeFile} = fsPromises;
import {createServer, IncomingMessage, Server} from "http";
import {IComment, IResponse, ISkillShareServer, ITalk} from "./interfaces";
import Router from "./router";

const router = new Router();
const defaultHeaders = {"Content-Type": "text/plain"};

class SkillShareServer implements ISkillShareServer {
    public readonly talks: {[title: string]: ITalk};
    public version: number;
    private readonly server: Server;
    private waiting: Array<(response: IResponse) => void>;

    constructor(talks: {[title: string]: ITalk}) {
        this.talks = talks;
        this.version = 0;
        this.waiting = [];

        const fileServer = ecstatic({root: "./public"});
        this.server = createServer((request, response) => {
            const resolved = router.resolve(this, request);
            if (resolved) {
                resolved
                    .catch((error: any) => {
                        if (error.status != null) {
                            return error;
                        }
                        return {body: String(error), status: 500};
                    })
                    .then(({body, status = 200, headers = defaultHeaders}: IResponse) => {
                        response.writeHead(status, headers);
                        response.end(body);
                    });
            } else {
                fileServer(request, response);
            }
        });
    }

    public start(port: number) {
        this.server.listen(port);
    }

    public stop() {
        this.server.close();
    }

    public talkResponse() {
        const talks = [];
        for (const title of Object.keys(this.talks)) {
            talks.push(this.talks[title]);
        }
        return {
            body: JSON.stringify(talks),
            headers: {
                "Content-Type": "application/json",
                "ETag": `"${this.version}"`,
            },
        };
    }

    public waitForChanges(time: number): Promise<IResponse> {
        return new Promise((resolve) => {
            this.waiting.push(resolve);
            setTimeout(() => {
                if (!this.waiting.includes(resolve)) {
                    return;
                }
                this.waiting = this.waiting.filter((r) => r !== resolve);
                resolve({status: 304});
            }, time * 1000);
        });
    }

    public updated() {
        this.version++;
        const response = this.talkResponse();
        this.waiting.forEach((resolve) => resolve(response));
        this.waiting = [];
        writeFile("talks.json", JSON.stringify(this.talks));
    }
}

const talkPath = /^\/talks\/([^\/]+)$/;

router.add("GET", talkPath, async (server, _, title) => {
    if (title in server.talks) {
        return {
            body: JSON.stringify(server.talks[title]),
            headers: {"Content-Type": "application.json"},
        };
    }
    return {status: 404, body: `No talk '${title}' found`};
});

router.add("DELETE", talkPath, async (server, _, title) => {
    if (title in server.talks) {
        delete server.talks[title];
        server.updated();
    }
    return {status: 204};
});

function readStream(stream: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = "";
        stream.on("error", reject);
        stream.on("data", (chunk) => data += chunk.toString());
        stream.on("end", () => resolve(data));
    });
}

router.add("PUT", talkPath, async (server, request, title) => {
    const requestBody = await readStream(request);
    let talk;
    try {
        talk = JSON.parse(requestBody);
    } catch (_) {
        return {status: 400, body: "Invalid JSON"};
    }

    if (!isTalk(talk)) {
        return {status: 400, body: "Bad talk data"};
    }
    server.talks[title] = {
        comments: [],
        presenter: talk.presenter,
        summary: talk.summary,
        title,
    };
    server.updated();
    return {status: 204};
});

function isTalk(data: any): data is ITalk {
    return data &&
            typeof data.presenter === "string" &&
            typeof data.summary === "string";
}

router.add("POST", /^\/talks\/([^\/]+)\/comments$/, async (server, request, title) => {
    const requestBody = await readStream(request);
    let comment;
    try {
        comment = JSON.parse(requestBody);
    } catch (_) {
        return {status: 400, body: "Invalid JSON"};
    }

    if (!isComment(comment)) {
        return {status: 400, body: "Bad comment data"};
    }
    if (title in server.talks) {
        server.talks[title].comments.push(comment);
        server.updated();
        return {status: 204};
    }
    return {status: 404, body: `No talk '${title}' found`};
});

function isComment(data: any): data is IComment {
    return data && typeof data.author === "string" &&
            typeof data.message === "string";
}

router.add("GET", /^\/talks$/, async (server, request) => {
    const ifNoneMatch = request.headers["if-none-match"];
    const prefer = request.headers.prefer;
    let tag;
    let wait;
    if (ifNoneMatch) {
        tag = /"(.*)"/.exec(ifNoneMatch);
    }
    if (typeof prefer === "string") {
        wait = /\bwait=(\d+)/.exec(prefer);
    }
    if (!tag || Number(tag[1]) !== server.version) {
        return server.talkResponse();
    }
    if (!wait) {
        return {status: 304};
    }
    return server.waitForChanges(Number(wait[1]));
});

readFile("talks.json", "utf-8")
    .then((text) => {
        new SkillShareServer(JSON.parse(text)).start(8000);
    })
    .catch(() => {
        new SkillShareServer(Object.create(null)).start(8000);
    });
