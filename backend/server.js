// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Anime List Comparison API');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



// Route to compare two users' anime lists
app.post('/compare', async (req, res) => {
  const { user1, user2 } = req.body;

  try {
    const query = `
      query ($user1: String!, $user2: String!) {
        user1: MediaListCollection(userName: $user1, type: ANIME) {
          lists {
            entries {
              media {
                title {
                  romaji
                }
                averageScore
              }
              score
            }
          }
        }
        user2: MediaListCollection(userName: $user2, type: ANIME) {
          lists {
            entries {
              media {
                title {
                  romaji
                }
                averageScore
              }
              score
            }
          }
        }
      }
    `;

    const response = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { user1, user2 },
    });

    const user1List = response.data.data.user1.lists[0].entries;
    const user2List = response.data.data.user2.lists[0].entries;

    // Logic to compare the lists will go here

    res.json({ user1List, user2List });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from AniList API.' });
  }
});
