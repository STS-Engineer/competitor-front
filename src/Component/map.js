import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import {useNavigate} from 'react-router-dom';
 
 
mapboxgl.accessToken = 'pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw';
const avoPlants = [
    { name: 'Tunisia', coordinates: [9.5375, 33.8869] },
    { name: 'Poitiers', coordinates: [0.3404, 46.5802] },
    { name: 'Amiens', coordinates: [2.3023, 49.8951] },
    { name: 'Frankfurt', coordinates: [8.6821, 50.1109] },
    { name: 'Chennai', coordinates: [80.2707, 13.0827] },
    { name: 'Kunshan', coordinates: [120.9822, 31.3858] },
    { name: 'Tianjin', coordinates: [117.3616, 39.3434] },
    { name: 'Anhui', coordinates: [117.9249, 30.6007] },
    { name: 'Monterrey', coordinates: [-100.3161, 25.6866] },
    { name: 'Mexico', coordinates: [-99.1332, 19.4326] },
];
 
function Map() {
    const mapContainerRef = useRef(null);
    const map = useRef(null);
    const [filters, setFilters] = useState({
        companyName: '',
        Product: '',
        country: '',
        RDLocation: '',
        HeadquartersLocation: '',
        region: '',
        avoPlant: ''
    });
    const [companies, setCompanies] = useState([]);
    const [companyNames, setCompanyNames] = useState([]);
    const [product, setProduct] = useState([]);
    const [country, setCountry] = useState([]);
    const [Rdlocation, setRdlocation] = useState([]);
    const [headquarterlocation, setHeadquarterlocation] = useState([]);
    const [region, setRegions] = useState([]);
    const navigate=useNavigate();
    const handlenavigate = ()=>{
        navigate("/stats")
    }
 
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
                addMarkersheadquarterForFilteredCompanies();
                addAvoPlantMarkers();
            });
        } else {
            // Clear existing markers before adding new ones
            clearMarkers();
            // Add markers for the filtered companies
            addMarkersForFilteredCompanies();
            addMarkersheadquarterForFilteredCompanies();
            addAvoPlantMarkers();
        }
    }, [companies, filters]);
 
    useEffect(() => {
        addAvoPlantPopup();
    }, [filters.avoPlant]); // Run when avoPlant filter changes
   
 
 
    const fetchCompanies = async () => {
        try {
            const response = await axios.get('https://avo-competitor-map-backend.azurewebsites.net/companies');
            setCompanies(response.data);
 
            // Extract company names from the fetched data
            const uniqueNames = Array.from(new Set(response.data.map(company => company.name)));
            setCompanyNames(uniqueNames);
            // Extract product from the fetched data
            const products = response.data.map(company => company.product);
            setProduct(products);
 
            // Extract country from the fetched data
            const country = Array.from(new Set(response.data.map(company => company.country)));
            setCountry(country);
 
            // Extract rdlocation from the fetched data
            const rdlocation = response.data.map(company => company.r_and_d_location);
            setRdlocation(rdlocation);
 
            // Extract headquarter from the fetched data
            const Headquarterlocation = response.data.map(company => company.headquarters_location);
            setHeadquarterlocation(Headquarterlocation);
 
            // Inside fetchCompanies function, extract regions from the fetched data
           const regions = Array.from(new Set(response.data.map(company => company.region)));
           setRegions(regions);
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
 
   
 
    const regionBoundaries = {
        africa: {
            minLat: -37,
            maxLat: 38,
            minLng: -25,
            maxLng: 52,
        },
        europe: {
            minLat: 36,
            maxLat: 71,
            minLng: -33,
            maxLng: 41,
        },
        eastAsia : {
            minLat: 18,
            maxLat: 54,
            minLng: 73,
            maxLng: 150,
        },
        easternEurope: {
            minLat: 40,
            maxLat: 81,
            minLng: 19,
            maxLng: 180,
        },
        southAsia: {
            minLat: -10,
            maxLat: 35,
            minLng: 65,
            maxLng: 106,
        },
        nafta: {
            minLat: -56,
            maxLat: 72,
            minLng: -168,
            maxLng: -34,
        },
        mercosur: {
            minLat: -55,
            maxLat: 5,
            minLng: -73,
            maxLng: -34
        }
    };
 
    const flyToRegion = (region) => {
        const boundaries = regionBoundaries[region];
        if (boundaries) {
            const centerLat = (boundaries.minLat + boundaries.maxLat) / 2;
            const centerLng = (boundaries.minLng + boundaries.maxLng) / 2;
           
            map.current.flyTo({
                center: [centerLng, centerLat],
                zoom: 3, // Adjust the zoom level as needed
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
            });
        } else {
            console.error('Region boundaries not found for:', region);
        }
    };
   
   
    const addMarkersForFilteredCompanies = () => {
        let regionFound = false; // Flag to check if region filter is applied
   
        companies.forEach(company => {
            const { r_and_d_location, product, name, country, headquarters_location, region } = company;
   
            const companyName = name.toLowerCase();
            const filterName = filters.companyName.toLowerCase();
            const filterProduct = filters.Product.toLowerCase();
            const filterCountry = filters.country.toLowerCase();
            const filterRdLocation = filters.RDLocation.toLowerCase();
            const filterHeadquartersLocation = filters.HeadquartersLocation.toLowerCase();
            const filterRegion = filters.region.toLowerCase();
   
            if (
                r_and_d_location &&
                companyName.includes(filterName) &&
                product.toLowerCase().includes(filterProduct) &&
                country.toLowerCase().includes(filterCountry) &&
                r_and_d_location.toLowerCase().includes(filterRdLocation) &&
                headquarters_location.toLowerCase().includes(filterHeadquartersLocation) &&
                region.toLowerCase().includes(filterRegion)
            ) {
                axios
                    .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(r_and_d_location)}.json?access_token=${mapboxgl.accessToken}`)
                    .then(response => {
                        if (response.data.features && response.data.features.length > 0) {
                            const coordinates = response.data.features[0].geometry.coordinates;
                            const longitude = coordinates[0];
                            const latitude = coordinates[1];
   
                            // Add marker for company location
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
   
                            new mapboxgl.Marker({ color: markerColor })
                                .setLngLat([longitude, latitude])
                                .setPopup(
                                    new mapboxgl.Popup().setHTML(`
                                        <img src="https://th.bing.com/th?id=OIP.HSliSi5UjcDwSy-4P7LijAAAAA&w=150&h=150&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2"
                                        alt="Company Image" style="max-width:50%;height:auto;">
                                        <h1>${name}</h1>
                                        <p>R&D Location: ${r_and_d_location}</p>
                                        <p>Headquarters Location: ${headquarters_location}</p>
                                        <p>Product: ${product}</p>
                                        <p>Country: ${country}</p>
                                    `)
                                )
                                .addTo(map.current);
   
                            if (filters.region && !regionFound) {
                                flyToRegion(filters.region);
                                regionFound = true;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching company location: ', error);
                    });
            }
        });
    };
   
const addMarkersheadquarterForFilteredCompanies = () => {
    companies.forEach(company => {
        const { r_and_d_location, product, name, country, headquarters_location, region } = company;
        const companyName = name.toLowerCase();
        const filterName = filters.companyName.toLowerCase();
        const filterProduct = filters.Product.toLowerCase();
        const filterCountry = filters.country.toLowerCase();
        const filterr_and_d_location = filters.RDLocation.toLowerCase();
        const filterheadquarters_location = filters.HeadquartersLocation.toLowerCase();
        const filterRegion = filters.region.toLowerCase();
 
 
 
        if ((r_and_d_location && companyName.includes(filterName) && product.toLowerCase().includes(filterProduct) && country.toLowerCase().includes(filterCountry) && r_and_d_location.toLowerCase().includes(filterr_and_d_location) && headquarters_location.toLowerCase().includes(filterheadquarters_location)&& region.toLowerCase().includes(filterRegion))) {
            axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(headquarters_location)}.json?access_token=pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw`)
                .then(response => {
                    if (response.data.features && response.data.features.length > 0) {
                        const coordinates = response.data.features[0].geometry.coordinates;
                        const longitude = coordinates[0];
                        const latitude = coordinates[1];
                        // Check if the marker is in the specified region
                        if (isMarkerInRegion(latitude, longitude, filterRegion)) {
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
                                .setPopup(new mapboxgl.Popup().setHTML(`<img src="https://th.bing.com/th?id=OIP.HSliSi5UjcDwSy-4P7LijAAAAA&w=150&h=150&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2" alt="Company Image" style="max-width:50%;height:auto;"><h1>name:${name}</h1><p>r_and_d_location:${r_and_d_location}</p><p>headquarters_location:${headquarters_location}</p><p>product: ${product}</p><p>Country: ${country}</p>`))
                                .addTo(map.current);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching company location: ', error);
                });
        }
    });
};
 
 
    const isMarkerInRegion = (lat, lng, region) => {
        // Trim whitespace from the region variable
        region = region.trim();
        console.log('Region:', region, 'Length:', region.length); // Log the value of the region parameter and its length
       
        // Check if the region name is empty
        if (!region) {
            console.error('Empty region name provided.');
            return false;
        }
   
        const boundaries = regionBoundaries[region];
        if (boundaries) {
            return lat >= boundaries.minLat && lat <= boundaries.maxLat && lng >= boundaries.minLng && lng <= boundaries.maxLng;
        } else {
            console.error('Region boundaries not found for:', region);
            return false;
        }
    };
   
   
   
    const haversineDistance = (coords1, coords2) => {
        const toRad = (x) => x * Math.PI / 180;
       
        const lat1 = coords1[1];
        const lon1 = coords1[0];
        const lat2 = coords2[1];
        const lon2 = coords2[0];
   
        const R = 6371; // Earth radius in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   
        return R * c; // Distance in kilometers
    };
   
 
 
    const handleproductChange = (event) => {
        const selectedproduct = event.target.value;
        setFilters({ ...filters, Product: selectedproduct });
    };
    const handlecountrychange = (event) => {
        const selectedcountry = event.target.value;
        setFilters({ ...filters, country: selectedcountry });
    };
    const handleRegionChange = (event) => {
        const selectedRegion = event.target.value;
        // Ensure the selected region name matches the keys in your regionBoundaries object
        setFilters({ ...filters, region: selectedRegion });
    };
   
    const handlefilterrdlocationchange = (event) => {
        const selectedRdLocation = event.target.value;
        setFilters({ ...filters, RDLocation: selectedRdLocation })
    }
    const handleheadquarterfilterchange = (event) => {
        const selectedheadquarter = event.target.value;
        setFilters({ ...filters, HeadquartersLocation: selectedheadquarter })
    }
    const handleDownloadPDF = () => {
        map.current.setZoom(1); // Set zoom level to 4
        map.current.once('idle', () => {
            html2canvas(mapContainerRef.current).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('landscape');
                pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
                pdf.save('map.pdf');
            });
        });
 
   
    };
 
   
    const handleDownloadExcel = () => {
        const filteredCompanies = companies.filter(company => {
            const companyName = company.name.toLowerCase();
            const product = company.product.toLowerCase();
            const country = company.country.toLowerCase();
            const r_and_d_location = company.r_and_d_location.toLowerCase();
            const headquarters_location = company.headquarters_location.toLowerCase();
 
            return (
                companyName.includes(filters.companyName.toLowerCase()) &&
                product.includes(filters.Product.toLowerCase()) &&
                country.includes(filters.country.toLowerCase()) &&
                r_and_d_location.includes(filters.RDLocation.toLowerCase()) &&
                headquarters_location.includes(filters.HeadquartersLocation.toLowerCase())
            );
        });
 
        const worksheetData = filteredCompanies.map(company => ({
            Name: company.name,
            Product: company.product,
            Country: company.country,
            'R&D Location': company.r_and_d_location,
            'Headquarters Location': company.headquarters_location
        }));
 
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');
 
        XLSX.writeFile(workbook, 'companies.xlsx');
    };
    const findClosestCompany = async (selectedPlantname,selectedPlantCoordinates, companies, mapboxToken) => {
        let closestCompany = null;
        let minDistance = Infinity;
   
        for (const company of companies) {
            const { r_and_d_location, headquarters_location } = company;
            const location = r_and_d_location || headquarters_location;
            if (location) {
                try {
                    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}`);
                    if (response.data.features && response.data.features.length > 0) {
                        const companyCoords = response.data.features[0].geometry.coordinates;
                        const distance = haversineDistance(selectedPlantCoordinates, companyCoords);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestCompany = { ...company, coordinates: companyCoords };
                        }
                    }
                } catch (error) {
                    console.error('Error fetching coordinates: ', error);
                }
            }
        }
   
        if (closestCompany) {
            const {
                name,
                r_and_d_location,
                headquarters_location,
                productionvolumes,
                employeestrength,
                revenues,
               
            } = closestCompany;
   
            // Custom CSS styles (same as before)
            const customStyles = `
                <style>
                    .swal2-popup {
                        font-size: 1.2rem;
                        font-family: 'Arial', sans-serif;
                        color: #333;
                        border-radius: 10px;
                        background: #f7f9fc;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    }
                    .swal2-title {
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    .swal2-html-container {
                        text-align: left;
                    }
                    .swal2-html-container strong {
                        color: #34495e;
                    }
                    .swal2-html-container br + strong {
                        margin-top: 10px;
                        display: inline-block;
                    }
                </style>
            `;
   
            // Additional details (added to the HTML content)
            const additionalDetails = `
                <strong>Production Volumes:</strong> ${productionvolumes || 'N/A'}<br>
                <strong>Employee Strength:</strong> ${employeestrength || 'N/A'}<br>
                <strong>Revenues:</strong> ${revenues || 'N/A'}<br>
                <strong>Products:</strong> ${product || 'N/A'}<br>
            `;
   
            Swal.fire({
                title: `Closest Company to ${selectedPlantname}`,
                html: `
                    ${customStyles}
                    <strong>Name:</strong> ${name}<br>
                    <strong>Location:</strong> ${r_and_d_location || headquarters_location}<br>
                    <strong>Distance:</strong> ${minDistance.toFixed(2)} km<br>
                    ${additionalDetails}
                `,
                icon: "info",
                customClass: {
                    popup: 'swal2-popup'
                }
            });
        }
    };
 
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };
 
const addAvoPlantPopup = () => {
    if (!filters.avoPlant) return;
    const selectedPlant = avoPlants.find(plant => plant.name.toLowerCase() === filters.avoPlant.toLowerCase());
    if (selectedPlant) {
        map.current.flyTo({
            center: selectedPlant.coordinates,
            zoom: 10,
            essential: true
        });
 
        new mapboxgl.Popup()
            .setLngLat(selectedPlant.coordinates)
            .setText(selectedPlant.name)
            .addTo(map.current);
 
        // Find the nearest company to the selected AVO plant
        findClosestCompany(selectedPlant.name, selectedPlant.coordinates, companies, mapboxgl.accessToken);
    }
};
   
 
 
    // Add markers for AVO plants
    const addAvoPlantMarkers = () => {
        avoPlants.forEach(plant => {
            if (filters.avoPlant === '' || plant.name.toLowerCase() === filters.avoPlant.toLowerCase()) {
                new mapboxgl.Marker({ color: 'red' })
                    .setLngLat(plant.coordinates)
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${plant.name}</h3>`))
                    .addTo(map.current);
            }
        });
    };
 
 
 
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
        if (name === 'region') {
            flyToRegion(value);
        }
    };
   
 
   
    return (
        <div>
            <nav style={{ background: '#333', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 style={{ color: '#fff', margin: '0', marginRight: '1rem' }}>Filters:</h2>
                    <select name="companyName" value={filters.companyName} onChange={handleFilterChange}
                    style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '4px', border: 'none' }}>
                        <option value="">All</option>
                        {companyNames.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                        value={filters.Product}
                        onChange={handleproductChange}
                        style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
                    >
                        <option value="">Select product</option>
                        {product.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                        value={filters.country}
                        onChange={handlecountrychange}
                        style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
                    >
                        <option value="">Select country</option>
                        {country.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                        value={filters.RDLocation}
                        onChange={handlefilterrdlocationchange}
                        style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
                    >
                        <option value="">Select R&D Location</option>
                        {Rdlocation.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                        value={filters.HeadquartersLocation}
                        onChange={handleheadquarterfilterchange}
                        style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
                    >
                        <option value="">Select Headquarters_Location</option>
                        {headquarterlocation.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                    value={filters.region}
                    onChange={handleRegionChange}
                    style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
                    >
                    <option value="">Select Region</option>
                    {region.map((name,index)=>(
                    <option key={index} value={name}>{name}</option>
                    ))}
                   </select>
 
 
                <select
               name="avoPlant"
               value={filters.avoPlant}
              onChange={handleInputChange}
              style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
               >
             <option value="">All</option>
            {avoPlants.map(plant => (
           <option key={plant.name} value={plant.name}>{plant.name}</option>
            ))}
          </select>
 
 
                    {/* {Object.entries(filters).map(([key, value]) => (
                        key !== 'companyName' && key !== 'Product' && key !== 'country' && key !== 'Rdlocation' && key !== 'HeadquartersLocation' && key !== 'region' &&  // Exclude company name from other filters
                        <input
                            key={key}
                            type="text"
                            placeholder={key.charAt(0).toUpperCase() + key.slice(1) + '...'}
                            value={value}
                            onChange={(event) => handleFilterChange(event, key)}
                            style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
                        />
                    ))} */}
                    <button  onClick={handleDownloadExcel} style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none', backgroundColor: 'green', color: 'white' }}>Download excel file</button>
                    <button onClick={handleDownloadPDF} style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none', backgroundColor: 'red', color: 'white' }}>Download pdf file</button>
                    <button onClick={handlenavigate} style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none', backgroundColor: 'orange', color: 'white' }}>Chart</button>
 
                </div>
            </nav>
            <div ref={mapContainerRef} style={{ width: '100vw', height: 'calc(100vh - 50px)' }} />
        </div>
    );
}
 
export default Map;
