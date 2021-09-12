/**
 * Review card displayed in the "Reviews" tab or under "Your Review"
 * in each movie page. 
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import React from "react";
 import { Link } from "react-router-dom";
 
 import StarRating from "./star-rating.js";
 import "../style/review-list.css";
 
 const ReviewListCard = (props) => {
     return (
         <div className="card">
             <div className="card-body">
                 <h5 className="card-title">
                     <div className="review-list-title">
                         {props.title} ({props.year})
                     </div>
                 </h5>
                 <div className="review-list-stars">
                     <StarRating display={true} existingRating={props.num_stars} />
                 </div>
                 <p className="card-text">
                     <div className="review-list-text">
                         {props.text} <br /> <br />
                         <strong>Created on: </strong>{props.formateDate(props.date)}
                     </div>
                 </p>
                 <div className="review-list-buttons">
                     <Link
                         to={{
                             pathname: `/movies/id/${props.movieId}`,
                         }}
                         className="btn">
                         Movie
                     </Link>
 
                     <Link
                         to={{
                             pathname: `/movies/${props.movieId}/review`,
                             state: {
                                 currentReview: props.currReview
                             }
                         }}
                         className="btn">
                         Edit
                     </Link>
 
                     <a
                         onClick={() => props.deleteReview(props.reviewId)}
                         className="btn btn-primary">
                         Delete
                     </a>
                 </div>
             </div>
         </div>
     )
 }
 
 export default ReviewListCard;