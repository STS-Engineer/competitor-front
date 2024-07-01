import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import logo from '../assets/logo-avocarbon.png';
// Replace 'YOUR_ACCESS_TOKEN' with your actual Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw';

const Mapp = () => {
  const mapContainerRef = useRef(null);
  const [filters, setFilters] = useState({
    filter1: '',
    filter2: '',
    filter3: '',
    filter4: '',
    filter5: '',
    filter6: ''
  });

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0], // [lng, lat]
      zoom: 2
    });

    return () => map.remove(); // Clean up map instance on unmount
  }, []); // Empty dependency array ensures this effect only runs once

  const handleFilterChange = (event, filterName) => {
    setFilters({ ...filters, [filterName]: event.target.value });
    // Add filtering logic here, e.g., update map markers based on filters
  };

  return (
    <div>
      <nav style={{ background: '#333', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ color: '#fff', margin: '0', marginRight: '1rem' }}>Filters:</h2>
          
        <input
          type="text"
          placeholder="Company..."
          value={filters.filter1}
          onChange={(event) => handleFilterChange(event, 'filter1')}
          style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
        />
        <input
          type="text"
          placeholder="Product..."
          value={filters.filter2}
          onChange={(event) => handleFilterChange(event, 'filter2')}
          style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
        />
        <input
          type="text"
          placeholder="Type of Location..."
          value={filters.filter3}
          onChange={(event) => handleFilterChange(event, 'filter3')}
          style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
        />
        <input
          type="text"
          placeholder="Region..."
          value={filters.filter4}
          onChange={(event) => handleFilterChange(event, 'filter4')}
          style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
        />
        <input
          type="text"
          placeholder="Country..."
          value={filters.filter5}
          onChange={(event) => handleFilterChange(event, 'filter5')}
          style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
        />
        <input
          type="text"
          placeholder="Filter 6..."
          value={filters.filter6}
          onChange={(event) => handleFilterChange(event, 'filter6')}
          style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
        />
        <img src={logo} alt="Logo" style={{ width: '200px', height: '25px',marginLeft: 'auto' }} />
        </div>
      </nav>
      <div ref={mapContainerRef} style={{ width: '100vw', height: 'calc(100vh - 50px)' }} />
    </div>
  );
};

export default Mapp;
