'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';  // Import from next/navigation for Next.js App Router

export default function Home() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [sharedAnime, setSharedAnime] = useState([]);
  const [user1Name, setUser1Name] = useState('');
  const [user2Name, setUser2Name] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isMounted, setIsMounted] = useState(false); // Add a state to track if the component is mounted

  const router = useRouter();  // Use next/navigation for App Router

  // Use effect to make sure router and other hooks are used only on the client-side
  useEffect(() => {
    setIsMounted(true);  // Mark that the component has been mounted
  }, []);

  // Check if the user is logged in using sessionToken in localStorage
  useEffect(() => {
    if (isMounted) {  // Only execute this after the component has mounted
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        setLoggedIn(true);

        // Optionally, you can fetch the username associated with the session token here
        // (Assuming you have an endpoint that can fetch the username by token)
        axios
          .get('http://localhost:5000/get-username', { headers: { Authorization: `Bearer ${sessionToken}` } })
          .then((response) => {
            setUsername(response.data.username);
          })
          .catch((error) => {
            console.error('Error fetching username:', error);
            setLoggedIn(false); // If there’s an issue with fetching username, consider logging out the user.
          });
      }
    }
  }, [isMounted]);

  // Redirect to AniList login page
  const login = () => {
    const clientID = '22306'; // Replace with your actual AniList client ID
    const redirectURI = 'http://localhost:3000/callback'; // Replace with your redirect URI

    const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code&scope=read`;

    window.location.href = authUrl; // Redirect to AniList login page
  };

  // Handle form submission for comparing anime lists
  const compareLists = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);  // Reset previous errors

    try {
      const response = await axios.post('http://localhost:5000/compare', { user1, user2 });
      setSharedAnime(response.data.sharedAnime);
      setUser1Name(user1);
      setUser2Name(user2);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.error || "Error comparing lists");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Compare Shared Anime Scores</h1>
        <div>
          {loggedIn ? (
            <span>Welcome, {username}</span>  // Display username when logged in
          ) : (
            <button onClick={login}>Login with AniList</button>  // Login button
          )}
        </div>
      </header>

      <form onSubmit={compareLists}>
        <input
          type="text"
          placeholder="User 1"
          value={user1}
          onChange={(e) => setUser1(e.target.value)}
          required
          className="text-gray-800"
        />
        <input
          type="text"
          placeholder="User 2"
          value={user2}
          onChange={(e) => setUser2(e.target.value)}
          required
          className="text-gray-800"
        />
        <button type="submit">Compare</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading && <p>Loading...</p>}

      {sharedAnime.length > 0 && (
        <div>
          <h2>Shared Anime with Scores</h2>
          <table>
            <thead>
              <tr>
                <th>Anime Title</th>
                <th>{user1Name}'s Score</th>
                <th>{user2Name}'s Score</th>
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
