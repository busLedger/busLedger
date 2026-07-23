"use client";

import PropTypes from "prop-types";
import { createContext, useContext } from "react";

const HomeContext = createContext(null);

export function HomeProvider({ children, value }) {
  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome debe usarse dentro de HomeProvider");
  }
  return context;
}

HomeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.shape({
    darkMode: PropTypes.bool.isRequired,
    userData: PropTypes.object,
  }).isRequired,
};
