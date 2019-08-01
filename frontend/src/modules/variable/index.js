import React, { Component } from 'react';
import Widget from './Widget';
import HistoryModal from './HistoryModal';

class Variable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      name: props.name,
      value: props.value,
      suffix: props.suffix,
      prefix: props.prefix,
      color: props.color,
      lastUpdate: props.lastUpdate,
      openModal: false,
    };
  }

  componentDidMount() {
    this.props.core.subscribe(`variable/${this.state.id}`, this.onUpdate);
  }

  componentWillUnmount() {
    this.props.core.unsubscribe(`variable/${this.state.id}`, this.onUpdate);
  }

  onUpdate = (value) => this.setState({ value });

  handleClick = () => this.setState({
    openModal: true,
  });

  handleClose = () => this.setState({
    openModal: false,
  });

  render() {
    const { name, prefix, suffix } = this.state;

    return (
      <React.Fragment>
        <Widget color={this.state.color}
                lastUpdate={this.state.lastUpdate}
                onClick={this.handleClick}
                name={name}
                prefix={prefix}
                value={this.state.value}
                suffix={suffix}/>

        <HistoryModal open={this.state.openModal}
                      onClose={this.handleClose}
                      name={name}
                      suffix={suffix}
                      id={this.state.id}
                      core={this.props.core}/>
      </React.Fragment>
    );
  }
}

export default Variable;