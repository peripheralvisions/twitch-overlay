# sub-sunday-overlay

Requires Node.js and mongodb installed on Your PC.

What is this app supposed to do?
---

- It allows users to vote for newly released games they would like to see being played on stream

Current features
---

- Easy to use interface that blocks minimal view of the stream based around a theme of a certain broadcaster
- Card design that contains all the neccesary information
- Basic search functionality on own database
- Votes are being saved to database 

Goals
---
- Improving search engine by using some API
- Smooth animations for loading and transitions
- JWT for encryption
- Deployment to Twitch platform
- Cleaner code

What is this app build upon?
---

- MERN stack (Mongoose, Express, React, Nodejs)
- Puppeteer for the scraping of upcoming games

How to run?
---

`git clone (this repository)`

- Clones this repository to where Your terminal is currently opened 



`npm install`

- node_modules folder doesnt come with this repository by default to save space so this command installs all the dependencies listed in package.json

`npm run fetch-steam-games`

- Opens a Pupppeteer client and scrapes certain Steam routes resulting in a json file which contains all newly released games.
Without this .json file the app will not be able to import newly found games into the database.

`npm run watch-frontend`

`npm run watch-backend`

- Watch for changes upon frontend and backend files. Run these in two separate terminals
