require('dotenv').config();
const express = require('express');
const axios = require('axios');
const sequelize = require('./models/index');
const Location = require('./models/Location');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database initialization
sequelize.authenticate()
  .then(() => {
    console.log('✓ Database connected successfully');
  })
  .catch(err => {
    console.error('✗ Database connection error:', err);
  });

// Sync database (creates table if it doesn't exist)
sequelize.sync()
  .catch(err => {
    console.error('✗ Database sync error:', err);
  });

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Express App!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Route to fetch location data from ip-api.com and store in database
app.get('/api/locate/:info', async (req, res) => {
  const { info } = req.params;

  try {
    // Fetch data from ip-api.com
    const response = await axios.get(`https://ip-api.com/json/${info}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,isp,org,as,asname,mobile,proxy,hosting,query`);

    const apiData = response.data;

    if (apiData.status === 'fail') {
      return res.status(400).json({
        error: 'Failed to fetch location data',
        message: apiData.message,
      });
    }

    // Save or update location data in database
    const [location, created] = await Location.findOrCreate({
      where: { info },
      defaults: {
        info,
        description: apiData,
      },
      // Update if record exists
      raw: false,
    });

    if (!created) {
      // Update existing record
      location.description = apiData;
      await location.save();
    }

    res.json({
      success: true,
      message: created ? 'Location data saved' : 'Location data updated',
      data: apiData,
      record: location,
    });
  } catch (error) {
    console.error('Error in /api/locate/:info route:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
