# Georgia Water Safety Dashboard

A React application that allows users to search for and view information about drinking water systems in Georgia, including water quality scores, violations, and safety information.

## Features

- Search water systems by ZIP code, county, or system name
- View water quality trust scores and safety ratings
- Detailed violation information with health effects and recommendations
- Alert signup functionality for water quality notifications
- Responsive design with modern UI

## How to Run

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the project directory:
   ```bash
   cd water-safety-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:3000`

The application will automatically reload when you make changes to the code.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Sample Data

The application currently uses sample data for demonstration purposes. You can search for:
- ZIP codes: 30301, 30318, 31513
- Counties: Fulton, Appling
- System names: Atlanta, Baxley, Riverside

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- Lucide React (for icons)
- Create React App

## Project Structure

```
src/
├── App.tsx          # Main application component
├── index.tsx        # Application entry point
├── index.css        # Global styles with Tailwind
└── ...
```

## Future Enhancements

- Connect to real SDWIS (Safe Drinking Water Information System) API
- Add more detailed violation tracking
- Implement real-time alerts
- Add historical data visualization
- Include water quality testing results
