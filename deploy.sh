#!/bin/bash
# EquipScout Deployment Script
cd ~/equipscout-railway

# Configure git
git config user.email "shane@equipscout.io"
git config user.name "Shane Petitto"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Done! Now go to railway.app and:"
echo "1. Click 'New Project'"
echo "2. Select 'Deploy from GitHub repo'"
echo "3. Choose 'HawgLeg/equipscout'"
echo "4. Railway will auto-detect and deploy"
echo ""
echo "Then add PostgreSQL database:"
echo "1. In your project, click 'New' → 'Database' → 'Add PostgreSQL'"
echo "2. Railway will auto-connect DATABASE_URL"
echo "3. Click Deploy