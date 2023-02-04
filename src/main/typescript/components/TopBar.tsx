import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {useHistory} from "react-router-dom";
import Button from "react-bootstrap/Button";
import {isAdmin, User} from "../Utils";

type Props = {
  logoutFunction: () => void
  loggedIn: boolean
  serverLink?: boolean
  user?: User|null
  manage?: boolean
}

export default function TopBar({logoutFunction, loggedIn, serverLink, user = null, manage = true}: Props) {
  const history = useHistory();

  return (
    <Navbar fixed="top" bg="primary" variant="dark" className="d-flex justify-content-between align-items-center">
      <Navbar.Brand>Octopus Manager</Navbar.Brand>
      <Nav style={{"paddingRight": "24px"}}>
        {isAdmin(user) && manage && <Button onClick={() => history.push("/manage")}>Manage</Button>}
        {serverLink && <Button onClick={() => history.push("/servers")}>Servers</Button>}
        {user !== null && <Button onClick={() => history.push(`/account/${user?.username}`)}>Account</Button>}
        {loggedIn && <Button onClick={logoutFunction}>Logout</Button>}
      </Nav>
    </Navbar>
  );
}
