/**
 * Redirects users to Auth0's login page for MovieDB.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: Auth0 Complete Guide to React User Authentication
 */
 import { useAuth0 } from "@auth0/auth0-react";
 import React from "react";
 
 const LoginButton = () => {
     const { loginWithRedirect } = useAuth0();
 
     return (
         <button onClick={() => loginWithRedirect()}>
             Log In/Sign up
         </button>
     )
 }
 
 export default LoginButton;