import React from 'react';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import useFetch from '../../../core/useFetch';
import Loading from '../Loading';

export default ({ match }) => {
  console.log(match.params);

  const [{ data, isLoading, error }] = useFetch(
    {
      url: `/users/${match.params.userId}`,
      method: 'GET',
      responseType: 'json',
    },
    [],
  );

  if (isLoading) {
    return <Loading/>;
  }

  if (error) {
    return (
      <Box bgcolor="error.main" color="background.paper" p={2}>
        {error}
      </Box>
    );
  }

  console.log(data);

  return (
    <List>
      {data.user.user_id}
    </List>
  );
};
