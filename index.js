const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
//Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Helping Hand Server is running");
});

app.listen(port, () => {
  console.log("Server is running");
});

//Database Connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lywwz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client
      .db("helping-hands-db")
      .collection("volunteer-activities");
    //Displaying All Volunteer Services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //POST id
    app.post("/services", async (req, res) => {
      const selectedService = req.body;
      const selectedServiceCollection = client
        .db("helping-hands-db")
        .collection("events");
      const result = await selectedServiceCollection.insertOne(selectedService);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);
