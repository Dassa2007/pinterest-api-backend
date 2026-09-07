const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "Vercel Pinterest API is running smoothly!" });
});

app.get('/download', async (req, res) => {
  const pinUrl = req.query.url;
  if (!pinUrl) {
    return res.status(400).json({ success: false, error: "Please provide a Pinterest URL" });
  }

  try {
    // Vercel එක ඇතුළේ කල් යෑම (Timeout) වළක්වා ගැනීමට සහ ඉතා වේගයෙන් වීඩියෝ ලින්ක් එක ලබා ගැනීමට විශ්වාසදායක ක්‍රමයක් භාවිතය
    const response = await axios.get(`https://www.dark-yasiya-api.site/download/pinterest?url=${encodeURIComponent(pinUrl)}`, {
      timeout: 8000 // Vercel සීමාවට වඩා අඩු කාලයක් ඇතුළත ප්‍රතිචාර ලබා ගැනීමට
    });

    if (response.data && response.data.status && response.data.result) {
      let videoUrl = response.data.result.url || response.data.result;
      return res.json({ success: true, download_url: videoUrl });
    } else {
      return res.status(404).json({ success: false, error: "Could not fetch video from this Pinterest link." });
    }
  } catch (err) {
    // දෙවන විකල්පය ලෙස වෙනත් ස්ටේබල් ක්‍රමයක් හෝ ෆේල් වුනොත් එරර් එක ලබා දීම
    try {
      const altResponse = await axios.get(`https://api.giftedtech.my.id/api/download/pinterest?url=${encodeURIComponent(pinUrl)}`, {
        timeout: 8000
      });
      if (altResponse.data && altResponse.data.result) {
        return res.json({ success: true, download_url: altResponse.data.result.video_url || altResponse.data.result });
      }
    } catch (altErr) {
      // දෝෂයක් මතු වුවහොත්
    }

    return res.status(500).json({ 
      success: false, 
      error: "Vercel timeout or failed to fetch. Please try a different link." 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
