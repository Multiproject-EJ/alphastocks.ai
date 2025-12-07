export async function startSkinPurchase(skinId) {
  try {
    const response = await fetch('/api/create-wealth-skin-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skinId })
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
