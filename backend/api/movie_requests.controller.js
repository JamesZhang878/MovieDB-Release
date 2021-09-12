/**
 * Contains methods that facilitates the access and editing of 
 * movie request information performed by MovieRequestsDAO.
 * 
 * Functions:
 * - Add a movie request to the database.
 * - Get a list of requests made by a specific user.
 * - Get a list of all movie requests.
 * - Delete a request.
 * - Deny a request.
 * - Deactivate a request.
 * - Accept a request
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import MovieRequestsDAO from "../dao/movie_requestsDAO.js";
 import MoviesDAO from "../dao/moviesDAO.js";
 
 export default class MovieRequestsCtrl {
     /**
      * Formats the data contained within the request body before passing
      * that information on to the DAO to add a movie request to the 
      * mongoDB database.
      */
     static async apiSendRequest(req, res, next) {
         try {
             // Data formatting
             let data = req.body;
             let releasedArr = data.released.split("-");
             let releasedDate = new Date(releasedArr[0], releasedArr[1] - 1, releasedArr[2]);
 
             let requestInfo = {
                 title: data.title,
                 year: parseInt(data.year),
                 fullplot: data.fullplot,
                 genres: data.genres,
                 runtime: parseInt(data.runtime),
                 released: releasedDate,
                 rated: data.rated,
                 lastupdated: new Date(),
                 type: "movie",
                 user_id: data.user_id,
                 status: data.status,
                 active: data.active,
             };
 
             // Send to DAO
             let sendRequest = await MovieRequestsDAO.addRequest(requestInfo);
 
             // Check addition status.
             if (sendRequest.insertedCount == 1) {
                 res.json("success");
             }
             else {
                 res.json("fail");
             }
         } catch (e) {
             console.log(`Unable to send movie request, ${e}`);
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * @returns A list of movie requests a specific user has made.
      */
     static async apiGetRequests(req, res, next) {
         try {
             let user_id = req.query.email;
             const requestList = await MovieRequestsDAO.getUserRequests(user_id);
 
             res.json(requestList);
         } catch (e) {
             console.log(`Unable to get movie requests, ${e}`);
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * @returns A list containing all movie requests. Only available to Admins.
      */
     static async apiGetAllRequests(req, res, next) {
         try {
             const requestList = await MovieRequestsDAO.getAllRequests();
 
             res.json(requestList);
         } catch (e) {
             console.log(`Unable to get all movie requests, ${e}`);
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Deletes a movie request from the database using the request's ID
      * and the user's ID (email). Deleted requests are removed from the database.
      */
     static async apiDeleteRequest(req, res, next) {
         try {
             let requestId = req.query.id;
             let userId = req.body.user_id;
 
             const deleteStatus = await MovieRequestsDAO.deleteRequest(requestId, userId);
 
             if (deleteStatus.deletedCount == 1) {
                 res.json("success");
             }
             else {
                 res.json("fail");
             }
         } catch (e) {
             console.log(`Unable to delete movie request, ${e}`);
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Denies a movie request with an ID of requestID made by a user
      * with userId.
      */
     static async apiDenyRequest(req, res, next) {
         try {
             let requestId = req.body.id;
             let userId = req.body.user_id;
 
             const denyStatus = await MovieRequestsDAO.denyRequest(requestId, userId);
 
             if (denyStatus.modifiedCount == 1) {
                 res.json("success");
             }
             else {
                 res.json("fail");
             }
         } catch (e) {
             console.log(`Unable to deny movie request, ${e}`);
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Deactivates a movie request. Deactivated requests no longer show
      * up in users' profiles, but they still exist in the database.
      */
     static async apiDeactivateRequest(req, res, next) {
         try {
             let requestId = req.body.id;
             let userId = req.body.user_id;
 
             let deactivateStatus = await MovieRequestsDAO.deactivateRequest(requestId, userId);
 
             if (deactivateStatus.modifiedCount == 1) {
                 res.json("success");
             }
             else {
                 res.json("fail");
             }
         } catch (e) {
             console.log(`Unable to deactivate movie request, ${e}`);
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Accepts a movie request and changes the request's status before adding
      * the newly added movie's information to the request object.
      */
     static async apiAcceptRequest(req, res, next) {
         try {
             let requestId = req.body.id;
             let userId = req.body.user_id;
             let title = req.body.title;
             let year = req.body.year;
             let genre = req.body.genres[0];
             let rated = req.body.rated;
 
             // Looks for newly added movie.
             // This movie was added to the database by acceptRequest() in add-movie.js
             // - add-movie.js is a component in the frontend.
             let filters = {
                 title: title,
                 year: year,
                 rated: rated,
                 genres: genre,
             };
 
             let page = 0;
             let moviesPerPage = 20;
             const acceptedMovie = await MoviesDAO.getMovies({
                 filters,
                 page,
                 moviesPerPage,
             });
 
             // Adds the newly added movie's ID to the request object.
             // This ID is then used in the frontend to redirect users to the newly added movie.
             let acceptStatus = await MovieRequestsDAO.acceptRequest(requestId, 
                 userId, acceptedMovie.moviesList[0]._id);
 
             if (acceptStatus.modifiedCount == 1) {
                 res.json("success");
             }
             else {
                 res.json("fail");
             }
         } catch (e) {
             console.log(`Unable to accept movie request, ${e}`);
             res.status(500).json({ error: e.message });
         }
     }
 }