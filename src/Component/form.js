import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
import Notification from './Notification/Notification';
import phonehand from "../assets/logo-avocarbon.png";
import MapComponent from '../Component/mapbox';
import Navbar from '../Components/Navbar';
import { MultiSelect } from 'react-multi-select-component';


function Form() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        headquarters_location: '',
        r_and_d_location: '',
        country: '',
        product: '',
        email: '',
        employeestrength: '',
        revenues: '',
        telephone: '',
        website: '',
        productionvolumes: '',
        keycustomers: '',
        region: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedRdLocation, setSelectedRdLocation] = useState(null); // Selected R&D location
    const [mode, setMode] = useState('');
    const [showAddForm, setShowAddForm] = useState(false); // State to show/hide add form
    const [showEditForm, setShowEditForm] = useState(false); // State to show/hide edit form
    const [showMap, setShowMap] = useState(false);
    const [newCompanyCoordinates, setNewCompanyCoordinates] = useState(null);
    const [newCompanyCoordinatesheadquarter, setNewCompanyCoordinatesheadquarter] = useState(null);
    const [rdLocationSuggestions, setRdLocationSuggestions] = useState([]);
    const [headquarterSuggestions, setheadquarterSuggestions] = useState([]);
    const [loadingRdSuggestions, setLoadingRdSuggestions] = useState(false);
    const [loadingheadquarterSuggestions, setLoadingheadquarterSuggestions] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    


       const options = [
        { label: 'Chokes', value: 'Chokes' },
        { label: 'Seals', value: 'Seals' },
        { label: 'Assembly', value: 'Assembly' },
        { label: 'Injection', value: 'Injection' },
        { label: 'Brush', value: 'Brush' }
    ];

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        // Save selected R&D location to storage whenever it changes
        if (selectedRdLocation) {
            localStorage.setItem('selectedRdLocation', selectedRdLocation);
        }
    }, [selectedRdLocation]);

    const fetchCompanies = async () => {
        try {
            const response = await axios.get('https://avo-competitor-map-backend.azurewebsites.net/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies: ', error);
        }
    };
   const handleProductChange = (selectedProducts) => {
        const formattedProduct = selectedProducts.map(product => product.value).join(', ');
        setFormData({ ...formData, product: formattedProduct });
    };
    
    

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


      const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            let response;
            if (mode === 'add') {
                response = await axios.post('https://avo-competitor-map-backend.azurewebsites.net/companies', formData);
            } else if (mode === 'edit') {
                response = await axios.put(`https://avo-competitor-map-backend.azurewebsites.net/companies/${selectedCompanyId}`, formData);
            }

            const newCompanyData = response.data;
            const { latitude, longitude } = newCompanyData.r_and_d_location;
            const { latitude1, longitude1 } = newCompanyData.headquarters_location;
            setNewCompanyCoordinates({ latitude, longitude });
            setNewCompanyCoordinatesheadquarter({ latitude1, longitude1 });
            setShowMap(true);

            setSuccessMessage(mode === 'add' ? 'Company added successfully' : 'Company updated successfully');
            event.target.reset();
        } catch (error) {
            console.error(`Error ${mode === 'add' ? 'adding' : 'updating'} company: `, error);
        }
    };


    const handleCancelEdit = () => {
        setFormData({
            name: '',
            headquarters_location: '',
            r_and_d_location: '',
            country: '',
            product: '',
            email: '',
            employeestrength: '',
            revenues: '',
            telephone: '',
            website: '',
            productionvolumes: '',
            keycustomers: '',
            region: ''
        });
        setSelectedCompanyId('');
        setMode('add');
    };


    const handleSelectChange = async (e) => {
        const selectedName = e.target.value;
        const selectedCompany = companies.find(company => company.name === selectedName);
        setSelectedCompanyId(selectedCompany.id);

        // Fetch the company details from the backend using the company ID
        try {
            const response = await axios.get(`https://avo-competitor-map-backend.azurewebsites.net/companies/${selectedCompany.id}`);
            const selectedCompanyData = response.data;
            if (selectedCompanyData) {
                // Set the form data with the details of the selected company
                setFormData({
                    name: selectedCompanyData.name,
                    headquarters_location: selectedCompanyData.headquarters_location,
                    r_and_d_location: selectedCompanyData.r_and_d_location,
                    country: selectedCompanyData.country,
                    product: selectedCompanyData.product,
                    email: selectedCompanyData.email,
                    employeestrength: selectedCompanyData.employeestrength,
                    revenues: selectedCompanyData.revenues,
                    telephone: selectedCompanyData.telephone,
                    website: selectedCompanyData.website,
                    productionvolumes: selectedCompanyData.productionvolumes,
                    keycustomers: selectedCompanyData.keycustomers,
                    region: selectedCompanyData.region
                });
                setSelectedRdLocation(selectedCompanyData.r_and_d_location); // Set the selected R&D location
            }
        } catch (error) {
            console.error('Error fetching company details: ', error);
        }
    };


    const handleAddForm = () => {
        setShowAddForm(true);
        setShowEditForm(false);
        setMode('add');
    };

    const handleEditForm = () => {
        setShowAddForm(false);
        setShowEditForm(true);
        setMode('edit');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        // Implement your update logic here, using formData and selectedCompanyId
        try {
            const response = await axios.put(`https://avo-competitor-map-backend.azurewebsites.net/companies/${selectedCompanyId}`, formData);
            setSuccessMessage('Company updated successfully');
            // Inside handleUpdate function, after successful update
            setSelectedRdLocation(formData.r_and_d_location);

        } catch (error) {
            console.error('Error updating company: ', error);
        }
    };


    return (

       
        <div className="container">
      
        <div style={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
                <Navbar />
         </div>
            {!showAddForm && !showEditForm && (
                <form className="form">
                    {/* Initial form content */}
                    <img src={phonehand} width={180} height={50} style={{ marginBottom: '20px' }} />
                    <div className="button-container">
                        <button onClick={handleAddForm} className="button">Add a competitor</button>
                        <button onClick={handleEditForm} className="button">Update competitor details</button>
                    </div>
                </form>
            )}
                   

         {showAddForm && (
        <form onSubmit={handleSubmit} className="form">
        <img src={phonehand} width={180} height={50} style={{ marginBottom: '20px' }} />
        <div className="input-group">
             <label htmlFor="name" className="label">Company Name:</label>
             <input type="text" name="name" placeholder="Enter company name" value={formData.name} required onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" />
                    </div>

        <div className="input-row">
            <div className="input-group">
                <label htmlFor="email" className="label">E-mail</label>
                <input type="text" name="email" placeholder="Enter company email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="telephone" className="label">Phone number</label>
                <input type="text" name="telephone" placeholder="Enter company Telephone" value={formData.telephone} required onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="input" />
            </div>
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="website" className="label">Website</label>
                <input type="text" name="website" placeholder="Enter company website" value={formData.website} required onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" />
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
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="region" className="label">Region</label>
                <select name="region" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="input" required>
                    <option value="">Select Region</option>
                    <option value="nafta ">Nafta </option>
                    <option value="mercosur">Mercosur</option>
                    <option value="europe">Europe</option>
                    <option value="easternEurope">Eastern Europe</option>
                    <option value="africa">Africa</option>
                    <option value="southAsia">South Asia</option>
                    <option value="eastAsia">East Asia</option>
                </select>
            </div>
            <div className="input-group">
                <label htmlFor="headquarters_location" className="label">HeadquartersLocation</label>
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
         
            
        </div>      
        <div className="input-row">
            <div className="input-group">
                <label htmlFor="r_and_d_location" className="label">R&D location:</label>
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
            <div className="input-group">
           <label htmlFor="product" className="label">Product</label>
             <MultiSelect
                options={options}
                value={formData.product ? formData.product.split(', ').map(product => ({ label: product, value: product })) : []}
                onChange={handleProductChange}
                labelledBy="Select Products"
            />
</div>

        </div>

        
        <div className="input-row">
        <div className="input-group">
                <label htmlFor="revenues" className="label">Currency(USD Million)</label>
                <input type="text" name="revenues" placeholder="Enter company Revenues" value={formData.revenues} required onChange={(e) => setFormData({ ...formData, revenues: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="employeestrength" className="label">Employees number</label>
                <input type="text" name="employeestrength" placeholder="Enter company employeestrength" value={formData.employeestrength} required onChange={(e) => setFormData({ ...formData, employeestrength: e.target.value })} className="input" />
            </div>
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="productionvolumes" className="label">Production volumes:</label>
                <input type="text" name="productionvolumes" placeholder="Enter company Productionvolumes" value={formData.productionvolumes} required onChange={(e) => setFormData({ ...formData, productionvolumes: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="keycustomers" className="label">Key customers</label>
                <input type="text" name="keycustomers" placeholder="Enter company Keycustomers" value={formData.keycustomers} required onChange={(e) => setFormData({ ...formData, keycustomers: e.target.value })} className="input" />
            </div>
            </div>
       

        <div className="button-container">
            {mode === 'add' ? (
                <button type="submit" className="button">Add</button>
            ) : (
                <>
                    <button type="submit" className="button">Update</button>
                    <button type="button" onClick={handleCancelEdit} className="button">Cancel</button>
                </>
            )}
        </div>
    </form>
)}


            {/* Edit Form */}
            {showEditForm && (
                <form  className="form">
                    <img src={phonehand} width={180} height={50} style={{ marginBottom: '20px' }} />
                    <div className="input-group">
                        <label htmlFor="selectCompany" className="label">Select Company</label>
                        <select name="selectCompany" value={formData.name} onChange={handleSelectChange} className="input">
                            <option value="">Select Company</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.name}>{company.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
             <label htmlFor="name" className="label">Company Name</label>
             <input type="text" name="name" placeholder="Enter company name" value={formData.name} required onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" />
                    </div>

        <div className="input-row">
            <div className="input-group">
                <label htmlFor="email" className="label">E-mail</label>
                <input type="text" name="email" placeholder="Enter company email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="telephone" className="label">Phone number</label>
                <input type="text" name="telephone" placeholder="Enter company Telephone" value={formData.telephone} required onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="input" />
            </div>
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="website" className="label">Website</label>
                <input type="text" name="website" placeholder="Enter company website" value={formData.website} required onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" />
            </div>

            <div className="input-group">
                        <label htmlFor="country" className="label">Country</label>
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
        </div>

        <div className="input-row">

        <div className="input-group">
                <label htmlFor="region" className="label">Region</label>
                <select name="region" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="input" required>
                    <option value="">Select Region</option>
                    <option value="nafta ">Nafta </option>
                    <option value="mercosur">Mercosur</option>
                    <option value="europe">Europe</option>
                    <option value="easternEurope">Eastern Europe</option>
                    <option value="africa">Africa</option>
                    <option value="southAsia">South Asia</option>
                    <option value="eastAsia">East Asia</option>
                </select>
            </div>
            <div className="input-group">
                <label htmlFor="headquarters_location" className="label">HeadquartersLocation</label>
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
         
            
        </div>      
        <div className="input-row">
            <div className="input-group">
                <label htmlFor="r_and_d_location" className="label">R&D location</label>
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
            <div className="input-group">
    <label htmlFor="product" className="label">Product</label>
    <MultiSelect
             options={options}
             value={options.filter(option => formData.product.includes(option.value))} // Map product values to options
             onChange={handleProductChange}
             labelledBy={"Select Products"}
             className="input"
             hasSelectAll={false}
                />
</div>



            </div>

        
        <div className="input-row">
        <div className="input-group">
                <label htmlFor="revenues" className="label">Currency USD(Million)</label>
                <input type="text" name="revenues" placeholder="Enter company Revenues" value={formData.revenues} required onChange={(e) => setFormData({ ...formData, revenues: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="employeestrength" className="label">Employees number</label>
                <input type="text" name="employeestrength" placeholder="Enter company employeestrength" value={formData.employeestrength} required onChange={(e) => setFormData({ ...formData, employeestrength: e.target.value })} className="input" />
            </div>
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="productionvolumes" className="label">Production volumes:</label>
                <input type="text" name="productionvolumes" placeholder="Enter company Productionvolumes" value={formData.productionvolumes} required onChange={(e) => setFormData({ ...formData, productionvolumes: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="keycustomers" className="label">Key customers</label>
                <input type="text" name="keycustomers" placeholder="Enter company Keycustomers" value={formData.keycustomers} required onChange={(e) => setFormData({ ...formData, keycustomers: e.target.value })} className="input" />
            </div>
            </div>
       

        <div className="button-container">
            {mode === 'add' ? (
                <button type="submit" className="button">Add</button>
            ) : (
                <>
                     {selectedCompanyId && <button onClick={handleUpdate} className="button">Update</button>}
                    <button type="button" onClick={handleCancelEdit} className="button">Cancel</button>
                </>
            )}
        </div>
                </form>
            )}
            {/* Map Component */}
            {showMap && (
                <div style={{ position: 'absolute', top: '60px', right: '0', width: '20%', height: '80%' }}>
                    <MapComponent coordinates={newCompanyCoordinates} coordinateslocations={newCompanyCoordinatesheadquarter} />
                </div>
            )}
            <Notification message={successMessage} />

        </div>
    );
}

export default Form;
