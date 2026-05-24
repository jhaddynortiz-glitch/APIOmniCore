async function testApi() {
  const url = 'https://omnicore-api.duckdns.org/organizations/polivitaminas-id';
  try {
    console.log('Sending GET to verify initial state...');
    let res = await fetch(url);
    let data = await res.json();
    console.log('Initial state:', {
      isDeliveryEnabled: data.isDeliveryEnabled,
      isLocalEnabled: data.isLocalEnabled,
      isMeetingEnabled: data.isMeetingEnabled
    });

    console.log('Sending PATCH to update fields...');
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isDeliveryEnabled: false,
        isLocalEnabled: false,
        isMeetingEnabled: false
      })
    });
    const patchData = await patchRes.json();
    console.log('PATCH response:', {
      isDeliveryEnabled: patchData.isDeliveryEnabled,
      isLocalEnabled: patchData.isLocalEnabled,
      isMeetingEnabled: patchData.isMeetingEnabled
    });

    console.log('Sending GET to verify saved state...');
    res = await fetch(url);
    data = await res.json();
    console.log('Final state:', {
      isDeliveryEnabled: data.isDeliveryEnabled,
      isLocalEnabled: data.isLocalEnabled,
      isMeetingEnabled: data.isMeetingEnabled
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

testApi();
