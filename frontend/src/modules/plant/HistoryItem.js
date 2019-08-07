import React from 'react';
import DropIcon from '@material-ui/icons/Opacity';
import SettingsIcon from '@material-ui/icons/Settings';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import { HISTORY_TYPES } from './constants';

const HistoryItem = ({ name, data }) => {
  let text = 'Unknown type';
  let icon;

  const { data: itemData, date } = data;
  const { type, oldMoisture, oldDuration, newMoisture, newDuration } = itemData;

  if (type === HISTORY_TYPES.WATERED) {
    text = `${name} was watered`;
    icon = <DropIcon/>;
  } else if (type === HISTORY_TYPES.SETTINGS_CHANGED) {
    text = 'Settings changed: ';

    if (oldMoisture) {
      text += `${oldMoisture}% → ${newMoisture}%    `;
    }

    if (oldDuration) {
      text += `${oldDuration} sec. → ${newDuration} sec.`;
    }

    icon = <SettingsIcon/>;
  }

  return (
    <ListItem>
      <Avatar>
        {icon}
      </Avatar>

      <ListItemText primary={text} secondary={new Date(date * 1000).toLocaleString()}/>
    </ListItem>
  );
};

export default HistoryItem;
