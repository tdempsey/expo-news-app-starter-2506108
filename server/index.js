const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'news.json');

app.use(express.json());

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all news
app.get('/news', (req, res) => {
  res.json(readData());
});

// Get single news item
app.get('/news/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = readData();
  const item = items.find(n => n.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(item);
});

// Create news item
app.post('/news', (req, res) => {
  const items = readData();
  const newItem = {
    id: items.length ? Math.max(...items.map(n => n.id)) + 1 : 1,
    title: req.body.title || '',
    content: req.body.content || ''
  };
  items.push(newItem);
  writeData(items);
  res.status(201).json(newItem);
});

// Update news item
app.put('/news/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = readData();
  const itemIndex = items.findIndex(n => n.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  items[itemIndex] = { ...items[itemIndex], ...req.body, id };
  writeData(items);
  res.json(items[itemIndex]);
});

// Delete news item
app.delete('/news/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  let items = readData();
  const itemIndex = items.findIndex(n => n.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  const deleted = items.splice(itemIndex, 1)[0];
  writeData(items);
  res.json(deleted);
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
