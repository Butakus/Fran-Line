import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Button } from 'reactstrap';

class Monitor extends Component {
  constructor () {
    super();
    this.state = {
      clients: {},
      socket_connected: false
    }

    this.updateAllClients = this.updateAllClients.bind(this);
    this.updateClient = this.updateClient.bind(this);
    this.kickUser = this.kickUser.bind(this);

    this.socket = socketIOClient("http://localhost:5555");
    // this.socket = socketIOClient("http://163.117.150.92:5555");
    this.socket.on("connect", () => {this.setState({socket_connected: true})});
    this.socket.on("clients", (data) => {this.updateAllClients(data)});
    this.socket.on("update_client", (client) => {this.updateClient(client)});
  }

  sendCMD(client_addr, action) {
    var cmd = {}
    cmd.client_addr = client_addr;
    cmd.action = action;
    this.socket.emit("request_cmd", cmd);
  };
  
  kickUser(client_addr) {
    // TODO
  };

  updateAllClients(data) {
    this.setState({clients: data});
  }

  updateClient(client) {
    var clients = this.state.clients;
    clients[client.address] = client;
    this.setState({clients: clients});
  }

  render () {
    if (!this.state.socket_connected) {
      return (
        <div>
          <h2>You do not have enough power to wield this weapon!</h2>
        </div>
      );
    }
    return (
      <div>
        <h2>Fran-Line Monitor</h2>
        <hr/>
        <div id="clients" className="container-fluid">
        {
          Object.keys(this.state.clients).map((client_addr, index) => (
            <div key={index}>
              <div className='row'>
                <div className='col-3'><b>ID:</b> {this.state.clients[client_addr].uuid}</div>
                <div className='col-3'><b>Name:</b> {this.state.clients[client_addr].name}</div>
                <div className='col-2'>
                  <Button color="danger" onClick={(e) => this.kickUser(client_addr)}>Kick Out</Button>
                </div>
              </div>
              <div className='row mt-1'>
                <div className='col-3'><b>Address:</b> {client_addr}</div>
                <div className='col-3'><b>Requests today:</b> {this.state.clients[client_addr].num_requests}</div>
              </div>
              {
              (this.state.clients[client_addr].active_request === null) ? (
                <div className='row mt-2'>
                  <div className='col-4'><b>Request:</b> None</div>
                </div>
              ) : (
                <div>
                  <div className='row mt-2'>
                    <div className='col-3'><b>Request:</b> {this.state.clients[client_addr].active_request.id}</div>
                    <div className='col-3'><b>Time:</b> {new Date(this.state.clients[client_addr].active_request.time).toLocaleString("en-GB", {hour12: false})}</div>
                    <div className='col-2'><b>Status:</b> {this.state.clients[client_addr].active_request.status}</div>
                  </div>
                  <div className='row mt-2'>
                    <div className='col-12'>
                      <Button color='success' className='mr-2' onClick={(e) => this.sendCMD(client_addr, "accept")}>Accept</Button>
                      <Button color='warning' className='mr-2' onClick={(e) => this.sendCMD(client_addr, "delay")}>Delay</Button>
                      <Button color='danger' className='mr-2' onClick={(e) => this.sendCMD(client_addr, "reject")}>Reject</Button>
                      <Button color='primary' onClick={(e) => this.sendCMD(client_addr, "finish")}>Finish</Button>
                    </div>
                  </div>
                  <div className='row mt-2'>
                    <div className='col-4'><b>Message:</b></div>
                  </div>
                  <div className='row mt-2'>
                    <div className='col-12' style={{WhiteSpace: "pre-line"}}>{this.state.clients[client_addr].active_request.data}</div>
                  </div>
                </div>
              )
              }
              <hr />
            </div>
          ))
        }
        </div>
      </div>
    );
  }
}

export default Monitor;
