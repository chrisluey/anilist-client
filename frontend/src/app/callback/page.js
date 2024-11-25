'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Get token from URL fragment (#)
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');

    if (accessToken) {
      // Store token
      localStorage.setItem('anilistToken', accessToken);
      
      // Fetch username with token
      fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              Viewer {
                name
              }
            }
          `
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.data?.Viewer?.name) {
          localStorage.setItem('username', data.data.Viewer.name);
          router.push('/');
        }
      })
      .catch(err => {
        console.error('Error fetching username:', err);
        router.push('/');
      });
    } else {
      router.push('/');
    }
  }, [router]);

  return <div>Logging in...</div>;
}