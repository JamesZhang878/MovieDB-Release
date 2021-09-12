/**
 * Logs users out of MovieDB with Auth0.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: Auth0 Complete Guide to React User Authentication
 */
 import React from "react";
 import { useAuth0 } from "@auth0/auth0-react";
 
 const LogoutButton = () => {
     const { logout } = useAuth0();
 
     return (
         <button onClick={() => logout({ returnTo: "http://localhost:3000" })}>
             Log out
         </button>
     )
 }
 
 export default LogoutButton;