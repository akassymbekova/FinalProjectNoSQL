# Advanced Databases NoSQL Final Project

# Home Appliances Supplier - Backend Application 

## Description
This project is a backend application designed for a Home Appliances Supplier using Node.js, MongoDB, and Express.js. The system offers APIs for managing home appliance products, handling user authentication, and processing orders. It aims to provide a scalable and efficient platform for small-to-medium appliance suppliers to manage their inventory and order flow seamlessly.

# Core features

The application supports the following core features:

- Product Management: Enables adding, updating, deleting, and viewing products in the inventory.
- User Authentication: Secure login and registration system for both customers and administrators, using JWT for token-based authentication.
- Order Processing: Allows users to place, view, and update orders, while administrators can manage orders and track their status.
- Web Scraping: Integrates external data collection to automatically update product information, keeping the database current without manual input.
- Security & Query Optimization: Ensures secure data handling with role-based access control (RBAC) and optimizes database queries for better performance.

## Team Members

Akerke - Integarted the hardware features of application and README.md
Ainur - Integrated main backend servers and presentation


## APIs Used
- **OpenWeatherAPI**: Provides real-time weather data including temperature, humidity, wind speed, weather description, rain volume (last 3 hours), and more. This data is displayed on the frontend for users to check the weather conditions of any given city.
- **Map API (e.g., Google Maps API)**: Displays the location of cities based on their latitude and longitude. This API is used to visually showcase the location of a city on a map, enhancing the user's understanding of the weather conditions by showing the exact geographic location.


## Setup Instructions

### Prerequisites
Ensure that Node.js and npm are installed. You can download them from [here](https://nodejs.org/).

Additionally, make sure you have the following dependencies installed:
- **Express.js**: A web framework for Node.js.
- **Axios**: A promise-based HTTP client for making API requests.
- **dotenv**: A module to load environment variables from a `.env` file.
- **Bootstrap**: A CSS framework for responsive design

These dependencies will be installed automatically by running the `npm install` command, as they are listed in the `package.json` file.

## Download the libraries
## Run following command in the terminal:
npm install express body-parser axios dotenv chalk mongoose express-session bcrypt uuid

### Steps:
1. **Clone the repository**:
   Open your terminal and run the following command to clone the repository:
   ```bash
   git clone <repository-url>
   cd weather-app

2. **Install dependencies: Install all required dependencies by running:**
    npm install
3. **Start the server**
    npm start

1. **OpenWeather API Integration**:

Endpoint
https://api.openweathermap.org/data/2.5/weather

Required parameters:
q: City name
appid: Your OpenWeather API key
units: Unit of measurement (e.g., metric for Celsius)
lang: Language for weather description (e.g., en for English)
How It Works
The application fetches real-time weather data for a predefined city using the OpenWeather API.
The data includes weather details such as temperature, humidity, pressure, and wind speed.
The data is then passed to the frontend to be displayed to the user.

2. **Map API Integration (e.g., Google Maps API)**

Endpoint
https://maps.googleapis.com/maps/api/geocode/json

Required parameters:
address: The city or location name
key: Your Google Maps API key
How It Works
The application uses the latitude and longitude obtained from the weather data to display the location of the city on a map.
This helps users visualize the geographic location and context of the weather data.

