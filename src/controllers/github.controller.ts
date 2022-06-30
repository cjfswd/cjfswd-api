import { gql, GraphQLClient } from 'graphql-request'
import fetch from "cross-fetch";
import enviroment from '../config'

type ITree = { [key in string]: string }[];
type IRepositories = { [key: string]: string } & { tree: ITree } & {
    [key in "repositoryTopics" | "languages"]: any;
};

interface IGithubAPI {
    login: string;
    repositories: IRepositories[];
}

const headers = { "Authorization": enviroment.GITHUB_TOKEN }

const client = new GraphQLClient('https://api.github.com/graphql', { headers })

const repositoryQuery = gql`
query {
	viewer {
		login
		repositories(first: 100) {
			nodes {
				name
				description
				homepageUrl
				diskUsage
				visibility
				repositoryTopics(first: 100) {
					nodes {
						topic {
							name
						}
					}
				}
				languages(first: 100) {
					nodes {
						name
					}
				}
			}
		}
	}
}
`
const gistQuery = gql`
query {
	viewer {
		gists(first: 100) {
			nodes {
				url
				description
				files(limit: 1){
					name
					text
				}
			}
		}
	}
}
`

const getViewerLoginAndRepositoryData = async () => {
    return await client.request(repositoryQuery)
        .then(res => {
            return {
                login: res.viewer.login,
                repositories: res.viewer.repositories.nodes
            }
        }).catch(error => {
            console.log(error)
            return {} as Promise<{ login: any, repositories: any }>
        });
}

const getRepositoryFilesAndPushToList = async (login: string, repositoryList: any[]) => {
    return await Promise.all(repositoryList.map(async repo => {
        return {
            ...repo,
            diskUsage: (repo.diskUsage / 1000).toFixed(2) + ' mb',
            repositoryTopics: repo.repositoryTopics.nodes.map(item => item.topic.name),
            languages: repo.languages.nodes.map(item => item.name),
            tree: await fetch(`https://api.github.com/repos/${login}/${repo.name}/git/trees/main?recursive=1`, { headers })
                .then(res => res.json())
                .then(res => res.tree != undefined ?
                    res.tree.map(item => {
                        return item.size != undefined ?
                            {
                                ...item,
                                size: (item.size / 1000000) >= 0.1 ? (item.size / 1000000).toFixed(2) + ' mb' : (item.size / 1000).toFixed(2) + ' kb'
                            } : { ...item }
                    }) : []
                )
        }
    }))
}

const getUserData = async (): Promise<{ login: string, repositories: { [key in string]: any } & { tree: { [key in string]: string }[] }[] }> => {
    let { login, repositories } = await getViewerLoginAndRepositoryData()
    repositories = await getRepositoryFilesAndPushToList(login, repositories)
    return { login, repositories }
}

export const getAllData = async () => {
    return await getUserData()
}

export const getRepositoriesMarkdown = async () => {
    let { repositories } = await getUserData()
    return repositories.map(repository => {
        return {
            ...repository,
            tree: repository.tree != undefined ? repository.tree.filter(branch => branch.path.includes('.md')) : []
        }
    })
}

type IGist = { url: string, description: string, files: { name: string, text: string }[] }

export const getGist = async () => {
    return await client.request(gistQuery)
        .then(res => res.viewer.gists.nodes as IGist[])
        .catch(error => {
            console.log(error)
            return []
        });
}