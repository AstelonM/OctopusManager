import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import {useHistory} from "react-router-dom";
import {canStart} from "../Utils";
import {useNavigate} from "react-router-dom-v5-compat";

type Props = {
  serverName: string
  onlineStatus: string
  startServer: (server: string) => void
  stopServer: (server: string) => void
  killServer: (server: string) => void
  restartServer: (server: string) => void
}

export default function ServerListItem({serverName, onlineStatus, startServer, stopServer, killServer, restartServer}: Props) {
  const navigate = useNavigate();

  function selectServer() {
    navigate(`/server/${serverName}/console`);
  }

  function serverAction(event: React.MouseEvent<Element>, action: number, serverName: string) {
    event.stopPropagation();
    switch (action) {
      case 1: {
        startServer(serverName);
        break;
      }
      case 2: {
        stopServer(serverName);
        break;
      }
      case 3: {
        killServer(serverName);
        break;
      }
      case 4: {
        restartServer(serverName);
        break;
      }
    }
  }

  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center" action onClick={selectServer} as="div">
      <div>
        <h5>{serverName}</h5>
        <small>{onlineStatus}</small>
      </div>
      <div>
        {canStart(onlineStatus) && <Button variant="success"
                                               onClick={event => serverAction(event, 1, serverName)}>Start</Button>}
        {onlineStatus === "ONLINE" && <Button variant="warning"
                                              onClick={event => serverAction(event, 2, serverName)}>Stop</Button>}
        {onlineStatus === "ONLINE" && <Button variant="danger"
                                              onClick={event => serverAction(event, 3, serverName)}>Kill</Button>}
        {onlineStatus === "ONLINE" && <Button variant="primary"
                                              onClick={event => serverAction(event, 4, serverName)}>Restart</Button>}
      </div>
    </ListGroup.Item>
  );
}
