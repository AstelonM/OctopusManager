import React, {FormEvent, useState} from "react";
import TopBar from "../components/TopBar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Alert from "react-bootstrap/Alert";
import {useNavigate} from "react-router-dom-v5-compat";

type Props = {
  type: string
  logoutFunction: () => void
  initialize: () => void
}

export default function AccountCreationPage({type, logoutFunction, initialize}: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string|null>(null);
  const [badName, setBadName] = useState(false);
  const [nameConflict, setNameConflict] = useState(false);
  const [badPassword, setBadPassword] = useState(false);
  const [notMatching, setNotMatching] = useState(false);
  const [badConfirm, setBadConfirm] = useState(false);

  const navigate = useNavigate();

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (username === null || username.trim().length === 0)
      setBadName(true);
    if (password === null || password.trim().length === 0)
      setBadPassword(true);
    if (confirmPassword === null || confirmPassword.trim().length === 0)
      setBadConfirm(true);
    else
      registerAdminAccount();
  }

  async function registerAdminAccount() {
    try {
      if (password === confirmPassword) {
        if (type === "root") {
          const response = await axios.post("/api/initialize", {username: username, password: password});
          if (response.status === 204) {
            initialize();
            navigate("/");
          } else if (response.status === 400) {
            setError("The request is invalid.");
          } else if (response.status === 409) {
            setNameConflict(true);
            setBadPassword(false);
            setBadName(false);
            setNotMatching(false);
            setBadConfirm(false);
          } else {
            setNameConflict(false);
            setBadPassword(false);
            setBadName(false);
            setNotMatching(false);
            setBadConfirm(false);
            setError("Could not create the account.");
          }
        } else {
          let link = "/api/accounts/create";
          if (type === "admin")
            link = link + "/admin";
          const response = await axios.post(link, {username: username, password: password});
          if (response.status === 204)
            navigate("/manage/accounts");
          else if (response.status === 400) {
            setError("The request is invalid.");
          } else if (response.status === 409) {
            setNameConflict(true);
            setBadPassword(false);
            setBadName(false);
            setNotMatching(false);
            setBadConfirm(false);
          } else {
            setNameConflict(false);
            setBadPassword(false);
            setBadName(false);
            setNotMatching(false);
            setBadConfirm(false);
            setError("Could not create the account.");
          }
        }
      } else {
        setNotMatching(true);
        setPassword("");
        setConfirmPassword("");
        setBadName(false);
        setNameConflict(false);
        setBadPassword(false);
        setBadConfirm(false);
      }
    } catch (error) {
      setError("Could not create the account.");
    }
  }

  return (
    <Container fluid>
      <TopBar logoutFunction={logoutFunction} loggedIn={false}/>
      <Row className="justify-content-center">
        <Col xs={4}/>
        <Col xs={4}>
          <Card>
            {type === "root" && <Card.Header as="h5">Create the root account</Card.Header>}
            {type === "admin" && <Card.Header as="h5">Create a new admin account</Card.Header>}
            {type === "user" && <Card.Header as="h5">Create a new user account</Card.Header>}
            <Card.Body>
              {type === "root" && <p>It seems that OctopusManager is not initialized! To initialize it, all you need to do
              is to create an account to serve as the &quot;root&quot; account. With it you can then access the whole
              application, as well as create other accounts for people to use.</p>}
              <Form onSubmit={(e) => submitForm(e)}>
                <Form.Group>
                  <Form.Label>Username:</Form.Label>
                  <Form.Control value={username} onChange={e => setUsername(e.target.value)}/>
                  {badName && <div className="text-danger">The username is invalid.</div>}
                  {nameConflict && <div className="text-danger">The username is already used by another account.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Password:</Form.Label>
                  <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                  {badPassword && <div className="text-danger">The password is invalid.</div>}
                  {notMatching && <div className="text-danger">The passwords do not match.</div>}
                </Form.Group>
                <Form.Group>
                  <Form.Label>Confirm password:</Form.Label>
                  <Form.Control type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                  {badConfirm && <div className="text-danger">The password confirmation is invalid.</div>}
                </Form.Group>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {type !== "root" && <Button onClick={() => navigate("/manage/accounts")}>Cancel</Button>}
                  </div>
                  <Button type="submit">Create</Button>
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
