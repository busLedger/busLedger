"use client";

import PropTypes from "prop-types";
import { SWRConfig } from "swr";

export function SWRProvider({ children }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 30_000,
        errorRetryCount: 2,
        onErrorRetry: (error, _key, config, revalidate, { retryCount }) => {
          if ([401, 403].includes(error.status)) return;
          if (retryCount >= config.errorRetryCount) return;

          setTimeout(
            () => revalidate({ retryCount }),
            config.errorRetryInterval ?? 5_000
          );
        },
        onError: (error) => {
          if ([401, 403].includes(error.status)) return;
          console.error("SWR Error:", error.message);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}

SWRProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
