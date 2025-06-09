class Analytics {
    constructor() {
        this.initializeCharts();
        this.loadAnalyticsData();
        this.loadInsights();
    }

    initializeCharts() {
        // Income vs Expenses Chart
        this.incomeExpensesChart = new Chart(
            document.getElementById('incomeExpensesChart'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Income',
                            data: [],
                            borderColor: '#43A047',
                            backgroundColor: 'rgba(67, 160, 71, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Expenses',
                            data: [],
                            borderColor: '#E53935',
                            backgroundColor: 'rgba(229, 57, 53, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            }
        );

        // Category Chart
        this.categoryChart = new Chart(
            document.getElementById('categoryChart'),
            {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#4B39EF',
                            '#43A047',
                            '#E53935',
                            '#FFA000',
                            '#039BE5'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            }
        );

        // Savings Chart
        this.savingsChart = new Chart(
            document.getElementById('savingsChart'),
            {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Savings',
                        data: [],
                        borderColor: '#4B39EF',
                        backgroundColor: 'rgba(75, 57, 239, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            }
        );

        // Budget Chart
        this.budgetChart = new Chart(
            document.getElementById('budgetChart'),
            {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Budget',
                        data: [],
                        backgroundColor: '#4B39EF'
                    }, {
                        label: 'Spent',
                        data: [],
                        backgroundColor: '#E53935'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            }
        );
    }

    async loadAnalyticsData() {
        try {
            const response = await fetch('/api/analytics');
            const data = await response.json();
            
            this.updateCharts(data);
        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.showToast('Failed to load analytics data', 'error');
        }
    }

    updateCharts(data) {
        // Update Income vs Expenses Chart
        this.incomeExpensesChart.data.labels = data.incomeExpenses.labels;
        this.incomeExpensesChart.data.datasets[0].data = data.incomeExpenses.income;
        this.incomeExpensesChart.data.datasets[1].data = data.incomeExpenses.expenses;
        this.incomeExpensesChart.update();

        // Update Category Chart
        this.categoryChart.data.labels = data.categories.labels;
        this.categoryChart.data.datasets[0].data = data.categories.values;
        this.categoryChart.update();

        // Update Savings Chart
        this.savingsChart.data.labels = data.savings.labels;
        this.savingsChart.data.datasets[0].data = data.savings.values;
        this.savingsChart.update();

        // Update Budget Chart
        this.budgetChart.data.labels = data.budget.labels;
        this.budgetChart.data.datasets[0].data = data.budget.planned;
        this.budgetChart.data.datasets[1].data = data.budget.actual;
        this.budgetChart.update();
    }

    async loadInsights() {
        try {
            const response = await fetch('/api/analytics/insights');
            const insights = await response.json();
            
            this.renderInsights(insights);
        } catch (error) {
            console.error('Error loading insights:', error);
            this.showToast('Failed to load insights', 'error');
        }
    }

    renderInsights(insights) {
        const insightsContainer = document.getElementById('financialInsights');
        insightsContainer.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <div class="insight-header">
                    <div class="insight-icon">
                        <span class="material-icons">${this.getInsightIcon(insight.type)}</span>
                    </div>
                    <div class="insight-title">${insight.title}</div>
                </div>
                <div class="insight-content">${insight.content}</div>
            </div>
        `).join('');
    }

    getInsightIcon(type) {
        const icons = {
            'spending': 'trending_down',
            'savings': 'savings',
            'budget': 'account_balance_wallet',
            'goal': 'flag'
        };
        return icons[type] || 'insights';
    }

    async generateReport() {
        const reportType = document.getElementById('reportType').value;
        try {
            const response = await fetch(`/api/reports/${reportType}`);
            const report = await response.json();
            
            this.renderReport(report);
        } catch (error) {
            console.error('Error generating report:', error);
            this.showToast('Failed to generate report', 'error');
        }
    }

    renderReport(report) {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = `
            <div class="report-header">
                <h3>${report.title}</h3>
                <p>${report.date}</p>
            </div>
            <div class="report-body">
                ${report.content}
            </div>
        `;
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions
function setDateRange(range) {
    const buttons = document.querySelectorAll('.date-range .btn-outline');
    buttons.forEach(button => button.classList.remove('active'));
    event.target.classList.add('active');
    
    // Reload data with new date range
    analytics.loadAnalyticsData();
}

function exportReport() {
    const reportType = document.getElementById('reportType').value;
    window.location.href = `/api/reports/${reportType}/export`;
}

function downloadReport() {
    const reportType = document.getElementById('reportType').value;
    window.location.href = `/api/reports/${reportType}/download`;
}

// Initialize analytics
let analytics;
document.addEventListener('DOMContentLoaded', () => {
    analytics = new Analytics();
}); 