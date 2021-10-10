import {StompSubscription} from "@stomp/stompjs";

export interface Server {
  name: string
  status: string
}

export type ServerName = {
  serverName: string
}

export interface File {
  name: string
  directory: boolean
  size: number
  lastModified: number
}

export type User = {
  username: string
  role: string
}

export type LineType = {
  id: number
  text: string
}

export function isAdmin(user: User|null): boolean {
  if (user === null)
    return false;
  return user.role === "ROOT" || user.role === "ADMIN";
}

export function canStart(status: string|null): boolean {
  return status === "OFFLINE" || status === "CRASHED";
}

export type ServerSocketSub = {
  serverName: string
  subscription: StompSubscription
}
