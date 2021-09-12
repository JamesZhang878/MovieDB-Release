/**
 * Receives input for movie requests or movie additions. Also formats
 * the input to check if it is valid. Admins can directly add movies to the 
 * database while users can only submit requests that will require review from 
 * an Admin.
 * 
 * Features:
 * - Check to see if all inputs are valid
 * - Check to see if the desired movie addition/request already exists.
 * - Add a movie to the movies collection
 * - Add a request to the movie_requests collection
 * - Reset input fields
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import React, { useState } from "react";

 import MoviesDataService from "../services/movies.js";
 import "../style/movie-form.css";
 
 const MovieForm = (props) => {
     const [title, setTitle] = useState(""); // String
     const [year, setYear] = useState(""); // Int32
     const [fullPlot, setFullPlot] = useState(""); // String 
     const [genres, setGenres] = useState([]); // String 
     const [imdb, setImdb] = useState(""); // String: Have this be inputted by the admin
     const [poster, setPoster] = useState(""); // String: Have this be inputted by the admin
     const [runtime, setRuntime] = useState(""); // Int32: In Minutes
     const [rated, setRated] = useState(""); // String
     const [released, setReleased] = useState(""); // String
 
     const [requestSubmitted, setRequestSubmitted] = useState(false);
 
     /**
      * Checks to see if the inputted information is valid. 
      * @returns Whether the form inputs are valid
      */
     const validateInputs = () => {
         if (title == null || title.length < 1) { return false; }
         if (year == null || isNaN(parseInt(year)) || parseInt(year) > 2050 || parseInt(year) < 1877) { return false; }
         if (fullPlot == null || fullPlot.length < 1) { return false; }
         if (genres == null || genres.length < 1) { return false; }
         if (runtime == null || isNaN(parseInt(runtime)) || parseInt(runtime) > 300 || parseInt(runtime) < 30) { return false; }
         if (rated == null || rated.length >= 10) { return false; }
         if (released == null || released.split("-").length != 3 || !isReleasedValid()) { return false; }
         if (props.isAdmin) {
             if (imdb == null || imdb.length < 3) { return false; }
             if (poster == null || poster.length < 1) { return false; }
         }
         return true;
     }
 
     /**
      * Checks to see if the released date provided is valid
      * @returns Whether the released date provided is valid
      */
     const isReleasedValid = () => {
         let releasedArr = released.split("-");
         if (releasedArr.length != 3) { return false; }
         if (releasedArr[0] > 2050 || releasedArr[0] < 1877) { return false; }
         if (releasedArr[1] > 12 || releasedArr[1] < 1) { return false; }
         if (releasedArr[2] > 31 || releasedArr[2] < 1) { return false; }
         return true;
     }
 
     /**
      * Checks the validity of the input with validateInputs(), formats the genres attribute,
      * checks to see if the requested movie already exists in MovieDB, and either adds the
      * movie to the database if the user is an Admin or adds a request to the movie_requests
      * collection if the user is a regular user.
      * 
      * If the user is a regular user, then this method also checks to see if this user is 
      * at their limit of 5 pending movie requests.
      * 
      * This method handles a lot of different tasks because a lot of what it does is asynchronous,
      * which makes it necessary for everything to be in one method.
      */
     const addMovie = () => {
         let validInputs = validateInputs();
 
         if (!validInputs) {
             alert("Please fill out all fields with valid information.");
         }
         else {
             // Formatting the genres attribute by removing any leading or trailing white spaces.
             let genresList = [];
             for (let i = 0; i < genres.length; i++) {
                 genresList.push(genres[i].trim());
             }
 
             let movieInfo = {
                 title: title,
                 year: year,
                 fullplot: fullPlot,
                 genres: genresList,
                 imdb: imdb,
                 poster: poster,
                 runtime: runtime,
                 released: released,
                 rated: rated,
             };
 
             // Checks to see if a similar movie already exists in MovieDB.
             let searchParams = {
                 filters: [title, year, genres[0], rated],
                 findBys: ["title", "year", "genres", "rated"],
             };
 
             let duplicate = false;
 
             MoviesDataService.find(searchParams, 0)
                 .then(response => {
                     if (response.data.moviesList.length > 0) {
                         // If there is another movie with the same title and the same year, 
                         // then the movie that is being requested already exists in MovieDB.
                         for (let i = 0; i < response.data.moviesList.length; i++) {
                             let currMovie = response.data.moviesList[i];
                             if (currMovie.title == title &&
                                 currMovie.year == year) {
                                 duplicate = true;
                                 break;
                             }
                         }
                     }
 
                     if (duplicate) {
                         alert("This movie is already available in MovieDB!");
                         resetFields();
                     }
                     else {
                         // Movie being added by admin
                         if (props.isAdmin) {
                             MoviesDataService.addMovie(movieInfo)
                                 .then(response => {
                                     if (response.data.status == "success") {
                                         alert("Movie added successfully!");
                                         setTimeout(resetFields, 10000);
                                     }
                                 })
                                 .catch(e => {
                                     console.log(e);
                                 })
                         }
                         // Adding a movie request as a regular user
                         else {
                             MoviesDataService.getRequests(props.user.email)
                                 .then(response => {
                                     // Checks the number of pending requests this user currently has
                                     let pendingRequests = 0;
                                     for (let i = 0; i < response.data.requestList.length; i++) {
                                         let currRequest = response.data.requestList[i];
                                         if (currRequest.status == "pending" &&
                                             currRequest.active) {
                                             pendingRequests++;
                                         }
                                     }
 
                                     // Users are limited to 5 pending requests at any given time.
                                     if (pendingRequests >= 5) {
                                         alert("You've reached your request limit for now!" +
                                             " Please give the admin some time to review your pending requests." +
                                             " Thank you!");
                                     }
                                     else {
                                         movieInfo.user_id = props.user.email;
                                         movieInfo.status = "pending";
                                         movieInfo.active = true;
                                         MoviesDataService.addRequest(movieInfo)
                                             .then(response => {
                                                 if (response.data == "success") {
                                                     setRequestSubmitted(true);
                                                     setTimeout(resetFields, 10000);
                                                 }
                                                 else {
                                                     alert("Unable to submit request. Please try again or contact the admin.");
                                                 }
                                             })
                                             .catch(e => {
                                                 console.log(e);
                                             })
                                     }
                                 })
                                 .catch(e => {
                                     console.log(e.message);
                                 })
                         }
                     }
                 })
                 .catch(e => {
                     console.log(e);
                 })
         }
     }
 
     /**
      * Resets input fields
      */
     const resetFields = () => {
         setTitle("");
         setYear("");
         setFullPlot("");
         setGenres("");
         setRuntime("");
         setRated("");
         setReleased("");
         if (props.isAdmin) {
             setImdb("");
             setPoster("");
         }
         setRequestSubmitted(false);
     }
 
     // Input field listener methods
     const onChangeTitle = e => {
         const title = e.target.value;
         setTitle(title);
     }
 
     const onChangeYear = e => {
         const year = e.target.value;
         setYear(year);
     }
 
     const onChangeFullPlot = e => {
         const fullPlot = e.target.value;
         setFullPlot(fullPlot);
     }
 
     const onChangeGenres = e => {
         const genres = e.target.value.split(",");
         setGenres(genres);
     }
 
     const onChangeImdb = e => {
         const imdb = e.target.value.split(",");
         setImdb(imdb);
     }
 
     const onChangePoster = e => {
         const poster = e.target.value;
         setPoster(poster);
     }
 
     const onChangeRuntime = e => {
         const runtime = e.target.value;
         setRuntime(runtime);
     }
 
     const onChangeReleased = e => {
         const released = e.target.value;
         setReleased(released);
     }
 
     const onChangeRated = e => {
         const rated = e.target.value;
         setRated(rated);
     }
 
     return (
         <div>
             <div className="request-section-header">
                 <h3>Movie Requests</h3>
                 <button
                     type="button"
                     class="btn movie-form-btn"
                     data-bs-toggle="modal"
                     data-bs-target="#add-movie"
                     title="Request a movie"
                 >
                     &oplus;
                 </button>
             </div>
 
             {requestSubmitted ? (
                 <div class="modal fade" tabIndex="-1" id="add-movie">
                     <div class="modal-dialog">
                         <div class="modal-content">
                             <div class="modal-header">
                                 <h5 class="modal-title">Request Submitted!</h5>
                                 <button
                                     type="button"
                                     class="btn-close"
                                     data-bs-dismiss="modal"
                                     aria-label="Close"
                                     onClick={() => { props.submittedRequest(true); }}
                                 ></button>
                             </div>
                             <div class="modal-body">
                                 Please give the admin 2-3 business days to review your request. Thank you!
                             </div>
                         </div>
                     </div>
                 </div>
             ) : (
                 <div class="modal fade" tabIndex="-1" id="add-movie">
                     <div class="modal-dialog">
                         <div class="modal-content">
                             <div class="modal-header">
                                 <h5 class="modal-title">{props.isAdmin ? "Movie Form" : "Movie Request Form"}</h5>
                                 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                             </div>
                             <div class="modal-body">
                                 <div className="movie-info-group">
                                     <p>Please enter the movie title below.</p>
                                     <div className="input-group">
                                         <input
                                             type="text"
                                             className="form-control"
                                             placeholder="eg: Pulp Fiction"
                                             value={title}
                                             onChange={onChangeTitle}
                                         />
                                     </div>
                                 </div>
 
                                 <div className="movie-info-group">
                                     <p>Please enter the year the movie was released below.</p>
                                     <div className="input-group">
                                         <input
                                             type="text"
                                             className="form-control"
                                             placeholder="eg: 1994"
                                             value={year}
                                             onChange={onChangeYear}
                                         />
                                     </div>
                                 </div>
 
                                 <div className="movie-info-group">
                                     <p>Please enter the movie's FULL plot below.</p>
                                     <div className="input-group">
                                         <input
                                             type="text"
                                             className="form-control"
                                             placeholder="eg: Jules Winnfield and Vincent Vega
                                                    are two hitmen who are out to retrieve 
                                                    a suitcase stolen from their employer, 
                                                    mob boss Marsellus Wallace. Wallace has 
                                                    also asked Vincent..."
                                             value={fullPlot}
                                             onChange={onChangeFullPlot}
                                         />
                                     </div>
                                 </div>
 
                                 <div className="movie-info-group">
                                     <p>Please enter the movie's genre(s) below separated by commas.</p>
                                     <div className="input-group">
                                         <input
                                             type="text"
                                             className="form-control"
                                             placeholder="eg: Crime, Drama"
                                             value={genres}
                                             onChange={onChangeGenres}
                                         />
                                     </div>
                                 </div>
 
                                 <div className="movie-info-group">
                                     <p>Please enter the movie's runtime below (in minutes).</p>
                                     <div className="input-group">
                                         <input
                                             type="text"
                                             className="form-control"
                                             placeholder="eg: 154"
                                             value={runtime}
                                             onChange={onChangeRuntime}
                                         />
                                     </div>
                                 </div>
 
                                 <div className="movie-info-group">
                                     <p>Please enter the exact date the movie was released on below with the following format: (YYYY-MM-DD).</p>
                                     <div className="input-group">
                                         <input
                                             type="text"
                                             className="form-control"
                                             placeholder="eg: 1994-10-14"
                                             value={released}
                                             onChange={onChangeReleased}
                                         />
                                     </div>
                                 </div>
 
                                 <div className="movie-info-group">
                                     <p>Please enter the movie's rating below.</p>
                                     <div className="input-group">
                                         <input
                                             type="text"
                                             className="form-control"
                                             placeholder="eg: G, PG, PG-13, R, etc"
                                             value={rated}
                                             onChange={onChangeRated}
                                         />
                                     </div>
                                 </div>
 
                                 {props.isAdmin ? (
                                     <div>
                                         <div className="movie-info-group">
                                             <p>Please enter a link to the movie's poster below.</p>
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
 
                                         <div className="movie-info-group">
                                             <p>Please enter the movie's imdb information below.</p>
                                             <div className="input-group">
                                                 <input
                                                     type="text"
                                                     className="form-control"
                                                     placeholder="eg: rating, votes, id"
                                                     value={imdb}
                                                     onChange={onChangeImdb}
                                                 />
                                             </div>
                                         </div>
                                     </div>
                                 ) : (
                                     <div>
                                         <strong>Please make sure that all of the information you
                                             provided is valid and follows the given formats!</strong>
                                     </div>
                                 )}
                             </div>
 
                             <div class="modal-footer">
                                 <button
                                     type="submit"
                                     class="btn btn-primary"
                                     onClick={addMovie}>
                                     {props.isAdmin ? ("Add Movie") : ("Submit Request")} </button>
                             </div>
                         </div>
                     </div>
                 </div>
             )}
         </div>
     )
 }
 
 export default MovieForm;