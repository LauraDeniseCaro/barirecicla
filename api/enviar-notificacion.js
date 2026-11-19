export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta ONESIGNAL_REST_API_KEY en Vercel' });
  }

  const { titulo, mensaje, url, imagen_url } = req.body;

  if (!titulo || !mensaje) {
    return res.status(400).json({ error: 'Faltan título o mensaje para la notificación' });
  }

  try {
    const payload = {
      app_id: '7afa2b42-a75a-4746-93bd-406077384b88',
      included_segments: ['Total Subscriptions', 'Subscribed Users'],
      headings: { en: titulo, es: titulo },
      contents: { en: mensaje, es: mensaje },
      url: url || 'https://baritoxicorecicla.vercel.app/',
    };

    if (imagen_url) {
      payload.chrome_web_image = imagen_url;
      payload.big_picture = imagen_url;
    }

    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors ? JSON.stringify(data.errors) : 'Error al enviar en OneSignal');
    }

    return res.status(200).json({ ok: true, id: data.id, recipients: data.recipients });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}