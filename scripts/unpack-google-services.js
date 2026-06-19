const fs = require("fs");
const path = require("path");

if (!process.env.GOOGLE_SERVICES_JSON) {
  console.error("Missing GOOGLE_SERVICES_JSON env variable");
  process.exit(1);
}

const decoded = Buffer.from(process.env.GOOGLE_SERVICES_JSON, "base64").toString("utf8");

// Write to root (for Expo config)
fs.writeFileSync("google-services.json", decoded);
console.log("Wrote google-services.json to root");

// Write to android/app/ (for Gradle when native Android directory exists)
const androidAppPath = path.join("android", "app", "google-services.json");
if (fs.existsSync("android")) {
  fs.mkdirSync(path.join("android", "app"), { recursive: true });
  fs.writeFileSync(androidAppPath, decoded);
  console.log("Wrote google-services.json to android/app/");
}
