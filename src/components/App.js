import React, { Component } from "react";
import {
  BrowserRouter as Router, Route
} from 'react-router-dom';
import ReactDOM from "react-dom";
import Home from "./Home";
import Monitor from "./Monitor";

class App extends Component {
  render () {
    return (
      <Router>
        <div id="main_container" className="container-fluid main-container mt-5 pl-5 pr-5">
          <Route exact path="/" component={Home}/>
          <Route path="/monitor" component={Monitor}/>
        </div>
      </Router>
    );
  }
}

export default App;
