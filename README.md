1. install dev dependencies:

    npm i env-cmd@8.0.2 --save-dev
    npm i jest@27.2.1 --save-dev
    npm i nodemon@2.0.13 --save-dev
    npm i supertest@6.1.6 --save-dev

2. create the folder for the server storage before run the application, the path for the folder can be modified in "src/routers/video.js" on variable "storagePath". In this case the path is "D:/Documentos/ceiba-globant-node-course/my-tube-app/serverStorage"

3. feel free to change the environment variables in "config/dev.env" and "config/test.env"

4. Start the server API:
    npm run dev

