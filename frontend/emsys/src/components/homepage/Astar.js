import React, { useState } from 'react';
import './common.css';

const cities = ['Belgavi', 'Bangalore', 'Mumbai', 'Pune'];
const venues = [
  { 
    name: 'Garden Hall', 
    description: `Garden Hall accommodates up to 300 guests and is ideal for weddings, anniversaries, or family gatherings. The hall features customizable floral arrangements, themed lighting, and draped canopies. Food options include a wide range of buffet and plated meals, with both vegetarian and non-vegetarian options, as well as live counters for chaat, barbecue, or desserts.`,
    imgSrc: '/assets/garden_hall.png' 
  },
  { 
    name: 'Swimming Pool Pavilion', 
    description: `The Swimming Pool Pavilion is perfect for gatherings of 100–150 guests. Its poolside décor includes floating candles, lanterns, fairy lights, and tropical themes.`,
    imgSrc: '/assets/pool_pavilion.png' 
  },
  { 
    name: 'Elegant Ballroom', 
    description: `The Elegant Ballroom is a large venue that can accommodate up to 500 guests. It features luxurious chandeliers, grand stage setups, and royal-themed décor, making it perfect for high-end events.`,
    imgSrc: '/assets/ballroom.png' 
  },
  { 
    name: 'Terrace Lounge', 
    description: `The Terrace Lounge provides an intimate and cozy setting for up to 100 guests. Its open-air ambiance, featuring fairy lights, minimalist furniture, and boho-themed arrangements, creates a perfect atmosphere for small gatherings.`,
    imgSrc: '/assets/terrace_lounge.png' 
  },
  { 
    name: 'Majestic Courtyard', 
    description: `The Majestic Courtyard can comfortably host up to 400 guests. It features rustic and vintage-themed décor, with hanging lights, floral arches, and elegant seating arrangements.`,
    imgSrc: '/assets/courtyard.png' 
  },
  { 
    name: 'Sky Lounge', 
    description: `The Sky Lounge is a premium venue that can host up to 200 guests. Its modern and chic design, featuring LED lighting, modular furniture, and panoramic skyline views, creates an exclusive atmosphere.`,
    imgSrc: '/assets/sky_lounge.png' 
  }
];

// Updated coordinates for cities and venues ensuring different nearest venues
const cityCoordinates = {
  'Belgavi': { lat: 15.8481, lon: 74.4977 }, 
  'Bangalore': { lat: 12.9716, lon: 77.5946 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Pune': { lat: 18.5204, lon: 73.8567 }
};

const venueCoordinates = [
  { name: 'Garden Hall', lat: 15.85, lon: 74.5 },
  { name: 'Swimming Pool Pavilion', lat: 12.97, lon: 77.59 },
  { name: 'Elegant Ballroom', lat: 18.52, lon: 73.85 },
  { name: 'Terrace Lounge', lat: 12.96, lon: 77.60 },
  { name: 'Majestic Courtyard', lat: 19.07, lon: 72.87 },
  { name: 'Sky Lounge', lat: 12.94, lon: 77.61 }
];

// Haversine formula to calculate distance between two coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// A* algorithm implementation
const aStar = (startCity) => {
  const startCoords = cityCoordinates[startCity];
  let nearestVenue = null;
  let minDistance = Infinity;

  venueCoordinates.forEach(venue => {
    const distance = haversineDistance(startCoords.lat, startCoords.lon, venue.lat, venue.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestVenue = venue;
    }
  });

  return nearestVenue;
};

const Astar = () => {
  const [userCity, setUserCity] = useState('');
  const [nearestVenue, setNearestVenue] = useState(null);
  const [showAllVenues, setShowAllVenues] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = () => {
    if (userCity === '') {
      setShowAllVenues(true);
      setNearestVenue(null);
      setErrorMessage('');
    } else if (userCity && cities.includes(userCity)) {
      const nearest = aStar(userCity);
      setNearestVenue(nearest);
      setShowAllVenues(false);
      setErrorMessage('');
    } else {
      setErrorMessage('We are not connected to that city yet, we will connect soon!');
      setShowAllVenues(false);
      setNearestVenue(null);
    }
  };

  return (
    <div className="astar-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Nearest Venue, Enter your city..."
            value={userCity}
            onChange={(e) => setUserCity(e.target.value)}
            className="search-input"
            style={{
              width: '70%',
              padding: '10px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        <div className="search-button-container" style={{ textAlign: 'center' }}>
          <button
            onClick={handleSearch}
            className="search-button"
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go
          </button>
        </div>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {nearestVenue && (
        <div className="nearest-venue">
          <h2>Nearest Venue</h2>
          <img 
            src={venues.find(venue => venue.name === nearestVenue.name).imgSrc} 
            alt={nearestVenue.name} 
          />
          <h3>{nearestVenue.name}</h3>
          <p>{venues.find(venue => venue.name === nearestVenue.name).description}</p>
        </div>
      )}
      {showAllVenues && !nearestVenue && (
        <div className="all-venues">
          <div className="venues-list">
            {venues.map((venue, index) => (
              <div className="venue-item glowing-card" key={index}>
                <img src={venue.imgSrc} alt={venue.name} />
                <h4>{venue.name}</h4>
                <p>{venue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Astar;
