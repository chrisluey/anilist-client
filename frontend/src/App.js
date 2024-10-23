import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://graphql.anilist.co',
  cache: new InMemoryCache(),
});

const GET_ANIME = gql`
  query {
    Media(id: 1, type: ANIME) {
      title {
        romaji
        english
      }
      description
      episodes
    }
  }
`;

function Anime() {
  const { loading, error, data } = useQuery(GET_ANIME);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div>
      <h1>{data.Media.title.english}</h1>
      <p>{data.Media.description}</p>
      <p>Episodes: {data.Media.episodes}</p>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>AniList API Example</h1>
        <Anime />
      </div>
    </ApolloProvider>
  );
}

export default App;
