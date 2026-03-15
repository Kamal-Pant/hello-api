const express = require("express");
const redis = require("redis");
const { Pool } = require("pg");

const app = express();

/* Redis */
const redisClient = redis.createClient({
  url: "redis://redis:6379"
});
redisClient.connect();

/* Postgres */
const pool = new Pool({
  host: "postgres",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "appdb"
});

app.get("/", async (req, res) => {

  const cached = await redisClient.get("homepage");

  if (cached) {
    return res.send("From Redis Cache: " + cached);
  }

  const result = await pool.query("SELECT NOW()");

  const response = "Fresh Response - DB Time: " + result.rows[0].now;

  await redisClient.set("homepage", response, {
    EX: 60
  });

  res.send(response);

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

