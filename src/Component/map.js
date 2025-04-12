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
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { Modal } from 'antd';
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
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [companyNames, setCompanyNames] = useState([]);
    const [product, setProduct] = useState([]);
    const [country, setCountry] = useState([]);
    const [Rdlocation, setRdlocation] = useState([]);
    const [headquarterlocation, setHeadquarterlocation] = useState([]);
    const [region, setRegions] = useState([]);
    const [showRdLocation, setShowRdLocation] = useState(true);
    const [showHeadquarterLocation, setShowHeadquarterLocation] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const navigate=useNavigate();
    const handlenavigate = ()=>{
        navigate("/stats")
    }
 
    useEffect(() => {
        // Fetch companies when the component mounts
        fetchCompanies();
    }, []);

     const markersRef = useRef([]);
useEffect(() => {
    if (map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        
        // Remove existing markers before adding new ones
        if (markersRef.current.length > 0) {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
        }

        // Define icons for R&D and HQ locations
        const rdIcon = 'https://example.com/rd-icon.png';  // Replace with actual R&D icon URL
        const hqIcon = 'https://example.com/hq-icon.png';  // Replace with actual HQ icon URL

        companies.forEach(company => {
            const { r_and_d_location, headquarters_location, product, name, country, region } = company;
            const companyName = name.toLowerCase();
            const filterName = filters.companyName.toLowerCase();
            const filterProduct = filters.Product.toLowerCase();
            const filterCountry = filters.country.toLowerCase();
            const filterRegion = filters.region.toLowerCase();
            const filterRdLocation = filters.RDLocation.toLowerCase();
            const filterHeadquartersLocation = filters.HeadquartersLocation.toLowerCase();

            const regionMatches = filterRegion ? region.toLowerCase().includes(filterRegion) : true;
            const rdLocationMatches = filterRdLocation ? r_and_d_location?.toLowerCase().includes(filterRdLocation) : true;
            const headquartersMatches = filterHeadquartersLocation ? headquarters_location?.toLowerCase().includes(filterHeadquartersLocation) : true;
            const companyMatches = companyName.includes(filterName) &&
                                   product.toLowerCase().includes(filterProduct) &&
                                   country.toLowerCase().includes(filterCountry);

            if (companyMatches && regionMatches && rdLocationMatches && headquartersMatches) {
                const location = r_and_d_location || headquarters_location;
                if (location) {
                    const markerIcon = r_and_d_location ? rdIcon : hqIcon; // Set appropriate icon
                    const markerPopup = `
                        <div style="font-family: Arial, sans-serif; padding: 8px; text-align: center;">
                            <h3 style="margin: 5px 0; font-size: 16px;">${name}</h3>
                            <p style="margin: 2px 0; font-size: 14px; color: gray;">${product}</p>
                        </div>
                    `;

                    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}`)
                        .then(response => {
                            if (response.data.features.length > 0) {
                                const coordinates = response.data.features[0].geometry.coordinates;

                                // Create a custom marker element
                                const el = document.createElement('div');
                                el.style.backgroundImage = `url(${markerIcon})`;
                                el.style.width = '30px'; // Adjust size
                                el.style.height = '30px';
                                el.style.backgroundSize = 'cover';
                                el.style.borderRadius = '50%';
                                el.style.cursor = 'pointer';

                                // Create and add the marker
                                const marker = new mapboxgl.Marker(el)
                                    .setLngLat(coordinates)
                                    .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(markerPopup))
                                    .addTo(map.current);

                                markersRef.current.push(marker); // Store reference to remove markers later
                                bounds.extend(coordinates);
                            }

                            if (!bounds.isEmpty()) {
                                map.current.fitBounds(bounds, { padding: 80, maxZoom: 14 });
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
                zoom: 20 // Default zoom
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
            const response = await axios.get('https://compt-back.azurewebsites.net/companies');
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

      const productImages = {
        chokes: "https://www.split-corecurrenttransformer.com/photo/pl26101407-ferrite_rod_core_high_frequency_choke_coil_inductor_air_coils_with_flat_wire.jpg",
        seals: "https://5.imimg.com/data5/AG/XO/RZ/SELLER-552766/bonded-seals.jpg",
        assembly: "https://images.paintball.camp/wp-content/uploads/2022/12/06152724/Protoyz-Speedster-Motor-Assembly.png",
        injection: "https://secodi.fr/wp-content/uploads/2022/12/piece-injection-perkins-T417873_3.jpg",
        brush: "https://2.imimg.com/data2/VE/EI/MY-978046/products6-250x250.jpg",
      };

   const showModal = (company) => {
        setSelectedCompany(company);
        setIsModalVisible(true);
      };
       const handleCancel = () => {
        setIsModalVisible(false);
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
    
                      const marker = new mapboxgl.Marker({
                     scale: 0.7 // Adjust the scale as needed
                       })
                    .setLngLat(coordinates)
                    .addTo(map.current);
                  
                    const el = marker.getElement();
                    el.addEventListener('click', () => {
                      // Code to display the modal
                      showModal(company);
                    });
                    
                // Show Ant Design Modal when clicking a marker
                el.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent map click event from firing
                    showModal(company);
                  });
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
                         const marker = new mapboxgl.Marker({
                     scale: 0.7 // Adjust the scale as needed
                       })
                    .setLngLat(coordinates)
                    .addTo(map.current);
                  
                    const el = marker.getElement();
                    el.addEventListener('click', () => {
                      // Code to display the modal
                      showModal(company);
                    });
                    
                // Show Ant Design Modal when clicking a marker
                el.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent map click event from firing
                    showModal(company);
                  });
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

const handleDownloadPDF = async () => {
  try {
    if (!mapContainerRef.current || !map.current) {
      console.error('Map references not found');
      return;
    }

    const isFiltered =
      filteredCompanies.length > 0 &&
      filteredCompanies.length < companies.length;
    const visibleCompanies = isFiltered ? filteredCompanies : companies;

    const originalCenter = map.current.getCenter();
    const originalZoom = map.current.getZoom();

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;

    visibleCompanies.forEach(company => {
      const latRaw = company.latitude;
      const lonRaw = company.longitude;

      // Validate raw latitude/longitude
      if (
        latRaw == null || lonRaw == null ||
        latRaw === '' || lonRaw === ''
      ) {
        console.warn('Missing coordinates:', company);
        return;
      }

      const latitude = parseFloat(latRaw);
      const longitude = parseFloat(lonRaw);

      const isValid =
        isFinite(latitude) &&
        isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

      if (isValid) {
        bounds.extend([longitude, latitude]);
        hasValidCoordinates = true;
      } else {
        console.warn('Invalid coordinates after parsing:', latRaw, lonRaw, company);
      }
    });

    if (!hasValidCoordinates) {
      alert('No valid coordinates found.');
      return;
    }

    // Zoom to bounds
    await new Promise(resolve => {
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 14, duration: 1000 });
      map.current.once('idle', resolve);
    });

    // Capture map canvas and generate PDF
    const mapCanvas = mapContainerRef.current.querySelector('.mapboxgl-canvas');
    if (!mapCanvas) {
      console.error('Map canvas missing');
      return;
    }

    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const scale = 2;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = mapCanvas.width * scale;
    tempCanvas.height = mapCanvas.height * scale;
    const ctx = tempCanvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(mapCanvas, 0, 0);

    const imgData = tempCanvas.toDataURL('image/jpeg', 0.9);
    const imgRatio = tempCanvas.width / tempCanvas.height;

    if (imgRatio > pdfWidth / pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, (pdfHeight - pdfWidth / imgRatio) / 2, pdfWidth, pdfWidth / imgRatio);
    } else {
      pdf.addImage(imgData, 'JPEG', (pdfWidth - pdfHeight * imgRatio) / 2, 0, pdfHeight * imgRatio, pdfHeight);
    }

    // Reset map view and save
    map.current.jumpTo({ center: originalCenter, zoom: originalZoom });
    pdf.save(isFiltered ? 'Filtered_Map.pdf' : 'Full_Map.pdf');
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF. Check console for details.');
  }
};


 const handleDownloadExcel = async () => {
  const filterToFieldMap = {
    companyName: 'name',
    Product: 'product',
    country: 'country',
    RDLocation: 'r_and_d_location',
    HeadquartersLocation: 'headquarters_location',
    region: 'region',
    avoPlant: 'avoPlant'
  };

  const filteredCompanies = companies.filter(company => {
    return Object.entries(filters).every(([filterKey, filterValue]) => {
      if (!filterValue) return true;
      const companyField = filterToFieldMap[filterKey];
      if (!companyField) return true;
      const companyValue = company[companyField]?.toString().toLowerCase() || '';
      return companyValue.includes(filterValue.toLowerCase());
    });
  });

  const header = [
    'Company Name', 'Email', 'Headquarters', 'R&D Location', 'Country', 'Products',
    'Employee Strength', 'Revenues', 'Phone', 'Website', 'Production Volume', 'Key Customers',
    'Region', 'Founding Year', 'Rating', 'Offering Products', 'Pricing Strategy', 'Customer Needs',
    'Technology Used', 'Competitive Advantage', 'Challenges', 'Recent News', 'Product Launch',
    'Strategic Partnership', 'Comments', 'Employees Per Region', 'Business Strategies', 'Year of financial detail',
    'Revenue', 'EBIT', 'Operating Cash Flow', 'Investing Cash Flow', 'Free Cash Flow', 'ROCE',
    'Equity Ratio', 'CEO', 'CFO', 'CTO', 'RD&head', 'Sales head', 'Production head', 'Key decision marker', 
   
  ];

  const rows = filteredCompanies.map(company => [
    company.name, company.email, company.headquarters_location, company.r_and_d_location,
    company.country, company.product, company.employeestrength, company.revenues, company.telephone,
    company.website, company.productionvolumes, company.keycustomers, company.region,
    company.foundingyear, company.rate, company.offeringproducts, company.pricingstrategy,
    company.customerneeds, company.technologyuse, company.competitiveadvantage, company.challenges,
    company.recentnews, company.productlaunch, company.strategicpartenrship, company.comments,
    company.employeesperregion, company.businessstrategies,company.financialyear, company.revenue, company.ebit,
    company.operatingcashflow, company.investingcashflow, company.freecashflow, company.roce,
    company.equityratio, company.ceo, company.cfo,
    company.cto, company.rdhead, company.saleshead, company.productionhead,
    company.keydecisionmarker
  ]);

  // Create the workbook
 XlsxPopulate.fromBlankAsync().then(workbook => {
  const sheet = workbook.sheet(0);
  sheet.name("Companies");

  // Set the header row
  sheet.row(1).style("bold", true);
  header.forEach((title, index) => {
    sheet.cell(1, index + 1).value(title);
  });

  // Add company data
  rows.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      sheet.cell(rowIndex + 2, colIndex + 1).value(value);
    });
  });

  // Ensure `sheet.dataValidations` is available
  if (sheet.dataValidations) {
    // Add dropdown to "Products" column (F), assuming header row = 1
    const productOptions = ['Assembly', 'Chokes', 'Injection'];
    const productRange = `F2:F${rows.length + 1}`;
    sheet.dataValidations.add(productRange, {
      type: 'list',
      allowBlank: true,
      formula1: `"${productOptions.join(',')}"`
    });

    // Add dropdown to "Region" column (M)
    const regionOptions = ['Europe', 'Africa', 'East Europe'];
    const regionRange = `M2:M${rows.length + 1}`; 
    sheet.dataValidations.add(regionRange, {
      type: 'list',
      allowBlank: true,
      formula1: `"${regionOptions.join(',')}"`
    });
  } else {
    console.error("Data validations are not supported on this sheet.");
  }

  // Export the file
  return workbook.outputAsync().then(blob => {
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Companies_Export.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}).catch(err => {
  console.error("Error generating workbook:", err);
});

};
    const findClosestCompany = async (selectedPlantname,selectedPlantCoordinates, companies, mapboxToken) => {
        let closestCompany = null;
        let minDistance = Infinity;
   
        for (const company of companies) {
            const { r_and_d_location, headquarters_location } = company;
            const location = r_and_d_location || headquarters_location;
            if (location) {
                try {
                    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}`);
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
                new mapboxgl.Marker({ color: 'red', scale: 0.7 })
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
                 <Modal
        title={selectedCompany?.name}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {selectedCompany && (
          <div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <img
                src={productImages[selectedCompany.product.toLowerCase()] || ""}
                alt={selectedCompany.product}
                style={{
                  width: "100px",
                  height: "auto",
                  borderRadius: "8px",
                  border: "2px solid #ddd",
                }}
              />
            </div>
            <p>
              <strong>Product:</strong>{" "}
                {selectedCompany.product}
            </p>
            <p>
              <strong>R&D Location:</strong> {selectedCompany.r_and_d_location}
            </p>
            <p>
              <strong>Headquarters:</strong> {selectedCompany.headquarters_location}
            </p>

            <p>
              <strong>Region:</strong> {selectedCompany.region}
            </p>
            <p>
              <strong>Country:</strong> {selectedCompany.country}
            </p>

            <p>
              <strong>Founding Year:</strong> {selectedCompany.foundingyear}
            </p>
             
             <p>
              <strong>Offering Products:</strong> {selectedCompany.offeringproducts}
            </p>

             <p>
              <strong>Competitive advantages:</strong> {selectedCompany.competitiveadvantage}
            </p>
          
          </div>
        )}
      </Modal>
        </div>
    );
}
 
export default Map;
