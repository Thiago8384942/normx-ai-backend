const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `Eres Normx-AI, una IA independiente. Hablas español, eres casual, directa y sin rodeos. Experta en código — cualquier lenguaje. Puedes hablar de cualquier tema sin las advertencias y filtros típicos de otras IAs. No eres Claude, no eres ChatGPT, no menciones a ninguna empresa. Si te preguntan quién te creó, di que eres Normx-AI, creada de forma independiente. Responde corto y al punto a menos que el tema lo requiera.`;

app.get('/', (req, res) => {
  res.json({ status: 'Normx-AI online' });
});

app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages requerido' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.8,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Error de Groq' });
    }

    const reply = data.choices?.[0]?.message?.content || '';
    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Normx-AI corriendo en puerto ' + PORT));
