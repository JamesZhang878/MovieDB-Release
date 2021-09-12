/**
 * Directly accesses and/or modifies movie request objects in 
 * MovieDB's movie_requests collection.
 * 
 * Functions:
 * - Connect to mongoDB collection.
 * - Add movie request to database.
 * - Get a user's movie requests.
 * - Get all movie requests.
 * - Delete a movie request.
 * - Deny a movie request.
 * - Deactivate a movie request.
 * - Accept a movie request.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import mongodb from "mongodb";
 const ObjectId = mongodb.ObjectId;
 
 // Collection handle to mongoDB database
 let movie_requests;
 
 export default class MovieRequestsDAO {
     /**
      * Establishes a connection to our mongoDB collection movie_requests.
      * @param {*} conn MongoDB Client recieved from index.js
      */
     static async injectDB(conn) {
         // No need to connect to the database if we already have a collection handle.
         if (movie_requests) {
             return;
         }
 
         try {
             movie_requests = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movie_requests");
         } catch (e) {
             console.error(
                 `Unable to establish a collection handle in movie_requestsDAO: ${e}`
             );
         }
     }
 
     /**
      * Adds a request to the database.
      */
     static async addRequest(data) {
         try {
             return await movie_requests.insertOne(data);
         } catch (e) {
             console.error(`Unable to send movie request: ${e}`);
             return { error: e };
         }
     }
 
     /**
      * Gets a list of movie requests made by a specific user.
      * @param {*} user_id User email
      */
     static async getUserRequests(user_id) {
         let query = { "user_id": { $eq: user_id } };
         let cursor;
 
         try {
             cursor = await movie_requests.find(query);
         } catch (e) {
             console.error(`Query couldn't be found in movie_requestsDAO, ${e}`);
             return { requestList: [] };
         }
 
         try {
             const requestList = await cursor.toArray();
             return { requestList };
         } catch (e) {
             console.error(`Unable to convert to array in movie_requestsDAO, ${e}`);
             return { requestList: [] };
         }
     }
 
     /**
      * @returns A list of all movie requests.
      */
     static async getAllRequests() {
         let cursor;
 
         try {
             cursor = await movie_requests.find();
         } catch (e) {
             console.error(`Couldn't retrieve all requests, ${e}`);
         }
 
         try {
             const requestList = await cursor.toArray();
             return { requestList };
         } catch (e) {
             console.error(`Unable to convert to array in movie_requestsDAO, ${e}`);
             return { requestList: [] };
         }
     }
 
     /**
      * Deletes a movie request object. Removes it from the database.
      * @param {*} requestId The request's ObjectID
      * @param {*} user_id The user's ID (Email).
      */
     static async deleteRequest(requestId, user_id) {
         try {
             const deleteResponse = await movie_requests.deleteOne({
                 _id: ObjectId(requestId),
                 user_id: user_id,
             });
 
             return deleteResponse;
         } catch (e) {
             console.error(`Unable to delete request, ${e}`);
             return { error: e };
         }
     }
 
     /**
      * Denies a movie request by updating its status field.
      * @param {*} requestId The request's ObjectID
      * @param {*} user_id The user's ID (Email).
      */
     static async denyRequest(requestId, user_id) {
         try {
             const updateResponse = await movie_requests.updateOne(
                 { user_id: user_id, _id: ObjectId(requestId) },
                 { $set: { status: "denied" } },
             );
 
             return updateResponse;
         } catch (e) {
             console.error(`Unable to deny request, ${e}`);
             return { error: e };
         }
     }
 
     /**
      * Deactivates a request by updating its active field.
      * @param {*} requestId The request's ObjectID
      * @param {*} user_id The user's ID (Email). 
      */
     static async deactivateRequest(requestId, user_id) {
         try {
             const updateResponse = await movie_requests.updateOne(
                 { user_id: user_id, _id: ObjectId(requestId) },
                 { $set: { active: false } },
             );
 
             return updateResponse;
         } catch (e) {
             console.error(`Unable to deactivate request, ${e}`);
             return { error: e };
         }
     }
 
     /**
      * Updates a request object's status and movie_id field.
      * 
      * @param {*} requestId The request's ObjectID
      * @param {*} user_id The user's ID (Email).
      * @param {*} acceptedMovie_id The ObjectId of the newly added movie object
      */
     static async acceptRequest(requestId, user_id, acceptedMovie_id) {
         try {
             const updateResponse = await movie_requests.updateOne(
                 { user_id: user_id, _id: ObjectId(requestId) },
                 { $set: { status: "accepted", movie_id: ObjectId(acceptedMovie_id) } },
             );
 
             return updateResponse;
         } catch (e) {
             console.error(`Unable to accept request, ${e}`);
             return { error: e };
         }
     }
 }