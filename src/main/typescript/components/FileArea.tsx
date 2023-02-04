import React, {FormEvent, useEffect, useState} from "react";
import {useRouteMatch, useHistory, useParams} from "react-router-dom";
import Card from "react-bootstrap/Card";
import axios from "axios";
import useFilePath from "../hooks/FilePath";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {ServerName} from "../Utils";

type Props = {
  setError: (error: string|null) => void
  setSuccess: (success: string|null) => void
}

export default function FileArea({setError, setSuccess}: Props) {
  const {url} = useRouteMatch();
  const {serverName} = useParams<ServerName>();
  const history = useHistory();
  const path = useFilePath() as string;
  const pathComponents = path.split("/");
  const fileName = pathComponents[pathComponents.length - 1];
  const [content, setContent] = useState("");

  useEffect(() => {
    async function getFileContent(url: string, path: string) {
      try {
        const response = await axios.get(`/api${url}?path=${path}`);
        if (response.status === 200)
          setContent(response.data);
        else
          setError("Could not retrieve the file content.");
      } catch (error) {
        setError("Could not retrieve the file content.");
      }
    }
    getFileContent(url, path);
  }, [url, path]);

  async function submitChanges() {
    try {
      const response = await axios.put(`/api${url}?path=${path}`, {newContent: content});
      if (response.status === 204)
        setSuccess("File content has been saved!");
      else
        setError("Could not save the file content.");
    } catch (error) {
      setError("Could not save the file content.");
    }
  }

  function saveFile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitChanges();
  }

  function closeFile() {
    history.push(`/server/${serverName}/files?path=${path.substring(0, path.length - fileName.length - 1)}`);
  }

  function downloadFile() {
    window.location.href = `/api/server/${serverName}/file?path=${path}`;
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 style={{"marginBottom": "0"}}>{fileName}</h5>
        <Button onClick={downloadFile}>Download</Button>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={(e) => saveFile(e)}>
          <Form.Control as="textarea" rows={24} value={content} className="bg-dark text-white"
                        onChange={(e) => setContent(e.target.value)}/>
          <Form.Group className="d-flex justify-content-between align-items-center">
            <Button onClick={closeFile}>Close</Button>
            <Button type="submit">Save</Button>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
}
