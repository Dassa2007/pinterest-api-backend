const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "Vercel Pinterest API is active!" });
});

app.get('/download', async (req, res) => {
  const pinUrl = req.query.url;
  if (!pinUrl) {
    return res.status(400).json({ success: false, error: "Please provide a Pinterest URL" });
  }

  try {
    // Vercel සර්වර්ලස් සීමාවලට ගැළපෙන ඉතා වේගවත් API ක්‍රමයක්
    const response = await axios.get(`https://www.dark-yasiya-api.site/download/pinterest?url=${encodeURIComponent(pinUrl)}`, {
      timeout: 8000
    });

    if (response.data && response.data.status && response.data.result) {
      let videoUrl = response.data.result.url || response.data.result;
      return res.json({ success: true, download_url: videoUrl });
    }

    return res.status(404).json({ success: false, error: "Could not extract video from this link." });
  } catch (err) {
    // විකල්ප ක්‍රමයක් ලෙස වෙනත් ස්ටේබල් කෝඩ් එකක් මඟින් උත්සාහ කිරීම
    try {
      const altRes = await axios.get(`https://api.giftedtech.my.id/api/download/pinterest?url=${encodeURIComponent(pinUrl)}`, {
        timeout: 8000
      });
      if (altRes.data && altRes.data.result) {
        let altVideo = altRes.data.result.video_url || altRes.data.result;
        return res.json({ success: true, download_url: altVideo });
      }
    } catch (altErr) {
      // දෝෂය මඟ හැරීම
    }

    return res.status(500).json({ success: false, error: "Request failed. Please try a different Pinterest link." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
