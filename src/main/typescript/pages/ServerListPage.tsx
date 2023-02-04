import React, {useEffect, useState} from "react";
import axios from "axios";
import {isAdmin, Server, ServerSocketSub, User} from "../Utils";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ServerListItem from "../components/ServerListItem";
import ListGroup from "react-bootstrap/ListGroup";
import TopBar from "../components/TopBar";
import Card from "react-bootstrap/Card";
import {Client} from "@stomp/stompjs";
import KillServerDialogue from "../components/KillServerDialogue";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";
import Alert from "react-bootstrap/Alert";

type Props = {
  user: User|null
  webSocket: Client|null
  webSocketConnected: boolean
  logoutFunction: () => void
}

export default function ServerListPage({user, webSocket, webSocketConnected, logoutFunction}: Props) {
  const [servers, setServers] = useState<Server[]>([]);
  const [showKill, setShowKill] = useState(false);
  const [serverToKill, setServerToKill] = useState<string>("");

  const [error, setError] = useState<string|null>(null);

  const history = useHistory();

  useEffect(() => {
    async function getServers() {
      try {
        const response = await axios.get("/api/servers");
        if (response.status === 200)
          setServers(response.data);
        else
          setError("Could not retrieve the servers.");
      } catch (error) {
        setError("Could not retrieve the servers.");
      }
    }
    getServers();
  }, []);

  useEffect(() => {
    let serverSocketSubList: ServerSocketSub[] = [];
    async function subscribe() {
      if (webSocket !== null && webSocketConnected) {
        servers.map(server => {
          const serverName = server.name;
          const subscription = webSocket.subscribe(`/topic/status/${serverName}`, message => {
            setServers(servers.map(server => {
              if (server.name === serverName)
                return {name: server.name, status: message.body};
              else
                return server;
            }));
          });
          serverSocketSubList = serverSocketSubList.concat({serverName: serverName, subscription: subscription});
        });
      }
    }
    subscribe();
    return (() => {
      serverSocketSubList.map(serverSocketSub => serverSocketSub.subscription.unsubscribe());
    });
  }, [webSocket, webSocketConnected, servers]);

  async function startServer(serverName: string) {
    try {
      const response = await axios.post(`/api/server/${serverName}/start`);
      if (response.status !== 204)
        setError(`The server ${serverName} could not be started.`);
    } catch (error) {
      setError(`The server ${serverName} could not be started.`);
    }
  }
  async function stopServer(serverName: string) {
    try {
      const response = await axios.post(`/api/server/${serverName}/stop`);
      if (response.status !== 204)
        setError(`The server ${serverName} could not be stopped.`);
    } catch (error) {
      setError(`The server ${serverName} could not be stopped.`);
    }
  }
  async function killServer(serverName: string) {
    try {
      const response = await axios.post(`/api/server/${serverName}/kill`);
      if (response.status !== 204)
        setError(`The server ${serverName} could not be killed.`);
    } catch (error) {
      setError(`The server ${serverName} could not be killed.`);
    }
  }
  async function restartServer(serverName: string) {
    try {
      const response = await axios.post(`/api/server/${serverName}/restart`);
      if (response.status !== 204)
        setError(`The server ${serverName} could not be restarted.`);
    } catch (error) {
      setError(`The server ${serverName} could not be restarted.`);
    }
  }

  function showKillDialogue(serverName: string) {
    setServerToKill(serverName);
    setShowKill(true);
  }

  function confirmKill() {
    killServer(serverToKill);
    setShowKill(false);
    setServerToKill("");
  }

  return (
    <Container fluid>
      {showKill && <KillServerDialogue serverName={serverToKill} closeFunction={() => setShowKill(false)}
                                       confirmFunction={confirmKill}/>}
      <TopBar logoutFunction={logoutFunction} loggedIn={true} user={user}/>
      <Row className = "justify-content-center">
        <Col xs={10}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title className="no-bottom-margin">Servers</Card.Title>
              <div>
                {isAdmin(user) && <Button onClick={() => history.push("/newServer")}>New Server</Button>}
              </div>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {servers.length === 0 ? <p>There are no servers defined.</p> :
                servers.map(server => (
                  <ServerListItem key={server.name} serverName={server.name} onlineStatus={server.status}
                                  startServer={startServer} stopServer={stopServer} killServer={showKillDialogue}
                                  restartServer={restartServer}/>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
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
