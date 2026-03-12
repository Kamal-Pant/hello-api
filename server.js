const express = require("express");

const app = express();

app.get("/", (req, res) => {
	  res.send("Hello ji from Kamal DevOps Lab 🚀");
});

app.get("/health", (req, res) => {
	  res.json({
		      status: "OK",
		      service: "hello-api",
		    });
});

app.listen(3000, () => {
	  console.log("Server running on port 3000");
});
