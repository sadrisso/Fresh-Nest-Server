const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.oq68b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const categoryCollection = client
      .db("groceryMartDB")
      .collection("categories");

    const productsCollection = client
      .db("groceryMartDB")
      .collection("products");

    app.get("/categories", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    app.get("/product/:category", async (req, res) => {
      const category = req.params.category;
      const filter = { category };
      const result = await productsCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = {id}
      const result = await productsCollection.findOne(query)
      res.send(result)
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send({ running: true });
});

app.listen(port, () => {
  console.log(`Surver running on port ${port}`);
});
