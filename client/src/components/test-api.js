import React, { useState, useEffect } from 'react';
import modelService from './pages/model-service';

function TestAPI() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Wait for data to load
        await new Promise(resolve => {
          const checkData = () => {
            if (modelService.data.communities.length > 0) {
              resolve();
            } else {
              setTimeout(checkData, 500);
            }
          };
          checkData();
        });

        setCommunities(modelService.data.communities);
        setLoading(false);
      } catch (err) {
        setError('Error loading data: ' + err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading data from API...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Communities from API</h2>
      <ul>
        {communities.map(community => (
          <li key={community._id}>
            <h3>{community.name}</h3>
            <p>{community.description}</p>
            <p>Members: {community.members.length}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TestAPI;