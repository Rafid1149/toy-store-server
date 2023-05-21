const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(express.json());

app.use(cors());


// console.log(process.env.DB_PASS);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.adcchii.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toyCollection = client.db('toystore').collection('collection');


    app.get('/toys', async(req , res ) =>{
        const cursor = toyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post( '/post-toy', async(req , res ) =>{
        const body = req.body;
        const result = await toyCollection.insertOne(body);
       if(result.insertedId){
        return res.send(result);
       }
       else{
        return res.status(404).send({ message: 'Invalid'})
       }
    })

    app.get("/myToys/:email", async (req, res) => {
        const query = { email: req.params.email}
        const toys = await toyCollection.find(query).toArray();
        res.send(toys);
      });

      app.get('/toysCategory', async (req, res) =>{
        const result = await toyCollection.find().toArray();
        const category = result.map((item) => item.category);
        const uniqueCategory = [...new Set(category)];
        res.send(uniqueCategory)
      })

      app.delete( '/toyDelete/:id', async (req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const result = await toyCollection.deleteOne(query);
        res.send(result);

      })

      app.get( '/toy/:id', async (req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const result = await toyCollection.findOne(query);
        res.send(result);
      })

      app.patch('/updateToy/:id', async (req, res) =>{
        const id = req.params.id;
        const body = req.body;
        const query ={_id: new ObjectId(id)};
        const updateDoc = {
            $set: {
              price: body.price,
              quantity: body.quantity,
              description: body.description,
            },
          };
          console.log(body , query , updateDoc);
        //   const result = await toyCollection.updateOne(query , updateDoc);
          const result = await toyCollection.updateOne(query, updateDoc)
          res.send(result);
      })
 

    // Ensures that the client will close when you finish/error
    // await client.close();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {


 

 
  }
}
run().catch(console.dir);




app.get( '/' , (req , res) =>{
res.send('server is running')
});

app.listen(port , () =>{
    console.log(`toy server listening on port ${port}`);
});