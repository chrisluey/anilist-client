// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/compare', async (req, res) => {
  const { user1, user2 } = req.body;

  const query = `
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

  try {
    const [user1Data, user2Data] = await Promise.all([
      axios.post('https://graphql.anilist.co', { query, variables: { username: user1 } }),
      axios.post('https://graphql.anilist.co', { query, variables: { username: user2 } }),
    ]);

    const user1List = user1Data.data.data.MediaListCollection.lists.flatMap((list) => list.entries);
    const user2List = user2Data.data.data.MediaListCollection.lists.flatMap((list) => list.entries);

    // Filter user1's list for completed anime with a score > 0
    const user1Map = new Map();
    user1List
      .filter((entry) => entry.status === 'COMPLETED' && entry.score > 0)
      .forEach((entry) => {
        user1Map.set(entry.media.id, { title: entry.media.title.romaji, score: entry.score });
      });

    // Filter user2's list for completed anime with a score > 0 and find shared entries
    const sharedAnime = user2List
      .filter((entry) => entry.status === 'COMPLETED' && entry.score > 0 && user1Map.has(entry.media.id))
      .map((entry) => ({
        title: entry.media.title.romaji,
        user1Score: user1Map.get(entry.media.id).score,
        user2Score: entry.score,
      }));

    res.json({ sharedAnime });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
