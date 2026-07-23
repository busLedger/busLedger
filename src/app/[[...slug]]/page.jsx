"use client";

import "@ant-design/v5-patch-for-react-19";
import dynamic from "next/dynamic";

const App = dynamic(() => import("../../App"), { ssr: false });

export default function AppPage() {
  return <App />;
}
