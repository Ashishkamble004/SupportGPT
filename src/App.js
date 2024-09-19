import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import axios from 'axios';
import './App.css';

// Configure Amplify
import config from './config';

Amplify.configure({
  Auth: {
    region: config.REGION,
    userPoolId: config.USER_POOL_ID,
    userPoolWebClientId: config.USER_POOL_CLIENT_ID,
  },
  API: {
    endpoints: [
      {
        name: 'SupportGPTApi',
        endpoint: config.API_GATEWAY_URL,
      },
    ],
  },
});

function App({ signOut, user }) {
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_GATEWAY_URL}/summarize`,
        query, // Send the query as plain text
        {
          headers: {
            'Authorization': `Bearer ${(await Amplify.Auth.currentSession()).getIdToken().getJwtToken()}`,
            'Content-Type': 'text/plain', // Set content type to plain text
          },
          responseType: 'text', // Expect a text response
        }
      );

      setSummary(response.data); // response.data is now the text summary
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>SupportGPT</h1>
        <p>Welcome, {user.username}! <button onClick={signOut}>Sign out</button></p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your support case or query"
            rows="5"
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {summary && (
          <div className="summary">
            <h2>Summary:</h2>
            <p>{summary}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuthenticator(App);

