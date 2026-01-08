
// Native fetch used

const BASE_URL = 'http://localhost:9000';

async function setupKey() {
    // 1. Login
    console.log("Logging in...");
    const authRes = await fetch(`${BASE_URL}/admin/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: "newadmin@test.com",
            password: "supersecret"
        })
    });

    if (!authRes.ok) {
        console.log("Login Failed: " + authRes.status);
        console.log(await authRes.text());
        return;
    }

    const { access_token } = await authRes.json();
    console.log("Got Admin Token.");

    // 2. Get Sales Channels
    const scRes = await fetch(`${BASE_URL}/admin/sales-channels`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const { sales_channels } = await scRes.json();
    const defaultSc = sales_channels[0];
    console.log(`Using Sales Channel: ${defaultSc.name} (${defaultSc.id})`);

    // 3. Create Key
    console.log("Creating Publishable Key...");
    const keyRes = await fetch(`${BASE_URL}/admin/publishable-api-keys`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({ title: "API Created Key" })
    });

    const { publishable_api_key } = await keyRes.json();
    console.log(`Created Key: ${publishable_api_key.token} (${publishable_api_key.id})`);

    // 4. Link Sales Channel
    console.log("Linking Sales Channel...");
    const linkRes = await fetch(`${BASE_URL}/admin/publishable-api-keys/${publishable_api_key.id}/sales-channels/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({ sales_channel_ids: [defaultSc.id] })
    });

    if (linkRes.ok) {
        console.log("SUCCESS: Key Linked!");
        console.log(`NEW_KEY::${publishable_api_key.token}`);
    } else {
        console.log("Linking Failed: " + await linkRes.text());
    }
}

setupKey();
