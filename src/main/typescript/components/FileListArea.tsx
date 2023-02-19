import React, {useEffect, useRef, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {File, ServerName} from "../Utils";
import axios from "axios";
import ListGroup from "react-bootstrap/ListGroup";
import FileListItem from "./FileListItem";
import useFilePath from "../hooks/FilePath";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import FormDialogue from "./FormDialogue";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import {useNavigate} from "react-router-dom-v5-compat";

type PathLink = {
  key: string
  link: JSX.Element
}

function computePathLinks(path: string|null, serverName: string): PathLink[] {
  let result: PathLink[] = [];
  if (path === null) {
    return result;
  }
  const directories = path.split("/");
  for (let i = 0; i < directories.length - 1; i++) {
    let link = "";
    for (let j = 0; j <= i; j++)
      link = link + "/" + directories[j];
    link = link.slice(1);

    result = result.concat({key: `breadcrumb${i}`, link: <Link to={`/server/${serverName}/files?path=${link}`}>{directories[i]}</Link>});
  }
  const lastIndex = directories.length - 1;
  return result.concat({key: `breadcrumb${lastIndex}`, link: <span style={{"color": "#fff"}}>{directories[lastIndex]}</span>});
}

function getBackPath(path: string|null): string|null {
  if (path === null)
    return null;
  const directories = path.split("/");
  if (directories.length === 1)
    return null;
  return path.replace(`/${directories[directories.length - 1]}`, "");
}

type Props = {
  maxFileSize: number
  setError: (error: string|null) => void
}

//TODO replace absolute paths with relative?
export default function FileListArea({maxFileSize, setError}: Props) {
  const {serverName} = useParams<ServerName>();
  const [files, setFiles] = useState<File[]>([]);
  const [multipleDirectories, setMultipleDirectories] = useState<boolean|null>(null);
  const path = useFilePath();
  const backPath = getBackPath(path);
  const pathLinks = computePathLinks(path, serverName);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showDirectory, setShowDirectory] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renamedFile, setRenamedFile] = useState("");
  const [showArchive, setShowArchive] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);

  const [moving, setMoving] = useState<string|null>(null);
  const [copying, setCopying] = useState<string|null>(null);

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [movingMultiple, setMovingMultiple] = useState<string[]|null>(null);
  const [copyingMultiple, setCopyingMultiple] = useState<string[]|null>(null);

  useEffect(() => {
    async function getDirectories() {
      try {
        const response = await axios.get(`/api/server/${serverName}/directories`);
        if (response.status === 200) {
          const dirs = response.data as File[];
          if (dirs.length === 0)
            setError("The server has no directory and is thus invalid.");
          else if (dirs.length === 1)
            setMultipleDirectories(false);
          else
            setMultipleDirectories(true);
        } else {
          setError("Could not retrieve the directories of the server.");
        }
      } catch (error) {
        setError("Could not retrieve the directories of the server.");
      }
    }
    getDirectories();
  }, [serverName]);

  useEffect(() => {
    async function getFiles() {
      try {
        let response;
        if (path === null) {
          response = await axios.get(`/api/server/${serverName}/directories`);
          if (response.status === 200) {
            const dirs = response.data as File[];
            if (dirs.length === 0)
              setError("The server has no directory and is thus invalid.");
            else if (dirs.length === 1) {
              navigate(`/server/${serverName}/files?path=${dirs[0].name}`);
            } else {
              setFiles(response.data);
              setSelectedFiles([]);
            }
          } else {
            setError("Could not retrieve the directories of the server.");
          }
        } else {
          setLoading(true);
          response = await axios.get(`/api/server/${serverName}/files?path=${path}`);
          if (response.status === 200) {
            setFiles(response.data);
            setSelectedFiles([]);
          } else {
            setError("Could not retrieve the files of the server.");
          }
          setLoading(false);
        }
      } catch (error) {
        setError("Could not retrieve the files of the server.");
        setLoading(false);
      }
    }
    getFiles();
  }, [path, reload, serverName]);

  function openFile(file: string, directory: boolean, size: number) {
    if (directory) {
      if (path === null) {
        navigate(`/server/${serverName}/files?path=${file}`);
      } else {
        navigate(`/server/${serverName}/files?path=${path}/${file}`);
      }
    } else {
      if (size >= maxFileSize)
        window.location.href = `/api/server/${serverName}/file?path=${path}/${file}`;
      else
        navigate(`/server/${serverName}/file?path=${path}/${file}`);
    }
  }

  function openRenameDialogue(file: string) {
    setRenamedFile(file);
    setShowRename(true);
  }

  function startMoving(file: string) {
    setCopying(null);
    setMoving(`${path}/${file}`);
  }

  function startCopying(file: string) {
    setMoving(null);
    setCopying(`${path}/${file}`);
  }

  function stopMovingOrCopying() {
    setMoving(null);
    setCopying(null);
  }

  async function createDirectory(name: string) {
    setShowDirectory(false);
    try {
      const response = await axios.post(`/api/server/${serverName}/files/newDirectory?path=${path}`, {name: name});
      if (response.status === 201)
        setReload(!reload);
      else if (response.status === 409)
        setError("The name is already used.");
      else
        setError("Could not create the directory.");
    } catch (error) {
      setError("Could not create the directory.");
    }
  }

  async function createFile(name: string) {
    setShowFile(false);
    try {
      const response = await axios.post(`/api/server/${serverName}/files/newFile?path=${path}`, {name: name});
      if (response.status === 201)
        setReload(!reload);
      else if (response.status === 409)
        setError("The name is already used.");
      else
        setError("Could not create the file.");
    } catch (error) {
      setError("Could not create the file.");
    }
  }

  async function uploadFile(input: HTMLInputElement) {
    try {
      const fileList = input.files;
      if (fileList !== null) {
        const file = fileList[0];
        if (file !== null) {
          const formData = new FormData();
          formData.append("file", file, file.name);
          const response = await axios.post(`/api/server/${serverName}/files/upload?path=${path}`, formData, {
            headers: {
              "content-type": "multipart/form-data"
            }
          });
          if (response.status === 201)
            setReload(!reload);
          else if (response.status === 409)
            setError("The name of the uploaded file is already in use.");
          else
            setError("Could not upload the file.");
        }
      }
    } catch (error) {
      setError("Could not upload the file.");
    }
  }

  async function renameFile(newName: string) {
    setShowRename(false);
    try {
      const response = await axios.patch(`/api/server/${serverName}/files?path=${path}/${renamedFile}`, {newName: newName});
      setRenamedFile("");
      if (response.status === 204)
        setReload(!reload);
      else if (response.status === 409)
        setError("The name is already used.");
      else
        setError("Could not rename the file.");
    } catch (error) {
      setError("Could not rename the file.");
    }
  }

  async function deleteFile(file: string) {
    try {
      const response = await axios.delete(`/api/server/${serverName}/files?path=${path}/${file}`);
      if (response.status === 204)
        setReload(!reload);
      else
        setError("Could not delete the file.");
    } catch (error) {
      setError("Could not delete the file.");
    }
  }

  async function moveFile() {
    try {
      const response = await axios.post(`/api/server/${serverName}/files/move?path=${path}`, {sourcePath: moving});
      if (response.status === 204) {
        stopMovingOrCopying();
        setReload(!reload);
      } else if (response.status === 409)
        setError("The name of the moved file is already used at the destination.");
      else
        setError("Could not move the file.");
    } catch (error) {
      setError("Could not move the file.");
    }
  }

  async function copyFile() {
    try {
      const response = await axios.post(`/api/server/${serverName}/files/copy?path=${path}`, {sourcePath: copying});
      if (response.status === 204) {
        stopMovingOrCopying();
        setReload(!reload);
      } else if (response.status === 409)
        setError("The name of the copied file is already used at the destination.");
      else
        setError("Could not copy the file.");
    } catch (error) {
      setError("Could not copy the file.");
    }
  }

  async function downloadFile(file: string) {
    window.location.href = `/api/server/${serverName}/file?path=${path}/${file}`;
  }

  function selectFile(file: string, checked: boolean) {
    if (checked) {
      setSelectedFiles(selectedFiles => selectedFiles.concat(`${path}/${file}`));
    } else {
      setSelectedFiles(selectedFiles => selectedFiles.filter(f => f !== `${path}/${file}`));
    }
  }

  function startMovingMultiple() {
    stopMovingOrCopying();
    setCopyingMultiple(null);
    setMovingMultiple(selectedFiles);
  }

  function startCopyingMultiple() {
    stopMovingOrCopying();
    setMovingMultiple(null);
    setCopyingMultiple(selectedFiles);
  }

  function stopMovingOrCopyingMultiple() {
    setMovingMultiple(null);
    setCopyingMultiple(null);
  }

  async function moveFiles() {
    try {
      const response = await axios.post(`/api/server/${serverName}/files/move/multiple?path=${path}`,
        {files: movingMultiple});
      if (response.status === 204) {
        stopMovingOrCopyingMultiple();
        setReload(!reload);
      } else
        setError("Could not move the files.");
    } catch (error) {
      setError("Could not move the files.");
    }
  }

  async function copyFiles() {
    try {
      const response = await axios.post(`/api/server/${serverName}/files/copy/multiple?path=${path}`,
        {files: copyingMultiple});
      if (response.status === 204) {
        stopMovingOrCopyingMultiple();
        setReload(!reload);
      } else
        setError("Could not copy the files.");
    } catch (error) {
      setError("Could not copy the files.");
    }
  }

  async function deleteFiles() {
    try {
      const response = await axios.post(`/api/server/${serverName}/files/delete/multiple?path=${path}`,
        {files: selectedFiles});
      if (response.status === 204) {
        setSelectedFiles([]);
        setReload(!reload);
      } else
        setError("Could not delete the files.");
    } catch (error) {
      setError("Could not delete the files.");
    }
  }

  async function compressFiles(name: string) {
    setShowArchive(false);
    try {
      const response = await axios.post(`/api/server/${serverName}/files/compress?path=${path}/${name}.zip`,
        {files: selectedFiles});
      if (response.status === 204) {
        setSelectedFiles([]);
        setReload(!reload);
      } else if (response.status === 409)
        setError("The name of the archive is already in use.");
      else
        setError("Could not create the archive.");
    } catch (error) {
      setError("Could not create the archive.");
    }
  }

  async function decompressFile(file: string) {
    try {
      const response = await axios.post(`/api/server/${serverName}/files/decompress?path=${path}/${file}`);
      if (response.status === 204) {
        setReload(!reload);
      } else
        setError("Could not unzip the archive.");
    } catch (error) {
      setError("Could not unzip the archive.");
    }
  }

  return (
    <Card>
      {showDirectory &&
      <FormDialogue type="directory" createFunction={createDirectory}
                    closeFunction={() => setShowDirectory(false)}/>}
      {showFile &&
      <FormDialogue type="file" createFunction={createFile}
                    closeFunction={() => setShowFile(false)}/>}
      {showRename &&
      <FormDialogue type="rename" createFunction={renameFile}
                    closeFunction={() => setShowRename(false)} originalName={renamedFile}/>}
      {showArchive &&
      <FormDialogue type="archive" createFunction={compressFiles}
                    closeFunction={() => setShowArchive(false)}/>}
      {path !== null ?
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <Card.Title>Files - {serverName}</Card.Title>
          {loading && <h5 className="no-bottom-margin">Loading...</h5>}
        </div>
        <div className="d-flex justify-content-start align-items-center">
          {(backPath === null && multipleDirectories) &&
          <Button style={{"padding": "0"}} variant="secondary" onClick={() => navigate(`/server/${serverName}/files`)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd"
                      d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
            </svg>
          </Button>}
          {backPath !== null &&
          <Button style={{"padding": "0"}} variant="secondary" onClick={() => navigate(`/server/${serverName}/files?path=${backPath}`)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd"
                    d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
            </svg>
          </Button>}
          <Breadcrumb>
            {pathLinks.map(pathLink => (
              <Breadcrumb.Item key={pathLink.key} active as="h5" className="no-bottom-margin">
                {pathLink.link}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
      </Card.Header> :
      <Card.Header>
        <Card.Title className="no-bottom-margin">Directories - {serverName}</Card.Title>
      </Card.Header>}
      <Card.Body className="d-flex justify-content-between align-items-center no-bottom-padding">
        <div>
          {moving !== null && <Card.Text>Moving file: {moving}</Card.Text>}
          {copying !== null && <Card.Text>Copying file: {copying}</Card.Text>}
          {movingMultiple !== null && <Card.Text>Moving multiple files</Card.Text>}
          {copyingMultiple !== null && <Card.Text>Copying multiple files</Card.Text>}
        </div>
        <div>
          {path !== null &&
          <div>
            {moving !== null &&
            <span>
              <Button onClick={stopMovingOrCopying}>Cancel</Button>
              <Button onClick={moveFile}>Paste</Button>
            </span>}
            {copying != null &&
            <span>
              <Button onClick={stopMovingOrCopying}>Cancel</Button>
              <Button onClick={copyFile}>Paste</Button>
            </span>}
            {movingMultiple !== null &&
            <span>
              <Button onClick={stopMovingOrCopyingMultiple}>Cancel</Button>
              <Button onClick={moveFiles}>Paste</Button>
            </span>}
            {copyingMultiple != null &&
            <span>
              <Button onClick={stopMovingOrCopyingMultiple}>Cancel</Button>
              <Button onClick={copyFiles}>Paste</Button>
            </span>}
            <Button onClick={() => setShowDirectory(true)}>New Directory</Button>
            <Button onClick={() => setShowFile(true)}>New File</Button>
            <input ref={fileInput} className="d-none" type="file" onChange={(e) => uploadFile(e.target)}/>
            <Button onClick={() => fileInput.current?.click()}>UploadFile</Button>
            {selectedFiles.length !== 0 &&
            <DropdownButton className="d-inline" title="Mass actions">
                <Dropdown.Item as={Button} onClick={startMovingMultiple}>Move</Dropdown.Item>
                <Dropdown.Item as={Button} onClick={startCopyingMultiple}>Copy</Dropdown.Item>
                <Dropdown.Item as={Button} onClick={deleteFiles}>Delete</Dropdown.Item>
                <Dropdown.Item as={Button} onClick={() => setShowArchive(true)}>Compress</Dropdown.Item>
            </DropdownButton>
            }
          </div>}
        </div>
      </Card.Body>
      <Card.Body>
        <ListGroup>
          {files.length === 0 ? <p>This directory is empty.</p> :
          files.map(file => (
            <FileListItem key={file.name} file={file} openFile={openFile} serverDirectory={path === null}
                          openRenameDialogue={openRenameDialogue} deleteFile={deleteFile} startMoving={startMoving}
                          startCopying={startCopying} download={downloadFile} select={selectFile} decompress={decompressFile}/>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
