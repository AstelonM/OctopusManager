import React, {FormEvent, useState} from "react";
import Container from "react-bootstrap/Container";
import TopBar from "../components/TopBar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Alert from "react-bootstrap/Alert";

type Props = {
  loginFunction: (username: string, role: string) => void
  logoutFunction: () => void
}

export default function LoginPage({loginFunction, logoutFunction}: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState<string|null>(null);
  const [badName, setBadName] = useState(false);
  const [badPassword, setBadPassword] = useState(false);

  function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (username === null || username.trim().length === 0)
      setBadName(true);
    if (password === null || password.trim().length === 0)
      setBadPassword(true);
    else
      login();
  }

  async function login() {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("rememberMe", JSON.stringify(rememberMe));
      const response = await axios.post("/api/login", formData, {
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        }
      });
      if (response.status === 200)
        loginFunction(username, response.headers["role"]);
      else if (response.status === 401) {
        setError("The username or password are wrong.");
        setBadName(false);
        setBadPassword(false);
        setUsername("");
        setPassword("");
      } else {
        setError("Could not log in.");
      }
    } catch (error) {
      setError("Could not log in.");
    }
  }

  return (
    <Container fluid>
      <TopBar logoutFunction={logoutFunction} loggedIn={false}/>
      <Row className="justify-content-center">
        <Col xs={4}/>
        <Col xs={4}>
          <Card>
            <Card.Header as="h5">Login</Card.Header>
            <Card.Body>
              <Form onSubmit={(e) => submitForm(e)}>
                <Form.Group>
                  <Form.Label>Username:</Form.Label>
                  <Form.Control value={username} onChange={e => setUsername(e.target.value)}/>
                  {badName && <div className="text-danger">The username is invalid.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Password:</Form.Label>
                  <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                  {badPassword && <div className="text-danger">The password is invalid.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Check custom id="rememberMe" type="checkbox" label="Remember me" checked={rememberMe}
                              onChange={e => setRememberMe(e.target.checked)}/>
                </Form.Group>
                <Button type="submit">Login</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={4}/>
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
