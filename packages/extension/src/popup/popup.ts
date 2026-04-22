const addBtn   = document.getElementById('addBtn')      as HTMLButtonElement
const openApp  = document.getElementById('openApp')     as HTMLButtonElement
const openOpts = document.getElementById('openOptions') as HTMLButtonElement
const desc     = document.getElementById('desc')        as HTMLParagraphElement
const msg      = document.getElementById('msg')         as HTMLDivElement

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab?.url?.includes('facebook.com/marketplace/item/')) {
    desc.textContent = 'Ready to add this listing.'
    addBtn.disabled  = false
  }
})

addBtn.addEventListener('click', async () => {
  addBtn.disabled  = true
  addBtn.textContent = 'Adding…'

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const name       = document.querySelector('h1')?.textContent?.trim() ?? ''
      const priceEl    = document.querySelector('[data-testid="marketplace_pdp_price"]')
      const priceMatch = priceEl?.textContent?.match(/[\d\s,]+/)
      const price      = priceMatch ? parseFloat(priceMatch[0].replace(/[\s,]/g, '')) : null
      const descEl     = document.querySelector('[data-testid="marketplace_pdp_description"]') ?? document.querySelector('div[dir="auto"]')
      const notes      = descEl?.textContent?.trim().slice(0, 500) ?? ''
      const thumbEl    = document.querySelector('img[data-visualcompletion]') as HTMLImageElement | null
      const fbListingId = location.pathname.match(/\/marketplace\/item\/(\d+)/)?.[1] ?? null
      return { name, price, notes, listingUrl: location.href, thumbnailUrl: thumbEl?.src ?? '', fbListingId }
    },
  })

  const res = await chrome.runtime.sendMessage({ type: 'ADD_LISTING', payload: result.result })

  if (res.ok) {
    msg.textContent    = '✓ Listing added!'
    msg.className      = 'ok'
    addBtn.textContent = '✓ Added'
  } else {
    msg.textContent    = `✗ ${res.error}`
    msg.className      = 'err'
    addBtn.textContent = '＋ Add This Listing'
    addBtn.disabled    = false
  }
})

openApp.addEventListener('click', async () => {
  const { serverUrl } = await chrome.storage.sync.get('serverUrl')
  if (serverUrl) chrome.tabs.create({ url: serverUrl })
  else chrome.runtime.openOptionsPage()
})

openOpts.addEventListener('click', () => chrome.runtime.openOptionsPage())
