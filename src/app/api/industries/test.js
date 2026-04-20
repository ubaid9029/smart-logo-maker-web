async function testIndustries() {
  try {
    const res = await fetch('http://localhost:3000/api/industries');
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data Length:', Array.isArray(data) ? data.length : 'Not an array');
    console.log('First Item:', data[0]);
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

testIndustries();
