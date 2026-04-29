import fs from "fs";
import path from "path";

function safeReplace(file, replacer) {
  if (!fs.existsSync(file)) return;

  const content = fs.readFileSync(file, "utf8");
  const updated = replacer(content);

  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf8");
    console.warn("✔ patched:", file);
  }
}

// 1. Fix effect unused imports
safeReplace(
  "node_modules/@withstudiocms/effect/dist/effect.js",
  (content) =>
    content.replace(
      /import\s*{[^}]+}\s*from\s*["']effect["'];?/g,
      'import { deepmerge } from "effect";'
    )
);

// 2. Remove astro internal helpers (dangerous dep)
safeReplace(
  "node_modules/@studiocms/markdown-remark/dist/index.js",
  (content) =>
    content.replace(
      /import\s*{[^}]+}\s*from\s*["']@astrojs\/internal-helpers["'];?/g,
      ""
    )
);

// 3. Clean unused imports in studiocms handlers
const studiocmsDir =
  "node_modules/studiocms/frontend/pages/studiocms_api/_handlers";

if (fs.existsSync(studiocmsDir)) {
  for (const file of fs.readdirSync(studiocmsDir, { recursive: true })) {
    const full = path.join(studiocmsDir, file);
    if (full.endsWith(".ts")) {
      safeReplace(full, (content) =>
        content.replace(/import\s*{[^}]+}\s*from\s*["']effect["'];?/g, "")
      );
    }
  }
}

// 4. Keep StudioCMS dashboard content full-width after the sidebar width is applied.
safeReplace(
  "node_modules/studiocms/frontend/layouts/DashboardLayout.astro",
  (content) =>
    content.replace(
      "main.style.maxWidth = computedWidth > 840 ? `${computedWidth}px` : `100%`;",
      "main.style.width = computedWidth > 840 ? `${computedWidth}px` : `100%`;\n\t\t\t\tmain.style.maxWidth = computedWidth > 840 ? `${computedWidth}px` : `100%`;"
    )
);

console.warn("🎯 studiocms auto-patch done");
