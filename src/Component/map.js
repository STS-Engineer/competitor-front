import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import {useNavigate} from 'react-router-dom';
import Navbar from '../Components/Navbar';
import './map.css'
 
 
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
    const [showRdLocation, setShowRdLocation] = useState(true);
    const [showHeadquarterLocation, setShowHeadquarterLocation] = useState(true);
    const navigate=useNavigate();
    const handlenavigate = ()=>{
        navigate("/stats")
    }
 
    useEffect(() => {
        // Fetch companies when the component mounts
        fetchCompanies();
    }, []);

 
useEffect(() => {
    if (map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        
        // Filter companies based on active filters
        companies.forEach(company => {
            const { r_and_d_location, headquarters_location, product, name, country, region } = company;
            const companyName = name.toLowerCase();
            const filterName = filters.companyName.toLowerCase();
            const filterProduct = filters.Product.toLowerCase();
            const filterCountry = filters.country.toLowerCase();
            const filterRegion = filters.region.toLowerCase();
            const filterRdLocation = filters.RDLocation.toLowerCase();
            const filterHeadquartersLocation = filters.HeadquartersLocation.toLowerCase();

            // Check for region filter
            const regionMatches = filterRegion ? region.toLowerCase().includes(filterRegion) : true;

            // Check for R&D location filter
            const rdLocationMatches = filterRdLocation ? r_and_d_location && r_and_d_location.toLowerCase().includes(filterRdLocation) : true;

            // Check for headquarters location filter
            const headquartersMatches = filterHeadquartersLocation ? headquarters_location && headquarters_location.toLowerCase().includes(filterHeadquartersLocation) : true;

            // Check for company name, product, and country filters
            const companyMatches =
                companyName.includes(filterName) &&
                product.toLowerCase().includes(filterProduct) &&
                country.toLowerCase().includes(filterCountry);

            // If all conditions are met, add the marker
            if (companyMatches && regionMatches && rdLocationMatches && headquartersMatches) {
                const location = r_and_d_location || headquarters_location;
                if (location) {
                    // Use the appropriate color for the location type (R&D or HQ)
                    const markerColor = r_and_d_location ? '#00FF00' : '#0000FF'; // Green for R&D, Blue for HQ
                    const markerPopup = `<h3>${name}</h3><p>${product}</p>`;

                    axios
                        .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw`)
                        .then(response => {
                            if (response.data.features.length > 0) {
                                const coordinates = response.data.features[0].geometry.coordinates;

                                // Add the marker to the map
                                new mapboxgl.Marker({ color: markerColor })
                                    .setLngLat(coordinates)
                                    .setPopup(new mapboxgl.Popup().setHTML(markerPopup))
                                    .addTo(map.current);

                                // Extend the bounds to include this marker
                                bounds.extend(coordinates);
                            }

                            // Adjust the map view to fit all markers after adding them
                            if (!bounds.isEmpty()) {
                                map.current.fitBounds(bounds, { padding: 60, maxZoom: 16 });
                            }
                        })
                        .catch(error => console.error('Error fetching location:', error));
                }
            }
        });
    }
}, [companies, filters]);

 
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
    }, [companies, filters,showRdLocation, showHeadquarterLocation]);
 
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
            const products = Array.from(new Set(response.data.map(company => company.product)));
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
        Africa: {
            minLat: -37,
            maxLat: 38,
            minLng: -25,
            maxLng: 52,
        },
        Europe: {
            minLat: 36,
            maxLat: 71,
            minLng: -33,
            maxLng: 41,
        },
        East_Asia : {
            minLat: 18,
            maxLat: 54,
            minLng: 73,
            maxLng: 150,
        },
        Eastern_Europe: {
            minLat: 40,
            maxLat: 81,
            minLng: 19,
            maxLng: 180,
        },
        South_Asia: {
            minLat: -10,
            maxLat: 35,
            minLng: 65,
            maxLng: 106,
        },
        Nafta: {
            minLat: -56,
            maxLat: 72,
            minLng: -168,
            maxLng: -34,
        },
        Mercosur: {
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
        if (!showRdLocation) return;
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
                    .get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(r_and_d_location)}.json?access_token=pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw`)
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
    
                            const marker = new mapboxgl.Marker({ color: markerColor })
                                .setLngLat([longitude, latitude])
                                .setPopup(
                                    new mapboxgl.Popup({ offset: 25, className: 'custom-popup' }).setHTML(`
                                        <div class="popup-content">
                                            <div class="popup-header">
                                              <p style={{fontWeight:'bold'}}>R&D Location</p>
                                              <p>${name}</p>
                                            </div>
                                        
                                        </div>
                                    `)
                                )
                                .addTo(map.current);
    
                            // Open popup by default
                            marker.getPopup().addTo(map.current);
    
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
    if (!showHeadquarterLocation) return; 
    companies.forEach(company => {
        const { headquarters_location, product, name, country, region } = company;

        // Convert filter values to lowercase for case-insensitive comparison
        const companyName = name.toLowerCase();
        const filterName = filters.companyName.toLowerCase();
        const filterProduct = filters.Product.toLowerCase();
        const filterCountry = filters.country.toLowerCase();
        const filterHeadquartersLocation = filters.HeadquartersLocation.toLowerCase();
        const filterRegion = filters.region.toLowerCase();

        // Check if the company matches all filters
        if (
            headquarters_location && // Ensure headquarters_location is not empty
            companyName.includes(filterName) &&
            product.toLowerCase().includes(filterProduct) &&
            country.toLowerCase().includes(filterCountry) &&
            headquarters_location.toLowerCase().includes(filterHeadquartersLocation) &&
            region.toLowerCase().includes(filterRegion)
        ) {
            // Fetch coordinates for the headquarters location
            axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(headquarters_location)}.json?access_token=pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw`)
                .then(response => {
                    if (response.data.features && response.data.features.length > 0) {
                        const coordinates = response.data.features[0].geometry.coordinates;
                        const [longitude, latitude] = coordinates;

                        // Use a consistent color for headquarter markers (e.g., blue)
                        const markerColor = '#0000FF'; // Blue for headquarters

                        // Add marker for the headquarters location
                        const marker = new mapboxgl.Marker({ color: markerColor })
                            .setLngLat([longitude, latitude])
                            .setPopup(
                                new mapboxgl.Popup().setHTML(`
                                    <p style={{fontWeight:'bold'}}>Headquarters Location</p>
                                    <p>${name}</p>
                                  
                                `)
                            )
                            .addTo(map.current);

                        // Open popup by default
                        marker.getPopup().addTo(map.current);
                    }
                })
                .catch(error => {
                    console.error('Error fetching headquarters location:', error);
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


 const handleRdLocationCheckbox = (e) => {
    setShowRdLocation(e.target.checked); // Toggle R&D checkbox
};

const handleHeadquarterLocationCheckbox = (e) => {
    setShowHeadquarterLocation(e.target.checked); // Toggle Headquarters checkbox
};

     const handleDownloadPDF = () => {
        // Initialize map bounds
        const bounds = new mapboxgl.LngLatBounds();
        const filteredCompanies = companies.filter(company => {
            const companyName = company.name.toLowerCase();
            const product = company.product.toLowerCase();
            const country = company.country.toLowerCase();
            const r_and_d_location = company.r_and_d_location.toLowerCase();
            const headquarters_location = company.headquarters_location.toLowerCase();
            const region = company.region.toLowerCase();
    
            return (
                companyName.includes(filters.companyName.toLowerCase()) &&
                product.includes(filters.Product.toLowerCase()) &&
                country.includes(filters.country.toLowerCase()) &&
                r_and_d_location.includes(filters.RDLocation.toLowerCase()) &&
                headquarters_location.includes(filters.HeadquartersLocation.toLowerCase()) &&
                region.includes(filters.region.toLowerCase())
            );
        });
    
        // Array to store promises for fetching marker data
        const markerPromises = [];
    
        filteredCompanies.forEach(company => {
            const { r_and_d_location, name, product } = company;
    
            // Fetch coordinates for R&D location
            const markerPromise = axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(r_and_d_location)}.json?access_token=${mapboxgl.accessToken}`)
                .then(response => {
                    if (response.data.features && response.data.features.length > 0) {
                        const coordinates = response.data.features[0].geometry.coordinates;
                        const longitude = coordinates[0];
                        const latitude = coordinates[1];
    
                        // Extend bounds to include this marker
                        bounds.extend([longitude, latitude]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching company location: ', error);
                });
    
            markerPromises.push(markerPromise);
        });
    
        // After all markers are added, wait for them to be loaded
        Promise.all(markerPromises).then(() => {
            // Adjust map view for a clear country-wide screenshot with markers visible
            if (!bounds.isEmpty()) {
                const paddingOptions = { padding: 50, maxZoom: 4 }; // Limit zoom level to a wider view
                map.current.fitBounds(bounds, paddingOptions);
            }
    
            // Once the map is adjusted, capture the map as a canvas
            map.current.once('idle', () => {
                html2canvas(mapContainerRef.current, {
                    useCORS: true,
                    scale: 2, // Higher resolution for a clearer screenshot
                }).then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('landscape');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
    
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save('filtered_markers_map.pdf');
                });
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
            Region: company.region,
            'R&D Location': company.r_and_d_location,
            'Headquarters Location': company.headquarters_location,
            Email: company.email, // Add email field
            Revenues: company.revenues, // Add revenues field
            Website: company.website, // Add website field
            Telephone: company.telephone, // Add telephone field
            'Key Customers': company.keycustomers,// Add key customers field
            'ProductionVolumes': company.productionvolumes, // Add key customers field
            'Employees Strength ': company.employeestrength // Add key customers field
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
            <div style={{ width: '100%', position: 'fixed', top: 0, zIndex: 1000 }}>
                <Navbar />
            </div>
            <nav style={{ background:'#333', padding: '1rem', marginTop: '60px',  display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h2 style={{ color: '#fff', margin: '0', marginRight: '1rem' }}>Filters:</h2>
                    <select name="companyName" value={filters.companyName} onChange={handleFilterChange}
                    style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '4px', border: 'none' }}>
                        <option value="">Company Name</option>
                        {companyNames.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                        value={filters.Product}
                        onChange={handleproductChange}
                        style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none'}}
                    >
                        <option value="">Product</option>
                        {product.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                        value={filters.country}
                        onChange={handlecountrychange}
                        style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
                    >
                        <option value="">Country</option>
                        {country.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                        value={filters.RDLocation}
                        onChange={handlefilterrdlocationchange}
                        style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none', width:'120px'}}
                    >
                        <option value="">R&D Location</option>
                        {Rdlocation.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                        value={filters.HeadquartersLocation}
                        onChange={handleheadquarterfilterchange}
                        style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none', width:'120px'}}
                    >
                        <option value="">HQ Location</option>
                        {headquarterlocation.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
 
                    <select
                    value={filters.region}
                    onChange={handleRegionChange}
                    style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
                    >
                    <option value="">Region</option>
                    {region.map((name,index)=>(
                    <option key={index} value={name}>{name}</option>
                    ))}
                   </select>
 
                  
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ color: '#fff', marginRight: '1rem' }}>
                    <input
                        type="checkbox"
                        checked={showRdLocation}
                        onChange={handleRdLocationCheckbox}
                        style={{ marginRight: '0.5rem' }}
                    />
                    R&D Location
                </label>
                <label style={{ color: '#fff' }}>
                    <input
                        type="checkbox"
                        checked={showHeadquarterLocation}
                        onChange={handleHeadquarterLocationCheckbox}
                        style={{ marginRight: '0.5rem' }}
                    />
                    Headquarters Location
                </label>
            </div>
                <select
               name="avoPlant"
               value={filters.avoPlant}
              onChange={handleInputChange}
              style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '5px', border: 'none' }}
               >
             <option value="">AVOCarbon Plant</option>
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
