/**
 * Initializes an Auth0Provider with access to session history. 
 * Helps keep users logged in even when they refresh the page.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Source: Auth0 Complete Guide to React User Authentication
 */
 import React from "react";
 import { useHistory } from "react-router-dom";
 import { Auth0Provider } from "@auth0/auth0-react";
 
 const Auth0ProviderWithHistory = ({ children }) => {
     const domain = process.env.REACT_APP_AUTH0_DOMAIN;
     const clientId = process.env.REACT_APP_CLIENT_ID;
 
     const history = useHistory();
 
     const onRedirectCallback = (appState) => {
         history.push(appState?.returnTo || window.location.pathname);
     }
 
     return (
         <Auth0Provider
             domain={domain}
             clientId={clientId}
             redirectUri="http://localhost:3000"
             onRedirectCallback={onRedirectCallback}
             audience={`https://${domain}/api/v2/`}
             scope="read: current_user update:current_user_metadata"
             cacheLocation="localstorage"
         >
             {children}
         </Auth0Provider>
     )
 }
 
 export default Auth0ProviderWithHistory;