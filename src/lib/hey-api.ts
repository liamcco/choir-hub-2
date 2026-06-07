import type { CreateClientConfig } from "@/lib/api-client/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  cache: "no-store",
  credentials: "include",
});
