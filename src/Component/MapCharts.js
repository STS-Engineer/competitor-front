import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './MapCharts.css';
import Navbar from '../Components/Navbar';
 
function MapCharts() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
 
    useEffect(() => {
        fetchCompanies();
    }, []);
 
    const fetchCompanies = async () => {
        try {
            const response = await axios.get('http://localhost:4000/companies');
            const fetchedCompanies = response.data;
 
            setCompanies(fetchedCompanies);
        } catch (error) {
            console.error('Error fetching companies: ', error);
        }
    };
 
    const convertToNumber = (value) => {
        const number = parseFloat(value);
        return isNaN(number) ? 0 : number;
    };
 
    const renderChartForProduct = () => {
        const labels = companies.map(company => company.name);
        const productData = companies.map(company => convertToNumber(company.product));
 
        renderChart('product-chart', 'Product Comparison', labels, productData);
    };
 
    const renderChartForRevenues = () => {
        const labels = companies.map(company => company.name);
        const revenuesData = companies.map(company => convertToNumber(company.revenues));
 
        renderChart('revenues-chart', 'Revenues Comparison', labels, revenuesData);
    };
 
    const renderChartForProductionvolumes = () => {
        const labels = companies.map(company => company.name);
        const productionVolumesData = companies.map(company => convertToNumber(company.productionvolumes));
 
        renderChart('productionvolume-chart', 'Production Volume Comparison', labels, productionVolumesData);
    };
 
    const renderChartForNumberOfEmployees = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.employeestrength));
 
        renderChart('employeestrength-chart', 'Number of Employees Comparison', labels, numberOfEmployeesData);
    };
 
    const renderChart = (canvasId, title, labels, data) => {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const existingChart = Chart.getChart(ctx);
 
        if (existingChart) {
            existingChart.destroy();
        }
 
        const backgroundColors = labels.map(label => label === 'AVOCarbon' ? 'rgba(255, 165, 0, 0.6)' : 'rgba(75, 192, 192, 0.2)');
        const borderColors = labels.map(label => label === 'AVOCarbon' ? 'rgba(255, 165, 0, 1)' : 'rgba(75, 192, 192, 1)');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };
 
    useEffect(() => {
        renderChartForRevenues();
        renderChartForProductionvolumes();
        renderChartForNumberOfEmployees();
        renderChartForProduct();
    }, [companies]);
 
    const closeModal = () => {
        setSelectedCompany(null);
    };
 
    return (
        <div className="chart-container">
        <Navbar/>
            <div className="chart">
                <canvas id="revenues-chart" width="400" height="200"></canvas>
            </div>
           
            <div className="chart">
                <canvas id="productionvolume-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="employeestrength-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="product-chart" width="400" height="200"></canvas>
            </div>
            {selectedCompany && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>{selectedCompany.name} Details</h2>
                        <p>Employee Strength: {selectedCompany.employeestrength}</p>
                        <p>Revenues: {selectedCompany.revenues}</p>
                        <p>Production Volumes: {selectedCompany.productionvolumes}</p>
                        <p>Product: {selectedCompany.product}</p>
                        {/* Add more details as needed */}
                    </div>
                </div>
            )}
        </div>
    );
}
 
export default MapCharts;
 