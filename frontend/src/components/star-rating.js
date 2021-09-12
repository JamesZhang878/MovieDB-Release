/**
 * An interface used to create a star rating from 1-5 for a review.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: https://w3collective.com/react-star-rating-component/
 */
 import React, { useState } from "react";
 import "../style/star-rating.css";
 
 const StarRating = (props) => {
     const [rating, setRating] = useState(0);
 
     const handleInputChange = (index) => {
         if (index >= 0 && index <= 5) {
             setRating(index);
             props.sendRating(index);
         }
     }
 
     return (
         <div>
             {(props.display) ? (
                 <div className="star-rating">
                     <span className={props.existingRating >= 1 ? "display-on" : "display-off"}>&#9733;</span>
                     <span className={props.existingRating >= 2 ? "display-on" : "display-off"}>&#9733;</span>
                     <span className={props.existingRating >= 3 ? "display-on" : "display-off"}>&#9733;</span>
                     <span className={props.existingRating >= 4 ? "display-on" : "display-off"}>&#9733;</span>
                     <span className={props.existingRating >= 5 ? "display-on" : "display-off"}>&#9733;</span>
                 </div>
             ) : (
                 <div className="star-rating">
                     {[...Array(5)].map((star, index) => {
                         index += 1;
                         return (
                             <button
                                 type="button"
                                 title="Please select a star rating"
                                 key={index}
                                 className={(index <= rating) ? "on" : "off"}
                                 onClick={() => handleInputChange(index)}
                             >
                                 <span className="star">&#9733;</span>
                             </button>
                         )
                     })}
                 </div>
             )}
         </div>
 
     )
 }
 
 export default StarRating;