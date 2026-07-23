"use client";

import PropTypes from "prop-types";
import { Home } from "../../views/home/Home";
import { ProtectedRoute } from "../../views/auth/ProtectedRoute";

export default function HomeLayout({ children }) {
  return (
    <ProtectedRoute>
      <Home>{children}</Home>
    </ProtectedRoute>
  );
}

HomeLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
