# MovieDB 
## Table of Contents:
- Section 1: [Application Description](https://github.com/JamesZhang878/MovieDB-Release#section-1-application-description)
- Section 2: [Setup](https://github.com/JamesZhang878/MovieDB-Release#section-2-setup)
- Section 3: [Features](https://github.com/JamesZhang878/MovieDB-Release#section-3-features)
- Section 4: [Tips](https://github.com/JamesZhang878/MovieDB-Release#section-4-tips)

## Section 1: Application Description
### Overview
This application intends to help individuals keep track of their impressions on movies they've watched. Users can choose to review any of over 20,000 movies created anywhere from 1891 to 2015. Additions to the database are welcome as MovieDB supports a movie request system where users can submit requests to add certain movies. 
### Technical Aspect
This application uses the MERN (MongoDB, Express.js, React.js, Node.js) tech stack and implements Auth0 user authentication.
- frontend: React web application that handles information display and user interaction.
- backend: Node.js application that communicates with a MongoDB database to store and manipulate data.

## Section 2: Setup
**NOTE: This application will NOT work in its current state as the necessary environmental variables are not included for security purposes.** 
Please contact the developer if you would like to receive the necessary files to run this application.
### Dependencies:
- Node.js
- NPM
- MongoDB
- Express
#### Installing Dependencies
```
$ cd backend
$ npm install
$ cd ../frontend
$ npm install
```
### Starting the Application
Make sure that you're in the backend:
```
$ npx nodemon server
```
On a separate terminal:
```
$ cd frontend
$ npm start
```
### Keep In Mind:
- Please log out of your account when you're done using MovieDB to protect your information as other users can delete your account without your permission if you stay signed on.
- It is **CRITICAL** that you use a real email when signing up for an account because password-reset emails will be sent to the email address that you create your account with.
- Users who abuse the movie request system will be removed from the site.

## Section 3: Features
### Movie Features
- Information provided for each movie: title, year, genre(s), rated (G, PG, PG-13, etc), IMDb rating and link, Google link, poster, and plot.
- Multi-filtered search with any combination of the following fields: title, year, genre, and rated.
- Make movie requests
- Pagination
### Review Features
- Create, edit, and delete reviews.
- Separate review page to see all reviews made by the logged-in user.
- Distinction between the logged-in user's review and other users' reviews on a movie page.
- Star rating system
### Profile Features
- Change username
- Change profile picture
- Change password
- Delete account
##### Here is a Google Slides [presentation](https://docs.google.com/presentation/d/1cI9hRZVgDwW54wMCjPmqPA_4LU9EpvWhh3LNSuqhRWo/edit?usp=sharing) that shows where the above features are present in MovieDB.

## Section 4: Tips
### Changing Your Profile Picture
1. Upload an image to an online image hosting site (eg: Imgur).
2. Right click on your desired image and select "Open Image in New Tab".
3. Copy and paste the URL of this new tab into the input field in MovieDB.

### Miscellaneous
- Make sure to confirm reviewed movie requests to declutter your profile page.
- If you can't find a certain movie with the title alone, then try to find it using the other filters (year, genre, rated) without the title filter.
- If you encounter a **431 Error** after using this application, then you should clear your browser's cookies and cache.
- Please report any other errors not mentioned in this write-up to james692je@gmail.com.