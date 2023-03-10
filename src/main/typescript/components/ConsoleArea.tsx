import React, {FormEvent, useEffect, useState} from "react";
import Card from "react-bootstrap/Card";
import {canStart, LineType, ServerName} from "../Utils";
import Button from "react-bootstrap/Button";
import axios from "axios";
import {Client, IMessage, StompSubscription} from "@stomp/stompjs";
import Form from "react-bootstrap/Form";
import KillServerDialogue from "./KillServerDialogue";
import Console from "./Console";
import {useParams} from "react-router-dom";

let lastId = 0;

function trimArray(array: LineType[], maxLines: number) {
  if (array.length > maxLines)
    return array.slice(array.length - maxLines);
  return array;
}

type Props = {
  webSocket: Client|null
  webSocketConnected: boolean
  maxLines: number
  setError: (error: string|null) => void
}

export default function ConsoleArea({webSocket, webSocketConnected, maxLines, setError}: Props) {
  const {serverName} = useParams<"serverName">() as ServerName;
  const [onlineStatus, setOnlineStatus] = useState<string|null>(null);
  const [showKill, setShowKill] = useState(false);
  const [lines, setLines] = useState<LineType[]>([]);
  const [command, setCommand] = useState("");

  useEffect(() => {
    let serverSub: StompSubscription;
    async function getOnlineStatus(name: string) {
      try {
        const response = await axios.get(`/api/server/${name}/status`);
        if (response.status === 200) {
          setOnlineStatus(response.data);
          if (webSocket !== null && webSocketConnected) {
            serverSub = webSocket.subscribe(`/topic/status/${serverName}`, (message: IMessage) => {
              setOnlineStatus(message.body);
            });
          }
        } else
          setError("Could not get the status of the server.");
      } catch (error) {
        setError("Could not get the status of the server.");
      }
    }
    getOnlineStatus(serverName);
    return (() => {
      serverSub?.unsubscribe();
    });
  }, [serverName, webSocket, webSocketConnected]);

  useEffect(() => {
    let consoleSub: StompSubscription;
    async function startWebSocket() {
      try {
        const response = await axios.get(`/api/server/${serverName}/console`);
        if (response.status === 200) {
          const lineList = response.data.map((line: string) => ({id: lastId++, text: line}));
          setLines(lineList);
          if (webSocket !== null && webSocketConnected) {
            consoleSub = webSocket.subscribe(`/topic/console/${serverName}`, (message: IMessage) => {
              setLines(previousLines => trimArray(previousLines.concat({id: lastId++, text: message.body}), maxLines));
            });
          }
        } else {
          setError("Could not get the console of the server.");
        }
      } catch (error) {
        setError("Could not get the console of the server.");
      }
    }
    startWebSocket();
    return (() => {
      consoleSub?.unsubscribe();
    });
  }, [serverName, webSocket, webSocketConnected]);

  async function startServer() {
    try {
      const response = await axios.post(`/api/server/${serverName}/start`);
      if (response.status !== 204)
        setError(`The server ${serverName} could not be started.`);
    } catch (error) {
      setError(`The server ${serverName} could not be started.`);
    }
  }
  async function stopServer() {
    try {
      const response = await axios.post(`/api/server/${serverName}/stop`);
      if (response.status !== 204)
        setError(`The server ${serverName} could not be stopped.`);
    } catch (error) {
      setError(`The server ${serverName} could not be stopped.`);
    }
  }
  async function killServer() {
    try {
      const response = await axios.post(`/api/server/${serverName}/kill`);
      if (response.status !== 204)
        setError(`The server ${serverName} could not be killed.`);
    } catch (error) {
      setError(`The server ${serverName} could not be killed.`);
    }
  }
  async function restartServer() {
    try {
      const response = await axios.post(`/api/server/${serverName}/restart`);
      if (response.status !== 204)
        setError(`The server ${serverName} could not be restarted.`);
    } catch (error) {
      setError(`The server ${serverName} could not be restarted.`);
    }
  }

  async function sendCommand() {
    try {
      const response = await axios.post(`/api/server/${serverName}/console`, {command: command});
      if (response.status !== 204)
        setError("Could not send the command to the server.");
    } catch (error) {
      setError("Could not send the command to the server.");
    }
    setCommand("");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (command !== null && command.trim().length !== 0)
      sendCommand();
  }

  function confirmKill() {
    killServer();
    setShowKill(false);
  }

  return (
    <Card>
      {showKill && <KillServerDialogue serverName={serverName} closeFunction={() => setShowKill(false)}
                                       confirmFunction={confirmKill}/>}
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 style={{"marginBottom": "0"}}>Console - {serverName}</h5>
        <div>
          {canStart(onlineStatus) && <Button variant="success"
                                                 onClick={startServer}>Start</Button>}
          {onlineStatus === "ONLINE" && <Button variant="warning"
                                                onClick={stopServer}>Stop</Button>}
          {onlineStatus === "ONLINE" && <Button variant="danger" onClick={() => setShowKill(true)}>Kill</Button>}
          {onlineStatus === "ONLINE" && <Button variant="primary" onClick={restartServer}>Restart</Button>}
        </div>
      </Card.Header>
      <Console lines={lines}/>
      <Card.Body>
        <Form className="d-inline-flex align-items-stretch" style={{"width": "100%"}} onSubmit={e => submitForm(e)}>
          <Form.Control value={command} onChange={e => setCommand(e.target.value)}/>
          <Button variant="secondary" type="submit">Send</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
