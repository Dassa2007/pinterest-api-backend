const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "Vercel Fast API is running!" });
});

app.get('/download', async (req, res) => {
  const pinUrl = req.query.url;
  if (!pinUrl) {
    return res.status(400).json({ success: false, error: "Please provide a Pinterest URL" });
  }

  try {
    // Cobalt API එක ඉතා වේගවත් (Fast) නිසා Vercel එකේ තත්පර 10ක ටයිම්අවුට් සීමාවට අසු නොවී ක්ෂණිකව වැඩ කරයි
    const response = await axios.post('https://api.cobalt.tools/api/json', {
      url: pinUrl
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 8000 // Vercel සීමාවට වඩා අඩු කාලයක් ඇතුළත ප්‍රතිචාර ලබා ගැනීමට
    });

    if (response.data) {
      let downloadUrl = response.data.url;
      if (!downloadUrl && response.data.picker && response.data.picker.length > 0) {
        downloadUrl = response.data.picker[0].url;
      }

      if (downloadUrl) {
        return res.json({ success: true, download_url: downloadUrl });
      }
    }

    return res.status(404).json({ success: false, error: "Could not fetch video. Try another link." });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
