import React, { useState } from 'react';
import Widget from './Widget';
import HistoryModal from './HistoryModal';

const Variable = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <React.Fragment>
      <Widget onClick={() => setIsOpen(true)} {...props}/>

      <HistoryModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        {...props}
      />
    </React.Fragment>
  );
};

export default Variable;
