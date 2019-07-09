import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Button } from 'reactstrap';


const chatBoxStyle = {
  height: "50vh",
  overflowY: "scroll",
  backgroundColor: "#FFFFFF"
};


class Chat extends Component {
  constructor () {
    super();
    this.state = {
      input_msg: "",
      chat_history: []
    }

    this.handleChange = this.handleChange.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addChatMsg = this.addChatMsg.bind(this);
  }

  componentDidMount() {
    console.log("Chat componentDidMount");
    this.props.socket.on("chat_msg", (msg) => {this.addChatMsg(msg)});
  }

  scrollToBottom() {
    if (this.list_end) {
      this.list_end.scrollIntoView({ behavior: "smooth" });
    }
  }

  addChatMsg(msg) {
    console.log("New chat msg:");

    // Add timestamp in local time
    var datetime_options = 
    {
      hour12: false,
      hour: "numeric",
      minute: "numeric"
    }
    // If not today, show also day and month
    if(new Date().setHours(0,0,0,0) != new Date(msg.time).setHours(0,0,0,0)) {
      datetime_options["weekday"] = "short";
      datetime_options["day"] = "numeric";
      datetime_options["month"] = "short";
    }

    msg.time = new Date(msg.time).toLocaleString("en-GB", datetime_options);

    var chat_history = this.state.chat_history;
    chat_history.push(msg);

    var need_scroll = (this.chat_box && this.chat_box.scrollTopMax == this.chat_box.scrollTop) ? true : false;

    this.setState({chat_history: chat_history});

    if (need_scroll) {
      this.scrollToBottom();
    }
  }

  handleChange(event) {
    this.setState({ input_msg: event.target.value });
  }

  handleSubmit(event) {
    console.log("handleSubmit");
    event.preventDefault();
    console.log(this.state.input_msg);
    if (this.state.input_msg !== "")
    {
      this.props.socket.emit("chat_msg", this.state.input_msg);
    }
    else {
      console.log("Empty msg");
    }
    this.setState({ input_msg: ""});
  }

  render () {
    return (
      <div>
        <h3 className="text-center">Chat</h3>
        <hr/>
          <div style={chatBoxStyle} className="border rounded mb-3 list-group list-unstyled" ref={(el) => { this.chat_box = el; }}>
          {
            this.state.chat_history.map((msg, index) => (
              <div key={index} className='list-group-item' ref={(el) => { this.list_end = el; }}>
                <div className={(msg.id == this.props.uuid) ? "text-right" : ""}><b>{ msg.id }</b></div>
                <div className={(msg.id == this.props.uuid) ? "text-right text-muted small" : "text-muted small"}>{ msg.time }</div>
                <div className={(msg.id == this.props.uuid) ? "text-right" : ""}>{ msg.data }</div>
              </div>
            ))
          }
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="d-flex">
              <div id="form_name" className="flex-grow-1">
                <input id="input_msg" className="form-control" type="text" name="input_msg" value={this.state.input_msg} onChange={this.handleChange} />
              </div>
              <div className="ml-1">
                <Button color="primary" type="submit">Send</Button>{' '}
              </div>
            </div>
          </form>
      </div>
    );
  }
}

export default Chat;
