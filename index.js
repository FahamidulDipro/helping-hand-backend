const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const selectedServiceCollection = client
      .db("helping-hands-db")
      .collection("events");
    //Adding New Volunteer Service
    app.post("/addServices", async (req, res) => {
      const addedService = req.body;
      const result = await serviceCollection.insertOne(addedService);
      res.send(result);
    });
    //Adding Unique Services to the events(Selection)
    app.post("/services", async (req, res) => {
      const selectedService = req.body;

      const doc = {
        name: selectedService.name,
        img: selectedService.img,
        detail: selectedService.detail,
        bgcolor: selectedService.bgcolor,
      };
      const foundServiceCursor = selectedServiceCollection.find(doc);
      const foundService = await foundServiceCursor.toArray();
      console.log(foundService.length);
      if (foundService.length !== 0) {
        console.log("Service already exists");
      } else {
        console.log("Service added");
        const result = await selectedServiceCollection.insertOne(doc);
        res.send(result);
      }
    });

    //Get the events
    app.get("/selected-services", async (req, res) => {
      const query = {};
      const cursor = selectedServiceCollection.find(query);
      const selectedServices = await cursor.toArray();
      res.send(selectedServices);
    });

    //Delete any event
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      console.log(query);
      const result = await selectedServiceCollection.deleteOne(query);

      res.send(result);
    });
    //Adding Registered Volunteers to database
    const registeredVolunteerCollection = client
      .db("helping-hands-db")
      .collection("registered-volunteers");
    app.post("/register-as-volunteer", async (req, res) => {
      const registeredVolunteer = req.body;
      const result = await registeredVolunteerCollection.insertOne(
        registeredVolunteer
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);
