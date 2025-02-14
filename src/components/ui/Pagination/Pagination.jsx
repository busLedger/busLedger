import { Pagination as AntPagination } from 'antd';
import './pagination.css';
import PropTypes from "prop-types";

export const Pagination = ({ 
  totalItems, 
  onPageChange, 
  currentPage, 
  pageSize 
}) => {
  const handleChange = (page) => {
    onPageChange(page, pageSize);
  };

  return (
    <div className="pagination-container">
      <AntPagination
        current={currentPage}
        pageSize={pageSize}
        total={totalItems}
        onChange={handleChange}
        showSizeChanger={false}
      />
    </div>
  );
};

Pagination.propTypes = {
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};