const serverUrlEl = document.getElementById('serverUrl') as HTMLInputElement
const apiKeyEl    = document.getElementById('apiKey')    as HTMLInputElement
const saveBtn     = document.getElementById('save')      as HTMLButtonElement
const statusEl    = document.getElementById('status')    as HTMLDivElement

chrome.storage.sync.get(['serverUrl', 'apiKey'], ({ serverUrl, apiKey }) => {
  if (serverUrl) serverUrlEl.value = serverUrl
  if (apiKey)    apiKeyEl.value    = apiKey
})

saveBtn.addEventListener('click', async () => {
  const serverUrl = serverUrlEl.value.trim().replace(/\/$/, '')
  const apiKey    = apiKeyEl.value.trim()

  if (!serverUrl || !apiKey) {
    statusEl.textContent = 'Both fields are required.'
    statusEl.className   = 'err'
    return
  }

  try {
    const res = await fetch(`${serverUrl}/api/categories`, {
      headers: { 'X-API-Key': apiKey },
    })
    if (!res.ok) throw new Error('Invalid API key or server unreachable')
    await chrome.storage.sync.set({ serverUrl, apiKey })
    statusEl.textContent = '✓ Settings saved and verified'
    statusEl.className   = 'ok'
  } catch (e) {
    statusEl.textContent = `✗ ${e instanceof Error ? e.message : 'Connection failed'}`
    statusEl.className   = 'err'
  }
})
