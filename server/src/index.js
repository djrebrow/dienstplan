import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/schedule.json');

const defaultPayload = {
  rangeStart: new Date().toISOString().slice(0, 10),
  rangeEnd: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  employees: [],
  cells: [],
  shiftTypes: ['Früh', 'Spät', 'Nacht', 'Frei'],
  legend: {
    Früh: 'Frühschicht (06:00 - 14:00)',
    Spät: 'Spätschicht (14:00 - 22:00)',
    Nacht: 'Nachtschicht (22:00 - 06:00)',
    Frei: 'Freier Tag'
  },
  notes: ''
};

const ensureDataFile = async () => {
  try {
    await fs.access(dataPath);
  } catch (error) {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(defaultPayload, null, 2), 'utf8');
  }
};

const readPayload = async () => {
  await ensureDataFile();
  const content = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(content);
};

const writePayload = async (payload) => {
  await fs.writeFile(dataPath, JSON.stringify(payload, null, 2), 'utf8');
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/schedule', async (_req, res) => {
  try {
    const payload = await readPayload();
    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Lesen des Dienstplans' });
  }
});

app.put('/api/schedule', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) {
      return res.status(400).json({ message: 'Ungültige Daten' });
    }
    await writePayload(payload);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Speichern des Dienstplans' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Dienstplan-Server läuft auf Port ${port}`);
});
