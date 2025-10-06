const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xclxgx7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('gameReviewDB');
    const reviewsCollection = db.collection('review');
    const watchlistCollection = db.collection('watchlist');

    console.log("MongoDB connected");

    // ---------------- Reviews Routes ----------------

    // Get all reviews
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // Get single review by ID
    app.get('/reviews/:id', async (req, res) => {
      try {
        const review = await reviewsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!review) return res.status(404).send({ message: "Review not found" });
        res.send(review);
      } catch {
        res.status(400).send({ message: "Invalid ID format" });
      }
    });

    // Add a new review
    app.post('/reviews', async (req, res) => {
      const result = await reviewsCollection.insertOne(req.body);
      res.send(result);
    });

    // Update a review
    app.put('/reviews/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updateDoc = { $set: req.body };
        const result = await reviewsCollection.updateOne({ _id: new ObjectId(id) }, updateDoc);
        if (result.matchedCount === 0) return res.status(404).send({ message: "Review not found" });
        res.send({ message: "Review updated", result });
      } catch {
        res.status(400).send({ message: "Invalid ID format" });
      }
    });

    // Delete a review
    app.delete('/reviews/:id', async (req, res) => {
      const result = await reviewsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    // Top-rated reviews
    app.get('/top-rated', async (req, res) => {
      try {
        const topRated = await reviewsCollection.find().sort({ rating: -1 }).limit(6).toArray();
        res.send(topRated);
      } catch (err) {
        res.status(500).send({ message: "Error fetching top-rated", error: err.message });
      }
    });

    // Reviews of a user
    app.get('/myreviews', async (req, res) => {
      const email = req.query.email;
      const result = await reviewsCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    // ---------------- Watchlist Routes ----------------
    const watchlistRouter = express.Router();

    // Add to watchlist
    watchlistRouter.post('/', async (req, res) => {
      const { userEmail, game } = req.body;
      const exists = await watchlistCollection.findOne({ userEmail, "game._id": game._id });
      if (exists) return res.status(400).send({ message: "Game already in watchlist" });
      const result = await watchlistCollection.insertOne({ userEmail, game });
      res.send(result);
    });

    // Get user's watchlist
    watchlistRouter.get('/:email', async (req, res) => {
      const games = await watchlistCollection.find({ userEmail: req.params.email }).toArray();
      res.send(games);
    });

    // Delete from watchlist
    watchlistRouter.delete('/:id', async (req, res) => {
      const result = await watchlistCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    app.use('/watchlist', watchlistRouter);

  } catch (err) {
    console.error(err);
  }
}

// Run server
run().catch(console.dir);

// Test route
app.get('/', (req, res) => res.send('Gaming Server is running...'));

// Listen
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));



























































































































































































































































































































































































































































// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const Review = require("./Review");
// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xclxgx7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri);
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// const router = express.Router();
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     //  client side data transfrom to server side to mongodb
//     const reviewsCollection = client.db('reviewDb').collection('review');

//     // mongodb data show ui
//     app.get('/reviews', async (req, res) => {
//       const cursor = reviewsCollection.find();
//       const result = await cursor.toArray();
//       res.send(result);
//     })

//     // single review fetch by ID
//     app.get("/reviews/:id", async (req, res) => {
//       const { id } = req.params;
//       try {
//         const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
//         if (!review) return res.status(404).send({ message: "Review not found" });
//         res.send(review);
//       } catch (error) {
//         res.status(500).send({ message: "Invalid ID format" });
//       }
//     });

//     // server.js or routes/reviews.js
//     // top-rated route using MongoClient
//     app.get("/top-rated", async (req, res) => {
//       try {
//         const cursor = reviewsCollection.find().sort({ rating: -1 }).limit(6);
//         const topRated = await cursor.toArray();
//         res.send(topRated);
//       } catch (err) {
//         console.error("Top-rated error:", err);
//         res.status(500).json({
//           message: "Error fetching top-rated games",
//           error: err.message,
//         });
//       }
//     });

//     app.post('/reviews', async (req, res) => {
//       const newReview = req.body;
//       console.log(newReview);
//       const result = await reviewsCollection.insertOne(newReview);
//       res.send(result);
//     })

//     // Add game to watchlist
//     router.post('/', async (req, res) => {
//       const { userEmail, game } = req.body;

//       // Check duplicate
//       const exists = await watchlistCollection.findOne({ userEmail, "game._id": game._id });
//       if (exists) return res.status(400).send({ message: "Game already in watchlist" });

//       const result = await watchlistCollection.insertOne({ userEmail, game });
//       res.send(result);
//     });

//     // Get user watchlist
//     router.get('/:email', async (req, res) => {
//       const email = req.params.email;
//       const games = await watchlistCollection.find({ userEmail: email }).toArray();
//       res.send(games);
//     });

//     // Delete game from watchlist
//     router.delete('/:id', async (req, res) => {
//       const id = req.params.id;
//       const result = await watchlistCollection.deleteOne({ _id: new ObjectId(id) });
//       res.send(result);
//     });


//     app.put('/reviews/:id', async (req, res) => {
//       try {
//         const id = req.params.id;
//         const updatedReview = req.body;

//         // Check if ID is valid
//         if (!ObjectId.isValid(id)) {
//           return res.status(400).send({ message: "Invalid ID" });
//         }

//         // Filter to find the document
//         const filter = { _id: new ObjectId(id) };

//         // Update document with $set
//         const updateDoc = {
//           $set: {
//             gameTitle: updatedReview.gameTitle,
//             publishYear: updatedReview.publishYear,
//             rating: updatedReview.rating,
//             gameCoverImage: updatedReview.gameCoverImage,
//             genre: updatedReview.genre,
//             userName: updatedReview.userName,
//             userEmail: updatedReview.userEmail,
//             reviewDescription: updatedReview.reviewDescription
//           },
//         };

//         const result = await reviewsCollection.updateOne(filter, updateDoc);

//         if (result.matchedCount === 0) {
//           return res.status(404).send({ message: "Review not found" });
//         }

//         res.send({ message: "Review updated successfully", result });
//       } catch (err) {
//         console.error(err);
//         res.status(500).send({ message: "Server error", error: err.message });
//       }
//     });




//     // Add to Watchlist
//     router.post('/', async (req, res) => {
//       const { userEmail, game } = req.body;

//     });

//     // Get Watchlist
//     router.get('/:email', async (req, res) => {
//       const { email } = req.params;

//     });

//     // Delete from Watchlist
//     router.delete('/:id', async (req, res) => {
//       const { id } = req.params;

//     });


//     app.use('/watchlist', router);







//     client.connect().then(() => {
//       db = client.db("gameReviewDB");
//       watchlistCollection = db.collection("watchlist");
//       console.log("MongoDB connected");
//     });






//     app.listen(5000, () => console.log("Server running on port 5000"));









//     // Just login user Review 
//     app.get('/myreviews', async (req, res) => {
//       const email = req.query.email;
//       const result = await reviewsCollection.find({ userEmail: email }).toArray();
//       res.send(result);
//     });



//     // Updated Review
//     app.put('/reviews/:id', async (req, res) => {
//       const id = req.params.id;
//       const updatedReview = req.body;
//       const filter = { _id: new ObjectId(id) };
//       const updateDoc = {
//         $set: {
//           reviewDescription: updatedReview.reviewDescription,
//           rating: updatedReview.rating,
//         }
//       };
//       const result = await reviewsCollection.updateOne(filter, updateDoc);
//       res.send(result);
//     });


//     app.delete('/reviews/:id', async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) }
//       const result = await reviewsCollection.deleteOne(query);
//       res.send(result);
//     })





//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//   }
// }
// run().catch(console.dir);






// // Test route
// app.get('/', (req, res) => {
//   res.send('Gaming Server is running...');
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`🚀 Server is running on port ${port}`);
// });