import { StartClient, hydrateStart } from "@tanstack/react-start/client"
import { getRouter } from "./router"

hydrateStart(<StartClient router={getRouter()} />)
