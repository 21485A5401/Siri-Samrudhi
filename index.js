const dotenv = require('dotenv')
const cors = require('cors')
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const apirouter = require('./routes/routes.js');
const PORT = process.env.PORT || 4050
const bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
dotenv.config()
const path = require('path');
// Client's ip is derived from the x-forwarded-for header
app.set('trust proxy', true)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use('/public', express.static(path.join(__dirname, 'public')));
const whitelist = [ 'https://dashboard.sirisamruddhigold.in/','https://dashboard.sirisamruddhigold.in','http://localhost:3000','http://backend.sirisamruddhigold.in','https://backend.sirisamruddhigold.in/','http://165.232.183.157:4050','http://165.232.183.157:4050/','http://localhost:4050','undefined', 'null', process.env.ORIGIN, process.env.STAGING_ORIGIN]

app.use(cors({
    origin: (origin, callback) => {
        console.log(origin)
        if (whitelist.some(item => String(origin).includes(item))) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by cors'))
        }
    },
    optionsSuccessStatus: 200
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Routes
// app.use('/', whatsapprouter)

app.use("/api", apirouter)


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => { console.log("Successfully connected to database") })
    .catch(error => {
        console.log("[-] Mongoose error")
        console.log(error)
    })

app.listen(PORT, async () => {
    console.log('Server running on port ' + PORT)
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
})