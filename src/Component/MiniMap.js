import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
 
mapboxgl.accessToken = 'pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw';
 
function Mapbox() {
    const mapContainerRef = useRef(null);
    const map = useRef(null);
    const [filters, setFilters] = useState({
        companyName: '',
        Product: '',
        country: '',
        RDLocation: '',
        HeadquartersLocation: '',
    });
    const [companies, setCompanies] = useState([]);
 
 
    useEffect(() => {
        // Fetch companies when the component mounts
        fetchCompanies();
    }, []);
 
    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [0, 0], // Default center
                zoom: 1 // Default zoom
            });
 
            map.current.on('load', () => {
                // Add markers for the filtered companies after the map has loaded
                addMarkersForFilteredCompanies();
            });
        } else {
            // Clear existing markers before adding new ones
            clearMarkers();
            // Add markers for the filtered companies
            addMarkersForFilteredCompanies();
        }
    }, [companies, filters]);
 
 
    const fetchCompanies = async () => {
        try {
            const response = await axios.get('http://localhost:4000/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies: ', error);
        }
    };
 
    const clearMarkers = () => {
        if (map.current) {
            map.current.remove(); // Remove existing map
            map.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [0, 0], // Default center
                zoom: 1 // Default zoom
            });
        }
    };
 
 
    const addMarkersForFilteredCompanies = () => {
        companies.forEach(company => {
            const { r_and_d_location, product, name, country, headquarters_location } = company;
            const companyName = name.toLowerCase();
            const filterName = filters.companyName.toLowerCase(); // Assuming filter1 corresponds to name filter
            const filterProduct = filters.Product.toLowerCase();
            const filterCountry = filters.country.toLowerCase();
            const filterr_and_d_location = filters.RDLocation.toLowerCase();
            const filterheadquarters_location = filters.HeadquartersLocation.toLowerCase();
 
            if (r_and_d_location && companyName.includes(filterName) && product.toLowerCase().includes(filterProduct) && country.toLowerCase().includes(filterCountry) && r_and_d_location.toLowerCase().includes(filterr_and_d_location) && headquarters_location.toLowerCase().includes(filterheadquarters_location)) {
                axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(r_and_d_location)}.json?access_token=pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw`)
                    .then(response => {
                        if (response.data.features && response.data.features.length > 0) {
                            const coordinates = response.data.features[0].geometry.coordinates;
                            const longitude = coordinates[0];
                            const latitude = coordinates[1];
                            let markerColor = '#000'; // Default color
                            if (product) {
                                // Set marker color based on product type
                                switch (product.toLowerCase()) {
                                    case 'chokes':
                                        markerColor = '#00FF00'; // Green
                                        break;
                                    case 'seals':
                                        markerColor = '#FFA500'; // Orange
                                        break;
                                    case 'assembly':
                                        markerColor = '#0000FF'; // Blue
                                        break;
                                    case 'injection':
                                        markerColor = '#FF00FF'; // Magenta
                                        break;
                                    case 'brush':
                                        markerColor = '#FFFF00'; // Yellow
                                        break;
                                    default:
                                        break;
                                }
                            }
 
                            // Add marker for company location
                            new mapboxgl.Marker({ color: markerColor })
                                .setLngLat([longitude, latitude])
                                .setPopup(new mapboxgl.Popup().setHTML(`<h1>${name}</h1><p>${name}</p><p>${name}</p><p>Country: ${country}</p>`))
                                .addTo(map.current);
                                map.current.flyTo({
                                    center: [longitude, latitude],
                                    essential: true // this animation is considered essential with respect to prefers-reduced-motion
                                });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching company location: ', error);
                    });
            }
        });
    };
 
 
    return (
        <div style={{ position: 'relative', width: '20vw', height: '30vh' }}>
        <div ref={mapContainerRef} style={{ position: 'absolute', top: '10', margin: 'auto', width: '80%', height: '70%' }} />
    </div>
   
 
    );
}
 
export default Mapbox;