import React, { Component } from 'react';
import { ChromePicker } from 'react-color';
import { MODE } from './constants';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';
import DialogActions from '@material-ui/core/DialogActions';
import withStyles from '@material-ui/core/styles/withStyles';

const classes = theme => ({
  dialogContent: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit / 2}px`,
  },
});

class RGBDialog extends Component {
  state = {
    speed: 100,
    brightness: 100,
    selectedTab: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedTab: props.mode,
      speed: props.speed || 100,
      brightness: props.brightness || 100,
    };
  }

  handleTabChange = (event, value) => {
    this.handleTabIndexChange(value);
  };

  handleTabIndexChange = (index) => {
    this.setState({
      selectedTab: index,
    });
  };

  handleRainbow = () => {
    this.props.update(this.props.id, {
      mode: MODE.RAINBOW,
      brightness: this.state.brightness,
      speed: this.state.speed,
    });
  };

  render() {
    const { fullScreen, update, red, green, blue, id, name, open, onClose, classes } = this.props;
    const { selectedTab, brightness, speed } = this.state;

    return (
      <Dialog open={open} fullScreen={fullScreen} fullWidth={true} maxWidth={'sm'} onClose={onClose}
              aria-labelledby="simple-dialog-title">
        <DialogTitle id="simple-dialog-title">{name}</DialogTitle>
        <DialogContent>
          <Tabs value={selectedTab}
                onChange={this.handleTabChange}
                variant="fullWidth">
            <Tab label="Static Color"/>
            <Tab label="Rainbow"/>
          </Tabs>

          <SwipeableViews
            index={selectedTab}
            onChangeIndex={this.handleTabIndexChange}>
            <div className={classes.dialogContent}>
              <ChromePicker
                color={{
                  r: red,
                  g: green,
                  b: blue,
                }}
                disableAlpha={true}
                onChangeComplete={({ rgb }) => {
                  update(id, {
                    mode: MODE.COLOR,
                    red: rgb.r,
                    green: rgb.g,
                    blue: rgb.b,
                  });
                }}
              />
            </div>
            <div className={classes.dialogContent}>
              <FormControl margin="normal" fullWidth>
                <InputLabel htmlFor="demo-controlled-open-select">Brightness</InputLabel>
                <Select
                  value={brightness || 100}
                  onChange={(event) => this.setState({
                    brightness: event.target.value,
                  })}
                  inputProps={{
                    name: 'brightness',
                    id: 'demo-controlled-open-select',
                  }}
                  autoWidth
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={70}>70</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <InputLabel htmlFor="demo-controlled-speed-select">Speed</InputLabel>
                <Select
                  value={speed || 100}
                  onChange={(event) => this.setState({
                    speed: event.target.value,
                  })}
                  inputProps={{
                    name: 'speed',
                    id: 'demo-controlled-speed-select',
                  }}
                  autoWidth
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                  <MenuItem value={300}>300</MenuItem>
                </Select>
              </FormControl>
              <FormControl margin="normal" fullWidth>
                <Button onClick={this.handleRainbow} color="primary" variant="contained">
                  Apply
                </Button>
              </FormControl>
            </div>
          </SwipeableViews>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(classes)(withMobileDialog()(RGBDialog));