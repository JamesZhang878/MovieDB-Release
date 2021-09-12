/**
 * Controls interactions with MovieDB's backend application.
 * 
 * Features:
 * - Retrieve general or specific movie information
 * - Retrieve movie reviews
 * - Retrieve movie requests
 * - Retrieve user information
 * - User information modification (username, password, profile picture, and account deletion)
 * - Review modification (create, update, and delete)
 * - Movie request modification (create, delete, deny, deactivate, and accept/add movie)
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course.
 */
 import http from "../http-common.js";

 class MoviesDataService {
     /**
      * Creates a custom query based on the filters and the findBys passed in through
      * the param filtersFindBys
      * @param {*} filtersFindBys [filters : {The actual terms to look for}, 
      *                            findBys: {The category of the provided filters}]
      * @returns A query in the form of ?{findBy}={filter}... 
      *          eg: ?title=cosmos&genre=documentary
      */
     formatFilteredSearch = (filtersFindBys) => {
         let filters = filtersFindBys.filters;
         let findBys = filtersFindBys.findBys;
         let defaultQuery = "";
         let customQuery = "?";
 
         if (filters.length = findBys.length) {
             for (let i = 0; i < filters.length - 1; i++) {
                 customQuery = customQuery + findBys[i] + "=" + filters[i] + "&";
             }
             customQuery = customQuery + findBys[filters.length - 1] + "=" + filters[filters.length - 1];
         }
         else {
             return defaultQuery;
         }
 
         return customQuery;
     }
 
     // MOVIE ACCESS ROUTES //
     /**
      * @param {*} page The current page to display
      * @returns All movies available in the movies collection
      */
     getAll(page) {
         return http.get(`?page=${page}`);
     }
 
     /**
      * Looks for movies that fit into the provided filters.
      * @param {*} filters [filters : {The actual terms to look for}, 
      *                     findBys: {The category of the provided filters}]
      * @param {*} page The current page to display
      * @returns A list of movies that fit into the provided filters. Could be empty.
      */
     find(filters, page = 0) {
         let customQuery;
 
         if (filters) {
             customQuery = this.formatFilteredSearch(filters);
             return http.get(customQuery + `&page=${page}`);
         }
         else {
             return http.get(`?page=${page}`);
         }
     }
 
     /**
      * @returns A list of unique genres available in the movies collection
      */
     getGenres() {
         return http.get(`/genres`);
     }
 
     /**
      * @returns A list of unique ratings (G, PG, PG-13, etc) available in the movies collection
      */
     getRated() {
         return http.get(`/rated`);
     }
 
     /**
      * Looks for a movie with a specific ObjectID
      * @param {*} id The ObjectID of the movie to be found
      * @returns The movie with a matching ObjectID
      */
     get(id) {
         return http.get(`/id/${id}`);
     }
 
     // REVIEW MODIFICATION ROUTES //
     /**
      * Creates a review with the given information (data)
      * @param {*} data {text, name (username), user_id, movie_id, stars}
      * @returns Add review status
      */
     createReview(data) {
         return http.post("/reviews", data);
     }
 
     /**
      * Updates the review text and stars
      * @param {*} data {text, name (username), user_id, movie_id, stars}
      * @returns Update review status
      */
     editReview(data) {
         return http.put("/reviews", data);
     }
 
     /**
      * Removes a review from the reviews collection
      * @param {*} reviewId The ObjectID of the review to be deleted
      * @param {*} userId The user ID of the user trying to delete the review
      * @returns Delete review status
      */
     deleteReview(reviewId, userId) {
         return http.delete(`/reviews?id=${reviewId}`, { data: { user_id: userId } });
     }
 
     // PROFILE INFORMATION ROUTES //
     /**
      * Gets all reviews made by a specific user
      * @param {*} email The email of the user whose reviews we want to retrieve.
      * @returns A list of the provided user's reviews.
      */
     getUserReviews(email) {
         return http.get(`/userReviews?user_id=${email}`);
     }
 
     /**
      * Gets all of the movies that a specific user had reviewed. 
      * @param {*} email The email of the user whose reviewed movies we want to retrieve.
      * @returns A list of movies that the provided user reviewed.
      */
     getMoviesReviewed(email) {
         return http.get(`/moviesReviewed?user_id=${email}`);
     }
 
     /**
      * Gets the Auth0 account information of a specific user.
      * @param {*} email The email of the user whose information we want to retrieve.
      * @returns The provided user's Auth0 account information
      */
     getUserByEmail(email) {
         return http.get(`/userData?email=${email}`);
     }
 
     /**
      * Gets the MovieDB role (Admin or User) of a specific user.
      * @param {*} email The email of the user whose role we want to retrieve.
      * @returns The provided user's MovieDB role
      */
     getUserRole(email) {
         return http.get(`/role?email=${email}`);
     }
 
     /**
      * Changes a user's username
      * @param {*} data {userName: new username, user_id: (Auth0)}
      * @returns Username change status
      */
     changeUserName(data) {
         return http.put("/changeUserName", data);
     }
 
     /**
      * Activates Auth0's password reset process to send an email
      * to the user's email address to help them with the password reset 
      * process.
      * @param {*} data {userEmail}
      * @returns Email delivery status
      */
     changePassword(data) {
         return http.put("/changePassword", data);
     }
 
     /**
      * Updates a user's profile picture
      * @param {*} data {profilePic: Link, user_id (Auth0)}
      * @returns Profile picture update status
      */
     changeProfilePic(data) {
         return http.put("/changepfp", data);
     }
 
     /**
      * Removes all information related to the specified user from
      * MovieDB's Auth0 user database.
      * @param {*} data {user_id (Auth0)}
      * @returns Account deletion status
      */
     deleteAccount(data) {
         return http.put("/account", data);
     }
 
     /**
      * Edits the username displayed on movie reviews after a user
      * changes their username
      * @param {*} data {review_id: ObjectID, newUserName}
      * @returns Username update status
      */
     editReviewUserNames(data) {
         return http.put("/reviewsUpdateUserName", data);
     }
 
     // MOVIE REQUEST ROUTES //
     /**
      * Adds a movie to the movies collection in MovieDB's database. Should
      * only be used by Admin users.
      * @param {*} data {title, year, fullplot, genres, imdb, poster, runtime, released, rated}
      * @returns "success" if the movie was added to the database.
      */
     addMovie(data) {
         return http.post("/addMovie", data);
     }
 
     /**
      * Adds a movie request to the movie_requests colection
      * @param {*} data {title, year, fullplot, genres, runtime, released, rated, user_id (email), status, active}
      * @returns "success" if the request was added to the database.
      */
     addRequest(data) {
         return http.post("/addRequest", data);
     }
 
     /**
      * Gets all movie requests made by a specific user
      * @param {*} email The email of the user whose requests we want to retrieve.
      * @returns A list of the provided user's movie requests.
      */
     getRequests(email) {
         return http.get(`/getRequests?email=${email}`);
     }
 
     /**
      * @returns A list of all movie requests made on MovieDB. Should only be used by
      * admin users.
      */
     getAllRequests() {
         return http.get("/reviewRequests");
     }
 
     /**
      * Removes a request object from the movie_requests collection
      * @param {*} request_id The ObjectID of the request to be deleted
      * @param {*} user_id The email of the user who made the request
      * @returns "success" if the request was successfully deleted
      */
     deleteRequest(request_id, user_id) {
         return http.delete(`/deleteRequest?id=${request_id}`, { data: { user_id: user_id } });
     }
 
     /**
      * Updates a movie request's status to "denied". Should only be used by admin users
      * @param {*} data {id: request ObjectID, user_id: email}
      * @returns Request denial status
      */
     denyRequest(data) {
         return http.put("/denyRequest", data);
     }
 
     /**
      * Updates a movie request's active field to false. Deactivated requests will not
      * appear on any user's profile page.
      * @param {*} data {id: request ObjectID, user_id: email}
      * @returns Request deactivation status
      */
     deactivateRequest(data) {
         return http.put("/deactivateRequest", data);
     }
 
     /**
      * Updates a movie request's status to "accepted" and adds the movie_id field
      * which contains the ObjectID of the newly added movie that corresponds to 
      * the accepted request.
      * @param {*} data {id: request ObjectID, user_id: email, title, year, genres, rated}
      * @returns Request acceptance status
      */
     acceptRequest(data) {
         return http.put("/acceptRequest", data);
     }
 }
 
 export default new MoviesDataService();