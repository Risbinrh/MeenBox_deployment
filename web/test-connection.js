
// Native fetch used in Node 18+

const KEY = 'pk_427cce2a75049dde35ff19cb44f3fc18';
const REGION_ID = 'reg_01KDCHTTP9F4462Q0CFSSERPNN';
const URL = `http://localhost:9000/store/products?region_id=${REGION_ID}`;

async function testConnection() {
    console.log('Testing connection to:', URL);
    console.log('Using Key:', KEY);

    try {
        const response = await fetch(URL, {
            headers: {
                'x-publishable-api-key': KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', response.status);

        if (!response.ok) {
            const text = await response.text();
            console.log('Error Body:', text);
        } else {
            const data = await response.json();
            console.log('Success! Products found:', data.products?.length);
        }
    } catch (error) {
        console.error('Connection failed:', error.message);
    }
}

testConnection();
