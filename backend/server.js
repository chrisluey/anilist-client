// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const clientID = '22306';
const clientSecret = '1ETTHiQ9Ajim1Jv8Qzv0SDzgBbEL7B2FLkfMtOvB';
const redirectURI = 'http://localhost:3000/callback';

// app.post('/exchange-token', async (req, res) => {
//   const { code } = req.body;

//   try {
//     const response = await fetch('https://anilist.co/api/v2/oauth/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         client_id: clientID,
//         client_secret: clientSecret,
//         code,
//         redirect_uri: redirectURI,
//         grant_type: 'authorization_code',
//       }),
//     });

//     const data = await response.json();

//     if (data.access_token) {
//       // Store access token securely (e.g., in-memory, session store, etc.)
//       const sessionToken = generateSessionToken(); // Your method to generate a secure session token

//       // Respond with the session token to the frontend
//       res.json({ sessionToken });
//     } else {
//       res.status(400).json({ error: 'Failed to get access token' });
//     }
//   } catch (error) {
//     console.error('Error exchanging code for token', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// function generateSessionToken() {
//   // Implement JWT or session-based authentication
//   return 'your-session-token';
// }

// app.get('/get-username', async (req, res) => {
//   const token = req.headers['authorization']?.split(' ')[1];  // Get token from the Authorization header
  
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     const response = await fetch('https://graphql.anilist.co', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         query: `
//           query {
//             Viewer {
//               name
//             }
//           }
//         `,
//       }),
//     });

//     const data = await response.json();
    
//     if (data?.data?.Viewer) {
//       res.json({ username: data.data.Viewer.name });
//     } else {
//       res.status(401).json({ error: 'Failed to fetch username' });
//     }
//   } catch (error) {
//     console.error('Error fetching username:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

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
            averageScore
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
          console.log("User1 Validation Response:", user1Validation.data);
      } catch (error) {
          console.error(`Error validating user1: ${error.message}`);
          return res.status(404).json({ error: `User "${user1}" not found. Please check the username and try again.` });
      }

      // Validate user2
      let user2Validation;
      try {
          user2Validation = await axios.post('https://graphql.anilist.co', { 
              query: userValidationQuery, 
              variables: { username: user2 } 
          });
          console.log("User2 Validation Response:", user2Validation.data);
      } catch (error) {
          console.error(`Error validating user2: ${error.message}`);
          return res.status(404).json({ error: `User "${user2}" not found. Please check the username and try again.` });
      }

      // Check if users are valid
      if (!user1Validation.data?.data?.User) {
          return res.status(404).json({ error: `User "${user1}" not found. Please check the username and try again.` });
      }

      if (!user2Validation.data?.data?.User) {
          return res.status(404).json({ error: `User "${user2}" not found. Please check the username and try again.` });
      }

      // Fetch anime lists for both valid users
      const [user1Data, user2Data] = await Promise.all([
          axios.post('https://graphql.anilist.co', { query: animeListQuery, variables: { username: user1 } }),
          axios.post('https://graphql.anilist.co', { query: animeListQuery, variables: { username: user2 } }),
      ]);
      
      console.log("User1 Anime List Response:", user1Data.data);
      console.log("User2 Anime List Response:", user2Data.data);

      const user1List = user1Data.data.data.MediaListCollection.lists.flatMap((list) => list.entries);
      const user2List = user2Data.data.data.MediaListCollection.lists.flatMap((list) => list.entries);

      // Filter for completed anime with a score > 0
      const user1Map = new Map();
      user1List
          .filter((entry) => entry.status === 'COMPLETED' && entry.score > 0)
          .forEach((entry) => {
              user1Map.set(entry.media.id, { title: entry.media.title.romaji, score: entry.score,  averageScore: entry.media.averageScore });
          });

      // Find shared anime with scores
      const sharedAnime = user2List
          .filter((entry) => entry.status === 'COMPLETED' && entry.score > 0 && user1Map.has(entry.media.id))
          .map((entry) => ({
              title: entry.media.title.romaji,
              user1Score: user1Map.get(entry.media.id).score,
              user2Score: entry.score,
              averageScore: user1Map.get(entry.media.id).averageScore
          }));

      res.json({ sharedAnime });
  } catch (error) {
      // Handle other unexpected errors
      console.error("Unexpected error:", error.message);
      res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  }
});

  
  

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
