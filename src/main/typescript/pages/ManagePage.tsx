import React, {useState} from "react";
import TopBar from "../components/TopBar";
import Container from "react-bootstrap/Container";
import {User} from "../Utils";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import AdminSideBar from "../components/AdminSideBar";
import {Route, Switch, Redirect} from "react-router-dom";
import AccountListArea from "../components/AccountListArea";
import ServerListArea from "../components/ServerListArea";
import {Client} from "@stomp/stompjs";
import Alert from "react-bootstrap/Alert";

type Props = {
  user: User|null
  webSocket: Client|null
  webSocketConnected: boolean
  logoutFunction: () => void
}

export default function ManagePage({user, webSocket, webSocketConnected, logoutFunction}: Props) {
  const [error, setError] = useState<string|null>(null);

  return (
    <Container fluid>
      <TopBar logoutFunction={logoutFunction} loggedIn={true} serverLink={true} user={user} manage={false}/>
      <Row>
        <Col xs={2} style={{"paddingLeft": "0"}}>
          <AdminSideBar/>
        </Col>
        <Col>
          <Switch>
            <Route path="/manage/servers">
              <ServerListArea webSocket={webSocket} webSocketConnected={webSocketConnected} setError={setError}/>
            </Route>
            <Route path="/manage/accounts">
              <AccountListArea user={user} setError={setError}/>
            </Route>
            <Route path="/manage">
              <Redirect to="/manage/servers"/>
            </Route>
          </Switch>
        </Col>
      </Row>
      <div className="fixed-bottom d-flex justify-content-center align-items-center">
        {error !== null &&
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
            <p>{error}</p>
        </Alert>}
      </div>
    </Container>
  );
}
