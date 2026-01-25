# Mapbox Location Picker Setup

The Business Profile settings page includes an interactive map location picker powered by Mapbox. This allows business owners to easily select their exact location on a map.

## Getting Your Free Mapbox Token

1. **Create a Mapbox Account** (if you don't have one):
   - Go to [https://account.mapbox.com/](https://account.mapbox.com/)
   - Sign up for a free account

2. **Get Your Access Token**:
   - After logging in, go to [Access Tokens](https://account.mapbox.com/access-tokens/)
   - Copy your default public token (starts with `pk.eyJ...`)
   - Or create a new token with appropriate scopes

3. **Add Token to Your Project**:
   - Create a `.env` file in the `frontend` directory (if it doesn't exist)
   - Add the following line:
     ```
     REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
     ```
   - Replace `your_mapbox_token_here` with your actual Mapbox token

4. **Restart Your Development Server**:
   - Stop your React development server (Ctrl+C)
   - Start it again with `npm start`
   - The map picker will now work!

## Free Tier Limits

Mapbox offers a generous free tier:
- **50,000 map loads per month** (free)
- Perfect for most small to medium businesses
- No credit card required for free tier

## Features

The map location picker includes:
- ✅ Click on map to set location
- ✅ Drag marker to adjust position
- ✅ Use geolocation button to find current position
- ✅ Real-time coordinate display
- ✅ Responsive design for mobile and desktop

## Troubleshooting

**Map not loading?**
- Make sure you've added `REACT_APP_MAPBOX_TOKEN` to your `.env` file
- Restart your development server after adding the token
- Check that your token is valid at [Mapbox Account](https://account.mapbox.com/access-tokens/)

**Token errors?**
- Ensure your token has the correct scopes (public token is fine for this use case)
- Check that the token hasn't been revoked or expired

## Alternative: Manual Entry

If you prefer not to use Mapbox, you can still manually enter latitude and longitude coordinates in the address fields. The map preview will still work using Google Maps embed (no API key required).
