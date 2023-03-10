import React, {useState} from "react";
import TopBar from "../components/TopBar";
import Container from "react-bootstrap/Container";
import {User} from "../Utils";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import AdminSideBar from "../components/AdminSideBar";
import AccountListArea from "../components/AccountListArea";
import ServerListArea from "../components/ServerListArea";
import {Client} from "@stomp/stompjs";
import Alert from "react-bootstrap/Alert";
import {Navigate, Route, Routes} from "react-router-dom";

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
          <Routes>
            <Route path="/servers" element={<ServerListArea webSocket={webSocket} webSocketConnected={webSocketConnected}
                                                            setError={setError}/>}/>
            <Route path="/accounts" element={<AccountListArea user={user} setError={setError}/>}/>
            <Route path="/" element={<Navigate to="/manage/servers"/>}/>
          </Routes>
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
