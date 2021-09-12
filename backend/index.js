/**
 * Starts the express application created in server.js
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course
 */
 import app from "./server.js";
 import mongodb from "mongodb";
 import dotenv from "dotenv";
 
 import MoviesDAO from "./dao/moviesDAO.js";
 import ReviewsDAO from "./dao/reviewsDAO.js";
 import MovieRequestsDAO from "./dao/movie_requestsDAO.js";
 
 dotenv.config();
 
 const MongoClient = mongodb.MongoClient;
 
 const port = process.env.PORT || 8000;
 
 // Connects to the database, catches any errors, and starts the server
 MongoClient.connect(
     process.env.MOVIEREVIEWS_DB_URI,
     {
         poolSize: 25,
         wtimeout: 2500,
         userNewUrlParse: true,
     }
 )
     .catch(err => {
         console.error(err.stack);
         process.exit(1);
     })
     .then(async MongoClient => {
         await MoviesDAO.injectDB(MongoClient);
         await ReviewsDAO.injectDB(MongoClient);
         await MovieRequestsDAO.injectDB(MongoClient);
         app.listen(port, () => {
             console.log(`Listening on Port ${port}`);
         });
     });