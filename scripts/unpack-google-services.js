const fs = require("fs");

if (!process.env.GOOGLE_SERVICES_JSON) {
  console.error("Missing GOOGLE_SERVICES_JSON env variable");
  process.exit(1);
}

const decoded = Buffer.from(process.env.GOOGLE_SERVICES_JSON, "base64").toString("utf8");
fs.writeFileSync("google-services.json", decoded);
