import fs from "fs";

const rawWords = fs
  .readFileSync("scripts/allwords.txt", "utf-8")
  .split("\n");

const normalize = (word) =>
  word
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ñ/g, "N");

const filtered = rawWords
  .map(normalize)
  .filter(w => w.length === 5 && /^[A-Z]{5}$/.test(w));

const unique = [...new Set(filtered)];

fs.writeFileSync(
  "scripts/filtered_words.json",
  JSON.stringify(unique, null, 2)
);

console.log("✅ Palabras válidas:", unique.length);
