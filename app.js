require('dotenv').config();
const express = require('express');
const axios = require('axios');
const supabase = require('./models/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Supabase connection
supabase.auth
  .getSession()
  .then(() => {
    console.log('✓ Supabase connected successfully');
  })
  .catch(err => {
    console.error('✗ Supabase connection warning:', err.message);
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
    const response = await axios.get(`http://ip-api.com/json`, {
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

    // Save or update location data in Supabase database
    try {
      // Check if record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('locations')
        .select('*')
        .eq('info', info)
        .single();

      let location;
      let created = false;

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows found - that's expected for a new record
        throw fetchError;
      }

      if (!existingRecord) {
        // Insert new record
        const { data, error } = await supabase
          .from('locations')
          .insert([
            {
              info,
              description: apiData,
            }
          ])
          .select()
          .single();

        if (error) throw error;
        location = data;
        created = true;
      } else {
        // Update existing record
        const { data, error } = await supabase
          .from('locations')
          .update({
            description: apiData,
            updated_at: new Date().toISOString(),
          })
          .eq('info', info)
          .select()
          .single();

        if (error) throw error;
        location = data;
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

// Export app for Vercel serverless functions
module.exports = app;

// Start server only when running locally
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
