import React, {useEffect, useState} from "react";
import {User} from "../Utils";
import Card from "react-bootstrap/Card";
import {Table} from "react-bootstrap";
import AccountListItem from "./AccountListItem";
import axios from "axios";
import Button from "react-bootstrap/Button";
import {useNavigate} from "react-router-dom-v5-compat";

type Props = {
  user: User|null
  setError: (error: string|null) => void
}

export default function AccountListArea({user, setError}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [reload, setReload] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function getUsers() {
      try {
        const response = await axios.get("/api/users");
        if (response.status === 200)
          setUsers(response.data);
        else
          setError("Could not retrieve the users.");
      } catch (error) {
        setError("Could not retrieve the users.");
      }
    }
    getUsers();
  }, [reload]);

  async function deleteUser(user: string) {
    try {
      const response = await axios.delete(`/api/accounts/${user}/delete`);
      if (response.status === 204)
        setReload(!reload);
      else
        setError("Could not delete the user.");
    } catch (error) {
      setError("Could not delete the user.");
    }
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="no-bottom-margin">Accounts</Card.Title>
        <Button onClick={() => navigate("/newUser")}>New Account</Button>
      </Card.Header>
      <Card.Body>
        <Table striped bordered variant="dark">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <AccountListItem key={u.username} user={u} currentUser={user} deleteFunction={deleteUser}/>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
