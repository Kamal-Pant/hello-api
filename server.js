const express = require("express");
const redis = require("redis");
const { Pool } = require("pg");

const app = express();

/* Redis */
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});
redisClient.connect();

/* Postgres */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date()
  });
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

