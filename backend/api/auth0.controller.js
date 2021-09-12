/**
 * Contains methods that facilitates the access and editing of user information 
 * performed by Auth0DAO. 
 * 
 * Functions: 
 * - Get user information.
 * - Change username.
 * - Change user password.
 * - Change user profile picture.
 * - Delete user account.
 * - Check user's role (Admin or User).
 * 
 *  Author: James Zhang
 *  Email: james692je@gmail.com
 */
 import Auth0DAO from "../dao/auth0DAO.js";

 export default class Auth0Ctrl {
     /**
      * Gets an access token to Auth0's Management API and uses that token 
      * with the user's email to access the user's information.
      * 
      * NOTE: The token is never given to the frontend.
      */
     static async apiGetUserByEmail(req, res, next) {
         try {
             let email = req.query.email;
 
             const tokenResponse = await Auth0DAO.getToken();
             const userInfo = await Auth0DAO.getUserByEmail(tokenResponse.access_token, email);
 
             res.json(userInfo);
         } catch (e) {
             console.log(`Couldn't access user ${e}`);
         }
     }
 
     /**
      * Gets an access token to Auth0's Management AP and uses that token 
      * with the user's ID to change the user's username to the new 
      * username provided in the body of the request.
      */
     static async apiChangeUserName(req, res, next) {
         try {
             // New username
             let userName = req.body.userName;
             let user_id = req.body.user_id;
             const accessToken = await Auth0DAO.getToken();
             const changeStatus = await Auth0DAO.changeUserName(accessToken.access_token,
                 user_id, userName);
 
             let isSuccessful = (changeStatus.nickname == userName) ? true : false;
 
             res.json(isSuccessful);
         } catch (e) {
             console.log(`Couldn't change username ${e}`);
         }
     }
 
     /**
      * Uses Auth0's internal password-changing framework to send an email
      * to the user who wants to change their password to MovieDB.
      */
     static async apiChangePassword(req, res, next) {
         try {
             const email = req.body.userEmail;
             const changeStatus = await Auth0DAO.changePassword(email);
             const successMsg = "We've just sent you an email to reset your password.";
 
             let isSuccessful = (changeStatus == successMsg) ? true : false;
 
             res.json(isSuccessful);
         } catch (e) {
             console.log(`Couldn't change password ${e}`);
         }
     }
 
     /**
      * Gets an access token to Auth0's Management API and uses that token with
      * the user's id to change their profile picture to the picture linked
      * by the variable profilePic in the request body.
      */
     static async apiChangeProfilePic(req, res, next) {
         try {
             let picLink = req.body.profilePic;
             let user_id = req.body.user_id;
             const accessToken = await Auth0DAO.getToken();
             const changeStatus = await Auth0DAO.changeProfilePicture(accessToken.access_token,
                 user_id, picLink);
 
             let isSuccessful = (changeStatus.picture == picLink) ? true : false;
 
             res.json(isSuccessful);
         } catch (e) {
             console.log(`Couldn't change profile picture ${e}`);
         }
     }
 
     /**
      * Gets an access token to Auth0's Management API and uses tht token with the
      * user's id to delete their MovieDB account.
      */
     static async apiDeleteAccount(req, res, next) {
         try {
             const user_id = req.body.user_id;
             const accessToken = await Auth0DAO.getToken();
             const deleteStatus = await Auth0DAO.deleteUser(accessToken.access_token, user_id);
 
             let isSuccessful = (deleteStatus == []) ? true : false;
 
             res.json(isSuccessful);
         } catch (e) {
             console.log(`Couldn't delete account ${e}`);
         }
     }
 
     /**
      * Uses a user's email to check their role (Admin or User).
      */
     static async apiCheckRole(req, res, next) {
         try {
             const email = req.query.email;
             const accessToken = await Auth0DAO.getToken();
             const userResponse = await Auth0DAO.getUserByEmail(accessToken.access_token, email);
 
             // The user_id is different from the email. 
             // MovieDB uses a user's email as their ID, but Auth0 has a separate way
             //         of identifying users.
             const user_id = userResponse[0].user_id.split("|")[1];
             const roleStatus = await Auth0DAO.checkRole(accessToken.access_token, user_id);
 
             let isAdmin;
 
             if (roleStatus.length != 0) {
                 isAdmin = (roleStatus[0].name == "MovieDB Admin") ? true : false;
             }
             else {
                 isAdmin = false;
             }
 
             res.json(isAdmin);
         } catch (e) {
             console.log(`Couldn't access user's role, ${e}`);
         }
     }
 }