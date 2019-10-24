import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class IDProvider extends Component {
  constructor () {
    super();

    this.state = {
      input_name: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ input_name: event.target.value });
  }

  handleSubmit(event) {
    console.log("handleSubmit");
    event.preventDefault();
    console.log(this.state.input_name);

    if (this.state.input_name !== "")
    {
      this.props.socket.emit('get_uuid', this.state.input_name, function (uuid) {
        if (uuid === -1) {
          alert("You already have a UUID...\nRestart the application if you want a new one.");
        }
        else {
          // alert("Your ID is " + uuid);
          this.props.setUUID(uuid);
        }
      }.bind(this));
    }
    else {
      console.log("Empty name");
      // TODO: Show error to user
    }
  }

  componentDidMount() {
    this.nameInput.focus();
  }

  render () {
    return (
      <div>
        <Modal isOpen={true} backdrop='static' >
          <ModalHeader toggle={this.toggleModal}>Welcome to Fran-Line</ModalHeader>
          <form onSubmit={this.handleSubmit}>
            <ModalBody>
              <div id="form_name" className="form-group">
                <label for="name">Name</label>
                <input id="input_name" ref={(input) => { this.nameInput = input; }} className="form-control" type="text" size="30" name="input_name" value={this.state.input_name} onChange={this.handleChange} />
                <small id="nameHelp" className="form-text text-muted">Worry not, your identity shall remain anonymous.</small>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">Start</Button>{' '}
            </ModalFooter>
          </form>
        </Modal>
      </div>
    );
  }
}

export default IDProvider;
