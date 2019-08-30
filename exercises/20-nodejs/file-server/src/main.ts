import { createReadStream, createWriteStream, promises as fspromises, ReadStream, WriteStream } from "fs";
import { createServer, IncomingMessage } from "http";
import mime from "mime";
import { resolve as resolvePath, sep } from "path";
import { parse } from "url";

const { mkdir, readdir, rmdir, stat, unlink } = fspromises;
interface IHandlerResponse {
    body?: ReadStream | string | Buffer;
    status?: number;
    type?: string;
}
type Method = (request: IncomingMessage) => Promise<IHandlerResponse>;

const methods: { [key: string]: Method } = Object.create(null);
methods.GET = async (request) => {
    const path = urlPath(request.url!);
    let stats;
    try {
        stats = await stat(path);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
        return { status: 404, body: "File not found" };
    }
    if (stats.isDirectory()) {
        return { body: (await readdir(path)).join("\n") };
    }
    return {
        body: createReadStream(path),
        type: mime.getType(path) || undefined,
    };
};
methods.DELETE = async (request) => {
    const path = urlPath(request.url!);
    let stats;
    try {
        stats = await stat(path);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
        return { status: 204 };
    }
    if (stats.isDirectory()) {
        await rmdir(path);
    } else {
        await unlink(path);
    }
    return { status: 204 };
};
methods.PUT = async (request) => {
    const path = urlPath(request.url!);
    await pipeStream(request, createWriteStream(path));
    return {status: 204};
};
methods.MKCOL = async (request) => {
    const path = urlPath(request.url!);
    try {
        await mkdir(path);
    } catch (error) {
        if (error.code !== "EEXIST") {
            throw error;
        }
    }
    return { status: 204 };
};

createServer((request, response) => {
    const handler = methods[request.method!] || notAllowed;
    handler(request)
        .catch((error) => {
            if (error.status != null) {
                return error;
            }
            return { body: String(error), status: 500 };
        })
        .then(({ body, status = 200, type = "text/plain" }: IHandlerResponse) => {
            response.writeHead(status, { "Content-Type": type });
            if (body instanceof ReadStream) {
                body.pipe(response);
            } else {
                response.end(body);
            }
        });
}).listen(8000);

async function notAllowed(request: IncomingMessage) {
    return {
        body: `Method ${request.method} not allowed.`,
        status: 405,
    };
}

const baseDirectory = process.cwd();

function urlPath(url: string) {
    const { pathname } = parse(url);
    const path = resolvePath(decodeURIComponent(pathname!).slice(1));
    if (path !== baseDirectory && !path.startsWith(baseDirectory + sep)) {
        throw { status: 403, body: "Forbidden" };
    }
    return path;
}

function pipeStream(from: IncomingMessage, to: WriteStream) {
    return new Promise((resolve, reject) => {
        from.on("error", reject);
        to.on("error", reject);
        to.on("finish", resolve);
        from.pipe(to);
    });
}
