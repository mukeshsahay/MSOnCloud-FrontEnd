import React, { Component } from 'react';
import HttpsRedirect from 'react-https-redirect';
import './App.css';
import {BrowserRouter, Route, Switch} from "react-router-dom"
import Welcome from "./Components/Welcome";
import UserLogin from "./Components/userlogin";
import UserSignup from "./Components/usersignup";
import AdminUserDetails from "./Components/AdminUserDetails";
import UserDetails from "./Components/userDetails";
import Error from "./Components/Error";
class App extends Component {
  render() {
    return (
      <HttpsRedirect>
      <div className="App">
        <label className="appName">MS On Cloud</label>
        <BrowserRouter>
          <Switch>
            <Route path="/" component={Welcome} exact/>
            <Route path="/login" component={UserLogin}/>
            <Route path="/signup" component={UserSignup}/>
            <Route path="/admin" component={AdminUserDetails}/>
            <Route path="/userdetail" component={UserDetails}/>
            <Route component={Error}/>
          </Switch>
        </BrowserRouter>      
      </div>
      </HttpsRedirect>
    );
  }
}

export default App;
