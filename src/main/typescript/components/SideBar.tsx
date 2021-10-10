import React, {useState} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import {ServerName} from "../Utils";

type LocationType = {
  location: string
}

export default function SideBar({serverName}: ServerName) {
  const history = useHistory();
  const match = useRouteMatch("/server/:serverName/:location");
  const location = match === null ? "console" : (match.params as LocationType).location;
  const [selected, setSelected] = useState(location);

  function selectTab(eventKey: string|null) {
    if (eventKey === "files") {
      history.push(`/server/${serverName}/files`);
      setSelected("files");
    } else {
      history.push(`/server/${serverName}/console`);
      setSelected("console");
    }
  }

  return (
    <Nav className="flex-column bg-secondary justify-content-start sticky-top sidebar" variant="pills" activeKey={selected} onSelect={selectTab}>
      <Nav.Item>
        {selected === "console" ?
          <Nav.Link eventKey="console" active>Console</Nav.Link> :
          <Nav.Link eventKey="console">Console</Nav.Link>
        }
      </Nav.Item>
      <Nav.Item>
        {selected === "files" || selected === "file" ?
          <Nav.Link eventKey="files" active>Files</Nav.Link> :
          <Nav.Link eventKey="files">Files</Nav.Link>
        }
      </Nav.Item>
    </Nav>
  );
}
