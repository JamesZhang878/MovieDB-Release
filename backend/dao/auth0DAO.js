/**
 * Directly accesses and/or edits MovieDB user information. Operations facilitated 
 * by Auth0Ctrl (auth0.controller.js).
 * 
 * Functions:
 * - Retrieve an Auth0 Management API access token.
 * - Retrieve user information with email as ID.
 * - Change user name.
 * - Change password.
 * - Change profile picture.
 * - Delete user.
 * - Check user role.
 * 
 * Author: James Zhang
 * Email: james692je@gmail.com
 */
 import axios from "axios";

 export default class Auth0DAO {
 
     /**
      * @returns An access token to Auth0's Management API.
      */
     static async getToken() {
         // Initial token state
         let token = {
             access_token: '',
             scope: '',
             expires_in: 0,
             token_type: '',
         };
 
         var options = {
             method: 'POST',
             url: `${process.env.AUTH0_BASE}/oauth/token`,
             headers: { 'content-type': 'application/json' },
             data: {
                 grant_type: 'client_credentials',
                 client_id: `${process.env.CLIENT_ID}`,
                 client_secret: `${process.env.CLIENT}`,
                 audience: `${process.env.AUTH0_BASE}/api/v2/`
             },
         };
 
         await axios.request(options)
             .then(response => {
                 token.access_token = response.data.access_token;
                 token.scope = response.data.scope;
                 token.expires_in = response.data.expires_in;
                 token.token_type = response.data.token_type;
             })
             .catch(e => {
                 console.log(e);
             });
         return token;
     }
 
     /**
      * @param {*} access_token Management API access token
      * @param {*} email User email
      * @returns A user's information stored on Auth0's user database for MovieDB
      */
     static async getUserByEmail(access_token, email) {
         let user = [];
 
         var options = {
             method: 'GET',
             url: `${process.env.AUTH0_BASE}/api/v2/users`,
             params: { q: `email: ${email}`, search_engine: 'v3' },
             headers: { authorization: `Bearer ${access_token}` },
         };
 
         await axios.request(options)
             .then(response => {
                 user = response.data;
             })
             .catch(e => {
                 console.log(e);
             });
         return user;
     }
 
     /**
      * @param {*} access_token Management API access token
      * @param {*} user_id A user's Auth0 ID
      * @param {*} userName New username 
      * @returns Whether the user's username was changed or not.
      */
     static async changeUserName(access_token, user_id, userName) {
         let formattedID = "auth0%7C" + user_id;
         let requestRes = "";
 
         var options = {
             method: 'PATCH',
             url: `${process.env.AUTH0_BASE}/api/v2/users/${formattedID}`,
             headers: {
                 'content-type': 'application/json',
                 authorization: `Bearer ${access_token}`,
                 'cache-control': 'no-cache',
             },
             data: { "nickname": userName },
         };
 
         await axios.request(options)
             .then(response => {
                 requestRes = response.data;
             })
             .catch(e => {
                 console.error(e);
             });
         return requestRes;
     }
 
     /**
      * @param {*} email User email
      * @returns Whether the email to change the user's password was sent or not.
      */
     static async changePassword(email) {
         let requestRes = "";
 
         var options = {
             method: 'POST',
             url: `${process.env.AUTH0_BASE}/dbconnections/change_password`,
             headers: { 'content-type': 'application/json' },
             data: {
                 client_id: `${process.env.MOVIEDB_CLIENT_ID}`,
                 email: email,
                 connection: 'Username-Password-Authentication',
             },
         };
 
         await axios.request(options)
             .then(response => {
                 requestRes = response.data;
             })
             .catch(e => {
                 console.error(e);
             });
         return requestRes;
     }
 
     /**
      * @param {*} access_token Management API access token
      * @param {*} user_id User's Auth0 ID
      * @param {*} profilePic Link to new profile picture
      * @returns Whether the profile picture was successfully updated or not.
      */
     static async changeProfilePicture(access_token, user_id, profilePic) {
         let formattedID = "auth0%7C" + user_id;
         let requestRes = "";
 
         var options = {
             method: 'PATCH',
             url: `${process.env.AUTH0_BASE}/api/v2/users/${formattedID}`,
             headers: {
                 'content-type': 'application/json',
                 authorization: `Bearer ${access_token}`,
                 'cache-control': 'no-cache',
             },
             data: { "picture": profilePic },
         };
 
         await axios.request(options)
             .then(response => {
                 requestRes = response.data;
             })
             .catch(e => {
                 console.error(e);
             })
         return requestRes;
     }
 
     /**
      * @param {*} access_token Management API access token 
      * @param {*} user_id User's Auth0 ID
      * @returns Whether a user's account was successfully deleted or not.
      */
     static async deleteUser(access_token, user_id) {
         let formattedID = "auth0%7C" + user_id;
         let requestRes = "";
 
         var options = {
             method: 'DELETE',
             url: `${process.env.AUTH0_BASE}/api/v2/users/${formattedID}`,
             headers: {
                 authorization: `Bearer ${access_token}`,
             },
         };
 
         await axios.request(options)
             .then(response => {
                 requestRes = response.data;
             })
             .catch(e => {
                 console.error(e);
             })
         return requestRes;
     }
 
     /**
      * @param {*} access_token Management API access token
      * @param {*} user_id User's Auth0 ID.
      * @returns The user's role in MovieDB
      */
     static async checkRole(access_token, user_id) {
         let requestRes = "";
         let formattedID = "auth0%7C" + user_id;
 
         var options = {
             method: 'GET',
             url: `${process.env.AUTH0_BASE}/api/v2/users/${formattedID}/roles`,
             headers: { authorization: `Bearer ${access_token}` },
         };
 
         await axios.request(options)
             .then(response => {
                 requestRes = response.data;
             })
             .catch(e => {
                 console.log(e.message);
             });
         return requestRes;
     }
 }