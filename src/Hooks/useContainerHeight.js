import { useEffect, useRef } from "react";

export const useContainerHeight = (variableName = "--container-movil-height", offset = 30) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.offsetHeight - offset;
        document.documentElement.style.setProperty(variableName, `${containerHeight}px`);
      }
    };

    updateContainerHeight();
    window.addEventListener("resize", updateContainerHeight);

    return () => {
      window.removeEventListener("resize", updateContainerHeight);
    };
  }, [variableName, offset]);

  return containerRef;
};
