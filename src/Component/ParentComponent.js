// ParentComponent.js
import React, { useState } from 'react';
import Form from './form';
import Map from './map';


const ParentComponent = () => {
    const [selectedRdLocation, setSelectedRdLocation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        headquarters_location: '',
        r_and_d_location: '',
        country: '',
        product: '',
    });

    const handleFormSubmit = (data) => {
        // Update selectedRdLocation and formData
        setSelectedRdLocation(data.r_and_d_location);
        setFormData(data);
    };

    return (
        <div>
            <Form onSubmit={handleFormSubmit} />
            <Map selectedRdLocation={selectedRdLocation} formData={formData} />
        </div>
    );
};

export default ParentComponent;
