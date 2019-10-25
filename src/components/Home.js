import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import IDProvider from "./IDProvider";
import RequestForm from "./RequestForm";
import WaitingList from "./WaitingList";
import Chat from "./Chat";

class Home extends Component {
  constructor () {
    super();
    this.state = {
      user_id: "",
      user_kicked: false,
      show_id_modal: false,
      active_request: null,
      response_msg: ""
    }

    // this.socket = socketIOClient("http://localhost:80");
    this.socket = socketIOClient("http://163.117.150.92:80");
    // this.socket = socketIOClient("http://192.168.1.100:80");

    this.socket.on("request_accepted", (msg) => {this.handleRequestAccepted(msg)});
    this.socket.on("request_delayed", (msg) => {this.handleRequestDelayed(msg)});
    this.socket.on("request_rejected", (msg) => {this.handleRequestRejected(msg)});
    this.socket.on("request_finished", (msg) => {this.handleRequestFinished(msg)});
    this.socket.on("kick", (msg) => {this.handleKick(msg)});

    this.setUUID = this.setUUID.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setActiveRequest = this.setActiveRequest.bind(this);
    this.updateActiveRequest = this.updateActiveRequest.bind(this);
    this.handleRequestAccepted = this.handleRequestAccepted.bind(this);
    this.handleRequestDelayed = this.handleRequestDelayed.bind(this);
    this.handleRequestRejected = this.handleRequestRejected.bind(this);
    this.handleRequestFinished = this.handleRequestFinished.bind(this);
    this.handleKick = this.handleKick.bind(this);
    this.cancelRequest = this.cancelRequest.bind(this);
    this.renderRequest = this.renderRequest.bind(this);
  }

  setUUID (uuid) {
    console.log("Home setUUID: " + uuid);
    this.setState( {user_id: uuid, show_id_modal: true} );
  }

  updateActiveRequest(status, response) {
    var req = this.state.active_request;
    req.status = status;
    var res = response ? response : this.state.response_msg;
    this.setState( {active_request: req, response_msg: res} );
  }

  handleRequestAccepted(msg) {
    this.updateActiveRequest("Accepted", msg);
  }

  handleRequestDelayed(msg) {
    this.updateActiveRequest("Delayed", msg);
  }

  handleRequestRejected(msg) {
    this.updateActiveRequest("Rejected", msg);
  }

  handleRequestFinished(msg) {
    this.setState({active_request: null});
  }

  handleKick(msg) {
    this.setState({user_kicked: true, response_msg: msg});
  }

  closeModal() {
    this.setState({show_id_modal: false});
  }

  setActiveRequest (req) {
    console.log("Home setActiveRequest: " + req);
    this.setState( {active_request: req} );
  }

  cancelRequest() {
    var req_msg = {};
    this.socket.emit("cancel_request", function (msg) {
      if (msg === 'no_id') {
        alert("You don't have an ID assigned yet.\nPlease refresh this page.");
      }
      else if (msg === 'no_request') {
        alert("You don't have any active request yet yet.");
      }
    });
    this.setState({active_request: null});
  }

  /* renderRequest
    if kicked out:
      show kicked out message.
    else:
      if not active_request:
        show request form button.
      else:
        show request info.


    request info: {
      "Your request is {resuest.state}",
      Quick solution (automatic response lmgtfy),
      Message from the other side:
      {message}
      [cancel request button]
    }
  */
  renderRequest() {
    if (this.state.user_kicked) {
      var kicked_msg = (
        <div className="text-center">
          <h2 style={{ color: 'red' }}>You have been kicked out!</h2>
          {
            (this.state.response_msg === "") ? null : (
              <div className="text-center mt-4">
                <div><p>Wondering why?</p></div>
                <div><h4>{this.state.response_msg}</h4></div>
              </div>
            )
          }
        </div>
      );
      return kicked_msg;
    }
    else {
      if (this.state.active_request !== null) {
        var quick_link = "https://lmgtfy.com/?q=" + this.state.active_request.data + "&s=g&iie=1";
        var request_info = (
        <div>
          <div className="d-flex justify-content-center text-center">
            <h4>Your request is {this.state.active_request.status}</h4>
          </div>
          <div className="d-flex justify-content-center text-center">
            <h4><a target="_blank" rel="noopener noreferrer" href={quick_link}>Quick solution</a> (Automatic response)</h4>
          </div>
          {
            (this.state.response_msg === "") ? null : (
              <div className="text-center mt-4">
                <div><p>Message from the other side:</p></div>
                <div><h4>{this.state.response_msg}</h4></div>
              </div>
            )
          }
          <div className="text-center mt-3">
            <Button color="danger" size="lg" onClick={this.cancelRequest}>Cancel Request</Button>
          </div>
        </div>
        );
        return request_info;
      }
      else
      {
        var request_form = (<RequestForm socket={this.socket} uuid={this.state.user_id} setActiveRequest={this.setActiveRequest} />);
        return request_form;
      }
    }
  }

  render () {
    var request = this.renderRequest();

    return (
      <div>
        <div>
          <Modal isOpen={this.state.show_id_modal} backdrop="static">
            <ModalHeader>Welcome to Fran-Line</ModalHeader>
              <ModalBody>
                <div id="form_name" className="form-group">
                  <h3>Your ID is: {this.state.user_id}</h3>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" type="submit" onClick={this.closeModal}>Ok</Button>{' '}
              </ModalFooter>
          </Modal>
        </div>
        {
        (this.state.user_id === "") ? (
          <IDProvider socket={this.socket} setUUID={this.setUUID} />
        ) : (
          <div>
            <div className="row mt-5 mb-5">
              <div id="request_div" className="col">
                <div className="text-center">
                  <div className="mb-1"><h3>Hello there</h3></div>
                  <div className="mb-5"><h3>{this.state.user_id}</h3></div>
                </div>
                <div>
                  {request}
                </div>
              </div>
            </div>
            <div className="row">
              <div id="results_div" className="col-md-6 mb-5">
                <WaitingList uuid={this.state.user_id} />
              </div>
              <div id="chat_div" className="col-md-6">
                <Chat socket={this.socket} uuid={this.state.user_id} />
              </div>
            </div>
          </div>
        )
      }
    </div>
    );
  }
}

export default Home;
