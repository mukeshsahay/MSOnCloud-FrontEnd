import React from "react";
import {NavLink} from "react-router-dom";
import "./Welcome.css";

class Welcome extends React.Component{

    render(){
        return(
            <div>
                <div className="welcome">Welcome to MS On Cloud - The NextGen Storage Service</div>
                <NavLink to="/login">Login </NavLink>
                <label> / </label>
                <NavLink to="/signup"> Signup</NavLink>
            </div>    
        );
    }
}

export default Welcome;