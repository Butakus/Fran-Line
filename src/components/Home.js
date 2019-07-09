import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import IDProvider from "./IDProvider";
import RequestForm from "./RequestForm";
import WaitingList from "./WaitingList";
import Chat from "./Chat";

class Home extends Component {
  constructor () {
    super();
    this.state = {
      user_id: "",
      active_request: {}
    }

    // this.socket = socketIOClient("http://localhost:80");
    this.socket = socketIOClient("http://163.117.150.92:80");
    // this.socket = socketIOClient("http://192.168.1.100:80");

    this.setUUID = this.setUUID.bind(this);
    this.setActiveRequest = this.setActiveRequest.bind(this);
  }

  setUUID (uuid) {
    console.log("Home setUUID: " + uuid);
    this.setState( {user_id: uuid} );
  }

  setActiveRequest (req) {
    console.log("Home setActiveRequest: " + req);
    this.setState( {active_request: req} );
  }

  render () {
    return (
      <div>
        {
        (this.state.user_id === "") ? (
          <IDProvider socket={this.socket} setUUID={this.setUUID} />
        ) : (
          <div>
            <div className="row mt-5 mb-5">
              <div id="form_div" className="col">
                <RequestForm socket={this.socket} uuid={this.state.user_id} setActiveRequest={this.setActiveRequest} />
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
