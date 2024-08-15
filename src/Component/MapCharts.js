import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './MapCharts.css';
import Navbar from '../Components/Navbar';
import ChartDataLabels from 'chartjs-plugin-datalabels';
 
function MapCharts() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
 
    useEffect(() => {
        fetchCompanies();
    }, []);
 
    const fetchCompanies = async () => {
        try {
            const response = await axios.get('https://avo-competitor-map-backend.azurewebsites.net/companies');
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

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: labels.map(label => label === 'AVOCarbon' ? 'rgba(255, 165, 0, 0.6)' : 'rgba(75, 192, 192, 0.2)'),
                    borderColor: labels.map(label => label === 'AVOCarbon' ? 'rgba(255, 165, 0, 1)' : 'rgba(75, 192, 192, 1)'),
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    datalabels: {
                        color: '#000',
                        anchor: 'end',
                        align: 'bottom',
                        formatter: (value) => value.toFixed(2),
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        padding: 4,
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toFixed(2) // Format y-axis labels
                        }
                    }
                }
            },
            plugins: [ChartDataLabels] // Ensure the plugin is included here
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
 
