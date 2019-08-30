import { promises as fspromises } from "fs";
const { readdir, readFile, stat } = fspromises;
import { resolve, sep } from "path";

const cache: string[] = [];

if (process.argv.length > 3) {
    const regex = new RegExp(process.argv[2]);
    process.argv.slice(3).forEach((path) => matchFile(regex, resolve(path)));
} else {
    process.stdout.write("Expected at least 2 arguments.\n");
}

async function matchFile(regex: RegExp, path: string) {
    if (cache.indexOf(path) === -1) {
        cache.push(path);
        try {
            const stats = await stat(path);
            if (stats.isDirectory()) {
                (await readdir(path)).forEach((subPath) => {
                    matchFile(regex, path + sep + subPath);
                });
            } else {
                readFile(path).then((contents) => {
                    if (regex.test(contents.toString())) {
                        process.stdout.write(`Found match in ${path}.\n`);
                    }
                });
            }
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
            process.stdout.write(`File ${path} not found.\n`);
        }
    }
}
