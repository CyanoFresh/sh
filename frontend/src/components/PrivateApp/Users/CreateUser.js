import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import core from '../../../core';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router-dom';
import FormControl from '@material-ui/core/FormControl';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(3),
  },
}));

export default ({ match }) => {
  const classes = useStyles();
  const [values, setValues] = useState({
    user_id: '',
    name: '',
    password: '',
    api_key: '',
    room_id: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = event => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async event => {
    event.preventDefault();

    try {
      const { data } = await core.authenticatedRequest({
        url: '/users',
        method: 'POST',
        responseType: 'json',
        data: values,
      });

      setIsSuccess(data.ok);
    } catch (e) {
      console.log(e);
    }
  };

  if (isSuccess) {
    return <Redirect to="/users"/>;
  }

  return (
    <Grid item md={6}>
      <Paper className={classes.paper}>
        <Typography variant="h5" component="h3">
          Create User
        </Typography>

        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            required
            name="user_id"
            label="User ID"
            value={values.user_id}
            onChange={handleChange}
            margin="normal"
            variant="filled"
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
            required
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
          <FormControl margin="normal">
            <Button type="submit" color="primary" variant="contained">Create</Button>
          </FormControl>
        </form>
      </Paper>
    </Grid>
  );
}
;
