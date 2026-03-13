const express = require("express");
const redis = require("redis");

const app = express();

const client = redis.createClient({
  url: "redis://redis:6379"
});

client.connect();

app.get("/", async (req, res) => {

  const cached = await client.get("homepage");

  if (cached) {
    return res.send("From Redis Cache: " + cached);
  }

  const response = "Hello from Node API " + new Date();

  await client.set("homepage", response, {
    EX: 60
  });

  res.send("Fresh Response: " + response);

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
