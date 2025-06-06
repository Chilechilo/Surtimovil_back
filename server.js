const { ApolloServer } = require('apollo-server');
const db = require('./database/db');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(` Servidor listo en ${url} `);
});