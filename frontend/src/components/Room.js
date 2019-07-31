import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import core from '../core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadius * 4,
  },
}));

const Item = ({ id, module, ...rest }) => {
  const Module = core.modules[module];

  return <Module.default key={id} core={core} {...Module.config} {...rest}/>;
};

const ItemGroup = ({ items }) => (
  <Grid container spacing={1}>
    {items.map(item => <Item key={item.id} {...item}/>)}
  </Grid>
);

const Room = ({ id, name, items: itemGroups }) => {
  const classes = useStyles();

  return (
    <Grid item lg={6}>
      <Paper className={classes.root} elevation={2}>
        <Typography variant="h5" component="h3">
          {name}
        </Typography>

        {itemGroups.map((itemGroup, index) => <ItemGroup key={index} items={itemGroup}/>)}
      </Paper>
    </Grid>
  );
};

export default Room;