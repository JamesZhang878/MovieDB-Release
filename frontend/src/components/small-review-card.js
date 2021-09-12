/**
 * A card that displays reviews that were not created by the 
 * logged in user on an individual movie page.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */

 import React from "react";
 import StarRating from "./star-rating.js";
 
 const SmallReviewCard = (props) => {
     return (
         <div className="col-lg-4 pb-1" key={props.index}>
             <div className="review-card">
                 <div className="card-body">
                     <div className="display-rating">
                         <StarRating display={true} existingRating={props.num_stars} />
                     </div>
                     <p className="card-text">
                         {props.text} <br />
                         <strong>User: </strong>{props.user}<br />
                         <strong>Date: </strong>{props.formateDate(props.date)}
                     </p>
                 </div>
             </div>
         </div>
     )
 }
 
 export default SmallReviewCard;