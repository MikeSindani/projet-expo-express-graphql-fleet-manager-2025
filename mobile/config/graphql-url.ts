export const GRAPHQL_URL = __DEV__
  ? process.env.EXPO_PUBLIC_GRAPHQL_HTTP_URL_DEV || 'http://192.168.1.217:4001/graphql'
  : process.env.EXPO_PUBLIC_GRAPHQL_HTTP_URL_PROD || 'https://projet-express-apploserver-graphql.onrender.com/graphql';