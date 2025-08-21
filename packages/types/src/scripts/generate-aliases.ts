import fs from "node:fs";
import path from "node:path";

const apiJsonPath = path.resolve(
	__dirname,
	"../../../../apps/api/openapi.json",
);
const outDir = path.resolve(__dirname, "../api");

// Clean up the output directory
if (fs.existsSync(outDir)) {
	try {
		fs.rmSync(outDir, { recursive: true, force: true });
	} catch {
		// fallback for older Node versions
		const rimraf = (p: string) => {
			for (const name of fs.readdirSync(p)) {
				const cur = path.join(p, name);
				const stat = fs.lstatSync(cur);
				if (stat.isDirectory()) rimraf(cur);
				else fs.unlinkSync(cur);
			}
			fs.rmdirSync(p);
		};
		rimraf(outDir);
	}
}
fs.mkdirSync(outDir, { recursive: true });

const spec = JSON.parse(fs.readFileSync(apiJsonPath, "utf-8"));

function writeFileSafely(filePath: string, content: string) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, content, "utf-8");
}

function pascalCase(rest: string): string {
	return `${rest
		.toLowerCase()
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("")}`;
}

// keep track of generated files per directory so we can emit index.ts re-exports
const exportsByDir = new Map<string, Set<string>>();

for (const [route, methods] of Object.entries(spec.paths)) {
	const cleanRoute =
		route.replace(/^\//, "").replace(/(\{([a-zA-Z]+)\})/g, "$2") || "root";

	for (const [method] of Object.entries(methods)) {
		const filePath = path.join(outDir, cleanRoute, `${method}.ts`);
		const dirPath = path.dirname(filePath);
		const typeNameBase = `${pascalCase(method)}${cleanRoute.split("/").map(pascalCase).join("By")}`;

		// record this file for later index.ts generation
		if (!exportsByDir.has(dirPath)) exportsByDir.set(dirPath, new Set());
		exportsByDir.get(dirPath).add(method);

		let content = `import { paths } from "../${cleanRoute
			.split("/")
			.map(() => "../")
			.join("")}api";\n\n`;

		if (methods[method].responses[200]) {
			content += `export type ${typeNameBase}Response = paths["${route}"]["${method}"]["responses"]["200"]["content"]["application/json"];\n`;
		} else if (methods[method].responses[201]) {
			content += `export type ${typeNameBase}Response = paths["${route}"]["${method}"]["responses"]["201"]["content"]["application/json"];\n`;
		} else if (methods[method].responses[204]) {
			content += `export type ${typeNameBase}Response = paths["${route}"]["${method}"]["responses"]["204"]["content"]["application/json"];\n`;
		}

		if (methods[method].requestBody) {
			content += `export type ${typeNameBase}Request = paths["${route}"]["${method}"]["requestBody"]["content"]["application/json"];\n`;
		}

		if (methods[method].query) {
			content += `export type ${typeNameBase}Request = paths["${route}"]["${method}"]["query"]["content"]["application/json"];\n`;
		}

		writeFileSafely(filePath, content);
	}
}

// emit index.ts files that re-export all method modules in each directory
const entries = Array.from(exportsByDir.entries());

for (const [dir, filesSet] of entries) {
	const innerDirs = Array.from(entries).filter(
		([d]) => d.startsWith(dir) && d !== dir,
	);

	const files = Array.from(filesSet).sort();

	let indexContent = "";
	for (const f of files) {
		indexContent += `export * from "./${f}";\n`;
	}

	for (const [innerDir] of innerDirs) {
		const relativePath = path.relative(dir, innerDir);
		indexContent += `export * from "./${relativePath}";\n`;
	}

	// also export a default barrel if needed (optional)
	writeFileSafely(path.join(dir, "index.ts"), indexContent);
}

// Generate a top-level index.ts that re-exports each top-level folder under the api output
const topLevelDirs = new Set<string>();

for (const dir of exportsByDir.keys()) {
	const rel = path.relative(outDir, dir);
	const first = rel.split(path.sep)[0];
	if (first) topLevelDirs.add(first);
}

let rootIndexContent = "";
for (const d of Array.from(topLevelDirs).sort()) {
	rootIndexContent += `export * from "./${d}";\n`;
}

writeFileSafely(path.join(outDir, "index.ts"), rootIndexContent);
