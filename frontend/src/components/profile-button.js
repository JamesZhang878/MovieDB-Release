/**
 * Dropdown menu that displays "Profile", "Reviews", and Log out
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import React from "react";
 import { useAuth0 } from "@auth0/auth0-react";
 
 import LogoutButton from "./logout-auth0.js";
 import "../style/profile-button.css";
 
 const ProfileButton = () => {
     const { user, isAuthenticated } = useAuth0();
 
     if (isAuthenticated) {
         return (
             <div class="dropdown">
                 <button
                     class="btn dropdown-toggle"
                     type="button"
                     id="dropdownMenuButton1"
                     data-bs-toggle="dropdown"
                     aria-expanded="false"
                 >
                     <img src={user.picture} width="25" height="25" alt="" />
                     {user.nickname}
                 </button>
                 <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                     <li><a class="dropdown-item" href="http://localhost:3000/profile">Profile</a></li>
                     <li><a class="dropdown-item" href="http://localhost:3000/myreviews">Reviews</a></li>
                     <li><a class="dropdown-item" href="#"> <LogoutButton /></a></li>
                 </ul>
             </div>
         )
     }
 }
 
 export default ProfileButton