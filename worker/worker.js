const amqp = require("amqplib");

async function startWorker() {

  const connection = await amqp.connect("amqp://rabbitmq");
  const channel = await connection.createChannel();

  const queue = "jobs";

  await channel.assertQueue(queue);

  console.log("Worker waiting for messages...");

  channel.consume(queue, (msg) => {

    const job = msg.content.toString();

    console.log("Processing job:", job);

    // simulate job processing
    setTimeout(() => {
      console.log("Job completed:", job);
      channel.ack(msg);
    }, 2000);

  });

}

startWorker();

