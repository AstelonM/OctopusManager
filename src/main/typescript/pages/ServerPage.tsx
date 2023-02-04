import React, {useState} from "react";
import {Switch, Route, Redirect, useParams, useRouteMatch} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SideBar from "../components/SideBar";
import {ServerName, User} from "../Utils";
import ConsoleArea from "../components/ConsoleArea";
import FileListArea from "../components/FileListArea";
import FileArea from "../components/FileArea";
import TopBar from "../components/TopBar";
import {Client} from "@stomp/stompjs";
import Alert from "react-bootstrap/Alert";

type Props = {
  user: User|null
  webSocket: Client|null
  webSocketConnected: boolean
  logoutFunction: () => void
  consoleCacheSize: number
  maxFileSize: number
}

export default function ServerPage({user, webSocket, webSocketConnected, logoutFunction, consoleCacheSize, maxFileSize}: Props) {
  const {serverName} = useParams<ServerName>();
  const {path, url} = useRouteMatch();

  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  return (
    <Container fluid>
      <TopBar logoutFunction={logoutFunction} loggedIn={true} serverLink={true} user={user}/>
      <Row>
        <Col xs={2} style={{"paddingLeft": "0"}}>
          <SideBar serverName={serverName}/>
        </Col>
        <Col>
          <Switch>
            <Route path={`${path}/console`}>
              <ConsoleArea webSocket={webSocket} webSocketConnected={webSocketConnected} maxLines={consoleCacheSize}
                           setError={setError}/>
            </Route>
            <Route path={`${path}/files`}>
              <FileListArea maxFileSize={maxFileSize} setError={setError}/>
            </Route>
            <Route path={`${path}/file`}>
              <FileArea setError={setError} setSuccess={setSuccess}/>
            </Route>
            <Route path={`${path}`}>
              <Redirect to={`${url}/console`}/>
            </Route>
          </Switch>
        </Col>
      </Row>
      <div className="fixed-bottom d-flex justify-content-center align-items-center">
        {error !== null &&
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
            <p>{error}</p>
        </Alert>}
        {success !== null &&
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            <p>{success}</p>
        </Alert>}
      </div>
    </Container>
  );
}
