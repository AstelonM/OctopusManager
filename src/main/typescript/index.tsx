import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Route, Switch, Redirect, useHistory} from "react-router-dom";
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
import {CompatRouter} from "react-router-dom-v5-compat";

function App() {
  const [initialized, setInitialized] = useState<boolean|null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean|null>(null);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<User|null>(null);
  const history = useHistory();
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
        history.push("/");
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
        <Switch>
          <Route path="/server/:serverName">
            <ServerPage webSocket={webSocket} webSocketConnected={webSocketConnected} logoutFunction={logout} user={user}
                        consoleCacheSize={consoleCacheSize} maxFileSize={maxFileSize}/>
          </Route>
          <Route path="/servers">
            <ServerListPage webSocket={webSocket} webSocketConnected={webSocketConnected} logoutFunction={logout} user={user}/>
          </Route>
          <Route path="/initialize">
            <Redirect to="/"/>
          </Route>
          <Route path="/account/:username">
            <UpdateAccountPage logoutFunction={logout} user={user}/>
          </Route>
          <Route path="/newUser">
            {isAdmin(user) ? <AccountCreationPage type="user" logoutFunction={logout} initialize={initialize}/> :
              <Redirect to="/servers"/>}
          </Route>
          <Route path="/newServer">
            {isAdmin(user) ? <ServerCreationPage user={user} logoutFunction={logout}/> : <Redirect to="/servers"/>}
          </Route>
          <Route path="/manage">
            {isAdmin(user) ? <ManagePage user={user} webSocket={webSocket} webSocketConnected={webSocketConnected}
                                         logoutFunction={logout}/> : <Redirect to="/servers"/>}
          </Route>
          <Route path="/editServer/:serverName">
            {isAdmin(user) ? <EditServerPage user={user} logoutFunction={logout}/> : <Redirect to="/servers"/>}
          </Route>
          <Route path="/">
            <Redirect to="/servers"/>
          </Route>
        </Switch>
      );
    else
      return (
        <Switch>
          <Route exact path="/">
            <LoginPage loginFunction={login} logoutFunction={logout}/>
          </Route>
          <Route path="/">
            <Redirect to="/"/>
          </Route>
        </Switch>
      );
  else if (initialized === null)
    return (
      <div/>
    );
  else
    return (
      <Switch>
        <Route path="/initialize">
          <AccountCreationPage type="root" logoutFunction={logout} initialize={initialize}/>
        </Route>
        <Route path="/">
          <Redirect to="/initialize"/>
        </Route>
      </Switch>
    );
}

ReactDOM.render(
  <BrowserRouter>
    <CompatRouter>
      <App/>
    </CompatRouter>
  </BrowserRouter>,
  document.getElementById("root")
);
