import React, {FormEvent, useState} from "react";
import TopBar from "../components/TopBar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {useHistory} from "react-router-dom";
import {User} from "../Utils";
import Alert from "react-bootstrap/Alert";
import {useNavigate} from "react-router-dom-v5-compat";

type Props = {
  logoutFunction: () => void
  user: User|null
}

export default function ServerCreationPage({logoutFunction, user}: Props) {
  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [workingDirectory, setWorkingDirectory] = useState("");
  const [directories, setDirectories] = useState<string[]>([]);
  const [timeBetweenCrashes, setTimeBetweenCrashes] = useState("0");
  const [restartAttempts, setRestartAttempts] = useState("0");

  const [error, setError] = useState<string|null>(null);
  const [badName, setBadName] = useState(false);
  const [conflictingName, setConflictingName] = useState(false);
  const [badCommand, setBadCommand] = useState(false);
  const [badDirectory, setBadDirectory] = useState(false);

  const navigate = useNavigate();

    function submitForm(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (name === null || name.trim().length === 0)
        setBadName(true);
      if (command === null || command.trim().length === 0)
        setBadCommand(true);
      if (workingDirectory === null || workingDirectory.trim().length === 0)
        setBadDirectory(true);
      else
        createServer();
    }

    async function createServer() {
      try {
        const response = await axios.post(`/api/servers/create/${name}`,
          {
            command: command, workingDirectory: workingDirectory, extraDirectories: directories,
            timeBetweenCrashes: +timeBetweenCrashes, restartAttempts: +restartAttempts
          });
        if (response.status === 204)
          navigate("/servers");
        else if (response.status == 400)
          setError("The request is invalid.");
        else if (response.status == 409) {
          setConflictingName(true);
          setBadName(false);
          setBadCommand(false);
          setBadDirectory(false);
        } else if (response.status == 404) {
          setConflictingName(false);
          setBadName(false);
          setBadCommand(false);
          setBadDirectory(true);
        }
      } catch (error) {
        setError("There was an error creating the server.");
      }
    }

  return (
    <Container fluid>
      <TopBar logoutFunction={logoutFunction} user={user} loggedIn={true} serverLink={true}/>
      <Row className="justify-content-center">
        <Col xs={2}/>
        <Col xs={8}>
          <Card>
            <Card.Header as="h5">Create a new server</Card.Header>
            <Card.Body>
              <Form onSubmit={(e) => submitForm(e)}>
                <Form.Group>
                  <Form.Label>Server name:</Form.Label>
                  <Form.Control value={name} onChange={e => setName(e.target.value)}/>
                  {badName && <div className="text-danger">The name is invalid.</div>}
                  {conflictingName && <div className="text-danger">The name already exists.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Command (whitespace-separated, surround arguments with quotes if they contain spaces):</Form.Label>
                  <Form.Control value={command} onChange={e => setCommand(e.target.value)}/>
                  {badCommand && <div className="text-danger">The command is invalid.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Working directory:</Form.Label>
                  <Form.Control value={workingDirectory} onChange={e => setWorkingDirectory(e.target.value)}/>
                  {badDirectory && <div className="text-danger">The working directory is invalid.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Extra directories:</Form.Label>
                  {directories.map((value, i) => (
                  <div key={i} className="d-flex justify-content-start align-items-center">
                    <Form.Control value={value}
                                  onChange={e => setDirectories(directories.map((originalValue, j) => {
                                    if (i === j)
                                      return e.target.value;
                                    return originalValue;
                                  }))}/>
                    <Button variant="danger" onClick={() => setDirectories(directories.filter((v, j) => {
                      return i !== j;
                    }))}>Remove</Button>
                  </div>
                  ))}
                  <Button onClick={() => setDirectories(directories.concat(""))}>Add directory</Button>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Time between crashes (in ms):</Form.Label>
                  <Form.Control type="number" value={timeBetweenCrashes} onChange={e => setTimeBetweenCrashes(e.target.value)}/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Restart attempts:</Form.Label>
                  <Form.Control type="number" value={restartAttempts} onChange={e => setRestartAttempts(e.target.value)}/>
                </Form.Group>
                <div className="d-flex justify-content-between align-items-center">
                  <Button onClick={() => navigate("/servers")}>Cancel</Button>
                  <Button type="submit">Create</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={2}/>
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
