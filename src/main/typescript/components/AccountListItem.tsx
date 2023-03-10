import React from "react";
import {User} from "../Utils";
import Button from "react-bootstrap/Button";
import {ButtonGroup} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <tr>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td>
        {canEdit &&
        <ButtonGroup>
          <Button onClick={() => navigate(`/account/${user.username}`)}>Edit</Button>
          {canDelete && <Button variant="danger" onClick={() => deleteFunction(user.username)}>Delete</Button>}
        </ButtonGroup>}
      </td>
    </tr>
  );
}
