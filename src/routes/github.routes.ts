import express, {
    Request,
    Response,
} from "express";
import * as githubController from '../controllers/github.controller.js'

const githubRoutes = express.Router()

githubRoutes.get("/repository", async (req: Request, res: Response) => res.json(await githubController.getAllData()))
githubRoutes.get("/repository/markdown", async (req: Request, res: Response) => res.json(await githubController.getRepositoriesMarkdown()))
githubRoutes.get("/gist", async (req: Request, res: Response) => res.json(await githubController.getGist()))

export default githubRoutes