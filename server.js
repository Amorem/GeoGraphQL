require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const { findOrCreateUser } = require("./controllers/userController");
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

mongoose
  .connect(
    process.env.MONGO_URI,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB failed : ', err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    let authToken = null;
    let currentUser = null;
    try {
      authToken = req.headers.authorization;
      if (authToken) {

        // find or create a user
        currentUser = await findOrCreateUser(authToken);
      }
    } catch {
      console.log(`Unable to authenticate user with token ${authToken}`);
    }
    return { currentUser }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server is listening on ${url}`);
});
