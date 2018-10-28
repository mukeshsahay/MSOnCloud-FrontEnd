import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Welcome.css";
import 'bootstrap/dist/css/bootstrap.min.css';
// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
import { saveAs } from 'file-saver';
import config from "../config";

export default class AdminUserDetails extends Component
{
    constructor(props) {
        super(props);

        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleDeleteFile = this.handleDeleteFile.bind(this);
        this.gotoUserView = this.gotoUserView.bind(this);
        this.handleDownloadFile = this.handleDownloadFile.bind(this);
        this.handleDeleteFile = this.handleDeleteFile.bind(this);
        this.getFilesListForUser();
        this.state = { data: [] };
    }

    getFilesListForUser() {
    
        fetch(config.filesAPI + "getAdminFiles",{
            method:"GET",
            mode:"cors",
            headers: {
              'Accept':'application/json'
            }
        })
        .then(response => response.json())
        .then(data => this.setState({ data }))
        .catch(error => {
        console.error(error);
        return { name: "network error", description: "" };
        });
      }

    logoutUser = () => {
        localStorage.setItem('token', "");
        localStorage.setItem('firstName', "");
        localStorage.setItem('lastName', "");
        this.props.history.push('/login');
      }

      async handleUploadFile(ev) {
        ev.preventDefault();
        
        if(this.uploadInput.files[0] == null) {
            console.log("Please select a file to upload.");
            return;
        }
                let options = {
                    headers: {
                        'Accept':'application/json'
                    },
                    method: 'POST'
                  };
                
                  options.body = new FormData();
                  options.body.append('file', this.uploadInput.files[0]);
                  options.body.append('firstName', localStorage.getItem('firstName'));
                  options.body.append('lastName', localStorage.getItem('lastName'));
                  options.body.append('emailId', localStorage.getItem('token'));
                  options.body.append('fileName', this.uploadInput.files[0].name);
                  options.body.append('fileDescription', this.fileDescription.value);

          fetch(config.filesAPI + "uploadFile", options)
          .then((response) => {
          response.json().then((body) => {
            console.log(body);
            this.getFilesListForUser();
            this.refs.form.reset();
            return;
          });
        });
      }

      gotoUserView(ev) {
        ev.preventDefault();
        if(!localStorage.getItem('token')) {
          return;
        }

        this.props.history.push('/userdetail');
    }

    handleDeleteFile(ev, row) {
        ev.preventDefault();
        console.log("emailId", localStorage.getItem('token'));
        console.log("fileName", localStorage.getItem('selectedFileName'));
        
        const data = {
            "emailId": localStorage.getItem('token'),
            "fileName": localStorage.getItem('selectedFileName') 
          }

        fetch(config.filesAPI + "deleteFile" ,{
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
            console.log(res);
          const { status, data } = res;
          console.log("statusCode",status);
          console.log("data",data);
          if (status === 200) {
            this.getFilesListForUser();
          return data;
          } else {
            return { name: "Error deleting file.", description: "Error deleting file." };
          }
        })
        .catch(error => {
        console.error(error);
        return { name: "network error", description: "" };
        });
      }

      async handleDownloadFile(ev, row) {
        ev.preventDefault();
        console.log("fileName", localStorage.getItem('selectedFileName'));
        
        window.open(config.awsCouldFront + 
        localStorage.getItem('token') + "/" + localStorage.getItem('selectedFileName') + "?download");
        
      }

    render()
    {
        const columns = [{
            Header: 'User ID',
            accessor: 'emailId'
          }, {
            Header: 'First Name',
            accessor: 'firstName'
          }, {
            Header: 'Last Name',
            accessor: 'lastName'
          }, {
            Header: 'File Name',
            accessor: 'fileName' // String-based value accessors!
          }, {
            Header: 'Description',
            accessor: 'fileDescription'
          }, {
            Header: 'Upload Time',
            accessor: 'filecreatedTime'
          }, {
            Header: 'Last Updated Time',
            accessor: 'fileUpdatedTime'
          },
          {
            Header: '',
            Cell: row => (
                <div>
                    <Button bsStyle="success" onClick={this.handleDownloadFile}>Download</Button> <br/>
                    <Button bsStyle="danger" onClick={this.handleDeleteFile}>Delete</Button>
                </div>
            )
         }
        
        ]

        const userName = localStorage.getItem('firstName');
        const welcomeUser = "Welcome " + userName + " to the admin panel..!!";
        console.log(userName.toString());
        if(userName.toString() == "") {
            return(
                <div>
                    Please <NavLink to="/login">Login </NavLink>
                </div>
            );
        } else {
        return(
            <div>
            <div className="header">
                <div className="welcome"> {welcomeUser}
			<Button id="logout" className="btn btn-danger pull-right logout" onClick={this.logoutUser}>
				<span className="glyphicon glyphicon-log-out"></span>
        </Button>
        <div>
          <Button className="btn btn-xs pull-right" bsStyle="success" onClick={this.gotoUserView}>
          <img src="MyAccount.png" width="70" height="50" alt=""/>
          </Button>
                </div>
            </div>
            </div>

            <div>
            <form className="pull-right" encrypt="multipart/form-data" onSubmit={this.handleUploadFile} ref="form">
        <div>
          <button className="btn btn-xs pull-right"><img src="UploadFile.png" width="70" height="50" alt=""/></button>
          <input ref={(ref) => { this.uploadInput = ref; }} type="file" />
          <input ref={(ref) => { this.fileDescription = ref; }} type="text" placeholder="Description" width="10" />
        </div>
      </form>
            </div><br/><br/><br/><br/>
            <div className="tableData">
            <ReactTable
            getTdProps={(state, rowInfo, column, instance) => {
                return {
                  onClick: (e, handleOriginal) => {
                    localStorage.setItem('selectedFileName', rowInfo.row.fileName);
                    console.log("Selected fileName", localStorage.getItem('selectedFileName'));
                    if (handleOriginal) {
                      handleOriginal();
                    }
                  }
                };
              }}
    data={this.state.data}
    columns={columns}
  />
  </div>
        </div>
        );
    }
}

}