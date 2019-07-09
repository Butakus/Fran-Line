import React, { Component } from "react";
import socketIOClient from "socket.io-client";

class WaitingList extends Component {
  constructor () {
    super();
    this.state = {active_requests: []}
    this.socket = null;
  }

  componentDidMount() {
    // this.socket = socketIOClient("http://localhost:80/requests");
    // this.socket = socketIOClient("http://192.168.1.100:80/requests");
    this.socket = socketIOClient("http://163.117.150.92:80/requests");
    this.socket.on("active_requests", new_active_requests => this.setState({ active_requests: new_active_requests }));
  }

  render () {
    var accepted_requests = [];
    var delayed_requests = [];
    var rejected_requests = [];
    var pending_requests = [];

    for (var i = 0; i < this.state.active_requests.length; i++) {
        switch (this.state.active_requests[i].status) {
            case "Processing":
                accepted_requests.push(this.state.active_requests[i]);
                break;
            case "Delayed":
                delayed_requests.push(this.state.active_requests[i]);
                break;
            case "Rejected":
                rejected_requests.push(this.state.active_requests[i]);
                break;
            default:
                pending_requests.push(this.state.active_requests[i]);
                break;
        }
    }

    return (
      <div>
        <h3 className="text-center">Waiting List</h3>
        <hr/>
        <div id="active_requests" className="list-group list-unstyled">
        {
          accepted_requests.map((request, index) => (
            <div key={index} class='list-group-item d-flex justify-content-between list-group-item-success'>
              <div> { request.uuid } </div>
              <div> { request.status } </div>
            </div>
          ))
        }
        {
          pending_requests.map((request, index) => (
            <div key={index} class='list-group-item d-flex justify-content-between'>
              <div> { request.uuid } </div>
              <div> { request.status } </div>
            </div>
          ))
        }
        {
          delayed_requests.map((request, index) => (
            <div key={index} class='list-group-item d-flex justify-content-between list-group-item-warning'>
              <div> { request.uuid } </div>
              <div> { request.status } </div>
            </div>
          ))
        }
        {
          rejected_requests.map((request, index) => (
            <div key={index} class='list-group-item d-flex justify-content-between list-group-item-danger'>
              <div> { request.uuid } </div>
              <div> { request.status } </div>
            </div>
          ))
        }
        </div>
      </div>
    );
  }
}

export default WaitingList;
