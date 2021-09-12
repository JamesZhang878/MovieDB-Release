/**
 * Handles movie request operations in the profile page. Features 
 * that are only available to Admin users are appended with "(Admin)".
 * 
 * Features:
 * - Get user role (Admin or User)
 * - Get a specific user's request. 
 * - Get all movie requests. (Admin)
 * - Delete a movie request. 
 * - Deny a movie request. (Admin)
 * - Accept a movie request. (Admin)
 * - Deactivate a movie request.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import React, { useEffect, useState } from "react";
 import { useAuth0 } from "@auth0/auth0-react";
 import { Link } from "react-router-dom";
 
 import MovieForm from "./movie-form.js";
 import MoviesDataService from "../services/movies.js";
 import "../style/add-movie.css";
 
 const AddMovie = () => {
     const { user, isAuthenticated } = useAuth0();
 
     // User Information
     const [isAdmin, setIsAdmin] = useState(false);
     const [roleRetrieved, setRoleRetrieved] = useState(false);
 
     // Request Information
     const [requests, setRequests] = useState({});
     const [allRequests, setAllRequests] = useState({});
     const [requestsRetrieved, setRequestsRetrieved] = useState(false);
     const [allRequestsRetrieved, setAllRequestsRetrieved] = useState(false);
     const [pendingRequests, setPendingRequests] = useState(0);
     const [processedRequests, setProcessedRequests] = useState(0);
 
     // Movie Information
     const [acceptedRequest, setAcceptedRequest] = useState({});
     const [imdb, setImdb] = useState(""); // String: Have this be inputted by the admin
     const [poster, setPoster] = useState(""); // String: Have this be inputted by the admin
 
     /**
      * If the user is an admin, then get all movie requests available in the database.
      * Otherwise, only retrieve the specific user's movie requests. 
      */
     useEffect(() => {
         if (isAuthenticated && !roleRetrieved) {
             getUserRole();
         }
         if (isAuthenticated && roleRetrieved && !isAdmin & !requestsRetrieved) {
             getUserRequests();
         }
         if (isAuthenticated && roleRetrieved && isAdmin && !allRequestsRetrieved) {
             getAllRequests();
         }
     }, [user, roleRetrieved, requestsRetrieved, allRequestsRetrieved])
 
     /**
      * Determines whether the user is an Admin or a regular User.
      */
     const getUserRole = () => {
         MoviesDataService.getUserRole(user.email)
             .then(response => {
                 setRoleRetrieved(true);
                 setIsAdmin(response.data);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Gets a specific user's movie requests and determines how many 
      * of those active requests are still "pending" or have been "processed".
      */
     const getUserRequests = () => {
         MoviesDataService.getRequests(user.email)
             .then(response => {
                 // Retrieved movie requests
                 setRequests(response.data.requestList);
 
                 // Calculate number of pending and processed requests.
                 let pending = 0;
                 let processed = 0;
                 for (let i = 0; i < response.data.requestList.length; i++) {
                     if (response.data.requestList[i].status == "pending" &&
                         response.data.requestList[i].active) {
                         pending++;
                     }
                     else if (response.data.requestList[i].active) {
                         processed++;
                     }
                 }
                 setPendingRequests(pending);
                 setProcessedRequests(processed);
                 setRequestsRetrieved(true);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Gets all available movie requests for the Admin to review.
      * The returned requests are also checked to see if they are active,
      * and whether they are still pending or have already been processed.
      */
     const getAllRequests = () => {
         MoviesDataService.getAllRequests()
             .then(response => {
                 // Retrieved requests
                 setAllRequests(response.data.requestList);
 
                 // Calculate number of pending and processed requests.
                 let pending = 0;
                 let processed = 0;
                 for (let i = 0; i < response.data.requestList.length; i++) {
                     if (response.data.requestList[i].status == "pending" &&
                         response.data.requestList[i].active) {
                         pending++;
                     }
                     else if (response.data.requestList[i].active) {
                         processed++;
                     }
                 }
                 setPendingRequests(pending);
                 setProcessedRequests(processed);
                 setAllRequestsRetrieved(true);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Removes a movie request object from the movie_requests collection.
      * @param {*} request The request to be deleted/removed
      */
     const deleteRequest = (request) => {
         MoviesDataService.deleteRequest(request._id, request.user_id)
             .then(response => {
                 // Reloads the displayed requests if a request is deleted successfully
                 if (response.data == "success") {
                     if (isAdmin) {
                         setAllRequestsRetrieved(false);
                     }
                     else {
                         setRequestsRetrieved(false);
                     }
                 }
                 else {
                     alert("Unable to delete request.");
                 }
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Changes the status of a movie request object from "pending" to "denied"
      * @param {*} request The request to be denied
      */
     const denyRequest = (request) => {
         let data = {
             id: request._id,
             user_id: request.user_id,
         };
 
         MoviesDataService.denyRequest(data)
             .then(response => {
                 // Reloads the displayed requests if a request is successfully denied
                 if (response.data == "success") {
                     alert("Request Denied");
                     setAllRequestsRetrieved(false);
                 }
                 else {
                     alert("Unable to deny request");
                 }
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Adds the movie of an accepted request to the database and updates
      * the status of the accepted request to "accepted". The ObjectID of the newly added
      * movie is also added to the accepted movie request object.
      */
     const acceptRequest = () => {
         // Get attributes from the accepted request.
         let movieInfo = {
             title: acceptedRequest.title,
             year: acceptedRequest.year,
             fullplot: acceptedRequest.fullplot,
             genres: acceptedRequest.genres,
             imdb: imdb,
             poster: poster,
             runtime: acceptedRequest.runtime,
             released: acceptedRequest.released.split("T")[0],
             rated: acceptedRequest.rated,
         };
 
         // Add the movie to the database
         MoviesDataService.addMovie(movieInfo)
             .then(response => {
                 if (response.data.status == "success") {
                     let data = {
                         id: acceptedRequest._id,
                         user_id: acceptedRequest.user_id,
                         title: acceptedRequest.title,
                         year: acceptedRequest.year,
                         genres: acceptedRequest.genres,
                         rated: acceptedRequest.rated,
                     };
 
                     // Update the request object's status to "accepted"
                     // Append the ObjectID of the newly accepted movie to the request object
                     MoviesDataService.acceptRequest(data)
                         .then(response => {
                             alert("Successfully added to MovieDB!");
                             setImdb("");
                             setPoster("");
                             setAllRequestsRetrieved(false);
                         })
                         .catch(e => {
                             console.log(e);
                         })
                 }
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Updates a request object's active field. Deactivated requests
      * will no longer appear in any user's profile page.
      * @param {*} request The request to be deactivated
      */
     const deactivateRequest = (request) => {
         let data = {
             id: request._id,
             user_id: request.user_id,
         };
 
         MoviesDataService.deactivateRequest(data)
             .then(response => {
                 if (response.data == "success") {
                     alert("Request Deactivated");
                     // Reloads the displayed requests if a request is successfully deactivated.
                     if (isAdmin) {
                         setAllRequestsRetrieved(false);
                     }
                     else {
                         setRequestsRetrieved(false);
                     }
                 }
                 else {
                     alert("Unable to deactivate request");
                 }
             })
     }
 
     // Call-back function for MovieForm to reload the AddMovie component when a request is submitted.
     const submittedRequest = (status) => {
         if (status) {
             setRequestsRetrieved(false);
         }
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
 
     const onChangeImdb = e => {
         const imdb = e.target.value.split(",");
         setImdb(imdb);
     }
 
     const onChangePoster = e => {
         const poster = e.target.value;
         setPoster(poster);
     }
 
     if (isAuthenticated) {
         if (roleRetrieved && (requestsRetrieved || allRequestsRetrieved)) {
             return (
                 <div>
                     <div className="movie-form">
                         <MovieForm user={user} isAdmin={isAdmin} submittedRequest={submittedRequest} review={false} />
                     </div>
 
                     <div>
                         {isAdmin ? (
                             <div className="request">
                                 {/** Admin Interface */}
                                 <h3>Pending Requests: </h3>
                                 {(allRequests.length > 0 && pendingRequests > 0) ? (
                                     <div className="row">
                                         {allRequests.map((request, index) => {
                                             if (request.status == "pending" && request.active) {
                                                 return (
                                                     <div className="col-lg-4 pb-1">
                                                         <div className="card">
                                                             <div className="card-body">
                                                                 {(request.title.length > 30) ? (
                                                                     <h5 className="card-title mb-4">{(request.title.substr(0, 42).concat(`...(${request.year})`))}</h5>
                                                                 ) : (
                                                                     <h5 className="card-title mb-5">{request.title} ({request.year})</h5>
                                                                 )}
                                                             </div>
 
                                                             <div className="card-text">
                                                                 <p><strong>Status: </strong> {request.status.toUpperCase()}</p>
                                                                 <p><strong>Rated: </strong> {request.rated}</p>
                                                                 <p><strong>{formatGenre(request.genres)}</strong></p>
                                                                 <p><strong>Fullplot: </strong> {request.fullplot}</p>
                                                                 <p><strong>Released: </strong> {request.released.split("T")[0]}</p>
                                                                 <p><strong>Runtime: </strong> {request.runtime}</p>
                                                                 <p><strong>Last Updated: </strong> {request.lastupdated.split("T")[0]}</p>
                                                                 <p><strong>User: </strong> {request.user_id}</p>
                                                             </div>
 
                                                             <div className="card-footer">
                                                                 <div className="footer-buttons">
                                                                     <button
                                                                         type="button"
                                                                         class="btn btn-primary"
                                                                         data-bs-toggle="modal"
                                                                         data-bs-target="#accept-request"
                                                                         onClick={() => setAcceptedRequest(request)}
                                                                     >
                                                                         Accept
                                                                     </button>
                                                                     <div
                                                                         className="btn delete-request"
                                                                         onClick={() => denyRequest(request)}
                                                                     >
                                                                         Deny
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                         </div>
 
                                                         <div class="modal fade" tabIndex="-1" id="accept-request">
                                                             <div class="modal-dialog">
                                                                 <div class="modal-content">
                                                                     <div class="modal-header">
                                                                         <h5 class="modal-title">{acceptedRequest.title}</h5>
                                                                         <button
                                                                             type="button"
                                                                             class="btn-close"
                                                                             data-bs-dismiss="modal"
                                                                             aria-label="Close"
                                                                         ></button>
                                                                     </div>
                                                                     <div class="modal-body">
                                                                         <div className="movie-info-group">
                                                                             <p>Please enter the movie's imdb information below.</p>
                                                                             <div className="input-group">
                                                                                 <input
                                                                                     type="text"
                                                                                     className="form-control"
                                                                                     placeholder="eg: Rating, Votes, ID"
                                                                                     value={imdb}
                                                                                     onChange={onChangeImdb}
                                                                                 />
                                                                             </div>
                                                                         </div>
 
                                                                         <div className="movie-info-group">
                                                                             <p>Please enter the movie's poster link below.</p>
                                                                             <div className="input-group">
                                                                                 <input
                                                                                     type="text"
                                                                                     className="form-control"
                                                                                     placeholder="eg: https://m.media-amazon.com/images/..."
                                                                                     value={poster}
                                                                                     onChange={onChangePoster}
                                                                                 />
                                                                             </div>
                                                                         </div>
                                                                     </div>
 
                                                                     <div class="modal-footer">
                                                                         <button
                                                                             type="submit"
                                                                             class="btn btn-primary"
                                                                             data-bs-dismiss="modal"
                                                                             onClick={() => acceptRequest()}>
                                                                             Add Movie </button>
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 )
                                             }
                                         })}
                                     </div>
                                 ) : (
                                     <div>
                                         No pending requests.
                                     </div>
                                 )}
                                 <br />
                                 <h3>Processed Requests: </h3>
                                 {(allRequests.length > 0 && processedRequests > 0) ? (
                                     <div className="row">
                                         {allRequests.map((request, index) => {
                                             if (request.status != "pending" && request.active) {
                                                 return (
                                                     <div className="col-lg-4 pb-1">
                                                         <div className="card">
                                                             <div className="card-body">
                                                                 {(request.title.length > 30) ? (
                                                                     <h5 className="card-title mb-4">{(request.title.substr(0, 42).concat(`...(${request.year})`))}</h5>
                                                                 ) : (
                                                                     <h5 className="card-title mb-5">{request.title} ({request.year})</h5>
                                                                 )}
                                                             </div>
 
                                                             <div className="card-text">
                                                                 <p><strong>Status: </strong> {request.status.toUpperCase()}</p>
                                                                 <p><strong>Rated: </strong> {request.rated}</p>
                                                                 <p><strong>{formatGenre(request.genres)}</strong></p>
                                                                 <p><strong>Fullplot: </strong> {request.fullplot}</p>
                                                                 <p><strong>Released: </strong> {request.released.split("T")[0]}</p>
                                                                 <p><strong>Last Updated: </strong> {request.lastupdated.split("T")[0]}</p>
                                                             </div>
 
                                                             <div className="card-footer">
                                                                 <div className="footer-buttons">
                                                                     <div
                                                                         className="btn delete-request"
                                                                         onClick={() => deleteRequest(request)}
                                                                     >
                                                                         Delete
                                                                     </div>
 
                                                                     {(request.status == "accepted" && request.active) ? (
                                                                         <div>
                                                                             <Link to={"/movies/id/" + request.movie_id} className="btn request-movie">
                                                                                 Movie
                                                                             </Link>
                                                                         </div>
                                                                     ) : (
                                                                         <div>
                                                                         </div>
                                                                     )}
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 )
                                             }
                                         })}
                                     </div>
                                 ) : (
                                     <div>
                                         No processed requests.
                                     </div>
                                 )}
                             </div>
                         ) : (
                             <div className="request">
                                 {/** User Interface */}
                                 <h3>Your Pending Movie Requests:</h3>
                                 {(requests.length > 0 && pendingRequests > 0) ? (
                                     <div className="row">
                                         {requests.map((request, index) => {
                                             if (request.status == "pending" && request.active) {
                                                 return (
                                                     <div className="col-lg-4 pb-1">
                                                         <div className="card">
                                                             <div className="card-body">
                                                                 {(request.title.length > 30) ? (
                                                                     <h5 className="card-title mb-4">{(request.title.substr(0, 42).concat(`...(${request.year})`))}</h5>
                                                                 ) : (
                                                                     <h5 className="card-title mb-5">{request.title} ({request.year})</h5>
                                                                 )}
                                                             </div>
 
                                                             <div className="card-text">
                                                                 <p><strong>Status: </strong> {request.status.toUpperCase()}</p>
                                                                 <p><strong>Rated: </strong> {request.rated}</p>
                                                                 <p><strong>{formatGenre(request.genres)}</strong></p>
                                                             </div>
 
                                                             <div className="card-footer">
                                                                 <div className="footer-buttons">
                                                                     <div
                                                                         className="btn delete-request"
                                                                         onClick={() => deleteRequest(request)}
                                                                     >
                                                                         Delete
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 )
                                             }
                                         })}
                                     </div>
                                 ) : (
                                     <div>
                                         You don't have any pending requests.
                                     </div>
                                 )}
                                 <br />
                                 <h3>Your Processed Movie Requests:</h3>
                                 {(requests.length > 0 && processedRequests > 0) ? (
                                     <div className="row">
                                         {requests.map((request, index) => {
                                             if (request.status != "pending" && request.active) {
                                                 return (
                                                     <div className="col-lg-4 pb-1">
                                                         <div className="card">
                                                             <div className="card-body">
                                                                 {(request.title.length > 30) ? (
                                                                     <h5 className="card-title mb-4">{(request.title.substr(0, 42).concat(`...(${request.year})`))}</h5>
                                                                 ) : (
                                                                     <h5 className="card-title mb-5">{request.title} ({request.year})</h5>
                                                                 )}
                                                             </div>
 
                                                             <div className="card-text">
                                                                 <p><strong>Status: </strong> {request.status.toUpperCase()}</p>
                                                                 <p><strong>Rated: </strong> {request.rated}</p>
                                                                 <p><strong>{formatGenre(request.genres)}</strong></p>
                                                             </div>
 
                                                             <div className="card-footer">
                                                                 <div className="footer-buttons">
                                                                     {(request.status == "accepted" && request.active) ? (
                                                                         <div>
                                                                             <Link to={"/movies/id/" + request.movie_id} className="btn request-movie">
                                                                                 Movie
                                                                             </Link>
                                                                         </div>
                                                                     ) : (
                                                                         <div>
                                                                         </div>
                                                                     )}
 
                                                                     <div
                                                                         className="btn confirm-review"
                                                                         onClick={() => deactivateRequest(request)}
                                                                     >
                                                                         Confirm
                                                                     </div>
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 )
                                             }
                                         })}
                                     </div>
                                 ) : (
                                     <div>
                                         You don't have any processed requests.
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>
                 </div>
             )
         }
         else {
             return (
                 <div>
                     Loading...
                 </div>
             )
         }
     }
     else {
         <div>
             Not Authenticated.
         </div>
     }
 }
 
 export default AddMovie;