// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from "@sentry/nestjs";

Sentry.init({
	dsn: "https://effc3a1c79ad1a443bdc36caf6ade29a@o1062861.ingest.us.sentry.io/4511033681838080",
	// Setting this option to true will send default PII data to Sentry.
	// For example, automatic IP address collection on events
	sendDefaultPii: true,
});
