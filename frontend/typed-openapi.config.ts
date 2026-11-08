import { defineConfig } from "typed-openapi";

export default defineConfig({
  input: "../contracts/openapi.yaml",
  output: "src/api/generated/api.ts",
  runtime: "zod",
  validation: "strict",
  client: "promise",
  defaultFetcher: true,
  runtimeTypes: true,
});
