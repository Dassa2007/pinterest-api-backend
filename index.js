const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "Backend is running!" });
});

app.get('/download', async (req, res) => {
  const pinUrl = req.query.url;
  if (!pinUrl) {
    return res.status(400).json({ success: false, error: "Please provide a URL" });
  }

  try {
    // වෙනත් නිදහස් සහ විශ්වාසදායක Pinterest API එකක් භාවිතය
    const apiRes = await axios.get(`https://www.dark-yasiya-api.site/download/pinterest?url=${encodeURIComponent(pinUrl)}`);
    
    if (apiRes.data && apiRes.data.status && apiRes.data.result) {
      let videoUrl = apiRes.data.result.url || apiRes.data.result;
      return res.json({ success: true, download_url: videoUrl });
    }

    return res.status(404).json({ success: false, error: "Could not fetch video from this link." });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch video: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
