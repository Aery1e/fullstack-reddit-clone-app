[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/2tEDYwzN)
# Term Project

Add design docs in *images/*

## Instructions to setup and run project
Clearly explain the steps required to install and configure necessary packages,
for both the server and the client, and the sequence of steps required to get
your application running.

install all packages required from the projects documentation. 
For client: 
```
"dependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.8.4",
    "jest": "^27.5.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  }
```

For server:
```
"dependencies": {
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "eslint-plugin-only-warn": "^1.1.0",
    "express": "^4.21.2",
    "jest": "^29.7.0",
    "mongoose": "^8.13.2",
    "nodemon": "^3.1.9",
    "supertest": "^7.1.1"
  }
  ```

  To run tests, `npm test` from the overall directory, or `npm test` in `server` and `client` for their subsequently attached test. Please have mongodb open and running before attempting the mongodb test, and to start the server before running the express test.

  To get started, run `mongod --dbpath "C:\Users\YOUR_USER\YOUR_PATH_TO_DATA"`, while replacing the path with your desired mongodb data folder path. 
  Then run `node .\init.js mongodb://127.0.0.1:27017/phreddit admin@example.com AdminUser adminpassword ` in another terminal from the server folder. (You may change out the admin user and password and email if needed, but these are provided as they are what was used during testing.)
  Afterwards, run `npm start` on both `server` and `client` terminals. You should have a total of 3 running terminals: The mongod one, `server`, and `client`. 
  The application should automatically open in browser. To access an admin account, login with the email and password you used earlier. To access a user account, use one of the following:
   john@example.com
   jane@example.com
   bob@example.com
   alice@example.com

   All with the passwords `password123`.
   
In the sections below, list and describe each contribution briefly.

## Team Member 1 Contribution
<Team Member 1 Name>

## Team Member 2 Contribution
<Team Member 2 Name>
