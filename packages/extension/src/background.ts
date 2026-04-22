chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'ADD_LISTING') {
    handleAddListing(msg.payload)
      .then(sendResponse)
      .catch(err => sendResponse({ ok: false, error: err.message }))
    return true
  }
})

async function handleAddListing(payload: {
  name: string
  price: number | null
  notes: string
  listingUrl: string
  thumbnailUrl: string
  fbListingId: string | null
}) {
  const { serverUrl, apiKey } = await chrome.storage.sync.get(['serverUrl', 'apiKey'])
  if (!serverUrl || !apiKey) {
    throw new Error('Not configured — open extension options to set server URL and API key.')
  }
  const res = await fetch(`${serverUrl}/api/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Failed to save listing')
  }
  return { ok: true, listing: await res.json() }
}
