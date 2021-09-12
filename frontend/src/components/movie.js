/**
 * This component serves as the landing page for each individual movie. It 
 * displays more information about a particular movie along with reviews that MovieDB
 * users have made. A user's own review appears at the top of the review section for
 * easy viewing. 
 * 
 * Features:
 * - Get an individual movie's information
 * - Check if the current user had left a review for this movie
 * - Delete a review. (Users can only delete their own reviews)
 * - Format displayed genres
 * - Format IMDb ID used to redirect users to the movie's IMDb page
 * - Format date displayed on review cards
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course
 */
 import React, { useState, useEffect } from "react";
 import { Link } from "react-router-dom";
 import { useAuth0 } from "@auth0/auth0-react";
 
 import MoviesDataService from "../services/movies.js";
 import ReviewListCard from "./review-list-card.js";
 import SmallReviewCard from "./small-review-card.js";
 import "../style/movie.css";
 
 
 const Movie = (props) => {
     const initialMovieState = {
         id: null,
         title: "",
         rated: "",
         genres: [],
         plot: "",
         imdb: { rating: 0, votes: 0, id: 0 },
         reviews: [],
     };
 
     const { user, isAuthenticated } = useAuth0();
 
     const [movie, setMovie] = useState(initialMovieState);
     const [userReviewExists, setUserReviewExists] = useState(false);
 
     useEffect(() => {
         getMovie(props.match.params.id);
         if (user && isAuthenticated) {
             checkReviewExistence(props.match.params.id);
         }
         else {
             console.log("no user")
         }
     }, [props.match.params.id, user]);
 
     /**
      * Retrieves a movie from the movies collection based on its ObjectID
      * @param {*} id The ObjectID of the movie to be retrieved.
      */
     const getMovie = (id) => {
         MoviesDataService.get(id)
             .then(response => {
                 setMovie(response.data);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Checks to see if the user had already reviewed the current movie.
      * @param {*} movieId The ObjectID of the current movie
      */
     const checkReviewExistence = (movieId) => {
         let userReviews = [];
         // Retrieves all reviews made by the viewing user.
         MoviesDataService.getMoviesReviewed(user.email)
             .then(response => {
                 userReviews = response.data;
 
                 // Checks for a matching movie ObjectID
                 for (let i = 0; i < userReviews.length; i++) {
                     if (userReviews[i]._id == movieId) {
                         setUserReviewExists(true);
                         break;
                     }
                 }
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Removes a review object from the reviews collection
      * @param {*} reviewId The ObjectID of the review to be removed.
      * @param {*} index The index of the review to be removed in the previous movie state
      */
     const deleteReview = (reviewId, index) => {
         MoviesDataService.deleteReview(reviewId, user.email)
             .then(response => {
                 setMovie((prevState) => {
                     prevState.reviews.splice(index, 1);
                     return ({
                         ...prevState
                     });
                 })
                 setUserReviewExists(false);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
       * This function formats the genres into csv form. It also
       * limits the amount of genres displayed to be 4 genres at most.
       * @param {*} genres Array of genres
       * @returns String with the value of genres in csv form.
       */
     const formatGenre = (genres) => {
         let formattedGenre = "";
 
         if (!genres) {
             return "No Genres Available";
         }
         for (let i = 0; i < genres.length - 1; i++) {
             formattedGenre = formattedGenre.concat(genres[i] + ", ");
 
             if (i > 4) { break; }
         }
 
         if (genres.length > 1) {
             formattedGenre = "Genres: " + formattedGenre;
         }
         else {
             formattedGenre = "Genre: " + formattedGenre;
         }
 
         return formattedGenre.concat(genres[genres.length - 1]);
     }
 
     /**
      * Formats the IMDb ID, which is always 7 characters long with 0s as padding.
      * @param {*} movieID The IMDb ID to be formatted
      * @returns The formatted IMDb ID. (eg: 0000xyz)
      */
     const formatIMDbID = (movieID) => {
         let formattedID = movieID.toString();
         while (formattedID.length < 7) {
             formattedID = "0" + formattedID;
         }
         return formattedID;
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
             {movie ? (
                 <div className="wrapper">
                     <div className="movie-info">
                         <h1>{movie.title} ({movie.year})</h1> <br />
                         <a
                             target="_blank"
                             href={"https://www.google.com/search?q=" + movie.title + " " + movie.year}
                             className="btn btn-danger btn-lg btn-block mx-1 mb-1">
                             Google
                         </a> <br />
                         <a
                             target="_blank"
                             href={"https://www.imdb.com/title/tt" + formatIMDbID(movie.imdb.id)}
                             className="btn btn-danger btn-lg btn-block mx-1 mb-1">
                             IMDb ({movie.imdb.rating}/10)
                         </a> <br />
 
                         <p className="paragraph">
                             <strong>{formatGenre(movie.genres)}</strong> <br />
                             <strong>Rated:</strong> {(movie.rated) ? (movie.rated) : ("NOT RATED")}<br />
                             <strong>Plot:</strong> {movie.fullplot}
                         </p>
                     </div>
 
                     <img className="poster" src={movie.poster} /> <br />
 
                     <div className="reviews">
                         <h4>
                             Your Review:
                             {userReviewExists ? (
                                 <div></div>
                             ) : (
                                 <Link to={"/movies/" + props.match.params.id + "/review"} className="btn btn-primary" title="Add Review">
                                     &oplus;
                                 </Link>
                             )}
                         </h4>
                         <div className="row">
                             {userReviewExists ? (
                                 <div>
                                     {movie.reviews.length > 0 ? (
                                         movie.reviews.map((review) => {
                                             if (review.user_id == user.email) {
                                                 return (
                                                     <ReviewListCard
                                                         title={movie.title}
                                                         year={movie.year}
                                                         num_stars={review.num_stars}
                                                         text={review.text}
                                                         formateDate={formateDate}
                                                         date={review.date}
                                                         movieId={movie._id}
                                                         currReview={review}
                                                         deleteReview={deleteReview}
                                                         reviewId={review._id}
                                                     />
                                                 )
                                             }
                                         })
                                     ) : (
                                         <div>
                                             No Reviews Available.
                                         </div>
                                     )}
                                 </div>
                             ) : (
                                 <div>
                                     <p>You haven't reviewed this movie yet!</p>
                                 </div>
                             )}
                         </div>
                         <div className="row">
                             <h4>Other Reviews:</h4>
                             {movie.reviews.length > 0 ? (
                                 movie.reviews.map((review, index) => {
                                     if (user) {
                                         if (review.user_id != user.email) {
                                             return (
                                                 <SmallReviewCard
                                                     index={index}
                                                     num_stars={review.num_stars}
                                                     text={review.text}
                                                     user={review.name}
                                                     formateDate={formateDate}
                                                     date={review.date}
                                                 />
                                             )
                                         }
                                     }
                                     else {
                                         return (
                                             <SmallReviewCard
                                                 index={index}
                                                 num_stars={review.num_stars}
                                                 text={review.text}
                                                 user={review.name}
                                                 formateDate={formateDate}
                                                 date={review.date}
                                             />
                                         )
                                     }
                                 })
                             ) : (
                                 <div class="no-reviews" style={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                                     <br />
                                     <br />
                                     <br />
                                     <p>No reviews yet</p>
                                 </div>
                             )}
                         </div>
                     </div>
 
                 </div>
             ) : (
                 <div>
                     <br />
                     <p>No movie selected.</p>
                 </div>
             )}
 
             <footer class="footer mt-3">
                 <div class="container">
                     <img src="/favicon.ico" width="50" height="30" alt="" />
                     <span class="text"><strong>MovieDB</strong></span>
                 </div>
             </footer>
         </div>
     )
 }
 
 export default Movie;