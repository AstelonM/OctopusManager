import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

type Props = {
  serverName: string
  closeFunction: () => void
  confirmFunction: () => void
}

export default function KillServerDialogue({serverName, closeFunction, confirmFunction}: Props) {
  return (
    <Modal show onHide={closeFunction}>
      <Modal.Header closeButton>
        <Modal.Title>Kill Server {serverName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to force shutdown the server {serverName}? It will not have a chance to save its data.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeFunction}>No</Button>
        <Button variant="danger" onClick={confirmFunction}>Yes</Button>
      </Modal.Footer>
    </Modal>
  );
}
