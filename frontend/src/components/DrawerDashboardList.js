import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import React, { useEffect, useState } from 'react';
import { Dashboard } from '@material-ui/icons';
import core from '../core';
import { Link } from 'react-router-dom';

export default () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboards, setDashboards] = useState([]);

  useEffect(() => {
    const loadDashboards = async () => {
      setLoading(true);

      try {
        const { data } = await core.authenticatedRequest({
          url: '/dashboards',
          method: 'get',
          responseType: 'json',
        });

        setLoading(false);

        if (!data.ok) {
          return setError('Cannot load dashboards');
        }

        return setDashboards(data.dashboards);
      } catch (e) {
        setLoading(false);
        setError('Cannot load dashboards');
      }
    };

    loadDashboards();
  }, []);

  if (loading) {
    return <List>Loading...</List>;
  }

  if (error) {
    return <List>{error}</List>;
  }

  return <List>
    {dashboards.map((dashboard, index) => (
      <ListItem button key={dashboard.id} component={Link} to={`/${dashboard.id}`}>
        <ListItemIcon><Dashboard/></ListItemIcon>
        <ListItemText primary={dashboard.name}/>
      </ListItem>
    ))}
  </List>;
};