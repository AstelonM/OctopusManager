import React, {FormEvent, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

type Props = {
  type: string
  createFunction: (name: string) => void
  closeFunction: () => void
  originalName?: string
}

type MenuType = {[key: string]: string}

const titles: MenuType = {
  directory: "New Directory",
  file: "New File",
  rename: "Rename File",
  archive: "New Archive"
};

const labels: MenuType = {
  directory: "Directory name",
  file: "File name",
  rename: "New name",
  archive: "Archive name (without extension)"
};

const submitButton: MenuType = {
  directory: "Create",
  file: "Create",
  rename: "Save",
  archive: "Create"
};

export default function FormDialogue({type, createFunction, closeFunction, originalName = ""}: Props) {
  const [name, setName] = useState(originalName);

  const [badName, setBadName] = useState(false);

  function formSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name === null || name.trim().length === 0)
      setBadName(true);
    else
      createFunction(name);
  }

  return (
    <Modal show onHide={closeFunction}>
      <Modal.Header closeButton>
        <Modal.Title>{titles[type]}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => formSubmit(e)}>
        <Modal.Body>
          <Form.Label>{labels[type]}:</Form.Label>
          <Form.Control value={name} onChange={(e) => setName(e.target.value)}/>
          {badName && <div className="text-danger">The name is invalid.</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeFunction}>Close</Button>
          <Button variant="primary" type="submit">{submitButton[type]}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
