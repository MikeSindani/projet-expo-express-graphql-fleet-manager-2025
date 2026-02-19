/// <reference types="expo/types" />

declare module '@env' {
  export const EXPO_PUBLIC_GRAPHQL_HTTP_URL: string;
  export const EXPO_PUBLIC_GRAPHQL_WS_URL: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_GRAPHQL_HTTP_URL: string;
    EXPO_PUBLIC_GRAPHQL_WS_URL: string;
    EXPO_PUBLIC_GRAPHQL_HTTP_URL_DEV: string;
    EXPO_PUBLIC_GRAPHQL_HTTP_URL_PROD: string;
    EXPO_PUBLIC_GRAPHQL_WS_URL_DEV: string;
    EXPO_PUBLIC_GRAPHQL_WS_URL_PROD: string;
  }
}
