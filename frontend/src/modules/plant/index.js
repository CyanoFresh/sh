import React, { Component } from 'react';
import Widget from './Widget';
import Modal from './Modal';

class Plant extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      name: props.name,
      moisture: props.moisture,
      minMoisture: props.minMoisture,
      duration: props.duration,
      openModal: false,
    };
  }

  handleClick = () => this.setState({ openModal: true });

  handleModalClose = () => this.setState({ openModal: false });

  render() {
    return (
      <React.Fragment>
        <Widget
          onClick={this.handleClick}
          {...this.props}
        />

        <Modal
          open={this.state.openModal}
          onClose={this.handleModalClose}
          {...this.props}
        />
      </React.Fragment>
    );
  }
}

export default Plant;
