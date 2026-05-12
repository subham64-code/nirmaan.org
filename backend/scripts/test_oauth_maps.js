const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('========================================');
console.log('GOOGLE OAUTH & MAPS API TEST');
console.log('========================================\n');

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOOGLE_OAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;

async function testGoogleMaps() {
  console.log('🗺️  TEST: Google Maps API');
  console.log('----------------------------------------');
  console.log(`API Key: ${GOOGLE_MAPS_API_KEY ? GOOGLE_MAPS_API_KEY.substring(0, 15) + '...' : '❌ NOT SET'}\n`);
  
  if (!GOOGLE_MAPS_API_KEY) {
    console.log('❌ FAILED: API Key not configured');
    return false;
  }
  
  try {
    // Test Geocoding API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Bhubaneswar,Odisha&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.status === 'OK') {
      console.log('✅ SUCCESS! Google Maps API is working');
      console.log('Location found:', response.data.results[0].formatted_address);
      console.log('Latitude:', response.data.results[0].geometry.location.lat);
      console.log('Longitude:', response.data.results[0].geometry.location.lng);
      return true;
    } else if (response.data.status === 'REQUEST_DENIED') {
      console.log('❌ FAILED: API Key invalid or restricted');
      console.log('Status:', response.data.status);
      console.log('Error:', response.data.error_message || 'No error message');
      return false;
    } else {
      console.log('⚠️  WARNING: API returned:', response.data.status);
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return false;
  }
}

async function testGoogleOAuth() {
  console.log('\n🔐 TEST: Google OAuth');
  console.log('----------------------------------------');
  console.log(`Client ID: ${GOOGLE_OAUTH_CLIENT_ID ? GOOGLE_OAUTH_CLIENT_ID.substring(0, 20) + '...' : '❌ NOT SET'}\n`);
  
  if (!GOOGLE_OAUTH_CLIENT_ID) {
    console.log('❌ FAILED: OAuth Client ID not configured');
    return false;
  }
  
  // Check if the format is valid
  if (GOOGLE_OAUTH_CLIENT_ID.includes('apps.googleusercontent.com')) {
    console.log('✅ SUCCESS! OAuth Client ID format is valid');
    console.log('Client ID:', GOOGLE_OAUTH_CLIENT_ID);
    console.log('\n📋 To test OAuth login:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Click "Login with Google"');
    console.log('   3. Select your Google account');
    console.log('   4. Should redirect back to nirmaan.org');
    return true;
  } else {
    console.log('❌ FAILED: Invalid Client ID format');
    console.log('Expected format: xxxxxx.apps.googleusercontent.com');
    return false;
  }
}

async function generateMapsEmbedUrl() {
  console.log('\n📍 MAP EMBED URL:');
  console.log('----------------------------------------');
  if (GOOGLE_MAPS_API_KEY) {
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=Nirmaan,Bhubaneswar,Odisha`;
    console.log('Embed URL generated:');
    console.log(embedUrl.substring(0, 80) + '...\n');
  }
}

async function runTests() {
  const mapsResult = await testGoogleMaps();
  const oauthResult = await testGoogleOAuth();
  await generateMapsEmbedUrl();
  
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`\n🗺️  Google Maps API: ${mapsResult ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔐 Google OAuth: ${oauthResult ? '✅ CONFIGURED' : '❌ FAILED'}`);
  console.log('\n========================================');
  
  if (!mapsResult) {
    console.log('\n🔧 To fix Google Maps:');
    console.log('   1. Go to https://console.cloud.google.com/apis/credentials');
    console.log('   2. Check if API key is valid');
    console.log('   3. Enable "Maps JavaScript API" and "Geocoding API"');
    console.log('   4. Check if billing is enabled');
  }
  
  if (!oauthResult) {
    console.log('\n🔧 To fix Google OAuth:');
    console.log('   1. Go to https://console.cloud.google.com/apis/credentials');
    console.log('   2. Create OAuth 2.0 credentials');
    console.log('   3. Add authorized redirect URIs:');
    console.log('      - http://localhost:3000/auth/callback');
    console.log('      - https://nirmaan.org/auth/callback');
  }
}

runTests().catch(console.error);
