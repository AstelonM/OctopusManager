import React, {FormEvent, useEffect, useState} from "react";
import TopBar from "../components/TopBar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {useHistory, useParams} from "react-router-dom";
import {User} from "../Utils";
import Alert from "react-bootstrap/Alert";

type Props = {
  logoutFunction: () => void
  user: User|null
}

type Params = {
  serverName: string
}

export default function EditServerPage({logoutFunction, user}: Props) {
  const {serverName} = useParams<Params>();
  const [command, setCommand] = useState("");
  const [workingDirectory, setWorkingDirectory] = useState("");
  const [directories, setDirectories] = useState<string[]>([]);
  const [timeBetweenCrashes, setTimeBetweenCrashes] = useState("0");
  const [restartAttempts, setRestartAttempts] = useState("0");

  const [error, setError] = useState<string|null>(null);
  const [badCommand, setBadCommand] = useState(false);
  const [badDirectory, setBadDirectory] = useState(false);

  const history = useHistory();

  useEffect(() => {
    async function getServerInfo() {
      try {
        const response = await axios.get(`/api/server/${serverName}/info`);
        if (response.status === 200) {
          setCommand(response.data["command"]);
          setWorkingDirectory(response.data["workingDirectory"]);
          setDirectories(response.data["extraDirectories"]);
          setTimeBetweenCrashes(response.data["timeBetweenCrashes"]);
          setRestartAttempts(response.data["restartAttempts"]);
        } else if (response.status === 404) {
          history.push("/");
        } else {
          setError("Could not load the server data.");
        }
      } catch (error) {
        setError("Could not load the server data.");
      }
    }
    getServerInfo();
  }, [serverName]);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (command === null || command.trim().length === 0)
      setBadCommand(true);
    if (workingDirectory === null || workingDirectory.trim().length === 0)
      setBadDirectory(true);
    else
      updateServer();
  }

  async function updateServer() {
    try {
      const response = await axios.patch(`/api/servers/edit/${serverName}`,
        {
          command: command, workingDirectory: workingDirectory, extraDirectories: directories,
          timeBetweenCrashes: +timeBetweenCrashes, restartAttempts: +restartAttempts
        });
      if (response.status === 204)
        history.push("/manage/servers");
      else if (response.status === 400) {
        setError("The request is invalid.");
      } else if (response.status == 404) {
        setBadCommand(false);
        setBadDirectory(true);
      } else if (response.status === 405) {
        setBadDirectory(false);
        setBadCommand(false);
        setError("The server is currently online. It cannot be modified.");
      } else {
        setBadCommand(false);
        setBadDirectory(false);
        setError("Could not update the server.");
      }
    } catch (error) {
      setError("Could not update the server.");
    }
  }

  return (
    <Container fluid>
      <TopBar logoutFunction={logoutFunction} loggedIn={true} serverLink={true} user={user}/>
      <Row className="justify-content-center">
        <Col xs={2}/>
        <Col xs={8}>
          <Card>
            <Card.Header as="h5">Update server {serverName}</Card.Header>
            <Card.Body>
              <Form onSubmit={(e) => submitForm(e)}>
                <Form.Group>
                  <Form.Label>Command (must be whitespace-separated):</Form.Label>
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
                  <Form.Control type="number" value={timeBetweenCrashes}
                                onChange={e => setTimeBetweenCrashes(e.target.value)}/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Restart attempts:</Form.Label>
                  <Form.Control type="number" value={restartAttempts}
                                onChange={e => setRestartAttempts(e.target.value)}/>
                </Form.Group>
                <div className="d-flex justify-content-between align-items-center">
                  <Button onClick={() => history.push("/manage/servers")}>Cancel</Button>
                  <Button type="submit">Update</Button>
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
