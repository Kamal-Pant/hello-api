const express = require("express");
const redis = require("redis");
const { Pool } = require("pg");

const app = express();

/* Prometheus */
const client = require("prom-client");
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

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

const amqp = require("amqplib");

async function publishJob(message) {
  const connection = await amqp.connect("amqp://rabbitmq");
  const channel = await connection.createChannel();

  const queue = "jobs";

  await channel.assertQueue(queue);

  channel.sendToQueue(queue, Buffer.from(message));

  console.log("Job sent:", message);
}

app.get("/job", async (req, res) => {

  await publishJob("process-order");

  res.send("Job published to RabbitMQ");

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

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

