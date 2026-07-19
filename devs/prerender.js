import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { renderSsr } from "dreamland/vite";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const resolve = (p) => resolvePath(__dirname, p);

const entry = await import(pathToFileURL(resolve("dist/server/main-server.js")).href);

entry.default("/");
const paths = entry.router.ssgables();
paths.push(["/devs/404", "/devs/404.html"])

let template = await readFile(resolve("dist/static/index.html"), "utf8");

for (const [route, path] of paths) {
	const cleanRoute = route === "//" ? "/" : route;
	const cleanPath = path === "//.html" ? "/devs/index.html" : path.replace(/^\/\//, "/devs/");
	const rendered = await renderSsr(template, () => entry.default(cleanRoute));
	console.log(
		`prerendered: ${cleanRoute}\t${(new TextEncoder().encode(rendered).byteLength / 1024).toFixed(2)}kb`
	);
	const outPath = cleanPath.replace(/^\/devs\//, "");
	let resolved = resolve("dist/static/" + outPath);
	await mkdir(dirname(resolved), { recursive: true });
	await writeFile(resolved, rendered);
}

await rm(resolve("dist/static/.vite"), { recursive: true });
