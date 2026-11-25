import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = defineConfig([
  // ESLint 9 flat config hanya mencakup *.js secara default; tanpa ini
  // semua halaman/komponen .jsx dilewati diam-diam.
  { files: ["**/*.{js,jsx,mjs,cjs}"] },
  ...compat.extends("next/core-web-vitals"),
  {
    // Foto/logo berasal dari unggahan user (host Supabase, URL lama, preview
    // blob:/data:). next/image akan error untuk host yang tidak terdaftar,
    // jadi <img> dipertahankan dengan loading="lazy" + decoding="async".
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "app/generated/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
