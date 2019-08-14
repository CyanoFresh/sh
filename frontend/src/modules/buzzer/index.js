import React, { useState } from 'react';
import Widget from './Widget';
import HistoryModal from './HistoryModal';
import Notification from './Notification';

export default (props) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <React.Fragment>

      <Widget {...props} onClick={() => setOpenModal(true)}/>

      <HistoryModal open={openModal} onClose={() => setOpenModal(false)} {...props}/>

      <Notification  {...props}/>

    </React.Fragment>
  );
};
