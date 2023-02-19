import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import {useHistory} from "react-router-dom";
import {useNavigate} from "react-router-dom-v5-compat";

type Props = {
  serverName: string
  onlineStatus: string
  removeFunction: (name: string) => void
}

export default function ServerListAreaItem({serverName, onlineStatus, removeFunction}: Props) {
  const navigate = useNavigate();

  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center" as="div">
      <div>
        <h5>{serverName}</h5>
        <small>{onlineStatus}</small>
      </div>
      <div>
        <Button onClick={() => navigate(`/editServer/${serverName}/`)}>Edit</Button>
        <Button variant="danger" onClick={() => removeFunction(serverName)}>Remove</Button>
      </div>
    </ListGroup.Item>
  );
}
