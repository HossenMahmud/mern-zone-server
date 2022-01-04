const express = require('express');
const { MongoClient } = require('mongodb');
require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tkbxn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("Mern_Zone");
        const usersCollection = database.collection("users");
        const postsCollection = database.collection("posts");


        // Add user into database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
            console.log(result)
        });

        // User update if user stay in database
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Add Admin role user 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
            console.log(result);
        });

        // get user is Admin?
        app.get('/users/:email/', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        });


        // POST API Add (new Post)
        app.post('/addPost', async (req, res) => {
            const newPost = req.body;
            const result = await postsCollection.insertOne(newPost);
            res.send(result);
        });

        // get all Post
        app.get('/posts', async (req, res) => {
            const cursor = postsCollection.find({});
            const posts = await cursor.toArray();
            res.send(posts);
        });


        // Here Your work
        //GET Single Post/Blog API
        app.get('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const postItem = await postsCollection.findOne(query);
            res.send(postItem);
        });

        // Get My Post/blog
        app.get("/blogs/:email", async (req, res) => {
            const result = await postsCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is Running')
})

app.listen(port, () => {
    console.log('Listening to port', port)
})