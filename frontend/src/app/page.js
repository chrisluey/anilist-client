// src/app/page.js
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [sharedAnime, setSharedAnime] = useState([]);
  const [error, setError] = useState(null);

  const compareLists = async (e) => {
    e.preventDefault();
    setError(null);  // Reset previous errors

    try {
      const response = await axios.post('http://localhost:5000/compare', { user1, user2 });
      setSharedAnime(response.data.sharedAnime);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.error || "Error comparing lists");
    }
  };

  return (
    <div>
      <h1>Compare Shared Anime Scores</h1>
      <form onSubmit={compareLists}>
        <input
          type="text"
          placeholder="User 1"
          value={user1}
          onChange={(e) => setUser1(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="User 2"
          value={user2}
          onChange={(e) => setUser2(e.target.value)}
          required
        />
        <button type="submit">Compare</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {sharedAnime.length > 0 && (
        <div>
          <h2>Shared Anime with Scores</h2>
          <table>
            <thead>
              <tr>
                <th>Anime Title</th>
                <th>{user1}'s Score</th>
                <th>{user2}'s Score</th>
              </tr>
            </thead>
            <tbody>
              {sharedAnime.map((anime, index) => (
                <tr key={index}>
                  <td>{anime.title}</td>
                  <td>{anime.user1Score}</td>
                  <td>{anime.user2Score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
