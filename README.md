# File Manager Platform

## Overview

This project is a summary of the back-end trimester covering topics such as **authentication**, **NodeJS**, **MongoDB**, **Redis**, **pagination**, and **background processing**. The objective is to build a simple platform to upload and view files with the following features:

- **User authentication** via a token
- **List all files**
- **Upload a new file**
- **Change permission of a file**
- **View a file**
- **Generate thumbnails for images**

## Resources

Read or watch:
- *[Node JS getting started](https://nodejs.org/en/docs/guides/getting-started-guide/)*
- *[Process API doc](https://nodejs.org/dist/latest-v12.x/docs/api/process.html)*
- *[Express getting started](https://expressjs.com/en/starter/installing.html)*
- *[Mocha documentation](https://mochajs.org/)*
- *[Nodemon documentation](https://nodemon.io/)*
- *[MongoDB](https://www.mongodb.com/)*
- *[Bull](https://github.com/OptimalBits/bull)*
- *[Image thumbnail](https://www.npmjs.com/package/image-thumbnail)*
- *[Mime-Types](https://www.npmjs.com/package/mime-types)*
- *[Redis](https://redis.io/)*

## Learning Objectives

By the end of this project, you will be able to explain:

- **How to create an API with Express**
- **How to authenticate a user**
- **How to store data in MongoDB**
- **How to store temporary data in Redis**
- **How to setup and use a background worker**

## Requirements

- Allowed editors: **vi**, **vim**, **emacs**, **Visual Studio Code**
- All your files will be interpreted/compiled on **Ubuntu 18.04 LTS** using **Node.js** (version 12.x.x)
- All your files should end with a new line
- A `README.md` file, at the root of the folder of the project, is mandatory
- Your code should use the `.js` extension
- Your code will be verified against lint using **ESLint**

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```
2. **Install dependencies**:
    ```bash
    npm install
    ```
3. **Set up environment variables:**
    Create a .env file in the root directory and add the following:
    ```env
    PORT=5000
    MONGO_URL=mongodb://localhost:27017/files_manager
    REDIS_URL=redis://127.0.0.1:6379
    ```
4. **Run the server:**
    ```bash
    npm start
    ```
5. **Run the worker:**
    ```bash
    npm run worker
    ```
## API Endpoints

- POST /users: Register a new user
- GET /connect: Login and receive a token
- GET /disconnect: Logout the user
- GET /users/me: Retrieve user profile information
- POST /files: Upload a new file
- GET /files/: Retrieve a file
- GET /files: List all files with pagination
- PUT /files/publish: Change file permission to public
- PUT /files/unpublish: Change file permission to private
- GET /files/data: View a file's data

## Testing

To run the tests, use the following command:
    ```bash
    npm test
    ```

## Authors

1. ** Nickson Kipruto **
2. ** Peter Mwangi **
