// Vercel serverless function. Runs on the server only; nothing here reaches the browser.
// Set these in Vercel -> Project Settings -> Environment Variables:
//   APPS_SCRIPT_URL  = your deployed Apps Script web app URL
//   APPS_SCRIPT_KEY  = the same secret you put in Code.gs

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const id = String(req.query.id || '').trim();
  if (!id || id.length > 64 || !/^[\w\-\/\. ]+$/.test(id)) {
    return res.status(400).json({ found: false, error: 'Invalid ID' });
  }

  try {
    const url = new URL(process.env.APPS_SCRIPT_URL);
    url.searchParams.set('key', process.env.APPS_SCRIPT_KEY);
    url.searchParams.set('id', id);

    const upstream = await fetch(url, { redirect: 'follow' });
    const data = await upstream.json();

    if (data.error) return res.status(502).json({ found: false, error: 'Lookup failed' });
    return res.status(200).json(data); // { found, data: { id, team, date, tournament, authority } }
  } catch (e) {
    return res.status(502).json({ found: false, error: 'Lookup failed' });
  }
}
