import React, {useEffect, useState} from "react";
import axios from "axios";
import {Server, ServerSocketSub} from "../Utils";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import ServerListAreaItem from "./ServerListAreaItem";
import {Client} from "@stomp/stompjs";

type Props = {
  webSocket: Client|null
  webSocketConnected: boolean
  setError: (error: string|null) => void
}

export default function ServerListArea({webSocket, webSocketConnected, setError}: Props) {
  const [servers, setServers] = useState<Server[]>([]);
  const [reload, setReload] = useState(false);

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
  }, [reload]);

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

  async function removeServer(name: string) {
    try {
      const response = await axios.delete(`/api/servers/remove/${name}`);
      if (response.status === 204)
        setReload(!reload);
      else if (response.status === 405)
        setError("The server is currently online. It needs to be shut down before being removed.");
      else
        setError("The server could not be removed.");
    } catch (error) {
      setError("The server could not be removed.");
    }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="no-bottom-margin">Servers</Card.Title>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {servers.length === 0 ? <p>There are no servers defined</p> :
          servers.map(server => (
            <ServerListAreaItem key={server.name} serverName={server.name} onlineStatus={server.status}
                                removeFunction={removeServer}/>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
