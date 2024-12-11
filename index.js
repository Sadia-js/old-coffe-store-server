const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 3000;

//middleware
app.use(cors({origin:['http://localhost:5173']}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hnbxf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const coffeeCollection = client.db('coffeeDB').collection('coffee');

    const userCollection = client.db('coffeeDB').collection('users');

    app.get('/coffee', async(req, res)=>{
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // update to server
    app.get('/coffee/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    })

    
    app.post('/coffee', async(req, res)=>{
      const newCoffee = req.body;
      console.log(newCoffee) 

      // send server data to the database
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    })

    // updating data send to database from server
    app.put('/coffee/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updatedCoffee = req.body;
      const coffee = {
        $set: {
          photo: updatedCoffee.photo, 
          quantity: updatedCoffee.quantity, 
          name: updatedCoffee.name, 
          supplier: updatedCoffee.supplier, 
          taste: updatedCoffee.taste, 
          category: updatedCoffee.category, 
          details: updatedCoffee.details,
        }
      }
      const result = await coffeeCollection.updateOne(filter, coffee, options);
      res.send(result);
    })

    app.delete('/coffee/:id', async(req, res)=>{
      const id = req.params.id;
      // console.log(id)
      const query = {_id : new ObjectId(id)};
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    })

    // users related api's
    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    app.post('/users', async(req, res)=>{
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    }) 

    app.patch('/users', async(req, res)=>{
      const user = req.body.email;
      const filter = {email : user};
      const updateDoc = {
        $set:{
          lastSignInTime : req.body?.lastSignIn,
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.delete('/users/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Coffee server making is running');
})

app.listen(port, ()=>{
    console.log(`Coffee server is running on ${port}`);
})