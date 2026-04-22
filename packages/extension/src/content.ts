function scrapeListing() {
  const name = document.querySelector('h1')?.textContent?.trim() ?? ''

  const priceEl = document.querySelector('[data-testid="marketplace_pdp_price"]')
    ?? document.querySelector('span[dir="auto"]')
  const priceMatch = priceEl?.textContent?.match(/[\d\s,]+/)
  const price = priceMatch ? parseFloat(priceMatch[0].replace(/[\s,]/g, '')) : null

  const descEl = document.querySelector('[data-testid="marketplace_pdp_description"]')
    ?? document.querySelector('div[dir="auto"]')
  const notes = descEl?.textContent?.trim().slice(0, 500) ?? ''

  const thumbEl = document.querySelector('img[data-visualcompletion]') as HTMLImageElement | null
  const fbListingId = location.pathname.match(/\/marketplace\/item\/(\d+)/)?.[1] ?? null

  return { name, price, notes, listingUrl: location.href, thumbnailUrl: thumbEl?.src ?? '', fbListingId }
}

function injectButton() {
  if (document.getElementById('me-add-btn')) return

  const btn = document.createElement('button')
  btn.id = 'me-add-btn'
  btn.textContent = '＋ Add to Evaluator'
  btn.style.cssText = [
    'position:fixed', 'bottom:24px', 'right:24px', 'z-index:999999',
    'background:#5c6ef0', 'color:#fff', 'border:none', 'border-radius:8px',
    'padding:12px 20px', 'font-size:14px', 'font-weight:600', 'cursor:pointer',
    'box-shadow:0 4px 20px rgba(0,0,0,.35)', 'transition:background .15s',
    "font-family:-apple-system,'Segoe UI',system-ui,sans-serif",
  ].join(';')

  btn.onmouseover = () => { btn.style.background = '#4a5ce0' }
  btn.onmouseleave = () => { btn.style.background = '#5c6ef0' }

  btn.onclick = async () => {
    btn.textContent = 'Adding…'
    btn.disabled = true
    const res = await chrome.runtime.sendMessage({ type: 'ADD_LISTING', payload: scrapeListing() })
    if (res.ok) {
      btn.textContent = '✓ Added!'
      btn.style.background = '#22c55e'
      setTimeout(() => {
        btn.textContent = '＋ Add to Evaluator'
        btn.style.background = '#5c6ef0'
        btn.disabled = false
      }, 2500)
    } else {
      btn.textContent = '✗ Failed'
      btn.style.background = '#ef4444'
      console.error('[ME]', res.error)
      setTimeout(() => {
        btn.textContent = '＋ Add to Evaluator'
        btn.style.background = '#5c6ef0'
        btn.disabled = false
      }, 2500)
    }
  }

  document.body.appendChild(btn)
}

injectButton()

const observer = new MutationObserver(() => {
  if (location.href.includes('/marketplace/item/')) injectButton()
})
observer.observe(document.body, { childList: true, subtree: true })
