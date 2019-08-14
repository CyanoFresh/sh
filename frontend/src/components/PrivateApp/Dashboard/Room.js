import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import core from '../../../core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2, 3),
    borderRadius: theme.shape.borderRadius * 4,
  },
  title: {
    marginBottom: theme.spacing(),
  },
  itemGroup: {
    marginBottom: theme.spacing(),
  }
}));

const Item = ({ id, module, ...rest }) => {
  const Module = core.modules[module];

  return <Module.default key={id} core={core} {...Module.config} id={id} {...rest}/>;
};

const ItemGroup = ({ items }) => {
  const classes = useStyles();

  return (
    <Grid container spacing={1} className={classes.itemGroup}>
      {items.map(item => <Item key={item.id} {...item}/>)}
    </Grid>
  );
};

const Room = ({name, items: itemGroups }) => {
  const classes = useStyles();

  return (
    <Grid item lg={6}>
      <Paper className={classes.root} elevation={2}>
        <Typography variant="h5" component="h3" className={classes.title}>
          {name}
        </Typography>

        {itemGroups.map((itemGroup, index) => <ItemGroup key={index} items={itemGroup}/>)}
      </Paper>
    </Grid>
  );
};

export default Room;
