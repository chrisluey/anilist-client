// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// User validation query
const userValidationQuery = `
  query ($username: String) {
    User(name: $username) {
      id
    }
  }
`;

// Anime list query
const animeListQuery = `
  query ($username: String) {
    MediaListCollection(userName: $username, type: ANIME) {
      lists {
        entries {
          media {
            id
            title {
              romaji
            }
          }
          score
          status
        }
      }
    }
  }
`;

app.post('/compare', async (req, res) => {
    const { user1, user2 } = req.body;
  
    try {
      // Validate user1
      let user1Validation;
      try {
        user1Validation = await axios.post('https://graphql.anilist.co', { 
          query: userValidationQuery, 
          variables: { username: user1 } 
        });
      } catch (error) {
        return res.status(404).json({ error: `User "${user1}" not found. Please check the username and try again.` });
      }
  
      // Validate user2
      let user2Validation;
      try {
        user2Validation = await axios.post('https://graphql.anilist.co', { 
          query: userValidationQuery, 
          variables: { username: user2 } 
        });
      } catch (error) {
        return res.status(404).json({ error: `User "${user2}" not found. Please check the username and try again.` });
      }
  
      // Check if users are valid
      if (!user1Validation.data || !user1Validation.data.data || !user1Validation.data.data.User) {
        return res.status(404).json({ error: `User "${user1}" not found. Please check the username and try again.` });
      }
  
      if (!user2Validation.data || !user2Validation.data.data || !user2Validation.data.data.User) {
        return res.status(404).json({ error: `User "${user2}" not found. Please check the username and try again.` });
      }
  
      // Fetch anime lists for both valid users
      const [user1Data, user2Data] = await Promise.all([
        axios.post('https://graphql.anilist.co', { query: animeListQuery, variables: { username: user1 } }),
        axios.post('https://graphql.anilist.co', { query: animeListQuery, variables: { username: user2 } }),
      ]);
  
      const user1List = user1Data.data.data.MediaListCollection.lists.flatMap((list) => list.entries);
      const user2List = user2Data.data.data.MediaListCollection.lists.flatMap((list) => list.entries);
  
      // Filter for completed anime with a score > 0
      const user1Map = new Map();
      user1List
        .filter((entry) => entry.status === 'COMPLETED' && entry.score > 0)
        .forEach((entry) => {
          user1Map.set(entry.media.id, { title: entry.media.title.romaji, score: entry.score });
        });
  
      // Find shared anime with scores
      const sharedAnime = user2List
        .filter((entry) => entry.status === 'COMPLETED' && entry.score > 0 && user1Map.has(entry.media.id))
        .map((entry) => ({
          title: entry.media.title.romaji,
          user1Score: user1Map.get(entry.media.id).score,
          user2Score: entry.score,
        }));
  
      res.json({ sharedAnime });
    } catch (error) {
      // Handle other unexpected errors
      console.error("Unexpected error:", error.message);
      res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
    }
  });
  
  

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
