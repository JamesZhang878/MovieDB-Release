/**
 * Displays the movies available in MovieDB in a grid-like fashion. This 
 * is the main component that a user would interact with when using MovieDB.
 * 
 * Features:
 * - Get all movies
 * - Get all genres
 * - Get all rated (G, PG, PG-13, etc)
 * - Find-by-filter (title, year, genre, rated)
 * - Activate/Deactivate find-by-filter. (facilitates multi-filter search).
 * - Search params event listeners.
 * - Format displayed genre(s) 
 * - Format IMDb ID
 * - Pagination (pageScout(), pageScoutDirector(), and pagination())
 * - Key press event listeners.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import React, { useState, useEffect } from "react";
 import { Link } from "react-router-dom";
 
 import MoviesDataService from "../services/movies.js";
 import "../style/movies-list.css";
 
 const MoviesList = props => {
     const [movies, setMovies] = useState([]);
     const [searchTitle, setSearchTitle] = useState("");
     const [searchYear, setSearchYear] = useState("");
     const [searchGenre, setSearchGenre] = useState("");
     const [genres, setGenres] = useState(["All Genres"]);
     const [searchRated, setSearchRated] = useState("");
     const [rated, setRated] = useState(["All Ratings"]);
 
     // Variables for Pagination
     const [currPage, setCurrPage] = useState(1);
     const [findByFilter, setFindByFilter] = useState(false);
     const [searchParams, setSearchParams] = useState({ filters: [], findBys: [] });
     const [prevPageExists, setPrevPageExists] = useState(false);
     const [nextPageExists, setNextPageExists] = useState(false);
 
     /**
      * This component will update if there is a change in currPage, findByFilter,
      * searchParams, prevPageExists, or nextPageExists.
      */
     useEffect(() => {
         // Determines if there is a previous or next page.
         pageScoutDirector("previous");
         pageScoutDirector("next");
 
         if (findByFilter) {
             find(searchParams, currPage);
             retrieveGenres();
             retrieveRated();
         }
         else {
             retrieveMovies(currPage);
             retrieveGenres();
             retrieveRated();
         }
     }, [currPage, findByFilter, searchParams, prevPageExists, nextPageExists])
 
     /**
      * Retrieves all movies from the movies collection.
      * @param {*} page The page that the UI is currently on.
      *                 Determines which movies are displayed.
      */
     const retrieveMovies = (page) => {
         MoviesDataService.getAll(page)
             .then(response => {
                 setMovies(response.data.moviesList);
             })
             .catch(e => {
                 console.log(e);
             });
     };
 
     /**
      * Retrieves all genres available in the movies in the movies collection.
      */
     const retrieveGenres = () => {
         MoviesDataService.getGenres()
             .then(response => {
                 setGenres(["All Genres"].concat(response.data));
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Retrieves all ratings (G, PG, PG-13, etc) available in the movies in 
      * the movies collection.
      */
     const retrieveRated = () => {
         MoviesDataService.getRated()
             .then(response => {
                 setRated(["All Rated"].concat(response.data));
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Retrieves a filtered set of the movies available in the movies collection
      * @param {*} params The filters to be applied during the movie search
      * @param {*} currPage The page that the UI is currently on.
      *                     Determines which movies are displayed.
      */
     const find = (params, currPage) => {
         MoviesDataService.find(params, currPage)
             .then(response => {
                 setMovies(response.data.moviesList);
             })
             .catch(e => {
                 console.log(e);
             });
     };
 
     /**
      * Activates the find-by-filter feature that allows users to search
      * for movies with any combination of the following filters: title,
      * year, genre(s), and rated.
      * @param {*} searchFilter The actual terms that the user wants to look for (eg: Pulp Fiction)
      * @param {*} searchFindBy The type of the terms being used (eg: title)
      */
     const activateFindByFilter = (searchFilter, searchFindBy) => {
         setFindByFilter(true);
         let tempFilters = [];
         let tempFindBys = [];
 
         tempFilters.push(searchFilter);
         tempFindBys.push(searchFindBy);
 
         // Checks to see if there are any other filters that have been filled 
         //        out that are not already included in the searchFilter and 
         //        searchFindBy params
         if (searchTitle && !tempFindBys.includes("title")) {
             tempFilters.push(searchTitle);
             tempFindBys.push("title");
         }
 
         if (searchYear && !tempFindBys.includes("year")) {
             tempFilters.push(searchYear);
             tempFindBys.push("year");
         }
 
         if (searchGenre && !tempFindBys.includes("genres")) {
             tempFilters.push(searchGenre);
             tempFindBys.push("genres");
         }
 
         if (searchRated && !tempFindBys.includes("rated")) {
             tempFilters.push(searchRated);
             tempFindBys.push("rated");
         }
 
         // Triggers another call of useEffect() to reload the component
         setSearchParams({ filters: tempFilters, findBys: tempFindBys });
         setCurrPage(1);
     }
 
     /**
      * Deactivates the find-by-filter feature for the provided search category
      * @param {*} deactivatedFindBy The search category to deactivate.
      */
     const deactivateFindByFilter = (deactivatedFindBy) => {
         let findByIndex = searchParams.findBys.indexOf(deactivatedFindBy);
 
         // Removes the search category from the searchParams and reloads the component
         if (findByIndex != -1 && searchParams.findBys.length > 1) {
 
             let tempFilters = searchParams.filters;
             let tempFindBys = searchParams.findBys;
 
             tempFilters.splice(findByIndex, 1);
             tempFindBys.splice(findByIndex, 1);
 
             setSearchParams({ filters: tempFilters, findBys: tempFindBys });
             setCurrPage(1);
         }
         else {
             setFindByFilter(false);
             setSearchParams({ filters: [], findBys: [] });
             setCurrPage(1);
         }
     }
 
     // The following functions make custom calls the find() function.
     const findByTitle = () => {
         if (searchTitle) {
             activateFindByFilter(searchTitle, "title");
         }
         else {
             deactivateFindByFilter("title");
         }
     }
 
     const findByYear = () => {
         if (searchYear) {
             activateFindByFilter(searchYear, "year");
         }
         else {
             deactivateFindByFilter("year");
         }
     }
 
     const findByGenre = () => {
         if (searchGenre == "All Genres") {
             deactivateFindByFilter("genres");
             setSearchGenre("");
         }
         else {
             activateFindByFilter(searchGenre, "genres");
         }
     }
 
     const findByRated = () => {
         if (searchRated == "All Rated") {
             deactivateFindByFilter("rated");
             setSearchRated("");
         }
         else {
             activateFindByFilter(searchRated, "rated");
         }
     }
 
     // The following functions handle updating the search category variables.
     const onChangeSearchTitle = e => {
         const searchTitle = e.target.value;
         setSearchTitle(searchTitle);
     }
 
     const onChangeSearchYear = e => {
         const searchYear = e.target.value;
         setSearchYear(searchYear);
     }
 
     const onChangeSearchGenre = e => {
         const searchGenre = e.target.value;
         setSearchGenre(searchGenre);
     }
 
     const onChangeSearchRated = e => {
         const searchRated = e.target.value;
         setSearchRated(searchRated);
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
 
     // PAGINATION METHODS STARTS BELOW //
     /**
      * Checks to see if there are movies for either the next page or the previous
      * page in the MovieList UI. This method sets up the booleans that are
      * then used in pagination() to help with pagination.
      * @param {*} params Filters used if findByFilter is true.
      * @param {*} changedPage The new page to be evaluated for content
      * @param {*} direction Either previous or next.
      */
     const pageScout = (params, changedPage, direction) => {
         MoviesDataService.find(params, changedPage)
             .then(response => {
                 if (response.data.moviesList && response.data.moviesList.length > 0) {
                     if (direction == "previous") {
                         setPrevPageExists(true);
                     }
                     else {
                         setNextPageExists(true);
                     }
                 }
                 else {
                     if (direction == "previous") {
                         setPrevPageExists(false);
                     }
                     else {
                         setNextPageExists(false);
                     }
                 }
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Determines how pageScout() should be called based on the direction of the
      * request and whether findByFilter is on.
      * @param {*} direction previous or next.
      */
     const pageScoutDirector = (direction) => {
         if (findByFilter) {
             if (direction == "previous") {
                 if (currPage == 1) {
                     setPrevPageExists(false);
                 }
                 else {
                     pageScout(searchParams, currPage - 1, direction);
                 }
             }
             else {
                 pageScout(searchParams, currPage + 1, direction);
             }
         }
         else {
             if (direction == "previous") {
                 if (currPage == 1) {
                     setPrevPageExists(false);
                 }
                 else {
                     pageScout("", currPage - 1, direction);
                 }
             }
             else {
                 pageScout("", currPage + 1, direction);
             }
         }
     }
 
     /**
      * Paginates based on the direction param. prevPageExists and nextPageExists are 
      * determined by pageScoutDirector() and pageScout().
      * @param {*} direction previous or next.
      */
     const pagination = (direction) => {
         if (direction == "previous" && prevPageExists) {
             setCurrPage(currPage - 1);
         }
         else if (direction == "next" && nextPageExists) {
             setCurrPage(currPage + 1);
         }
     }
 
     /**
      * The following methods allow for the "enter" key to be
      * used when searching by title or by year.
      */
     const handleKeyPressTitle = e => {
         if (e.key == "Enter") {
             findByTitle();
         }
     }
 
     const handleKeyPressYear = e => {
         if (e.key == "Enter") {
             findByYear();
         }
     }
 
     return (
         <div>
             <div className="row">
                 <div className="movie-params-search">
                     <div className="input-group col-lg-4">
                         <input
                             type="text"
                             className="form-control"
                             placeholder="Search by title"
                             value={searchTitle}
                             onChange={onChangeSearchTitle}
                             onKeyPress={(e) => handleKeyPressTitle(e)}
                         />
                         <div className="input-group-append">
                             <button
                                 className="btn btn-outline-secondary"
                                 type="button"
                                 onClick={findByTitle}
                             >
                                 Search
                             </button>
                         </div>
                     </div>
 
                     <div className="year-search">
                         <div className="input-group col-lg-4">
                             <input
                                 type="text"
                                 className="form-control"
                                 placeholder="Search by year"
                                 value={searchYear}
                                 onChange={onChangeSearchYear}
                                 onKeyPress={(e) => handleKeyPressYear(e)}
                             />
 
                             <div className="input-group-append">
                                 <button
                                     className="btn btn-outline-secondary"
                                     type="button"
                                     onClick={findByYear}
                                 >
                                     Search
                                 </button>
                             </div>
                         </div>
                     </div>
 
                     <div className="genre-search">
                         <div className="input-group col-lg-4 pb-1">
                             <select onChange={onChangeSearchGenre}>
                                 {genres.map(genre => {
                                     return (
                                         <option value={genre}> {genre.substr(0, 20)}</option>
                                     )
                                 })}
                             </select>
                             <div className="input-group-append">
                                 <button
                                     className="btn btn-outline-secondary"
                                     type="button"
                                     onClick={findByGenre}
                                 >
                                     Search
                                 </button>
                             </div>
                         </div>
                     </div>
 
                     <div className="rated-search">
                         <div className="input-group col-lg-4 pb-1">
                             <select onChange={onChangeSearchRated}>
                                 {rated.map(rating => {
                                     return (
                                         <option value={rating}> {rating.substr(0, 20)} </option>
                                     )
                                 })}
                             </select>
                             <div className="input-group-append">
                                 <button
                                     className="btn btn-outline-secondary"
                                     type="button"
                                     onClick={findByRated}
                                 >
                                     Search
                                 </button>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
 
             <div>
                 {(movies.length > 0) ? (
                     <div className="row">
                         {movies.map((movie) => {
                             return (
                                 <div className="col-lg-4 pb-1">
                                     <div className="card">
                                         <img class="card-img-top" src={movie.poster} />
                                         <div className="card-body">
                                             {(movie.title.length > 30) ? (
                                                 <h5 className="card-title mb-4">{(movie.title.substr(0, 42).concat(`...(${movie.year})`))}</h5>
                                             ) : (
                                                 <h5 className="card-title mb-5">{movie.title} ({movie.year})</h5>
                                             )}
 
                                             <p className="card-text">
                                                 <strong>{formatGenre(movie.genres)} </strong>
                                                 <br />
                                                 <strong>Rated: </strong>{movie.rated ? (movie.rated) : "NOT RATED"}
                                                 <br />
                                                 <strong>IMDb: </strong>{movie.imdb ? (movie.imdb.rating + "/10") : "NO RATING"}
                                             </p>
                                             <p className="card-text">
 
                                             </p>
                                             <div className="card-footer text-center">
                                                 <Link to={"/movies/id/" + movie._id} className="btn btn-danger btn-lg btn-block mx-1 mb-1">
                                                     Reviews
                                                 </Link>
                                                 <a
                                                     target="_blank"
                                                     href={"https://www.google.com/search?q=" + movie.title + " " + movie.year}
                                                     className="btn btn-danger btn-lg btn-block mx-1 mb-1">
                                                     Google
                                                 </a>
                                                 <a
                                                     target="_blank"
                                                     href={"https://www.imdb.com/title/tt" + formatIMDbID(movie.imdb.id)}
                                                     className="btn btn-danger btn-lg btn-block mx-1 mb-1">
                                                     IMDb
                                                 </a>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )
                         })}
                     </div>
                 ) : (
                     <div class="no-results" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <br />
                         <br />
                         <br />
                         <h3>No Results Found</h3>
                     </div>
                 )}
             </div>
 
 
             <nav aria-label="Page navigation">
                 <ul class="pagination justify-content-center mt-3 pagination-lg">
                     <li class="page-item">
                         <a
                             onClick={() => (pagination("previous"))}
                             class="page-link"
                             href="#">{((prevPageExists) ? (
                                 <span aria-hidden="true">&laquo;</span>
                             ) : ("-"))}</a>
                     </li>
                     <li class="page-item">
                         <a
                             onClick={() => (pagination("previous"))}
                             class="page-link"
                             href="#">{(prevPageExists) ? (
                                 currPage - 1
                             ) : "X"}</a>
                     </li>
                     <li class="page-item active"><a class="page-link" href="#">{currPage}</a></li>
                     <li class="page-item">
                         <a
                             onClick={() => (pagination("next"))}
                             class="page-link"
                             href="#">{(nextPageExists) ? (
                                 currPage + 1
                             ) : "X"}</a>
                     </li>
                     <li class="page-item">
                         <a
                             onClick={() => (pagination("next"))}
                             class="page-link"
                             href="#">{((nextPageExists) ? (
                                 <span aria-hidden="true">&raquo;</span>
                             ) : ("-"))}</a>
                     </li>
                 </ul>
             </nav>
 
             <footer class="footer mt-3">
                 <div class="container">
                     <img src="/favicon.ico" width="50" height="30" alt="" />
                     <span class="text"><strong>MovieDB</strong></span>
                 </div>
             </footer>
 
         </div>
 
     )
 }
 
 export default MoviesList