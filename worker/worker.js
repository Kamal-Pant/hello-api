const amqp = require("amqplib");

async function startWorker() {

  while (true) {
    try {

      const connection = await amqp.connect("amqp://rabbitmq");
      const channel = await connection.createChannel();

      const queue = "jobs";

      await channel.assertQueue(queue);

      console.log("Worker connected. Waiting for messages...");

      channel.consume(queue, (msg) => {

        const job = msg.content.toString();

        console.log("Processing job:", job);

        setTimeout(() => {
          console.log("Job completed:", job);
          channel.ack(msg);
        }, 2000);

      });

      break;

    } catch (err) {

      console.log("RabbitMQ not ready, retrying in 5 seconds...");
      await new Promise(r => setTimeout(r, 5000));

    }
  }

}

startWorker();

