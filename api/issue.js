// Registers a generated certificate through the private Apps Script endpoint.
// Configure APPS_SCRIPT_URL and APPS_SCRIPT_KEY in Vercel environment variables.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const body = req.body || {};
  const id = String(body.id || '').trim();
  const team = String(body.team || '').trim();
  const date = String(body.date || '').trim();
  const tournament = String(body.tournament || '').trim();
  const authority = String(body.authority || '').trim();
  if (!id || id.length > 64 || !/^[\w\-\/. ]+$/.test(id))
    return res.status(400).json({ success: false, error: 'A valid certificate ID is required' });
  if (!team || !tournament || !authority)
    return res.status(400).json({ success: false, error: 'Team, tournament and issuing authority are required' });
  try {
    const url = new URL(process.env.APPS_SCRIPT_URL);
    url.searchParams.set('key', process.env.APPS_SCRIPT_KEY || '');
    const upstream = await fetch(url, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'issue', id, team, date, tournament, authority })
    });
    const data = await upstream.json();
    if (!upstream.ok || data.error || data.success === false)
      return res.status(502).json({ success: false, error: data.error || 'Certificate registration failed' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(502).json({ success: false, error: 'Certificate registration service unavailable' });
  }
}
