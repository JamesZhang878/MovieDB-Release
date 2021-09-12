/**
 * Handles adding and editing movie reviews.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course
 */
 import React, { useState } from "react";
 import { Link } from "react-router-dom";
 import { useAuth0 } from "@auth0/auth0-react";
 
 import MoviesDataService from "../services/movies.js";
 import StarRating from "./star-rating.js";
 import "../style/add-review.css";
 
 const AddReview = props => {
     let initialReviewState = "";
     let editing = false;
 
     // Checks to see if an existing review is being edited.
     if (props.location.state && props.location.state.currentReview) {
         editing = true;
         initialReviewState = props.location.state.currentReview.text;
     }
 
     const [review, setReview] = useState(initialReviewState);
     const [submitted, setSubmitted] = useState(false);
     const [rating, setRating] = useState(0);
     const { user, isAuthenticated } = useAuth0();
 
     const handleInputChange = e => {
         setReview(e.target.value);
     }
 
     const handleRatingChange = (newRating) => {
         if (newRating >= 0 && newRating <= 5) {
             setRating(newRating);
         }
     }
 
     /**
      * Edits or adds a review to the reviews collection. Also
      * checks to see if the given input is valid.
      */
     const saveReview = () => {
         var data = {
             text: review,
             name: user.nickname,
             user_id: user.email,
             movie_id: props.match.params.id,
             stars: rating,
         };
 
         // Input validation
         if (rating < 1) {
             alert("Please leave a star rating");
         }
         else if (review.length < 1) {
             alert("Please write something in the textbox");
         }
         else {
             if (editing) {
                 data.review_id = props.location.state.currentReview._id;
                 MoviesDataService.editReview(data)
                     .then(response => {
                         setSubmitted(true);
                     })
                     .catch(e => {
                         console.log(e);
                     })
             }
             else {
                 MoviesDataService.createReview(data)
                     .then(response => {
                         setSubmitted(true);
                     })
                     .catch(e => {
                         console.log(e);
                     })
             }
         }
     }
 
     return (
         <div className="add-review">
             {(user && isAuthenticated) ? (
                 <div className="submit-form">
                     {submitted ? (
                         <div className="success">
                             <h4>Submitted successfully!</h4>
                             <Link to={"/movies/id/" + props.match.params.id} className="btn btn-success">
                                 Back to Movie
                             </Link>
                         </div>
                     ) : (
                         <div className="review-box">
                             <div className="form-group">
                                 <label htmlFor="description">{editing ? "Edit" : "Create"} Review </label>
                                 <StarRating sendRating={handleRatingChange}
                                     display={false}
                                     existingRating={-1} />
                                 <input
                                     type="text"
                                     className="form-control"
                                     id="text"
                                     required
                                     value={review}
                                     onChange={handleInputChange}
                                     name="text"
                                     placeholder="Write review here"
                                 />
                                 <div className="review-form-buttons">
                                     <Link to={"/movies/id/" + props.match.params.id} className="btn btn-success">
                                         Cancel
                                     </Link>
                                     <button onClick={saveReview} className="btn btn-success">
                                         Submit
                                     </button>
                                 </div>
                             </div>
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="redirect">
                     <h1>Please log in to leave a review.</h1>
                     <Link to={"/movies/id/" + props.match.params.id} className="btn btn-success">
                         Back to Movie
                     </Link>
                 </div>
             )}
         </div>
     )
 }
 
 export default AddReview