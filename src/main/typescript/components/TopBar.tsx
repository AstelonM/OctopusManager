import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import {isAdmin, User} from "../Utils";
import {useNavigate} from "react-router-dom-v5-compat";

type Props = {
  logoutFunction: () => void
  loggedIn: boolean
  serverLink?: boolean
  user?: User|null
  manage?: boolean
}

export default function TopBar({logoutFunction, loggedIn, serverLink, user = null, manage = true}: Props) {
  const navigate = useNavigate();

  return (
    <Navbar fixed="top" bg="primary" variant="dark" className="d-flex justify-content-between align-items-center">
      <Navbar.Brand>Octopus Manager</Navbar.Brand>
      <Nav style={{"paddingRight": "24px"}}>
        {isAdmin(user) && manage && <Button onClick={() => navigate("/manage")}>Manage</Button>}
        {serverLink && <Button onClick={() => navigate("/servers")}>Servers</Button>}
        {user !== null && <Button onClick={() => navigate(`/account/${user?.username}`)}>Account</Button>}
        {loggedIn && <Button onClick={logoutFunction}>Logout</Button>}
      </Nav>
    </Navbar>
  );
}
