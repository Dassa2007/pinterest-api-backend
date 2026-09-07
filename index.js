const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "API is working perfectly!" });
});

app.get('/download', async (req, res) => {
  const pinUrl = req.query.url;
  if (!pinUrl) {
    return res.status(400).json({ success: false, error: "Please provide a Pinterest URL" });
  }

  try {
    // වඩාත්ම ස්ථාවර සහ වේගවත් ක්‍රමයක් භාවිතයෙන් වීඩියෝව ලබා ගැනීම
    const response = await axios.get(`https://www.dark-yasiya-api.site/download/pinterest?url=${encodeURIComponent(pinUrl)}`, {
      timeout: 7000
    });

    if (response.data && response.data.status && response.data.result) {
      let videoUrl = response.data.result.url || response.data.result;
      return res.json({ success: true, download_url: videoUrl });
    }

    return res.status(404).json({ success: false, error: "Video not found. Try another link." });
  } catch (err) {
    // ෆේල් වුනොත් වෙනත් විකල්ප API ලින්ක් එකකින් උත්සාහ කිරීම
    try {
      const altRes = await axios.get(`https://api.giftedtech.my.id/api/download/pinterest?url=${encodeURIComponent(pinUrl)}`, {
        timeout: 7000
      });
      if (altRes.data && altRes.data.result) {
        let videoUrl = altRes.data.result.video_url || altRes.data.result;
        return res.json({ success: true, download_url: videoUrl });
      }
    } catch (altErr) {}

    return res.status(500).json({ success: false, error: "Failed to fetch video. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
