import React, {useState} from "react";
import Nav from "react-bootstrap/Nav";
import {ServerName} from "../Utils";
import {useMatch, useNavigate} from "react-router-dom";

type LocationType = {
  location: string
}

export default function SideBar({serverName}: ServerName) {
  const navigate = useNavigate();
  const match = useMatch("/server/:serverName/:location");
  const location = match === null ? "console" : (match.params as LocationType).location;
  const [selected, setSelected] = useState(location);

  function selectTab(eventKey: string|null) {
    if (eventKey === "files") {
      navigate(`/server/${serverName}/files`);
      setSelected("files");
    } else {
      navigate(`/server/${serverName}/console`);
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
