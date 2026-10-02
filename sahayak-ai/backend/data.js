import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Default: monorepo `database/schemes.json` */
export function getSchemesPath() {
  return process.env.SCHEMES_PATH || path.join(__dirname, "..", "database", "schemes.json");
}

export function loadSchemes() {
  const p = getSchemesPath();
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}
