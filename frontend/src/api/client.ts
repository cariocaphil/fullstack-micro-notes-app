import { createApiClient, type Fetcher } from "./generated/api";
import { defaultFetcher } from "./generated/api.client";

/**
 * Placeholder origin used only so ApiClient can construct URL objects.
 * The relative fetcher strips it and calls fetch() with `/api/...` paths
 * so the Vite dev proxy can forward to Spring Boot.
 */
const URL_PARSE_ORIGIN = "http://typed-openapi.relative";

const relativeFetcher: Fetcher = {
  fetch: async (input) => {
    const relativeUrl = `${input.url.pathname}${input.url.search}`;
    // defaultFetcher forwards `url` to fetch(); a relative string keeps the Vite proxy working.
    return defaultFetcher({
      ...input,
      url: relativeUrl as unknown as URL,
    });
  },
};

/** Typed Notes API client that issues relative `/api` requests. */
export const notesApi = createApiClient(relativeFetcher, URL_PARSE_ORIGIN);
