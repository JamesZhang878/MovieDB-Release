/**
 * Loads up the React Application
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 * Sources:
 * - freeCodeCamp MERN Stack Course
 * - Auth0 Complete Guide to React User Authentication
 */
 import React from 'react';
 import ReactDOM from 'react-dom';
 import App from './App';
 import { BrowserRouter } from 'react-router-dom';
 import Auth0ProviderWithHistory from './components/auth0-provider-with-history';
 import 'bootstrap/dist/js/bootstrap.js';
 
 ReactDOM.render(
   <BrowserRouter>
     <Auth0ProviderWithHistory>
       <App />
     </Auth0ProviderWithHistory>
   </BrowserRouter>,
   document.getElementById('root')
 ); 