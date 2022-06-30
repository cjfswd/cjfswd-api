import express from "express";
import morgan from "morgan"
import cors from 'cors'

import githubRoutes from './routes/github.routes';

const app = express();
const api = express.Router()

// Middlewares: Observe with Morgan, Send response as JSON type and Acept URL parameters
app.use(cors())
app.use(morgan('tiny'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

api.use('/github', githubRoutes)

app.use('/api', api);

// Define Express Port
const PORT: string | number = process.env.PORT || 8080;

// Init express server and return port
app.listen(
    PORT,
    () => console.log(`Server started on port ${PORT}`)
);