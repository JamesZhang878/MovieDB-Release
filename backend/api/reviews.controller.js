/**
 * Contains methods that facilitates the access and editing of review
 * information performed by ReviewsDAO.
 * 
 * Functions:
 * - Add a review to the database
 * - Edit an existing review
 * - Delete an existing review
 * - Get a specific user's reviews
 * - Get a list of movies that a specific user had reviewed
 * - Change the username that appears on a review
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course
 */
 import ReviewsDAO from "../dao/reviewsDAO.js";
 import MoviesDAO from "../dao/moviesDAO.js";
 
 export default class ReviewsCtrl {
     /**
      * Adds a new review to the database with the information provided
      * by the body of the request.
      */
     static async apiAddReview(req, res, next) {
         try {
             const movie_id = req.body.movie_id;
             const review = req.body.text;
             const stars = req.body.stars;
             const userInfo = {
                 name: req.body.name,
                 _id: req.body.user_id,
             };
             const date = new Date();
 
             let addReview = await ReviewsDAO.addReviews(
                 movie_id, userInfo, review, stars, date);
 
             res.json({ status: "success" });
         } catch (e) {
             console.error(`Unable to post review, ${e}`);
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Edits a review with the information provided in the 
      * body of the request.
      */
     static async apiEditReview(req, res, next) {
         try {
             const userId = req.body.user_id;
             const reviewId = req.body.review_id;
             const updatedStars = req.body.stars;
             const updatedReview = req.body.text;
             const date = new Date();
 
             let editReview = await ReviewsDAO.editReview(
                 reviewId, userId, updatedReview, updatedStars, date);
 
             var { error } = editReview;
             if (error) {
                 throw new Error(
                     "Unable to edit review as user may not be original poster."
                 );
             }
 
             res.json({ status: "success" });
         } catch (e) {
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Deletes a review
      */
     static async apiDeleteReview(req, res, next) {
         try {
             const userId = req.body.user_id;
             const reviewId = req.query.id;
 
             let deleteReview = await ReviewsDAO.deleteReview(reviewId, userId);
             res.json({ status: "success" });
         } catch (e) {
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Gets a specific user's reviews
      */
     static async apiGetUserReviews(req, res, next) {
         try {
             const user_id = req.query.user_id;
             const reviewsList = await ReviewsDAO.getReviewsByUser(user_id);
             res.json(reviewsList);
         } catch (e) {
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Gets list of movies that the given user had created 
      * reviews for.
      */
     static async apiGetUserReviewMovies(req, res, next) {
         try {
             const user_id = req.query.user_id;
             const reviewsList = await ReviewsDAO.getReviewsByUser(user_id);
             let moviesReviewed = new Array(reviewsList.length);
 
             // For each of this user's reviews, get the corresponding movie
             for (let i = 0; i < reviewsList.length; i++) {
                 let currReview = reviewsList[i];
                 moviesReviewed[i] = await MoviesDAO.getMoviesByID(currReview.movie_id);
             }
 
             res.json(moviesReviewed);
         } catch (e) {
             res.status(500).json({ error: e.message });
         }
     }
 
     /**
      * Changes the username that appears on a review card.
      */
     static async apiEditReviewUserName(req, res, next) {
         try {
             const reviewId = req.body.review_id;
             const newUserName = req.body.newUserName;
             let updateReviewUserName = await ReviewsDAO.editReviewUserName(reviewId, newUserName);
 
             res.json(updateReviewUserName);
         } catch (e) {
             res.status(500).json({ error: e.message });
         }
     }
 }