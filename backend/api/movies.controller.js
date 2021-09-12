/**
 * Contains methods that facilitates the access and editing of 
 * movie objects performed by MoviesDAO.
 * 
 * Functions:
 * - Get movies based on filters
 * - Get movies by movie ID
 * - Get a list of genres
 * - Get a list of movie ratings
 * - Delete duplicate movie entries
 * - Add a movie to the database
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course.
 */
 import MoviesDAO from "../dao/moviesDAO.js";

 export default class MoviesController {
     /**
      * Gets a list of movies that fit the provided filters.
      */
     static async apiGetMovies(req, res, next) {
         const moviesPerPage = req.query.moviesPerPage ? parseInt(req.query.moviesPerPage, 10) : 21;
         const page = req.query.page ? parseInt(req.query.page, 10) : 0;
 
         // Parse filters
         let filters = [];
 
         if (req.query.title) {
             filters.title = req.query.title;
         }
         if (req.query.genres) {
             filters.genres = req.query.genres;
         }
         if (req.query.rated) {
             filters.rated = req.query.rated;
         }
         if (req.query.year) {
             filters.year = req.query.year;
         }
         
         // Get moviesList
         const moviesList = await MoviesDAO.getMovies({
             filters,
             page,
             moviesPerPage,
         });
         res.json(moviesList);
     }
 
     /**
      * Gets a movie by its specific ID
      */
     static async apiGetMoviesById(req, res, next) {
         try {
             let id = req.params.id || {};
             let movies = await MoviesDAO.getMoviesByID(id);
 
             if (!movies) {
                 res.status(404).json({ error: "Movie Not Found" });
                 return;
             }
             res.json(movies);
         } catch (e) {
             console.error(`Unable to get movies by Id, ${e}`);
             res.status(500).json({ error: e });
         }
     }
 
     /**
      * Gets a list of all of the distinct genres available.
      */
     static async apiGetGenres(req, res, next) {
         try {
             let genres = await MoviesDAO.getGenres();
             res.json(genres);
         } catch (e) {
             console.log(`api, ${e}`);
             res.status(500).json({ error: e });
         }
     }
 
     /**
      * Gets a list of all of the distinct movie ratings (G, PG, PG-13, etc) available.
      */
     static async apiGetRated(req, res, next) {
         try {
             let rated = await MoviesDAO.getRated();
             res.json(rated);
         } catch (e) {
             console.log(`api, ${e}`);
             res.status(500).json({ error: e });
         }
     }
 
     /**
      * Calls a method in MoviesDAO to delete duplicate movie entries
      */
     static async apiDeleteDuplicates(req, res, next) {
         try {
             let response = await MoviesDAO.deleteDuplicateMovies();
             res.json(response);
         } catch (e) {
             console.log(`Api, ${e}`);
         }
     }
 
     /**
      * Parses the information received in the request before adding a new 
      * movie to the database.
      */
     static async apiAddMovie(req, res, next) {
         try {
             // Data parsing
             let data = req.body;
             let imdb = data.imdb + "";
 
             let imdbInfo = {
                 rating: parseFloat(imdb.split(",")[0]),
                 votes: parseInt(imdb.split(",")[1]),
                 id: parseInt(imdb.split(",")[2]),
             };
 
             let releasedArr = data.released.split("-");
             let releasedDate = new Date(releasedArr[0], releasedArr[1] - 1, releasedArr[2]);
 
             let movieInfo = {
                 title: data.title,
                 year: parseInt(data.year),
                 fullplot: data.fullplot,
                 genres: data.genres,
                 imdb: imdbInfo,
                 poster: data.poster,
                 runtime: parseInt(data.runtime),
                 released: releasedDate,
                 rated: data.rated,
                 lastUpdated: new Date(),
                 type: "movie",
             };
 
             // Add movie to database.
             let addMovie = await MoviesDAO.addMovie(movieInfo);
 
             res.json({status: "success"});
         } catch (e) {
             console.log(`Unable to post movie, ${e}`);
             res.status(500).json({error: e.message});
         }
     }
 }