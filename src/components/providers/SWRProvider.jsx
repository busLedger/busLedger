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
        onError: (error) => {
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
