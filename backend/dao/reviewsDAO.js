/**
 * Directly accesses and/or modifies review objects in MovieDB's 
 * reviews collection
 * 
 * Features:
 * - Connect to reviews collection
 * - Add a review
 * - Edit a review
 * - Delete a review
 * - Get a specific user's reviews
 * - Edit the username displayed on a review card
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course
 */
 import mongodb from "mongodb";
 const ObjectId = mongodb.ObjectID;
 
 // Collection handle to mongoDB database.
 let reviews;
 
 export default class ReviewsDAO {
     /**
      * Establishes a connection to our mongoDB collection reviews.
      * @param {*} conn The MongoClient received from index.js
      */
     static async injectDB(conn) {
         if (reviews) {
             return;
         }
         try {
             reviews = await conn.db(process.env.MOVIEREVIEWS_NS).collection("reviews");
         } catch (e) {
             console.error(`Unable to connect to DB from ReviewsDAO, ${e}`);
         }
     }
 
     /**
      * Adds a review to the reviews collection
      * @param {*} movieId The ObjectID of the movie being reviewed
      * @param {*} user The information of the user creating the review (name + _id)
      * @param {*} review The review text
      * @param {*} stars The number of stars the user left for the movie (1 - 5)
      * @param {*} date The review creation date.
      * @returns Add review status
      */
     static async addReviews(movieId, user, review, stars, date) {
         try {
             const reviewDoc = {
                 name: user.name,
                 user_id: user._id,
                 date: date,
                 text: review,
                 num_stars: stars,
                 movie_id: ObjectId(movieId),
             };
 
             return await reviews.insertOne(reviewDoc);
         } catch (e) {
             console.error(`Unable to post review: ${e}`);
             return { error: e };
         }
     }
 
     /**
      * Edits a review in the reviews collection
      * @param {*} reviewId The ObjectID of the review to be edited
      * @param {*} userId The ID of the user trying to edit the review
      * @param {*} text The new review text
      * @param {*} stars The new number of stars left for the review
      * @param {*} date The review update date
      * @returns Edit review status
      */
     static async editReview(reviewId, userId, text, stars, date) {
         try {
             const updateResponse = await reviews.updateOne(
                 { user_id: userId, _id: ObjectId(reviewId) },
                 { $set: { text: text, date: date, num_stars: stars } },
             );
 
             return updateResponse;
         } catch (e) {
             console.error(`Unable to update review, ${e}`);
             return { error: e };
         }
     }
 
     /**
      * Deletes a review from the reviews collection
      * @param {*} reviewId The ObjectID of the review to be deleted
      * @param {*} userId The ID of the user trying to delete the review
      * @returns Deletion status.
      */
     static async deleteReview(reviewId, userId) {
         try {
             const deleteResponse = await reviews.deleteOne({
                 _id: ObjectId(reviewId),
                 user_id: userId,
             });
 
             return deleteResponse;
         } catch (e) {
             console.error(`Unable to delete review, ${e}`);
             return { error: e };
         }
     }
 
     /**
      * Gets a specific user's reviews
      * @param {*} userId The specific user's ID
      * @returns A list of reviews created by the specified user.
      */
     static async getReviewsByUser(userId) {
         let query = {
             "user_id": userId,
         };
 
         let cursor;
 
         // Looking for the reviews with a matching user_id field.
         try {
             cursor = await reviews.find(query).sort({ num_stars: -1 });
         } catch (e) {
             console.error(`Query couldn't be found in reviewsDAO, ${e}`);
             return { reviewsList: [] };
         }
 
         try {
             const reviewsList = await cursor.toArray();
             return (reviewsList);
         } catch (e) {
             console.error(`Unable to convert to array in reviewsDAO, ${e}`);
         }
     }
 
     /**
      * Changes the username that is displayed on a review card. Called after
      * a user changes their username from their profile page.
      * @param {*} reviewId The ObjectID of the review to be edited
      * @param {*} newUserName The new username 
      * @returns Edit review response.
      */
     static async editReviewUserName(reviewId, newUserName) {
         try {
             const updateResponse = await reviews.updateOne(
                 { _id: ObjectId(reviewId) },
                 { $set: { name: newUserName } },
             );
 
             return updateResponse;
         } catch (e) {
             console.error(`Unable to update review username, ${e}`);
         }
     }
 }