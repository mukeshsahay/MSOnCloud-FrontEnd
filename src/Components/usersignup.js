import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import config from "../config";

class UserSignup extends Component
{
    constructor(props) {
        super(props);
    
        this.state = {
            firstName: "",
            lastName: "",
          email: "",
          password: ""
        };
      }

      validateForm() {
        return this.state.firstName.length > 0 && this.state.lastName.length > 0 &&
        this.state.email.length > 0 && this.state.password.length > 0;
      }
    
      handleChange = event => {
        this.setState({
          [event.target.id]: event.target.value
        });
      }

    handleSubmit= (event) => {
      event.preventDefault();
      if (!this.state.firstName || !this.state.lastName ||
        !this.state.email || !this.state.password){
        return;
      }
  
      this.handleAPI();
    }

    handleAPI() {
      const data = {
        "firstName": this.state.firstName,
        "lastName": this.state.lastName,
        "emailId": this.state.email,
        "password": this.state.password,
        "role": "0" 
      }
      
fetch(config.userAPI + "signup",{
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
        console.log("data",data);
        if(statusCode === 200) {
        if(data.moreInfo){
          const error = data.moreInfo;
          this.setState({error});
          alert(error);
        } else {
          alert("Registration successfull. Please login to MS On Cloud..!!")
          this.props.history.push('/login');
        }
      }

        return data;
      }) .catch(error => {
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

    render()
    {
        return(  
            <div className="container">
      <div className="d-flex justify-content-center h-100">
      <div className="cardSignup">
      <div className="card-header">
				<h3>Register User</h3>
                </div>
            <div className="card-body">
                    <form onSubmit={this.handleSubmit}>
                    <FormGroup controlId="firstName" bsSize="large">
            <ControlLabel className="required">*</ControlLabel>
            <ControlLabel >First Name</ControlLabel>
            <FormControl className="form-control"
              autoFocus
              type="text"
              value={this.state.firstName}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="lastName" bsSize="large">
            <ControlLabel className="required">*</ControlLabel>
            <ControlLabel bsSize="large">Last Name</ControlLabel>
            <FormControl className="form-control"
              autoFocus
              type="text"
              value={this.state.lastName}
              onChange={this.handleChange}
            />
          </FormGroup>

                    <FormGroup controlId="email" bsSize="large">
            <ControlLabel className="required">*</ControlLabel>
            <ControlLabel bsSize="large">Email</ControlLabel>
            <FormControl className="form-control"
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel className="required">*</ControlLabel>
            <ControlLabel bsSize="large">Password</ControlLabel>
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
            Register Me
          </Button>
                    </form>
                </div>
                <div className="card-footer">
				<div className="d-flex justify-content-center links">
					Alreay have an account?<NavLink to="/login">Login</NavLink>
				</div>
			</div>
            </div>
            </div>
            </div>
        );
    }

}

export default UserSignup;