import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompanyForm = () => {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    headquarters_location: '',
    r_and_d_location: '',
    country: '',
    product: '',
    email: '',
    phone_number: '',
    revenues: '',
    website: ''
  });

  useEffect(() => {
    // Fetch all companies when component mounts
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:4000/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (!formData.name) {
        alert('Company name is required');
        return;
      }
      const response = await axios.post('http://localhost:4000/companies', formData);
      setCompanies([...companies, response.data]);
      setFormData({
        name: '',
        headquarters_location: '',
        r_and_d_location: '',
        country: '',
        product: '',
        email: '',
        phone_number: '',
        revenues: '',
        website: ''
      });
    } catch (error) {
      console.error('Error adding company:', error);
    }
  };

  return (
    <div>
      <h1>Add Company</h1>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
        <label>Headquarters Location:</label>
        <input type="text" name="headquarters_location" value={formData.headquarters_location} onChange={handleChange} />
        <label>R&D Location:</label>
        <input type="text" name="r_and_d_location" value={formData.r_and_d_location} onChange={handleChange} />
        <label>Country:</label>
        <input type="text" name="country" value={formData.country} onChange={handleChange} />
        <label>Product:</label>
        <input type="text" name="product" value={formData.product} onChange={handleChange} />
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
        <label>Phone Number:</label>
        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
        <label>Revenues:</label>
        <input type="text" name="revenues" value={formData.revenues} onChange={handleChange} />
        <label>Website:</label>
        <input type="text" name="website" value={formData.website} onChange={handleChange} />
        <button type="submit">Add Company</button>
      </form>
      <h1>Companies</h1>
      <ul>
        {companies.map(company => (
          <li key={company.id}>{company.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyForm;
