'use client'; // This allows the use of hooks

import { useState, useContext } from 'react';
import axios from 'axios';

export default function Home() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [comparisonData, setComparisonData] = useState(null);

  const compareLists = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/compare', { user1, user2 });
      setComparisonData(response.data);
    } catch (error) {
      console.error("Error comparing lists:", error);
    }
  };

  return (
    <div>
      <h1>Compare Anime Lists</h1>
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

      {comparisonData && (
        <div>
          <h2>Comparison Results:</h2>
          <h3>User 1's List:</h3>
          <ul>
            {comparisonData.user1List.map((item, index) => (
              <li key={index}>
                {item.media.title.romaji} - Score: {item.score}
              </li>
            ))}
          </ul>
          <h3>User 2's List:</h3>
          <ul>
            {comparisonData.user2List.map((item, index) => (
              <li key={index}>
                {item.media.title.romaji} - Score: {item.score}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
