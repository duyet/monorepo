const http = require("http");

const req = http.request(
  {
    hostname: "localhost",
    port: 3006,
    path: "/api/chat",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  },
  (res) => {
    const data = "";

    // In stream mode we just print exactly what we get
    res.on("data", (chunk) => {
      process.stdout.write(chunk.toString());
    });

    res.on("end", () => {
      console.log("\n---> Response Stream Complete <---");
    });
  }
);

req.on("error", (err) => {
  console.error("Request failed:", err);
});

req.write(
  JSON.stringify({
    messages: [{ role: "user", content: "What is your name?" }],
  })
);
req.end();
