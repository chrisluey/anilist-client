'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';  // Use 'next/navigation' in the app directory

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        try {
          // Send the authorization code to the backend, NOT AniList
          const response = await fetch('http://localhost:5000/exchange-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }), // Send the authorization code to the backend
          });
  
          const data = await response.json();
          if (data.sessionToken) {
            // Store the session token securely
            localStorage.setItem('sessionToken', data.sessionToken);
            router.push('/'); // Redirect to home page after login
          } else {
            console.error('Failed to fetch session token');
          }
        } catch (error) {
          console.error('Error exchanging code for token', error);
        }
      }
    };
    fetchToken();
  }, [router]);
  

  return <div>Logging in...</div>;
}
