#  <center>Online Multiplayer Ludo Game</center>


\>\>  [Play Online here](www.github.com/wenszel/mern-ludo) <<

\>\>  [Watch YouTube Video here](www.github.com/wenszel/mern-ludo) <<

##  Table of content

-  [About](#about)

-  [Architecture](#architecture)

-  [Key Features and Challenges](#key-features-and-challenges)

-  [Tech Stack](#tech-stack)

-  [Installation](#installation)

-  [Screenshots](#screenshots)

##  About
Ludo Online is a multiplayer web-based implementation of the classic board game Ludo, built using the MERN stack and integrated with SocketIO for real-time communication.
## Architecture
![Interface](https://github.com/Wenszel/mern-ludo/blob/main/src/images/architecture.png?raw=true)
##  Tech Stack
Frontend:
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)
Backend:
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
Tests:
![Mocha](https://img.shields.io/badge/-mocha-%238D6748?style=for-the-badge&logo=mocha&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
Tools:
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) ![CircleCI](https://img.shields.io/badge/circle%20ci-%23161616.svg?style=for-the-badge&logo=circleci&logoColor=white) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![Jira](https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white)

##  Key Features and Challenges

-   Maintained session consistency with **Express Session** and **MongoDB**.
-   Enabled real-time communication via **WebSocket** and **SocketIO**.
-   Ensured code reliability with testing using **Mocha**, **Chai**, and **Jest**. 
-   Hosted in a **Docker** container on **AWS EC2**.
-   Established CI/CD using **CircleCI**.


##  Installation
1.  Download this repository
2.  Generate your own [mongoDB atlas](https://www.mongodb.com) credential URL. It should looks like this:

```
mongodb+srv://madmin:<password>@clustername.mongodb.net/<dbname>?retryWrites=true&w=majority
```
3.  Add this URL to the /backend/credentials.js file
4.  Perform these commands in the main directory:

```
npm i
npm start
cd backend
npm i
node server.js
```

##  Screenshots

![Interface](https://github.com/Wenszel/mern-ludo/blob/main/src/images/readme1.png?raw=true)