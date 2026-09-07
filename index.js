const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "Pinterest Direct Scraper API is running!" });
});

app.get('/download', async (req, res) => {
  let pinUrl = req.query.url;
  if (!pinUrl) {
    return res.status(400).json({ success: false, error: "Please provide a Pinterest URL" });
  }

  try {
    if (pinUrl.includes('pin.it')) {
      const resp = await axios.get(pinUrl, {
        maxRedirects: 5,
        headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15" }
      });
      pinUrl = resp.request.res.responseUrl || pinUrl;
    }

    const response = await axios.get(pinUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const $ = cheerio.load(response.data);
    let videoUrl = null;

    videoUrl = $('meta[property="og:video"]').attr('content') || 
               $('meta[property="og:video:secure_url"]').attr('content');

    if (!videoUrl) {
      $('script').each((i, el) => {
        const text = $(el).html();
        if (text && text.includes('.mp4')) {
          const match = text.match(/"(https:\/\/[^"]+\.mp4[^"]*)"/);
          if (match && match[1]) {
            videoUrl = match[1].replace(/\\u002F/g, '/');
          }
        }
      });
    }

    if (videoUrl) {
      return res.json({ success: true, download_url: videoUrl });
    } else {
      return res.status(404).json({ success: false, error: "Video not found in this Pinterest link." });
    }
  } ziatch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch video: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
