# 🚰 Water Safety Dashboard - Georgia Drinking Water Quality Platform

A comprehensive web platform for monitoring and managing Georgia's public drinking water systems, built for the Codegen Speed Trials 2025 challenge. This project transforms complex EPA SDWIS data into actionable insights for the public, water system operators, and regulators.

## 🌟 Project Overview

This platform addresses America's top environmental concern - drinking water pollution - by making Georgia's water quality data accessible and actionable. The system provides three distinct interfaces:

- **Public Dashboard**: For residents to check their water quality and understand violations
- **Operator Dashboard**: For water system operators to manage compliance and generate reports
- **Data Analysis Tools**: Python scripts for processing and analyzing SDWIS data

## 🏗️ Architecture

The project consists of multiple components:

```
speedtrials-2025/
├── water-safety-dashboard/     # Public-facing dashboard (React + Tailwind)
├── operator-dashboard/         # Operator management interface (React + TypeScript)
├── data/                      # Raw SDWIS data files (10 CSV files)
├── analyse.py                 # Data analysis and processing scripts
├── extract_dashboard_data.py  # Data extraction utilities
└── get-public-data.py         # Data fetching utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd speedtrials-2025
   ```

2. **Install dependencies for both dashboards**
   ```bash
   # Install public dashboard dependencies
   cd water-safety-dashboard
   npm install
   
   # Install operator dashboard dependencies
   cd ../operator-dashboard
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp env.example .env
   cp water-safety-dashboard/env.example water-safety-dashboard/.env
   ```

4. **Process the data**
   ```bash
   # Run data analysis to generate processed datasets
   python analyse.py
   python extract_dashboard_data.py
   ```

### Running the Applications

#### Public Dashboard
```bash
cd water-safety-dashboard
npm start
```
Access at: http://localhost:3000

#### Operator Dashboard
```bash
cd operator-dashboard
npm start
```
Access at: http://localhost:3001

## 📊 Data Sources

The platform uses Georgia's Safe Drinking Water Information System (SDWIS) data, including:

- **Public Water Systems** (`SDWA_PUB_WATER_SYSTEMS.csv`): System information, contact details, population served
- **Violations & Enforcement** (`SDWA_VIOLATIONS_ENFORCEMENT.csv`): Compliance violations and enforcement actions
- **Lead & Copper Samples** (`SDWA_LCR_SAMPLES.csv`): Lead and copper testing results
- **Site Visits** (`SDWA_SITE_VISITS.csv`): Regulatory inspection records
- **Facilities** (`SDWA_FACILITIES.csv`): Water treatment and distribution facilities
- **Geographic Areas** (`SDWA_GEOGRAPHIC_AREAS.csv`): Service area boundaries
- **Events & Milestones** (`SDWA_EVENTS_MILESTONES.csv`): Compliance milestones and deadlines

## 🎯 Key Features

### Public Dashboard
- **Search by ZIP code, county, or system name**
- **Trust Score System**: Color-coded water quality ratings
- **Violation Tracking**: Real-time violation status and health implications
- **Contaminant Guide**: Educational information about water contaminants
- **Email Alerts**: Sign up for water quality notifications
- **Mobile-responsive design**

### Operator Dashboard
- **System Overview**: Key metrics and compliance status
- **Task Management**: Automated task generation from violations
- **Letter Generator**: Automated public notice generation
- **Data Export**: CSV and PDF report generation
- **Compliance Tracking**: Violation history and resolution status
- **Analytics**: Charts and visualizations of system performance

### Data Processing
- **Automated Analysis**: Python scripts for data processing
- **Violation Scoring**: Algorithm for calculating trust scores
- **Data Validation**: Quality checks and error handling
- **Export Utilities**: Generate processed datasets for dashboards

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **PDF-lib** for document generation

### Backend
- **Express.js** for API endpoints
- **SendGrid** for email notifications
- **CORS** for cross-origin requests

### Data Processing
- **Pandas** for data manipulation
- **NumPy** for numerical operations
- **Python** for analysis scripts

## 📈 Data Analysis

The platform includes comprehensive data analysis capabilities:

```python
# Run the main analysis script
python analyse.py

# This will generate:
# - System type breakdowns
# - Violation analysis
# - Population served statistics
# - Compliance trends
# - Geographic distribution
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in both dashboard directories:

```env
# Email configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sender@domain.com

# Server configuration
PORT=3000
NODE_ENV=development
```

### Data Processing Configuration

Modify `extract_dashboard_data.py` to customize:
- Trust score calculation algorithms
- Violation severity weighting
- Geographic data processing
- Export formats

## 🚀 Deployment

### Local Development
```bash
# Start both dashboards
cd water-safety-dashboard && npm start &
cd operator-dashboard && npm start &
```

### Production Deployment
```bash
# Build for production
cd water-safety-dashboard && npm run build
cd operator-dashboard && npm run build

# Serve with Express server
node server.js
```

## 📋 API Endpoints

### Public Dashboard API
- `GET /api/water-systems` - List all water systems
- `GET /api/search?q={query}&type={zip|county|name}` - Search water systems
- `POST /api/alerts` - Subscribe to email alerts

### Operator Dashboard API
- `GET /api/dashboard-data` - Get operator dashboard data
- `POST /api/generate-letter` - Generate compliance letters
- `GET /api/export-csv` - Export system data as CSV

## 🧪 Testing

```bash
# Run tests for both dashboards
cd water-safety-dashboard && npm test
cd operator-dashboard && npm test

# Run data analysis tests
python -m pytest tests/
```

## 📊 Performance Metrics

The platform processes:
- **2,000+** public water systems
- **50,000+** violation records
- **100,000+** lead and copper samples
- **Real-time** trust score calculations
- **Automated** task generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is developed for the Codegen Speed Trials 2025 challenge. See the original challenge documentation for licensing details.

## 🙏 Acknowledgments

- **Georgia Environmental Protection Division** for providing the SDWIS data
- **EPA** for maintaining the Safe Drinking Water Information System
- **Codegen Speed Trials** for the challenge opportunity
- **React and Tailwind CSS** communities for excellent documentation

## 📞 Support

For questions or issues:
- Check the [data documentation](data/README.md) for detailed field descriptions
- Review the [challenge requirements](README_LETTERS.md) for submission guidelines
- Open an issue in the repository for technical problems

---

**Built with ❤️ for better water quality transparency in Georgia**
