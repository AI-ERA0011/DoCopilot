import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
update 2024-08-07 11:40:22
update 2024-08-14 11:22:52
update 2024-08-15 11:7:14
update 2024-08-19 11:1:59
update 2024-08-27 11:29:2
update 2024-09-17 10:6:9
update 2024-10-01 17:37:22
update 2024-10-03 13:58:19
update 2024-10-10 9:35:8
update 2024-10-14 10:39:57
// update 2024-09-13 11:14:46
// update 2024-09-30 13:15:54
// update 2024-10-09 12:0:6
// update 2024-10-10 12:49:13
// update 2024-09-06 9:49:5
// update 2024-08-19 17:13:30
// update 2024-10-28 13:37:49
// update 2024-10-31 12:18:41
