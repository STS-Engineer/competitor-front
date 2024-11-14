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

    const renderChartPerFoundingYear = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.foundingyear));

        renderChart('foundingYear-chart', 'Founding Year', labels, numberOfEmployeesData);
    };

    const renderChartForBuisnessStrategic = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.businessstrategies));

        renderChart('Businessstrategies-chart', 'Buisness Strategy Comparison', labels, numberOfEmployeesData);
    };
    const renderChartForpricingstrategy = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.pricingstrategy));

        renderChart('pricingstrategy-chart', 'Pricing strategy Comparison', labels, numberOfEmployeesData);
    };

    const renderChartForCustomerneeds = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.customereeds));

        renderChart('customerneeds-chart', 'Customer Needs Comparison', labels, numberOfEmployeesData);
    };
    const renderChartForRevenue = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.revenue));

        renderChart('revenue-chart', 'Revenues Comparison', labels, numberOfEmployeesData);
    };
    const renderChartForEbit = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.ebit));

        renderChart('ebit-chart', 'Ebit Comparison', labels, numberOfEmployeesData);
    };

    const renderChartForCashFlowsituation = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.cashflowsituation));

        renderChart('cashFlowSituation-chart', 'Cash Flow Situation Comparison', labels, numberOfEmployeesData);
    };


   
    const renderChartForRoce = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.roceandequityratio));

        renderChart('roceandequityRatio-chart', 'RoCe and Equity ratio', labels, numberOfEmployeesData);
    };

    const renderChartForRate = () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.rate));

        renderChart('rate-chart', 'Growth rate Comparison', labels, numberOfEmployeesData);
    };

    const renderChartForCompettiiveAdvantages= () => {
        const labels = companies.map(company => company.name);
        const numberOfEmployeesData = companies.map(company => convertToNumber(company.keycustomers));

        renderChart('keycustomers-chart', 'keycustomers Comparison', labels, numberOfEmployeesData);
    };


    const renderChart = (canvasId, title, labels, data) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id ${canvasId} not found`);
            return;
        }
    
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }
    
        // Destroy existing chart instance if it exists
        const existingChart = Chart.getChart(canvasId);
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
                animation: {
                    onComplete: function() {
                        const chartInstance = this;
                        const ctx = chartInstance.ctx;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.font = 'bold 12px Arial';
                        ctx.fillStyle = '#000';
    
                        chartInstance.data.datasets.forEach((dataset, i) => {
                            const meta = chartInstance.getDatasetMeta(i);
                            meta.data.forEach((bar, index) => {
                                const value = dataset.data[index];
                                const barX = bar.x;
                                const barY = bar.y;
    
                                // Draw text above the bar
                                ctx.fillText(value.toFixed(2), barX, barY + 70); // Adjust vertical positioning
                            });
                        });
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toFixed(2)
                        }
                    }
                }
            }
        });
    };
    
    
    
    
    useEffect(() => {
        renderChartForRevenues();
        renderChartForProductionvolumes();
        renderChartForProduct();
        renderChartPerFoundingYear();
        renderChartForBuisnessStrategic();
        renderChartForpricingstrategy();
        renderChartForCustomerneeds();
        renderChartForRevenue();
        renderChartForEbit();
        renderChartForCashFlowsituation();
        renderChartForRate();
        renderChartForRoce();
        renderChartForCompettiiveAdvantages();
    }, [companies]);

    const closeModal = () => {
        setSelectedCompany(null);
    };

    return (
        <div className="chart-container">
            <Navbar/>
            <div className="chart">
                <canvas id="revenue-chart" width="400" height="200"></canvas>
            </div>

            <div className="chart">
                <canvas id="ebit-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="cashFlowSituation-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="roceandequityRatio-chart" width="400" height="200"></canvas>
            </div>
            
            <div className="chart">
                <canvas id="productionvolume-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="pricingstrategy-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="foundingYear-chart" width="400" height="200"></canvas>
            </div>
            
            <div className="chart">
                <canvas id="rate-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="rate-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="rate-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="rate-chart" width="400" height="200"></canvas>
            </div>
            <div className="chart">
                <canvas id="rate-chart" width="400" height="200"></canvas>
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
