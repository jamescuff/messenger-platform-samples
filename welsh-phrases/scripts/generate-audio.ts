import gtts from "google-tts-api";
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_PHRASES } from "../src/data/phrases.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "audio");

await mkdir(outDir, { recursive: true });

interface Task {
  id: string;
  text: string;
}

const tasks: Task[] = [];
for (const phrase of SEED_PHRASES) {
  tasks.push({ id: phrase.id, text: phrase.welsh });
  if (phrase.example) tasks.push({ id: `${phrase.id}-ex`, text: phrase.example.welsh });
}

let made = 0;
let skipped = 0;
let failed = 0;

for (const { id, text } of tasks) {
  const file = join(outDir, `${id}.mp3`);
  try {
    await access(file);
    skipped++;
    continue;
  } catch {
    // not present, generate
  }

  try {
    const b64 = await gtts.getAudioBase64(text, {
      lang: "cy",
      slow: false,
      host: "https://translate.google.com",
      timeout: 15000,
    });
    await writeFile(file, Buffer.from(b64, "base64"));
    made++;
    console.log(`  ✓ ${id}  (${text.slice(0, 50)}${text.length > 50 ? "…" : ""})`);
    await new Promise((r) => setTimeout(r, 250));
  } catch (e) {
    failed++;
    console.error(`  ✗ ${id}: ${(e as Error).message}`);
  }
}

console.log(`\nDone. generated=${made} skipped=${skipped} failed=${failed} total=${tasks.length}`);
if (failed > 0) process.exitCode = 1;
