import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import core from '../../../core';
import useFetch from '../../../core/useFetch';
import Loading from '../Loading';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router-dom';
import FormControl from '@material-ui/core/FormControl';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(3),
  },
}));

const defaultUser = {
  user_id: '',
  name: '',
  room_id: '',
  password: '',
  api_key: '',
  last_login_at: 0,
};

export default ({ match }) => {
  const classes = useStyles();
  const { userId } = match.params;
  const [{ data, isLoading, error }] = useFetch(
    {
      url: `/users/${userId}`,
      method: 'GET',
      responseType: 'json',
    },
    {
      user: defaultUser,
    },
  );
  const [values, setValues] = useState(defaultUser);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setValues(values => ({
      ...values,
      ...data.user,
    }));
  }, [data.user]);

  const handleChange = event => setValues({
    ...values,
    [event.target.name]: event.target.value,
  });

  const handleDelete = async () => {
    try {
      const { data } = await core.authenticatedRequest({
        url: `/users/${userId}`,
        method: 'DELETE',
      });

      setIsSuccess(data.ok);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();

    try {
      const { data } = await core.authenticatedRequest({
        url: `/users/${userId}`,
        method: 'PUT',
        data: values,
      });

      setIsSuccess(data.ok);
    } catch (e) {
      console.error(e);
    }
  };

  if (isSuccess) {
    return <Redirect to="/users"/>;
  }

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

  return (
    <Grid item md={6}>
      <Paper className={classes.paper}>
        <Typography variant="h5" component="h3">
          Edit {data.user.name || data.user.user_id}
        </Typography>

        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            name="user_id"
            label="User ID"
            value={values.user_id}
            margin="normal"
            variant="filled"
            InputProps={{
              readOnly: true,
            }}
            fullWidth
          />
          <TextField
            required
            name="name"
            label="Name"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            margin="normal"
            variant="filled"
            fullWidth
          />
          <TextField
            name="password"
            label="New Password"
            value={values.password}
            onChange={handleChange}
            margin="normal"
            variant="filled"
            type="password"
            autoComplete="new-password"
            fullWidth
          />
          <TextField
            name="api_key"
            label="API Key"
            value={values.api_key}
            onChange={handleChange}
            margin="normal"
            variant="filled"
            fullWidth
          />
          <TextField
            name="room_id"
            label="Room ID"
            value={values.room_id}
            onChange={handleChange}
            margin="normal"
            variant="filled"
            fullWidth
          />
          <TextField
            label="Last Login"
            value={new Date(values.last_login_at * 1000).toLocaleString()}
            margin="normal"
            variant="filled"
            InputProps={{
              readOnly: true,
            }}
            fullWidth
          />
          <FormControl margin="normal">
            <Button type="submit" color="primary" variant="contained">Save</Button>
            <Button onClick={handleDelete} color="danger" variant="contained">Delete</Button>
          </FormControl>
        </form>
      </Paper>
    </Grid>
  );
}
;
