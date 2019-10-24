import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class RequestForm extends Component {
  constructor () {
    super();
    this.state = {
      input_request: "",
      show_modal: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.focusInput = this.focusInput.bind(this);
  }

  handleChange(event) {
    this.setState({ input_request : event.target.value });
  }

  toggleModal() {
    console.log("toggleModal");
    this.setState(prevState => ({
      show_modal: !prevState.show_modal
    }));
  }

  resetForm() {
    console.log("resetForm");
    this.setState({
      show_modal: false,
      input_request: ""
    });
  }

  focusInput() {
    this.requestInput.focus();
  }

  handleSubmit(event) {
    console.log("handleSubmit");
    event.preventDefault();

    if (this.state.input_request !== "")
    {
      this.props.socket.emit('new_request', this.state.input_request, function (msg) {
        if (msg === 'no_id') {
          alert("You don't have an ID assigned yet.\nPlease refresh this page.");
        }
        else if (msg === 'active_request') {
          alert("You already have an active request...\nCancel it if you want a new one.");
        }
        else if (msg === 'request_limit') {
          alert("Request limit exceeded today...\nRelax and come back tomorrow!");
        }
        else {
          this.props.setActiveRequest(msg);
        }
      }.bind(this));
    }
    else {
      console.log("Invalid request");
    }
    this.resetForm();
  }

  render () {
    return (
      <div>
        <div className="text-center">
          <Button color="primary" size="lg" onClick={this.toggleModal}>New Request?</Button>
        </div>

        <Modal isOpen={this.state.show_modal} toggle={this.toggleModal} className={this.props.className} onOpened={this.focusInput} >
          <ModalHeader toggle={this.toggleModal}>New Request</ModalHeader>
          <form onSubmit={this.handleSubmit}>
            <ModalBody>
                <div id="request_box" className="form-group">
                  <label for="name">Request</label>
                  <textarea className="form-control" rows="5" cols="40" name="input_request" value={this.state.input_request} onChange={this.handleChange} ref={(input) => { this.requestInput = input; }}></textarea>
                </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">Submit</Button>{' '}
              <Button color="secondary" onClick={this.resetForm}>Cancel</Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    );
  }
}

export default RequestForm;
