import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Navigate, Routes, Route, useNavigate} from "react-router-dom";
import ServerListPage from "./pages/ServerListPage";
import ServerPage from "./pages/ServerPage";
import LoginPage from "./pages/LoginPage";
import axios from "axios";
import {Client} from "@stomp/stompjs";
import AccountCreationPage from "./pages/AccountCreationPage";
import {isAdmin, User} from "./Utils";
import UpdateAccountPage from "./pages/UpdateAccountPage";
import ManagePage from "./pages/ManagePage";
import ServerCreationPage from "./pages/ServerCreationPage";
import EditServerPage from "./pages/EditServerPage";

function App() {
  const [initialized, setInitialized] = useState<boolean|null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean|null>(null);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<User|null>(null);
  const navigate = useNavigate();
  const [webSocket, setWebSocket] = useState<Client|null>(null);
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  const consoleCacheSizeAttr = document.getElementById("consoleCacheSize")?.getAttribute("content");
  const consoleCacheSize = consoleCacheSizeAttr === undefined || consoleCacheSizeAttr === null ? 500 : +consoleCacheSizeAttr;
  const maxFileSizeAttr = document.getElementById("maxFileSize")?.getAttribute("content");
  const maxFileSize = maxFileSizeAttr === undefined || maxFileSizeAttr === null ? 2097152 : +maxFileSizeAttr;
  axios.defaults.xsrfCookieName = "XSRF-TOKEN";
  axios.defaults.validateStatus = function (status) {
    return status < 600;
  };

  useEffect(() => {
    async function isInitialized() {
      try {
        const response = await axios.get("/api/initialized");
        if (response.status === 204)
          setInitialized(true);
        else
          setInitialized(false);
      } catch (error) {
        setError(true);
      }
    }
    isInitialized();
  }, []);

  useEffect(() => {
    async function rememberMeCheck() {
      try {
        const response = await axios.get("/api/user");
        if (response.status === 204) {
          setLoggedIn(true);
          setUser(response.data);
        } else
          setLoggedIn(false);
      } catch (error) {
        setError(true);
      }
    }
    if (initialized)
      rememberMeCheck();
  }, [initialized]);

  useEffect(() => {
    let client: Client|null;
    if (loggedIn) {
      client = new Client();
      let protocol = "ws";
      if (window.location.protocol === "https:")
        protocol = "wss";
      client.brokerURL = `${protocol}://${window.location.host}/api/websocket`;
      client.reconnectDelay = 0;
      client.onConnect = () => {
        setWebSocket(client);
        setWebSocketConnected(true);
      };
      client.onWebSocketClose = () => {
        setWebSocket(null);
        setWebSocketConnected(false);
      };
      client.activate();
    } else {
      webSocket?.deactivate();
    }
    return (() => {
      client?.deactivate();
    });
  }, [loggedIn]);

  useEffect(() => {
    async function getToken() {
      try {
        await axios.get("/api/initialized");
      } catch (error) {
        setError(true);
      }
    }
    if (loggedIn === false)
      getToken();
  }, [loggedIn]);

  function initialize() {
    setInitialized(true);
  }

  function login(username: string, role: string) {
    setUser({username: username, role: role});
    setLoggedIn(true);
  }

  async function logout() {
    try {
      const response = await axios.post("/api/logout");
      if (response.status === 200) {
        setUser(null);
        setLoggedIn(false);
        navigate("/");
      }
    } catch (error) {
      setError(true);
    }
  }

  if (error) {
    return (
      <h5>Could not connect to the server!</h5>
    );
  }
  if (initialized)
    if (loggedIn)
      return (
        <Routes>
          <Route path="/server/:serverName/*" element={
            <ServerPage webSocket={webSocket} webSocketConnected={webSocketConnected} logoutFunction={logout} user={user}
                        consoleCacheSize={consoleCacheSize} maxFileSize={maxFileSize}/>
          }/>
          <Route path="/servers" element={
            <ServerListPage webSocket={webSocket} webSocketConnected={webSocketConnected} logoutFunction={logout} user={user}/>
          }/>
          <Route path="/initialize" element={<Navigate to="/" replace/>}/>
          <Route path="/account/:username" element={<UpdateAccountPage logoutFunction={logout} user={user}/>}/>
          <Route path="/newUser" element={
            isAdmin(user) ? <AccountCreationPage type="user" logoutFunction={logout} initialize={initialize}/> : <Navigate to="/servers"/>
          }/>
          <Route path="/newServer" element={
            isAdmin(user) ? <ServerCreationPage user={user} logoutFunction={logout}/> : <Navigate to="/servers"/>
          }/>
          <Route path="/manage/*" element={
            isAdmin(user) ? <ManagePage user={user} webSocket={webSocket} webSocketConnected={webSocketConnected}
                                        logoutFunction={logout}/> : <Navigate to="/servers"/>
          }/>
          <Route path="/editServer/:serverName" element={
            isAdmin(user) ? <EditServerPage user={user} logoutFunction={logout}/> : <Navigate to="/servers"/>
          }/>
          <Route path="/" element={<Navigate to="/servers"/>}/>
        </Routes>
      );
    else
      return (
        <Routes>
          <Route path="/" element={<LoginPage loginFunction={login} logoutFunction={logout}/>}/>
          <Route path="/*" element={<Navigate to="/" replace/>}/>
        </Routes>
      );
  else if (initialized === null)
    return (
      <div/>
    );
  else
    return (
      <Routes>
        <Route path="/initialize" element={<AccountCreationPage type="root" logoutFunction={logout} initialize={initialize}/>}/>
        <Route path="/" element={<Navigate to="/initialize"/>}/>
      </Routes>
    );
}

ReactDOM.render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>,
  document.getElementById("root")
);
