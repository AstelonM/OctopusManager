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
  role?: string
}

type Params = {
  username: string
}

export default function UpdateAccountPage({logoutFunction, user, role}: Props) {
  const {username} = useParams<Params>();
  const selfUser = user?.username === username;
  const [newUsername, setNewUsername] = useState(username);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [admin, setAdmin] = useState(false);

  const [error, setError] = useState<string|null>(null);
  const [badUsername, setBadUsername] = useState(false);
  const [usernameConflict, setUsernameConflict] = useState(false);
  const [passwordsNotMatching, setPasswordsNotMatching] = useState(false);

  const history = useHistory();

  useEffect(() => {
    if (!selfUser && user?.role !== "ROOT" && role === "ADMIN")
      history.push("/");
  }, []);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (username === null || username.trim().length === 0)
      setBadUsername(true);
    updateUser();
  }

  async function updateUser() {
    try {
      if (password === confirmPassword) {
        const pass = password.trim() === "" ? null : password;
        if (selfUser) {
          const response = await axios.patch("/api/accounts/update",
            {originalUsername: username, newUsername: newUsername, newPassword: pass});
          if (response.status === 204)
            logoutFunction();
          else if (response.status === 409)
            setUsernameConflict(true);
          else if (response.status === 403 || response.status === 404)
            history.push("/");
          else if (response.status === 400)
            setError("The request is invalid.");
          else {
            setPasswordsNotMatching(false);
            setUsernameConflict(false);
            setError("There was an error updating the account.");
          }
        } else {
          if (user?.role === "ROOT") {
            const response = await axios.patch("/api/accounts/update/admin",
              {originalUsername: username, newUsername: newUsername, newPassword: pass, admin: admin});
            if (response.status === 204)
              history.push("/manage");
            else if (response.status === 409)
              setUsernameConflict(true);
            else if (response.status === 404)
              history.push("/");
            else if (response.status === 400)
              setError("The request is invalid.");
            else {
              setPasswordsNotMatching(false);
              setUsernameConflict(false);
              setError("There was an error updating the account.");
            }
          } else if (role !== "ADMIN") {
            const response = await axios.patch("/api/accounts/update",
              {originalUsername: username, newUsername: newUsername, newPassword: pass});
            if (response.status === 204)
              history.push("/manage");
            else if (response.status === 409)
              setUsernameConflict(true);
            else if (response.status === 403 || response.status === 404)
              history.push("/");
            else if (response.status === 400)
              setError("The request is invalid.");
            else {
              setPasswordsNotMatching(false);
              setUsernameConflict(false);
              setError("There was an error updating the account.");
            }
          }
        }
      } else {
        setPasswordsNotMatching(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setError("There was an error updating the account.");
    }
  }

  return (
    <Container fluid>
      <TopBar logoutFunction={logoutFunction} loggedIn={true} serverLink={true} user={user}/>
      <Row className="justify-content-center">
        <Col xs={4}/>
        <Col xs={4}>
          <Card>
            <Card.Header as="h5">Update account credentials</Card.Header>
            <Card.Body>
              <Form onSubmit={(e) => submitForm(e)}>
                <Form.Group>
                  <Form.Label>Username:</Form.Label>
                  <Form.Control value={newUsername} onChange={e => setNewUsername(e.target.value)}/>
                  {usernameConflict && <div className="text-danger">The given username already exists.</div>}
                  {badUsername && <div className="text-danger">The username is invalid.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>New password:</Form.Label>
                  <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                  {passwordsNotMatching && <div className="text-danger">The passwords do not match.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Confirm new password:</Form.Label>
                  <Form.Control type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                </Form.Group>
                {(user?.role === "ROOT" && !selfUser) &&
                <Form.Group>
                    <Form.Check custom id="admin" type="checkbox" label="Admin" checked={admin}
                                onChange={e => setAdmin(e.target.checked)}/>
                </Form.Group>}
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {selfUser ?
                    <Button onClick={() => history.push("/servers")}>Cancel</Button> :
                    <Button onClick={() => history.push("/manage/accounts")}>Cancel</Button>}
                  </div>
                  <Button type="submit">Update</Button>
                </div>
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
