import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import { Button, FormGroup, FormControl, ControlLabel, Alert } from "react-bootstrap";
import "./Login.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'font-awesome/css/font-awesome.css';
import config from '../config';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.saveDataAndRedirectAfterLogin = this.saveDataAndRedirectAfterLogin.bind(this);

    this.state = {
      email: "",
      password: ""
    };
  }

  googleResponse = (e) => {};

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    if(!this.state.email || !this.state.password){
      return;
    }

    this.handleAPI();
  }
  
  handleAPI() {
    const data = {
      "emailId": this.state.email,
      "password": this.state.password 
    }
    
    fetch(config.userAPI + "signin",{
        method:"POST",
        mode:"cors",
        headers: {
          'Accept':'application/json',
          'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(this._checkStatus)
    .then(this.processResponse)
    .then(res => {
      const { statusCode, data } = res;
      console.log("statusCode",statusCode);
      if (statusCode === 200) {
      console.log("data",data);
      this.saveDataAndRedirectAfterLogin(data.emailId, data.firstName, data.lastName, data.role);
      return data;
      } else {
        alert("Invalid Email/Password.");
        return { name: "Invalid Email/Password.", description: "Invalid Email/Password." };
      }
    })
    .catch(error => {
    console.error(error);
    return { name: "network error", description: "" };
    });
  }

  processResponse(response) {
    const statusCode = response.status;
    const data = response.json();
    return Promise.all([statusCode, data]).then(res => ({
      statusCode: res[0],
      data: res[1]
    }));
  }

  saveDataAndRedirectAfterLogin(emailId, firstName, lastName, role) {
      localStorage.setItem('token', emailId);
      localStorage.setItem('firstName', firstName);
      localStorage.setItem('lastName', lastName);
      localStorage.setItem('userRole', role);
      this.props.history.push('/userdetail');
  }

  componentDidMount(){
    (function() {
        var e = document.createElement("script");
        e.type = "text/javascript";
        e.async = true;
        e.src = "https://apis.google.com/js/client:platform.js?onload=gPOnLoad";
        var t = document.getElementsByTagName("script")[0];
        t.parentNode.insertBefore(e, t)
    })();
    
    // Load the required SDK asynchronously for facebook, google and linkedin
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  
  window.fbAsyncInit = function() {
      window.FB.init({
        appId      : config.facebook,
        cookie     : true,  // enable cookies to allow the server to access the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.8' // use version 2.1
      });
  };
}

//Triggering login for google
googleLogin = () => {
    let response = null;
    window.gapi.auth.signIn({
        callback: function(authResponse) {
            this.googleSignInCallback( authResponse )
        }.bind( this ),
        clientid: config.google, //Google client Id
        cookiepolicy: "single_host_origin",
        requestvisibleactions: "http://schema.org/AddAction",
        scope: "https://www.googleapis.com/auth/plus.login email profile"
    });
}

googleSignInCallback = (e) => {
    console.log( e )
    if (e["status"]["signed_in"]) {
        window.gapi.client.load("plus", "v1", function() {
            if (e["access_token"]) {
                this.getUserGoogleProfile( e["access_token"] )
                console.log("google logged in");
                console.log("Google Token", e["access_token"]);
            } else if (e["error"]) {
                console.log('Import error', 'Error occured while importing data')
            }
        }.bind(this));
    } else {
        console.log('Oops... Error occured while importing data')
    }
}

getUserGoogleProfile = accesstoken => {
    var e = window.gapi.client.plus.people.get({
        userId: "me"
    });
    e.execute(function(e) {
        if (e.error) {
            console.log(e.message);
            console.log('Import error - Error occured while importing data')
            return
        
        } else if (e.id) {
            //Profile data
            //alert("Successfull login from google : "+ e.displayName )
            this.saveDataAndRedirectAfterLogin(e.emails[0].value, e.name.givenName, e.name.familyName, "0");
            console.log( e );
            return;
        }
    }.bind(this));
}

facebookLogin = () => {
  
  window.FB.login(
      function(resp){
          this.statusChangeCallback(resp);
      }.bind(this),{ scope : 'email,user_work_history,user_education_history,user_location,public_profile' });
}

checkLoginState() {
  //alert("Checking Login Status")
  console.log( "Checking login status..........." );
  
  window.FB.getLoginStatus(function(response) {
      //alert("FB Callback")
      console.log("----------->")
      console.log(response)
      this.statusChangeCallback(response);
  }.bind(this));
}

statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);
  if (response.status === 'connected') {
      //alert( "Connected to facebook. Retriving user from fb" );
      // Logged into your app and Facebook.
      this.fetchDataFacebook();
      this.props.history.push('/userdetail');
  } else if (response.status === 'not_authorized') {
      console.log('Import error', 'Authorize app to import data', 'error')
  } else {
      console.log('Import error', 'Error occured while importing data', 'error')
  }
}

fetchDataFacebook = () => {
  console.log('Welcome!  Fetching your information.... ');

  window.FB.api('/me',  { locale: 'en_US', fields: 'name, first_name, last_name, email' }, function(user) {
      console.log( user );
      console.log( user.email );
      console.log( user.first_name );
      console.log( user.last_name );
      console.log('Successful login from facebook : ' + user.name);
      //this.saveDataAndRedirectAfterLogin(user.email, user.first_name, user.last_name, "0");
      localStorage.setItem('token', user.email);
      localStorage.setItem('firstName', user.first_name);
      localStorage.setItem('lastName', user.last_name);
      localStorage.setItem('userRole', "0");
      //alert( 'Successful login for: ' + user.name );
  });
}
  
  render() {
    return (
      <div className="container">
      <div className="d-flex justify-content-center h-100">
      <div className="card">
      <div className="card-header">
				<h3>Sign In</h3>
				<div className="d-flex justify-content-end social_icon">
					<span><i className="fa fa-facebook-square" onClick={ () => this.facebookLogin() }></i></span>
					<span><i className="fa fa-google-plus-square" onClick={ () => this.googleLogin() }></i></span>
					<span><i className="fa fa-twitter-square"></i></span>
				</div>
			</div>
      <div className="card-body">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel className="required">*</ControlLabel>
            <ControlLabel>Email</ControlLabel>
            <FormControl className="form-control"
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel className="required">*</ControlLabel>
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Sign In
          </Button>
        </form>
        </div>
        <div className="card-footer">
				<div className="d-flex justify-content-center links">
					Don't have an account?<NavLink to="/signup">Sign Up</NavLink>
				</div>
				<div className="d-flex justify-content-center">
					<a href="#">Forgot your password?</a>
				</div>
			</div>
      </div>
      </div>
      </div>
    );
  }
}