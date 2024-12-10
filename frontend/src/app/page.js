'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' in the app directory

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

  // Check if the user is logged in using sessionToken in localStorage
  useEffect(() => {
    setIsMounted(true);  // Mark that the component has been mounted
  }, []);

  // Check the URL hash for the access token on page load
  useEffect(() => {
    if (isMounted) {
      const hash = window.location.hash;
      const token = new URLSearchParams(hash).get('access_token');
      const storedUsername = localStorage.getItem('username');  // Get the username from localStorage

      if (token) {
        // Store the token and username in localStorage
        localStorage.setItem('sessionToken', token);

        // Optionally, you can fetch the username here if needed (using the token)
        // For now, we'll assume the username comes with the token (if not, you could make a request here).
        localStorage.setItem('username', 'Username');  // Replace with actual username from API response if available

        setLoggedIn(true);
        setUsername('Username');  // Replace with the actual username fetched
        window.location.hash = ''; // Clear the hash from the URL after storing the token
      } else if (storedUsername) {
        // If already logged in, fetch username from localStorage
        setLoggedIn(true);
        setUsername(storedUsername);
      }
    }
  }, [isMounted]);

  // Handle login redirection (Implicit Grant)
  const login = () => {
    const clientID = '22306';  // Replace with your actual AniList client ID
    // const redirectURI = 'http://localhost:3000'; // Redirect URI where you'll handle the login

    const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientID}&response_type=token`;

    window.location.href = authUrl;  // Redirect to AniList login page
  };

  // Handle form submission for comparing anime lists
  const compareLists = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/compare', { user1, user2 });
      setSharedAnime(response.data.sharedAnime);
      setUser1Name(user1);
      setUser2Name(user2);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.error || 'Error comparing lists');
    } finally {
      setLoading(false);
    }
  };

  // Reset state and go back to the home page
  const resetPage = () => {
    setSharedAnime([]);
    setUser1('');
    setUser2('');
    setUser1Name('');
    setUser2Name('');
    setError(null);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/path-to-your-anime-montage.jpg)' }}>
      <div className="absolute inset-0 bg-black opacity-50" />
      
      {/* Login button/welcome message in the top-right corner */}
      <div className="absolute top-4 right-4 z-20">
        {loggedIn ? (
          <div className="text-lg text-white">
            Welcome, {username}
          </div>
        ) : (
          <button
            onClick={login}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Login with AniList
          </button>
        )}
      </div>
  
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white">
        {/* Header with Title, Inputs, and Compare Button */}
        {sharedAnime.length > 0 && (
          <div className="fixed top-0 left-0 right-0 bg-black bg-opacity-75 p-4 flex items-center justify-start z-20 space-x-4">
            <h1 
              className="text-2xl font-bold text-white cursor-pointer"
              onClick={resetPage}  // Reset page when clicked
            >
              AniList Comparator
            </h1>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="User 1"
                value={user1}
                onChange={(e) => setUser1(e.target.value)}
                required
                className="p-2 rounded-lg text-black"
              />
              <input
                type="text"
                placeholder="User 2"
                value={user2}
                onChange={(e) => setUser2(e.target.value)}
                required
                className="p-2 rounded-lg text-black"
              />
            </div>
  
            <button
              onClick={compareLists}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Compare
            </button>
          </div>
        )}
  
        {/* Centered Title, Input, and Button when No Shared Anime */}
        {sharedAnime.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
            <h1 
              className="text-4xl font-bold text-white cursor-pointer"
              onClick={resetPage}  // Reset page when clicked
            >
              AniList Comparator
            </h1>
  
            <form onSubmit={compareLists} className="flex flex-col items-center space-y-4">
              <input
                type="text"
                placeholder="User 1"
                value={user1}
                onChange={(e) => setUser1(e.target.value)}
                required
                className="p-2 rounded-lg w-64 text-black"
              />
              <input
                type="text"
                placeholder="User 2"
                value={user2}
                onChange={(e) => setUser2(e.target.value)}
                required
                className="p-2 rounded-lg w-64 text-black"
              />
              <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mt-4"
              >
                Compare
              </button>
            </form>
          </div>
        )}
  
        {error && (
          <div className="fixed top-1/3 right-0 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-in">
            {error}
          </div>
        )}
  
        {loading && <p className="mt-4">Loading...</p>}
  
        {sharedAnime.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl mb-4">Shared Anime with Scores</h2>
            <table className="min-w-full text-left table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Anime Title</th>
                  <th className="px-4 py-2">{user1Name}'s Score</th>
                  <th className="px-4 py-2">{user2Name}'s Score</th>
                </tr>
              </thead>
              <tbody>
                {sharedAnime.map((anime, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{anime.title}</td>
                    <td className="px-4 py-2">{anime.user1Score}</td>
                    <td className="px-4 py-2">{anime.user2Score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );


}
