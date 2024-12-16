import express from 'express'
import { ApolloServer } from '@apollo/server'
import bodyParser from 'body-parser'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import axios from 'axios'

async function startServer() {
    const app = express()

    const server = new ApolloServer({
        // what operations we perform
        typeDefs: `
        type User {
            id: ID!
            name: String!
            username: String!
            email: String!
            phone: String!
            website: String!
        }
        type Todo {
            id: ID!
            title: String!
            completed: Boolean
            userId:ID!
            user:User
        }
        type Query {
            getTodos: [Todo]
            getAllUsers: [User]
            getUser(id: ID!): User
        }
        `,
        resolvers: {
            Todo: {
                // anyone try to fetch user of Todo
                user: async (todo) => {
                    const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`)
                    return data
                }
            },
            Query: {
                // Deaflt error handler function
                // getTodos: () => [{
                //     id: 1,
                //     title: "Something",
                //     completed: false
                // }]
                getTodos: async () => {
                    const { data } = await axios.get('https://jsonplaceholder.typicode.com/todos')
                    return data
                }
                ,
                getAllUsers: async () => {
                    const { data } = await axios.get('https://jsonplaceholder.typicode.com/users')
                    return data
                },
                getUser: async (parent, { id }) => {
                    const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)
                    return data
                }
            }
        }
    })

    app.use(bodyParser.json())
    app.use(cors())

    await server.start()

    // Apollo client UI 
    app.use('/graphql', expressMiddleware(server))

    app.get("/", (req, res) => {
        return res.json({
            msg: "server is running"
        })
    })

    app.listen(8000, () => console.log("Server started at 8000"))
}


startServer()

console.log("NodeJs Server is running")