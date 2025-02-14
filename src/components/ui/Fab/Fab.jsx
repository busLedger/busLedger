import PropTypes from 'prop-types';
import { PlusOutlined } from '@ant-design/icons';
import './fab.css';

export const Fab = ({ onClick }) => {
  return (
    <button className="fab" onClick={onClick}>
      <PlusOutlined  className="fab-icon"/>
    </button>
  );
};

Fab.propTypes = {
  onClick: PropTypes.func.isRequired,
};