import React, {useState} from "react";
import Nav from "react-bootstrap/Nav";
import {useMatch, useNavigate} from "react-router-dom-v5-compat";

type ManageType = {
  type: string
}

export default function AdminSideBar() {
  const navigate = useNavigate();
  const match = useMatch("/manage/:type");
  const manage = match === null ? "servers" : (match.params as ManageType).type;
  const [selected, setSelected] = useState(manage);

  function selectTab(eventKey: string|null) {
    if (eventKey === "accounts") {
      navigate("/manage/accounts");
      setSelected("accounts");
    } else if (eventKey === "servers") {
      navigate("/manage/servers");
      setSelected("servers");
    }
  }

  return (
    <Nav className="flex-column bg-secondary justify-content-start sticky-top sidebar" variant="pills" activeKey={selected}
         onSelect={selectTab}>
      <Nav.Item>
        {selected === "servers" ?
          <Nav.Link eventKey="servers" active>Servers</Nav.Link> :
          <Nav.Link eventKey="servers">Servers</Nav.Link>
        }
      </Nav.Item>
      <Nav.Item>
        {selected === "accounts" ?
          <Nav.Link eventKey="accounts" active>Accounts</Nav.Link> :
          <Nav.Link eventKey="accounts">Accounts</Nav.Link>
        }
      </Nav.Item>
    </Nav>
  );
}
