import {
  StartServer,
  defaultStreamHandler,
} from "@tanstack/react-start/server"
import { getRouter } from "./router"

export default function handler(request: Request) {
  return defaultStreamHandler(request, () => (
    <StartServer router={getRouter()} />
  ))
}
