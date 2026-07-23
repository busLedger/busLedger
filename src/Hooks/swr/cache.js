import { mutate } from "swr";

const revalidatePrefix = (prefix) =>
  mutate((key) => typeof key === "string" && key.startsWith(prefix));

export { revalidatePrefix };
