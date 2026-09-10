import { redirectToAidr } from "./aidr-redirect";

export default {
  fetch(request: Request): Response {
    return (
      redirectToAidr(request) ??
      new Response("Not found", { status: 404 })
    );
  },
};
