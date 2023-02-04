import React from "react";
import {User} from "../Utils";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";
import {ButtonGroup} from "react-bootstrap";

type Props = {
  user: User
  currentUser: User|null
  deleteFunction: (user: string) => void
}

function canEditCheck(user: User, currentUser: User|null): boolean {
  if (currentUser === null)
    return false;
  if (currentUser.role === "ROOT")
    return true;
  if (user.username === currentUser.username)
    return true;
  return user.role === "USER";
}

export default function AccountListItem({user, currentUser, deleteFunction}: Props) {
  const canEdit = canEditCheck(user, currentUser);
  const canDelete = user.username !== currentUser?.username && user.role !== "ROOT";
  const history = useHistory();

  return (
    <tr>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td>
        {canEdit &&
        <ButtonGroup>
          <Button onClick={() => history.push(`/account/${user.username}`)}>Edit</Button>
          {canDelete && <Button variant="danger" onClick={() => deleteFunction(user.username)}>Delete</Button>}
        </ButtonGroup>}
      </td>
    </tr>
  );
}
