import React, {ChangeEvent, useState} from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Button from "react-bootstrap/Button";
import {File} from "../Utils";

type Props = {
  file: File
  openFile: (file: string, directory: boolean, size: number) => void
  serverDirectory: boolean
  openRenameDialogue: (file: string) => void
  deleteFile: (file: string) => void
  startMoving: (file: string) => void
  startCopying: (file: string) => void
  download: (file: string) => void
  select: (file: string, checked: boolean) => void
  decompress: (file: string) => void
}

function getReadableSize(size: number): string {
  if (size >= 1073741824)
    return `${Math.round(size / 1073741824 * 100) / 100} GB`;
  else if (size >= 1048576)
    return `${Math.round(size / 1048576 * 100) / 100} MB`;
  else if (size >= 1024)
    return `${Math.round(size / 1024 * 100) / 100} KB`;
  else
    return `${size} B`;
}

export default function FileListItem({file, openFile, serverDirectory, openRenameDialogue, deleteFile, startMoving,
                                       startCopying, download, select, decompress}: Props) {
  const [checked, setChecked] = useState(false);

  function check(event: ChangeEvent<HTMLInputElement>) {
    setChecked(event.target.checked);
    select(file.name, event.target.checked);
  }

  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center" action
                    onClick={() => openFile(file.name, file.directory, file.size)} as="div">
      <div className="d-flex justify-content-start align-items-center">
        {!serverDirectory &&
        <div className="form-check">
          <input type="checkbox" className="form-check-input position-static"
                 style={{"width": "15px", "height": "15px", "marginRight": "10px"}} checked={checked}
                 onChange={e => check(e)} onClick={e => e.stopPropagation()}/>
        </div>}
        {file.directory ?
        <div style={{"marginRight": "8px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z"/>
          </svg>
        </div> :
        <div style={{"marginRight": "8px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/>
          </svg>
        </div>}
        <div>
          <h6>{file.name}</h6>
          <small>{`Last modified ${new Date(file.lastModified).toLocaleString()} | Size: ${getReadableSize(file.size)}`}</small>
        </div>
      </div>
      <div>
        {!serverDirectory &&
        <DropdownButton title="Options" onClick={event => event.stopPropagation()}>
          <Dropdown.Item as={Button} onClick={event => {
            event.stopPropagation();
            startMoving(file.name);
          }}>Move</Dropdown.Item>
          <Dropdown.Item as={Button} onClick={event => {
            event.stopPropagation();
            startCopying(file.name);
          }}>Copy</Dropdown.Item>
          <Dropdown.Item as={Button} onClick={event => {
            event.stopPropagation();
            openRenameDialogue(file.name);
          }}>Rename</Dropdown.Item>
          <Dropdown.Item as={Button} onClick={event => {
            event.stopPropagation();
            deleteFile(file.name);
          }}>Delete</Dropdown.Item>
          {file.name.endsWith(".zip") &&
          <Dropdown.Item as={Button} onClick={event => {
            event.stopPropagation();
            decompress(file.name);
          }}>Decompress</Dropdown.Item>}
          {!file.directory &&
          <Dropdown.Item as={Button} onClick={event => {
            event.stopPropagation();
            download(file.name);
          }}>Download</Dropdown.Item>}
        </DropdownButton>}
      </div>
    </ListGroup.Item>
  );
}
