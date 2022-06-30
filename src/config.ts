import dotenv from 'dotenv'

dotenv.config()

export default {
    PORT: process.env.PORT,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN
}
