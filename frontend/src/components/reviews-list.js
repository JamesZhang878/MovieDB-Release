/**
 * Displays a list of all reviews a user had made on MovieDB
 * 
 * Features:
 * - Get a list of reviews made by a specific user
 * - Get a list of movies reviewed by a specific user
 * - Delete a review
 * - Format the review creation date displayed
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import React, { useState, useEffect } from "react";
 import { useAuth0 } from "@auth0/auth0-react";
 
 import ReviewListCard from "./review-list-card.js";
 import MoviesDataService from "../services/movies.js";
 import "../style/review-list.css";
 
 const ReviewsList = () => {
     const { user, isAuthenticated } = useAuth0();
     const [reviews, setReviews] = useState([]);
     const [reviewMovies, setReviewMovies] = useState([]);
     const [modifiyingReviews, setModifyingReviews] = useState(false);
 
     useEffect(() => {
         if (isAuthenticated) {
             getUserReviews();
             getReviewMovies();
         }
     }, [user, modifiyingReviews])
 
     /**
      * Retrieves a list of all of the reviews a user had created.
      */
     const getUserReviews = () => {
         MoviesDataService.getUserReviews(user.email)
             .then(response => {
                 setReviews(response.data);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Retrieves a list of movies that the user had created reviews for.
      */
     const getReviewMovies = () => {
         MoviesDataService.getMoviesReviewed(user.email)
             .then(response => {
                 setReviewMovies(response.data);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Removes a review from the reviews collection.
      * @param {*} reviewId The ObjectID of the review to be deleted
      */
     const deleteReview = (reviewId) => {
         MoviesDataService.deleteReview(reviewId, user.email)
             .then(response => {
                 setModifyingReviews(!modifiyingReviews);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Formats a review's creation date that appears on a review card.
      * @param {*} reviewDate The date to be formatted
      * @returns Formatted date as: (YYYY/MM/DD)
      */
     const formateDate = (reviewDate) => {
         let dateString = reviewDate.toString().substr(0, 10);
         let dateComponents = dateString.split("-");
         return dateComponents[0] + "/" + dateComponents[1] + "/" + dateComponents[2];
     }
 
     return (
         <div>
             <div className="review-list-header"><strong>Your Reviews:</strong></div>
             {(reviewMovies.length > 0) ? (
                 <div>
                     {(reviews.length > 0) ? (
                         <div className="row">
                             {reviews.map((review, index) => {
                                 return (
                                     <ReviewListCard
                                         title={reviewMovies[index].title}
                                         year={reviewMovies[index].year}
                                         num_stars={review.num_stars}
                                         text={review.text}
                                         formateDate={formateDate}
                                         date={review.date}
                                         movieId={reviewMovies[index]._id}
                                         currReview={review}
                                         deleteReview={deleteReview}
                                         reviewId={review._id}
                                     />
                                 )
                             })}
                         </div>
                     ) : (
                         <div>
                             No reviews available.
                         </div>
                     )}
                 </div>
             ) : (
                 <div>
                     {(reviews.length <= 0) ? (
                         <div>
                             You have no reviews!
                         </div>
                     ) : (
                         <div>
                             Server Error. Please make a report to the developer.
                         </div>
                     )}
                 </div>
             )}
         </div>
     )
 }
 
 export default ReviewsList;