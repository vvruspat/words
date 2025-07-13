const fs = require("node:fs");
const path = require("node:path");
const { glob } = require("glob");

// Define the root directory containing the component folders
const componentsDir = path.join(__dirname, "src", "atoms");
console.log("Searching in: ", componentsDir);

// Function to extract CSS variables from a CSS file
function extractCSSVariables(filePath, componentName) {
	const fileContent = fs.readFileSync(filePath, "utf8");
	const variableRegex = new RegExp(
		`var\\((--${componentName.slice(1).toLowerCase()}-[\\w-]+)(?:,\\s*([^\\)]+))?\\)`,
		"g",
	);
	const variables = new Map();
	let match = variableRegex.exec(fileContent);
	while (match !== null) {
		variables.set(match[1], match[2]?.trim());
		match = variableRegex.exec(fileContent);
	}
	return Array.from(variables.entries());
}

// Function to create a .vars.css file with the extracted variables
function createVarsCSSFile(componentName, variables) {
	const varsFilePath = path.join(
		componentsDir,
		componentName,
		`${componentName}.vars.css`,
	);
	const content = variables
		.map((variable) => `${variable[0]}: var(--any-var, ${variable[1]});`)
		.join("\n");
	fs.writeFileSync(varsFilePath, `:root {\n${content}\n}`);
	console.log(`Created: ${varsFilePath}`);
}

console.log("Running glob");

// Find all .module.css files in the components directory
glob(`${componentsDir}/**/*.module.css`).then((files) => {
	console.log("css files: ", files);

	files.forEach((filePath) => {
		console.log("checking filepath: ", filePath);
		const componentName = path.basename(filePath, ".module.css");
		console.log("Component name", componentName);
		const variables = extractCSSVariables(filePath, componentName);
		console.log("Variables: ", variables);
		if (variables.length > 0) {
			createVarsCSSFile(componentName, variables);
		}
	});
});
