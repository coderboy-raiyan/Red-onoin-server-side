const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pqspl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// main connection starts here

async function run() {
  try {
    await client.connect();
    const database = client.db("red_onion");
    const orderCollection = database.collection("orders");
    const foodCollection = database.collection("foods");

    // get all foods
    app.get("/foods", async (req, res) => {
      const result = await foodCollection.find({}).toArray();
      res.send(result);
    });

    // get a single food
    app.get("/foods/:foodId", async (req, res) => {
      const foodId = req.params.foodId;
      const query = { _id: ObjectId(foodId) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    // get the ordered food
    app.get("/food/ordered/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await orderCollection.find(filter).toArray();
      res.send(result);
    });

    // add a order item
    app.post("/order", async (req, res) => {
      const food = req.body;
      const result = await orderCollection.insertOne(food);
      res.send(result);
    });

    // update increasing the quantity value of the order
    app.put("/order/update", async (req, res) => {
      const foodId = req.body.id;
      const email = req.body.email;
      const quantity = req.body.quantity + 1;
      const filter = { id: foodId, email: email };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          quantity: quantity,
        },
      };

      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // decrease increasing the quantity value of the order
    app.put("/order/decrease", async (req, res) => {
      const foodId = req.body.id;
      const email = req.body.email;
      const quantity = req.body.quantity - 1;
      const filter = { id: foodId, email: email };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          quantity: quantity,
        },
      };

      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Remove a order from the order collection
    app.delete("/order", async (req, res) => {
      const orderId = req.body.id;
      const email = req.body.email;
      const filter = { id: orderId, email: email };
      const result = await orderCollection.deleteOne(filter);
      res.send(result);
    });

    console.log("connected");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
