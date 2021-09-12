/**
 * Uses imported controllers to facilitate data access and modification
 * in the backend.
 * 
 * Contains routes to:
 * - Retrieve movie information
 * - Modify movie information
 * - Retrieve user information
 * - Modify user information
 * - Retrieve review information
 * - Modify review information
 * - Retrieve + Modify movie request information
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import express from "express";

 import MoviesCtrl from "./movies.controller.js"
 import ReviewsCtrl from "./reviews.controller.js"
 import Auth0Ctrl from "./auth0.controller.js";
 import MovieRequestsCtrl from "./movie_requests.controller.js";
 
 const router = express.Router();
 
 // Movie information routes
 router.route("/").get(MoviesCtrl.apiGetMovies);
 router.route("/genres").get(MoviesCtrl.apiGetGenres);
 router.route("/rated").get(MoviesCtrl.apiGetRated);
 router.route("/id/:id").get(MoviesCtrl.apiGetMoviesById);
 
 // User information routes
 router.route("/userData").get(Auth0Ctrl.apiGetUserByEmail);
 router.route("/userReviews").get(ReviewsCtrl.apiGetUserReviews);
 router.route("/moviesReviewed").get(ReviewsCtrl.apiGetUserReviewMovies);
 router.route("/role").get(Auth0Ctrl.apiCheckRole);
 
 // User modification routes
 router.route("/changeUserName").put(Auth0Ctrl.apiChangeUserName);
 router.route("/changePassword").put(Auth0Ctrl.apiChangePassword);
 router.route("/changepfp").put(Auth0Ctrl.apiChangeProfilePic);
 router.route("/account").put(Auth0Ctrl.apiDeleteAccount);
 
 // Review information/modification routes
 router
     .route("/reviews")
     .post(ReviewsCtrl.apiAddReview)
     .put(ReviewsCtrl.apiEditReview)
     .delete(ReviewsCtrl.apiDeleteReview)
 router.route("/reviewsUpdateUserName").put(ReviewsCtrl.apiEditReviewUserName);
 
 // Movie modification routes
 router.route("/deleteDups").delete(MoviesCtrl.apiDeleteDuplicates);
 router.route("/addMovie").post(MoviesCtrl.apiAddMovie);
 
 // Movie request routes
 router.route("/addRequest").post(MovieRequestsCtrl.apiSendRequest);
 router.route("/getRequests").get(MovieRequestsCtrl.apiGetRequests);
 router.route("/deleteRequest").delete(MovieRequestsCtrl.apiDeleteRequest);
 router.route("/reviewRequests").get(MovieRequestsCtrl.apiGetAllRequests);
 router.route("/denyRequest").put(MovieRequestsCtrl.apiDenyRequest);
 router.route("/deactivateRequest").put(MovieRequestsCtrl.apiDeactivateRequest);
 router.route("/acceptRequest").put(MovieRequestsCtrl.apiAcceptRequest);
 
 export default router;
 
 
 
 