import { hydrateStart, StartClient } from "@tanstack/react-start/client";
import { getRouter } from "./router";

hydrateStart(<StartClient router={getRouter()} />);
