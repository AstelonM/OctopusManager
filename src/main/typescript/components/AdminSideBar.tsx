import React, {useState} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import Nav from "react-bootstrap/Nav";

type ManageType = {
  type: string
}

export default function AdminSideBar() {
  const history = useHistory();
  const match = useRouteMatch("/manage/:type");
  const manage = match === null ? "servers" : (match.params as ManageType).type;
  const [selected, setSelected] = useState(manage);

  function selectTab(eventKey: string|null) {
    if (eventKey === "accounts") {
      history.push("/manage/accounts");
      setSelected("accounts");
    } else if (eventKey === "servers") {
      history.push("/manage/servers");
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
