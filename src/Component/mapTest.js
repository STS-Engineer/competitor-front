import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
import Notification from './Notification/Notification';
import phonehand from "../assets/logo-avocarbon.png";
import { useNavigate } from 'react-router-dom';

function Form() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [markerCoordinates, setMarkerCoordinates] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    headquarters_location: '',
    r_and_d_location: '',
    country: '',
    product: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [showSelect, setShowSelect] = useState(false);
  const [rdLocationSuggestions, setRdLocationSuggestions] = useState([]);
  const [headquarterSuggestions, setheadquarterSuggestions] = useState([]);
  const [loadingRdSuggestions, setLoadingRdSuggestions] = useState(false);
  const [loadingheadquarterSuggestions, setLoadingheadquarterSuggestions] = useState(false);
  const [selectedRdLocation, setSelectedRdLocation] = useState(null); // Selected R&D location
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Save selected R&D location to storage whenever it changes
    if (selectedRdLocation) {
      localStorage.setItem('selectedRdLocation', selectedRdLocation);
    }
  }, [selectedRdLocation]);

  const fetchRdLocationSuggestions = async (inputValue) => {
    try {
      setLoadingRdSuggestions(true);
      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw`);
      setRdLocationSuggestions(response.data.features.map(feature => feature.place_name));
    } catch (error) {
      console.error('Error fetching R&D location suggestions: ', error);
    } finally {
      setLoadingRdSuggestions(false);
    }
  };

  const handlesuggestionclick = (suggestion) => {
    setFormData({ ...formData, r_and_d_location: suggestion });
    setRdLocationSuggestions([]);
  }


  const fetchheadquarterSuggestions = async (inputValue) => {
    try {
      setLoadingheadquarterSuggestions(true);
      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw`);
      setheadquarterSuggestions(response.data.features.map(feature => feature.place_name));
    } catch (error) {
      console.error('Error fetching R&D location suggestions: ', error);
    } finally {
      setLoadingheadquarterSuggestions(false);
    }
  };

  const handleheadquartersuggestionclick = (suggestion) => {
    setFormData({ ...formData, headquarters_location: suggestion });
    setheadquarterSuggestions([]);
  }


  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:4000/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies: ', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      // Submit the form data to the server
      const response = await axios.post('http://localhost:4000/companies', {
        name: formData.get('name'),
        headquarters_location: formData.get('headquarters_location'),
        r_and_d_location: formData.get('r_and_d_location'),
        country: formData.get('country'),
        product: formData.get('product')
      });

      // Display success message
      setSuccessMessage('Company added successfully');
      event.target.reset(); // Reset form after successful submission

      // Fetch coordinates for the R&D location from Mapbox API
      const locationResponse = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.get('r_and_d_location'))}.json?access_token=pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw`);

      // Check if the response is successful
      if (locationResponse.status === 200) {
        // Check if response data and features are available
        if (locationResponse.data && locationResponse.data.features && locationResponse.data.features.length > 0) {
          const coordinates = locationResponse.data.features[0].geometry.coordinates;
          const longitude = coordinates[0];
          const latitude = coordinates[1];

          // Log the coordinates
          console.log('Coordinates:', coordinates);
          console.log('Longitude:', longitude);
          console.log('Latitude:', latitude);

          // Check if longitude and latitude are valid numbers
          if (!isNaN(longitude) && !isNaN(latitude)) {
            // Set the marker coordinates
            setMarkerCoordinates({ longitude, latitude });
            setSelectedRdLocation(formData.get('r_and_d_location')); // Set the selected R&D location

            // Store the marker coordinates in local storage
            localStorage.setItem('markerCoordinates', JSON.stringify({ longitude, latitude }));
          } else {
            console.error('Invalid coordinates: Longitude and latitude must be valid numbers');
            // Handle invalid coordinates
            setMarkerCoordinates(null);
            setSelectedRdLocation(null);
          }
        } else {
          console.error('Invalid API response: No features found');
          // Handle invalid API response
          setMarkerCoordinates(null);
          setSelectedRdLocation(null);
        }
      } else {
        console.error('Error fetching location data: ', locationResponse.statusText);
        // Handle error fetching location data
        setMarkerCoordinates(null);
        setSelectedRdLocation(null);
      }
    } catch (error) {
      console.error('Error adding company: ', error);
      // Handle error adding company
      setMarkerCoordinates(null);
      setSelectedRdLocation(null);
    }
  };


  const navigatehome = () => {
    navigate('/');
  }

  const handleUpdateClick = () => {
    setShowSelect(true);
  };

  const handleSelectChange = async (e) => {
    const selectedName = e.target.value;
    const selectedCompany = companies.find(company => company.name === selectedName);
    setSelectedCompanyId(selectedCompany.id);

    // Fetch the company details from the backend using the company ID
    try {
      const response = await axios.get(`http://localhost:4000/companies/${selectedCompany.id}`);
      const selectedCompanyData = response.data;
      if (selectedCompanyData) {
        // Set the form data with the details of the selected company
        setFormData({
          name: selectedCompanyData.name,
          headquarters_location: selectedCompanyData.headquarters_location,
          r_and_d_location: selectedCompanyData.r_and_d_location,
          country: selectedCompanyData.country,
          product: selectedCompanyData.product,
        });
        setSelectedRdLocation(selectedCompanyData.r_and_d_location); // Set the selected R&D location
      }
    } catch (error) {
      console.error('Error fetching company details: ', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Implement your update logic here, using formData and selectedCompanyId
    try {
      const response = await axios.put(`http://localhost:4000/companies/${selectedCompanyId}`, formData);
      setSuccessMessage('Company updated successfully');
      // Inside handleUpdate function, after successful update
      setSelectedRdLocation(formData.r_and_d_location);

    } catch (error) {
      console.error('Error updating company: ', error);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <img src={phonehand} width={180} height={50} style={{ marginBottom: '20px' }} />

        {showSelect &&
          <div className="input-group">
            <label htmlFor="selectCompany" className="label">Select Company :</label>
            <select name="selectCompany" value={formData.name} onChange={handleSelectChange} className="input">
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.name}>{company.name}</option>
              ))}
            </select>

          </div>
        }
        <div className="input-group">
          <label htmlFor="name" className="label">Name of the company:</label>
          <input type="text" name="name" placeholder="Enter company name" value={formData.name} required onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" />
        </div>
        <div className="input-group">
          <label htmlFor="headquarters_location" className="label">Headquarters Location:</label>
          <input type="text" name="headquarters_location" placeholder="Enter headquarters location" value={formData.headquarters_location} required onChange={(e) => {
            setFormData({ ...formData, headquarters_location: e.target.value });
            fetchheadquarterSuggestions(e.target.value);
          }} className="input" />

          {loadingheadquarterSuggestions && <div>Loading...</div>}
          {headquarterSuggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {headquarterSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleheadquartersuggestionclick(suggestion)}>
                  <span>{suggestion}</span>
                  <span className="geolocation-icon">🌍</span>
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="input-group">
          <label htmlFor="country" className="label">Country:</label>
          <select name="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input" required>
            <option value="">Select Country</option>
            <option value="Afghanistan">Afghanistan</option>
            <option value="Albania">Albania</option>
            <option value="Algeria">Algeria</option>
            <option value="Andorra">Andorra</option>
            <option value="Angola">Angola</option>
            <option value="Antigua and Barbuda">Antigua and Barbuda</option>
            <option value="Argentina">Argentina</option>
            <option value="Armenia">Armenia</option>
            <option value="Australia">Australia</option>
            <option value="Austria">Austria</option>
            <option value="Azerbaijan">Azerbaijan</option>
            <option value="Bahamas">Bahamas</option>
            <option value="Bahrain">Bahrain</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Barbados">Barbados</option>
            <option value="Belarus">Belarus</option>
            <option value="Belgium">Belgium</option>
            <option value="Belize">Belize</option>
            <option value="Benin">Benin</option>
            <option value="Bhutan">Bhutan</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
            <option value="Botswana">Botswana</option>
            <option value="Brazil">Brazil</option>
            <option value="Brunei">Brunei</option>
            <option value="Bulgaria">Bulgaria</option>
            <option value="Burkina Faso">Burkina Faso</option>
            <option value="Burundi">Burundi</option>
            <option value="Cabo Verde">Cabo Verde</option>
            <option value="Cambodia">Cambodia</option>
            <option value="Cameroon">Cameroon</option>
            <option value="Canada">Canada</option>
            <option value="Central African Republic">Central African Republic</option>
            <option value="Chad">Chad</option>
            <option value="Chile">Chile</option>
            <option value="China">China</option>
            <option value="Colombia">Colombia</option>
            <option value="Comoros">Comoros</option>
            <option value="Congo">Congo</option>
            <option value="Costa Rica">Costa Rica</option>
            <option value="Croatia">Croatia</option>
            <option value="Cuba">Cuba</option>
            <option value="Cyprus">Cyprus</option>
            <option value="Czechia">Czechia</option>
            <option value="Denmark">Denmark</option>
            <option value="Djibouti">Djibouti</option>
            <option value="Dominica">Dominica</option>
            <option value="Dominican Republic">Dominican Republic</option>
            <option value="Ecuador">Ecuador</option>
            <option value="Egypt">Egypt</option>
            <option value="El Salvador">El Salvador</option>
            <option value="Equatorial Guinea">Equatorial Guinea</option>
            <option value="Eritrea">Eritrea</option>
            <option value="Estonia">Estonia</option>
            <option value="Eswatini">Eswatini</option>
            <option value="Ethiopia">Ethiopia</option>
            <option value="Fiji">Fiji</option>
            <option value="Finland">Finland</option>
            <option value="France">France</option>
            <option value="Gabon">Gabon</option>
            <option value="Gambia">Gambia</option>
            <option value="Georgia">Georgia</option>
            <option value="Germany">Germany</option>
            <option value="Ghana">Ghana</option>
            <option value="Greece">Greece</option>
            <option value="Grenada">Grenada</option>
            <option value="Guatemala">Guatemala</option>
            <option value="Guinea">Guinea</option>
            <option value="Guinea-Bissau">Guinea-Bissau</option>
            <option value="Guyana">Guyana</option>
            <option value="Haiti">Haiti</option>
            <option value="Honduras">Honduras</option>
            <option value="Hungary">Hungary</option>
            <option value="Iceland">Iceland</option>
            <option value="India">India</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Iran">Iran</option>
            <option value="Iraq">Iraq</option>
            <option value="Ireland">Ireland</option>
            <option value="Israel">Israel</option>
            <option value="Italy">Italy</option>
            <option value="Jamaica">Jamaica</option>
            <option value="Japan">Japan</option>
            <option value="Jordan">Jordan</option>
            <option value="Kazakhstan">Kazakhstan</option>
            <option value="Kenya">Kenya</option>
            <option value="Kiribati">Kiribati</option>
            <option value="Korea, North">Korea, North</option>
            <option value="Korea, South">Korea, South</option>
            <option value="Kosovo">Kosovo</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Kyrgyzstan">Kyrgyzstan</option>
            <option value="Laos">Laos</option>
            <option value="Latvia">Latvia</option>
            <option value="Lebanon">Lebanon</option>
            <option value="Lesotho">Lesotho</option>
            <option value="Liberia">Liberia</option>
            <option value="Libya">Libya</option>
            <option value="Liechtenstein">Liechtenstein</option>
            <option value="Lithuania">Lithuania</option>
            <option value="Luxembourg">Luxembourg</option>
            <option value="Madagascar">Madagascar</option>
            <option value="Malawi">Malawi</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Maldives">Maldives</option>
            <option value="Mali">Mali</option>
            <option value="Malta">Malta</option>
            <option value="Marshall Islands">Marshall Islands</option>
            <option value="Mauritania">Mauritania</option>
            <option value="Mauritius">Mauritius</option>
            <option value="Mexico">Mexico</option>
            <option value="Micronesia">Micronesia</option>
            <option value="Moldova">Moldova</option>
            <option value="Monaco">Monaco</option>
            <option value="Mongolia">Mongolia</option>
            <option value="Montenegro">Montenegro</option>
            <option value="Morocco">Morocco</option>
            <option value="Mozambique">Mozambique</option>
            <option value="Myanmar">Myanmar</option>
            <option value="Namibia">Namibia</option>
            <option value="Nauru">Nauru</option>
            <option value="Nepal">Nepal</option>
            <option value="Netherlands">Netherlands</option>
            <option value="New Zealand">New Zealand</option>
            <option value="Nicaragua">Nicaragua</option>
            <option value="Niger">Niger</option>
            <option value="Nigeria">Nigeria</option>
            <option value="North Macedonia">North Macedonia</option>
            <option value="Norway">Norway</option>
            <option value="Oman">Oman</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Palau">Palau</option>
            <option value="Palestine">Palestine</option>
            <option value="Panama">Panama</option>
            <option value="Papua New Guinea">Papua New Guinea</option>
            <option value="Paraguay">Paraguay</option>
            <option value="Peru">Peru</option>
            <option value="Philippines">Philippines</option>
            <option value="Poland">Poland</option>
            <option value="Portugal">Portugal</option>
            <option value="Qatar">Qatar</option>
            <option value="Romania">Romania</option>
            <option value="Russia">Russia</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
            <option value="Saint Lucia">Saint Lucia</option>
            <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
            <option value="Samoa">Samoa</option>
            <option value="San Marino">San Marino</option>
            <option value="Sao Tome and Principe">Sao Tome and Principe</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="Senegal">Senegal</option>
            <option value="Serbia">Serbia</option>
            <option value="Seychelles">Seychelles</option>
            <option value="Sierra Leone">Sierra Leone</option>
            <option value="Singapore">Singapore</option>
            <option value="Slovakia">Slovakia</option>
            <option value="Slovenia">Slovenia</option>
            <option value="Solomon Islands">Solomon Islands</option>
            <option value="Somalia">Somalia</option>
            <option value="South Africa">South Africa</option>
            <option value="South Sudan">South Sudan</option>
            <option value="Spain">Spain</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Sudan">Sudan</option>
            <option value="Suriname">Suriname</option>
            <option value="Sweden">Sweden</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Syria">Syria</option>
            <option value="Taiwan">Taiwan</option>
            <option value="Tajikistan">Tajikistan</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Thailand">Thailand</option>
            <option value="Timor-Leste">Timor-Leste</option>
            <option value="Togo">Togo</option>
            <option value="Tonga">Tonga</option>
            <option value="Trinidad and Tobago">Trinidad and Tobago</option>
            <option value="Tunisia">Tunisia</option>
            <option value="Turkey">Turkey</option>
            <option value="Turkmenistan">Turkmenistan</option>
            <option value="Tuvalu">Tuvalu</option>
            <option value="Uganda">Uganda</option>
            <option value="Ukraine">Ukraine</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United States">United States</option>
            <option value="Uruguay">Uruguay</option>
            <option value="Uzbekistan">Uzbekistan</option>
            <option value="Vanuatu">Vanuatu</option>
            <option value="Vatican City">Vatican City</option>
            <option value="Venezuela">Venezuela</option>
            <option value="Vietnam">Vietnam</option>
            <option value="Yemen">Yemen</option>
            <option value="Zambia">Zambia</option>
            <option value="Zimbabwe">Zimbabwe</option>
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="product" className="label">Product:</label>
          <input type="text" name="product" placeholder="Enter your product" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} className="input" />
        </div>
        <div className="input-group">
          <label htmlFor="r_and_d_location" className="label">R&D Location:</label>
          <input
            type="text"
            name="r_and_d_location"
            placeholder="Enter R&D location"
            value={formData.r_and_d_location}
            required
            onChange={(e) => {
              setFormData({ ...formData, r_and_d_location: e.target.value });
              fetchRdLocationSuggestions(e.target.value);
            }}
            className="input"
          />
          {loadingRdSuggestions && <div>Loading...</div>}
          {rdLocationSuggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {rdLocationSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handlesuggestionclick(suggestion)}>
                  <span>{suggestion}</span>
                  <span className="geolocation-icon">🌍</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="button-container">
          <button type="submit" className="button">Add</button>
          <div className="button-container">
            <a href="#" onClick={handleUpdateClick} className="link">Click here to update </a>
          </div>
          {selectedCompanyId && <button onClick={handleUpdate} className="button">Update</button>}
          <button onClick={navigatehome} className="button">suivant</button>
        </div>
      </form>
      <Notification message={successMessage} />
    </div>
  );
}

export default Form;