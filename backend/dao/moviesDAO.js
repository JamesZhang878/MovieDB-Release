/**
 * Directly accesses and/or modifies movie objects in MovieDB's 
 * movies collection
 * 
 * Functions:
 * - Connect to movies collection
 * - Get a list of filtered movies
 * - Get movies by their ObjectID
 * - Get a list of genres
 * - Get a list of movie ratings (G, PG, PG-13, etc)
 * - Delete duplicate movies
 * - Add a movie to the database.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course
 */
 import mongodb from "mongodb";
 const ObjectId = mongodb.ObjectID;
 
 // Collection handle to mongoDB database.
 let movies;
 
 export default class MoviesDAO {
     /**
      * Generates a reference to the database. Called in index.js right before
      * the server is started.
      * @param {*} conn The MongoClient received from index.js
      */
     static async injectDB(conn) {
         if (movies) {
             return;
         }
 
         try {
             movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movies");
         } catch (e) {
             console.error(
                 `Unable to establish a collection handle in moviesDAO: ${e}`,
             );
         }
     }
 
     /**
      * @returns A list of movies that fit into the provided filters
      */
     static async getMovies({
         filters = null,
         page = 0,
         moviesPerPage = 20,
     } = {}) {
 
         // Generate query from provided filters.
         let query = {};
         
         if (filters) {
             if ("title" in filters) {
                 query.$text = { $search: `\"${filters["title"]}\"` };
             }
             if ("genres" in filters) {
                 query.genres = { $eq: filters["genres"] };
             }
             if ("rated" in filters) {
                 query.rated = { $eq: filters["rated"] };
             }
             if ("year" in filters) {
                 query.year = { $eq: parseInt(filters["year"]) };
             }
         }
 
         let cursor;
 
         // Try to access all of the movies
         try {
             cursor = await movies.find(query).sort({ imdb: -1 });
         } catch (e) {
             console.error(`Query couldn't be found in moviesDAO, ${e}`);
             return { moviesList: [] };
         }
 
         if (page == 0) {
             page = 1;
         }
 
         const displayCursor = cursor.limit(moviesPerPage).skip(moviesPerPage * (page - 1));
         // Try to convert the list of movies to an array
         try {
             const moviesList = await displayCursor.toArray();
             return { moviesList };
         } catch (e) {
             console.error(`Unable to convert to array in moviesDAO, ${e}`);
             return { moviesList: [] };
         }
     }
 
     /**
      * @returns A movie that has the provided ObjectID along with its
      *          corresponding reviews
      */
     static async getMoviesByID(id) {
         try {
             const pipeline = [
                 {
                     $match: {
                         _id: new ObjectId(id),
                     },
                 },
                 {
                     $lookup: {
                         from: "reviews",
                         let: {
                             id: "$_id",
                         },
                         pipeline: [
                             {
                                 $match: {
                                     $expr: {
                                         // NOTE: The movie_id here is the id that the reivew object stores 
                                         //       of the movie that it is a review of.
                                         $eq: ["$movie_id", "$$id"],
                                     },
                                 },
                             },
                             {
                                 $sort: {
                                     date: -1,
                                 },
                             },
                         ],
                         as: "reviews",
                     },
                 },
                 {
                     $addFields: {
                         reviews: "$reviews",
                     },
                 }
             ];
             return await movies.aggregate(pipeline).next();
         } catch (e) {
             console.error(`Something went wrong in getMoviesByID: ${e}`);
             throw e;
         }
     }
 
     /**
      * @returns A list of distinct genres 
      */
     static async getGenres() {
         let genres = [];
         try {
             genres = await movies.distinct("genres");
             return genres;
         } catch (e) {
             console.error(`Unable to retrieve list of genres in moviesDAO, ${e}`);
             return { genres: [] };
         }
     }
 
     /**
      * @returns A list of distinct movie ratings (G, PG, PG-13, etc)
      */
     static async getRated() {
         let rated = [];
         try {
             rated = await movies.distinct("rated");
             return rated;
         } catch (e) {
             console.error(`Unable to retrieve a list of ratings in moviesDAO, ${e}`);
             return { rated: [] };
         }
     }
 
     /**
      * Deletes duplicate movies contained in the movies collection.
      * This function should only be called by the admin.
      */
     static async deleteDuplicateMovies() {
         try {
             // Groups movies by their fullplot.
             const pipeline = [
                 {
                     '$group': {
                         '_id': '$fullplot',
                         'count': {
                             '$addToSet': '$lastupdated'
                         },
                         'movieId': {
                             '$addToSet': '$_id'
                         },
                         'movieTitle': {
                             '$addToSet': '$title'
                         },
                         'year': {
                             '$addToSet': '$year'
                         },
                     },
                 }
             ];
             const cursor = await movies.aggregate(pipeline);
 
             // FINDING DUPLICATES
             let dups = [];
 
             // A group is considered to contain duplicates iff:
             //      - There is more than one item in the group.
             //      - There is only one unique title.
             //      - There is only one unique year.
             await cursor.forEach(group => {
                 if (group.count.length > 1 &&
                     group.movieTitle.length == 1 &&
                     group.year.length == 1) {
 
                     dups.push({
                         "title": group.movieTitle,
                         "movieId": group.movieId,
                         "year": group.year,
                     });
                 }
             });
 
             if (dups.length == 0) {
                 return "No duplicates to delete";
             }
 
             // DELETION PROCESS
             let delStatus = [];
 
             // Deletes duplicates and keeps track of how many were deleted
             for (let i = 0; i < dups.length; i++) {
                 let currDup = dups[i];
                 let deleteCount = 0;
                 for (let j = 1; j < currDup.movieId.length; j++) {
                     const deleteMovie = await movies.deleteOne({
                         _id: ObjectId(currDup.movieId[j])
                     });
                     deleteCount = deleteMovie.deletedCount;
                 }
 
                 delStatus.push((deleteCount > 0) ? true : false);
             }
 
             // Checks to see if all deletions were successful
             for (let i = 0; i < delStatus.length; i++) {
                 if (!delStatus[i]) {
                     return false;
                 }
             }
             return true;
         } catch (e) {
             console.log(e);
         }
     }
 
     /**
      * Adds a movie to the movies collection.
      * @param {*} data Information about the movie to be added
      */
     static async addMovie(data) {
         try {
             return await movies.insertOne(data);
         } catch (e) {
             console.error(`Unable to post movie: ${e}`);
             return { error: e };
         }
     }
 }