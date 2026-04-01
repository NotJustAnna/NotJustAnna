import { readFileSync, writeFileSync } from "fs";

const RSS_URL = "https://notjustanna.net/rss.xml";
const README_PATH = "README.md";
const MAX_POSTS = 5;

const START_MARKER = "<!-- BLOG:START -->";
const END_MARKER = "<!-- BLOG:END -->";

const res = await fetch(RSS_URL);
if (!res.ok) {
  console.error(`Failed to fetch RSS: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const xml = await res.text();

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .slice(0, MAX_POSTS)
  .map((match) => {
    const inner = match[1];
    const title = inner.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "";
    const link = inner.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    return { title, link };
  })
  .filter((item) => item.title && item.link);

const lines = [
  START_MARKER,
  "<!-- updated automatically — don't touch -->",
  ...items.map(({ title, link }) => `- [${title}](${link})`),
  END_MARKER,
].join("\n");

const readme = readFileSync(README_PATH, "utf-8");

if (!readme.includes(START_MARKER) || !readme.includes(END_MARKER)) {
  console.error("Could not find BLOG markers in README.md");
  process.exit(1);
}

const updated = readme.replace(
  new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`),
  lines
);

writeFileSync(README_PATH, updated, "utf-8");
console.log(`Updated README with ${items.length} posts.`);