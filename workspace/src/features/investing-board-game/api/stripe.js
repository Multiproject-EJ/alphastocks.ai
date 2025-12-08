export async function startSkinPurchase(skinId) {
  try {
    const response = await fetch('/api/provider-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createWealthSkinCheckout', skinId })
    });

    if (!response.ok) {
      console.error('Failed to create checkout session');
      return;
    }

    const { checkoutUrl } = await response.json();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  } catch (error) {
    console.error('Error starting skin purchase', error);
  }
}
