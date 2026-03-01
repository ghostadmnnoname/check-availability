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
    console.log(`[${new Date().toISOString()}] Fetching location data for: ${info}`);

    // Fetch data from ip-api.com with proper headers (use HTTP for free tier)
    const response = await axios.get(`http://ip-api.com/json/${info}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000
    });

    const apiData = response.data;
    console.log(`[${new Date().toISOString()}] API Response status:`, apiData.status);

    if (apiData.status === 'fail') {
      return res.status(400).json({
        error: 'Failed to fetch location data',
        message: apiData.message,
      });
    }

    // Save or update location data in database (if database is available)
    try {
      const [location, created] = await Location.findOrCreate({
        where: { info },
        defaults: {
          info,
          description: apiData,
        },
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
    } catch (dbError) {
      // If database fails, still return the API data
      console.warn('Database error (returning API data anyway):', dbError.message);
      res.json({
        success: true,
        message: 'Location data retrieved (database unavailable)',
        data: apiData,
      });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in /api/locate/:info route:`, error.message, error.response?.status);
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
