/**
 * Serves as the profile page in MovieDB. Displays user information,
 * allows edits to user information, and includes a section to either
 * add a movie to MovieDB or make a movie request.
 * 
 * Features:
 * - Get a user's Auth0 information
 * - Get a user's reviews
 * - Get a user's MovieDB role (Admin or User)
 * - Change username
 * - Change password
 * - Change pfp
 * - Delete MovieDB account
 * - Event listeners and display/input formatters
 * - Edit displayed username after a username change
 * - Removed reviews associated with a deleted user.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import React, { useState, useEffect } from "react";
 import { useAuth0 } from "@auth0/auth0-react";
 
 import MoviesDataService from "../services/movies.js";
 import LogoutButton from "./logout-auth0.js";
 import AddMovie from "./add-movie.js";
 import "../style/profile.css";
 
 const Profile = () => {
     // Variables containing information about the user
     const { user, isAuthenticated, isLoading, logout } = useAuth0();
     const [userInfo, setUserInfo] = useState(null);
     const [userReviews, setUserReviews] = useState(null);
     const [reviewsRetrieved, setReviewsRetrieved] = useState(false);
     const [isAdmin, setIsAdmin] = useState(false);
     const [roleRetrieved, setRoleRetrieved] = useState(false);
 
     // Variables used to edit user's information
     const [userName, setUserName] = useState("");
     const [nameChanged, setNameChanged] = useState(false);
     const [emailSent, setEmailSent] = useState(false);
     const [pfpLink, setPfpLink] = useState("");
     const [picChanged, setPicChanged] = useState(false);
 
     // Variables used in the account deletion process
     const [userConfirmation, setUserConfirmation] = useState("");
     const [accountDeleted, setAccountDeleted] = useState(false);
     const deleteConfirmation = "I'm sure that I want to delete my account.";
 
     // Gets user information
     useEffect(() => {
         if (!reviewsRetrieved) {
             if (isAuthenticated) {
                 getUserInfo();
             }
             else {
                 console.log("Not Authenticated");
             }
         }
     }, [user, reviewsRetrieved, roleRetrieved])
 
     // Password reset interface
     useEffect(() => {
         if (emailSent) {
             alert("We've sent you an email to reset your password.");
             setEmailSent(false);
         }
     }, [emailSent])
 
     /**
      * Gets a user's Auth0 information with their email, then gets
      * the reviews they've made and their role on MovieDB (Admin or User).
      */
     const getUserInfo = () => {
         MoviesDataService.getUserByEmail(user.email)
             .then(response => {
                 setUserInfo(response.data);
                 getNumReviews();
                 getUserRole();
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Gets all of the reviews that this specific user had made.
      */
     const getNumReviews = () => {
         MoviesDataService.getUserReviews(user.email)
             .then(response => {
                 setUserReviews(response.data);
                 setReviewsRetrieved(true);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Determines whether the user is an Admin or a regular user.
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
      * Changes a user's username and calls changeReviewInfoUserName()
      * to change the displayed username on reviews that this user 
      * created previously.
      */
     const changeUserName = () => {
         let data = {
             userName: userName,
             user_id: formateID(),
         };
 
         MoviesDataService.changeUserName(data)
             .then(response => {
                 setNameChanged(response.data);
                 changeReviewInfoUserName();
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Activates Auth0's password reset protocol; an email
      * is sent to the user to help them reset their password.
      */
     const changePassword = () => {
         let data = {
             userEmail: user.email,
         };
 
         MoviesDataService.changePassword(data)
             .then(response => {
                 setEmailSent(response.data);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Changes the user's profile picture to the picture 
      * linked to by the pfpLink variable.
      */
     const changeProfilePicture = () => {
         let data = {
             profilePic: pfpLink,
             user_id: formateID(),
         };
 
         MoviesDataService.changeProfilePic(data)
             .then(response => {
                 setPicChanged(response.data);
             })
             .catch(e => {
                 console.log(e);
             })
     }
 
     /**
      * Removes all of this user's information from the Auth0 
      * database for MovieDB.
      */
     const deleteAccount = () => {
         // Asks the user to confirm their decision.
         if (userConfirmation == deleteConfirmation) {
             let data = {
                 user_id: formateID(),
             };
 
             let userEmail = user.email;
             MoviesDataService.deleteAccount(data)
                 .then(response => {
                     removeDeletedUserReviews(userEmail);
                     setAccountDeleted(response.data);
                 })
                 .catch(e => {
                     console.log(e);
                 })
         }
         else {
             alert("Incorrect deletion confirmation. Please try again.");
         }
     }
 
     // Event Listeners
     const onChangeUserName = e => {
         const userName = e.target.value;
         setUserName(userName);
     }
 
     const onChangePfpLink = e => {
         const pfpLink = e.target.value;
         setPfpLink(pfpLink);
     }
 
     const onChangeUserConfirmation = e => {
         const confirmation = e.target.value;
         setUserConfirmation(confirmation);
     }
 
     /**
      * @returns The formatted version of a user's Auth0 ID.
      */
     const formateID = () => {
         let temp = userInfo[0].user_id.split("|");
         return temp[1];
     }
 
     // Logs out the user whose account had just been deleted.
     const deletedUserLogout = () => {
         alert("Your account has been deleted");
         logout({ returnTo: "http://localhost:3000" });
     }
 
     /**
      * If a user changes their username, then this method is called
      * which changes the useername information stored on reviews that
      * the user created previously.
      */
     const changeReviewInfoUserName = () => {
         let userReviews = [];
         MoviesDataService.getUserReviews(user.email)
             .then((response) => {
                 // Edits each review with a for loop
                 userReviews = response.data;
                 for (let i = 0; i < userReviews.length; i++) {
                     let data = {
                         review_id: userReviews[i]._id,
                         newUserName: userName,
                     };
 
                     MoviesDataService.editReviewUserNames(data)
                         .then((response) => {
                             // console.log(response.data);
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
      * Removes all reviews associated with a deleted user's account
      * from the reviews collection.
      * @param {*} email The deleted user's email.
      */
     const removeDeletedUserReviews = (email) => {
         let userReviews = [];
         MoviesDataService.getUserReviews(email)
             .then((response) => {
                 userReviews = response.data;
                 for (let i = 0; i < userReviews.length; i++) {
                     MoviesDataService.deleteReview(userReviews[i]._id, email)
                         .then((response) => {
                             // console.log(response.data);
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
 
     if (isLoading) {
         return (
             <div>
                 Loading...
             </div>
         )
     }
 
     if (isAuthenticated) {
         return (
             <div className="profile">
                 <div className="profile-header"><strong>Profile</strong></div>
                 <div className="wrapper">
                     <div className="profile-picture">
                         <img src={user.picture} alt="" />
                     </div>
                     <div className="user-info">
                         <p><strong>Username: </strong> {user.nickname}</p>
                         <p><strong>Email: </strong> {user.email}</p>
                         <p><strong>Reviews Created: </strong> {userReviews ? userReviews.length : "Loading..."} </p>
                         <p><strong>Role: </strong> {roleRetrieved ? (isAdmin ? "Admin" : "User") : "Loading..."} </p>
                     </div>
                     <div className="profile-buttons">
                         <button
                             type="button"
                             class="btn btn-primary"
                             data-bs-toggle="modal"
                             data-bs-target="#change-username"
                         >
                             Change Username
                         </button>
                         <button
                             type="button"
                             class="btn btn-primary"
                             data-bs-toggle="modal"
                             data-bs-target="#change-pfp"
                         >
                             Change Profile Picture
                         </button>
                         <button className="btn change-password" onClick={() => changePassword()}>Change Password</button>
                         <button
                             type="button"
                             className="btn delete-account"
                             data-bs-toggle="modal"
                             data-bs-target="#delete-account"
                         >
                             Delete Account
                         </button>
                     </div>
 
                     <div className="movie-modification">
                         <AddMovie user={user} isAdmin={isAdmin} />
                     </div>
 
                     <div class="modal fade" tabIndex="-1" id="change-username">
                         <div class="modal-dialog">
                             {nameChanged ? (
                                 <div class="modal-content">
                                     <div class="modal-header">
                                         <h5 class="modal-title">Username Changed Successfully!</h5>
                                         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                     </div>
                                     <div class="modal-body">
                                         <p>Please logout and log back in to see your new username in your profile.</p>
                                     </div>
                                     <div class="modal-footer">
                                         <div className="btn"><LogoutButton /></div>
                                     </div>
                                 </div>
                             ) : (
                                 <div class="modal-content">
                                     <div class="modal-header">
                                         <h5 class="modal-title">Change Username</h5>
                                         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                     </div>
                                     <div class="modal-body">
                                         <p>Please enter your new username below.</p>
                                         <div className="input-group">
                                             <input
                                                 type="text"
                                                 className="form-control"
                                                 placeholder="New Username"
                                                 value={userName}
                                                 onChange={onChangeUserName}
                                             />
                                         </div>
                                     </div>
                                     <div class="modal-footer">
                                         <button
                                             type="button"
                                             class="btn btn-primary"
                                             onClick={changeUserName}
                                         >Change Username</button>
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
 
                     <div class="modal fade" tabIndex="-1" id="change-pfp">
                         <div class="modal-dialog">
                             {picChanged ? (
                                 <div class="modal-content">
                                     <div class="modal-header">
                                         <h5 class="modal-title">Profile Picture Successfully!</h5>
                                         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                     </div>
                                     <div class="modal-body">
                                         <p>Please logout and log back in to see your new profile picture in your profile.</p>
                                     </div>
                                     <div class="modal-footer">
                                         <div className="btn"><LogoutButton /></div>
                                     </div>
                                 </div>
                             ) : (
                                 <div class="modal-content">
                                     <div class="modal-header">
                                         <h5 class="modal-title">Change Profile Picture</h5>
                                         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                     </div>
                                     <div class="modal-body">
                                         <p>Please enter a link to your new profile picture below.</p>
                                         <div className="input-group">
                                             <input
                                                 type="text"
                                                 className="form-control"
                                                 placeholder="Profile Picture Link"
                                                 value={pfpLink}
                                                 onChange={onChangePfpLink}
                                             />
                                         </div>
                                     </div>
                                     <div class="modal-footer">
                                         <button
                                             type="button"
                                             class="btn btn-primary"
                                             onClick={changeProfilePicture}
                                         >Change Profile Picture</button>
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
 
                     <div class="modal fade" tabIndex="-1" id="delete-account">
                         <div class="modal-dialog">
                             {accountDeleted ? (
                                 <div>
                                     {deletedUserLogout()}
                                 </div>
                             ) : (
                                 <div class="modal-content">
                                     <div class="modal-header">
                                         <h5 class="modal-title">Delete Account</h5>
                                         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                     </div>
                                     <div class="modal-body">
                                         <p>
                                             Are you sure that you want to delete your account? This
                                             <strong> CAN NOT</strong> be undone, and all of your information will be lost!
                                             Please type <em>"I'm sure that I want to delete my account."</em> in
                                             the text box below to confirm.
                                         </p>
                                         <div className="input-group">
                                             <input
                                                 type="text"
                                                 className="form-control"
                                                 placeholder="Deletion Confirmation"
                                                 value={userConfirmation}
                                                 onChange={onChangeUserConfirmation}
                                             />
                                         </div>
                                     </div>
                                     <div class="modal-footer">
                                         <button
                                             type="button"
                                             class="btn btn-primary"
                                             onClick={deleteAccount}
                                         >DELETE ACCOUNT</button>
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
             </div>
 
         )
     }
     else {
         if (user) {
             <div>
                 <p> User Exists</p>
             </div>
         }
         else {
             return (
                 <div>
                     <p> Not Authenticated</p>
                 </div>
             )
         }
     }
 }
 
 export default Profile;