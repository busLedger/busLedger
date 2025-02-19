import { useState, useEffect } from "react";

export const useResponsivePagination = (defaultPageSize = 3) => {
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginated, setIsPaginated] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsPaginated(false);
      } else {
        setIsPaginated(true);
        setPageSize(window.innerWidth < 1024 ? 2 : defaultPageSize);
      }
      setCurrentPage(1);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); 

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [defaultPageSize]);

  return { pageSize, currentPage, setCurrentPage, isPaginated };
};
