/**
 * Determines which components are rendered based on the current url/path.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: freeCodeCamp MERN Stack Course
 */
 import React from "react";
 import { Switch, Route } from "react-router-dom";
 import { useAuth0 } from "@auth0/auth0-react";
 import "bootstrap/dist/css/bootstrap.min.css";
 import "./App.css";
 
 // This is what we see when we first load up the website
 import MoviesList from "./components/movies-list.js";
 
 // This is the individual page for each movie
 import Movie from "./components/movie.js";
 
 // This is the page to create a new review
 import AddReview from "./components/add-review.js";
 
 // These are the components that implement Auth0
 import LoginButton from "./components/login-auth0";
 import Profile from "./components/profile-auth0";
 import ProfileButton from "./components/profile-button";
 
 // This component displays a list of a user's reviews
 import ReviewsList from "./components/reviews-list";
 
 // This component adds a movie request or a movie to the database
 import MovieForm from "./components/movie-form.js";
 
 export default function App() {
 
   const { user, isAuthenticated } = useAuth0();
 
   return (
     <div className="box" style={{ backgroundColor: "#FF9800" }} >
       <nav class="navbar navbar-inverse">
         <div class="container-fluid">
           <div class="navbar-header">
             <a href="/movies" className="navbar-brand ms-3" style={{ color: "#FFEC19" }}>
               <img src="/favicon.ico" width="40" height="30" alt="" />
               MovieDB
             </a>
           </div>
 
           <div>
             {isAuthenticated && user ? (
               <ul class="nav navbar-nav navbar-right">
                 <ProfileButton />
               </ul>
             ) : (
               <li class="navbar-nav ml-auto">
                 <LoginButton />
               </li>
             )}
           </div>
         </div>
       </nav>
 
       <div className="container mt-3 mb-3">
         <Switch>
           <Route exact path={["/", "/movies"]} component={MoviesList} />
 
           <Route
             path="/movies/:id/review"
             render={(props) => (
               <AddReview {...props} />
             )}
           />
 
           <Route
             path="/movies/id/:id"
             render={(props) => (
               <Movie {...props} />
             )}
           />
 
           <Route
             path="/profile"
             render={(props) => (
               <Profile />
             )}
           />
 
           <Route
             path="/myreviews"
             render={(props) => (
               <ReviewsList />
             )}
           />
 
           <Route
             path="/viewrequest"
             render={(props) => (
               <MovieForm {...props} />
             )}
           />
         </Switch>
       </div>
     </div>
   )
 }