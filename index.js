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

    const cartCollection = client.db("groceryMartDB").collection("cartItems");

    app.get("/categories", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const sortOption = req?.query?.sort || "default";
      const searchQuery = req?.query?.search || "";

      let sortQuery = {};
      let filterQuery = {};

      if (sortOption === "price-low") {
        sortQuery = { price: 1 }; // Ascending order
      } else if (sortOption === "price-high") {
        sortQuery = { price: -1 }; // Descending order
      } else if (sortOption === "stock") {
        sortQuery = { stock: -1 }; // Higher stock first
      }

      if (searchQuery) {
        filterQuery = { name: { $regex: searchQuery, $options: "i" } };
        // $options: "i" makes the search case-insensitive
      }

      const result = await productsCollection
        .find(filterQuery)
        .sort(sortQuery)
        .toArray();
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
      const query = { id };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/cartItem", async (req, res) => {
      const data = req.body;
      const result = await cartCollection.insertOne(data);
      res.send(result);
    });

    app.get("/cartItems", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });

    app.delete("/cartItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/increseQuantity/:id", async (req, res) => {
      const id = req.params.id;
      if (!id) {
        return res.status(400).send("Product ID is required");
      }

      let query = { _id: new ObjectId(id) }

      const result = await productsCollection.updateOne(
        query,
        { $inc: { quantity: 1 } }
      );

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
