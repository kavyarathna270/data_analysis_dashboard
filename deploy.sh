#!/bin/bash
set -e

EC2_IP="ec2-3-107-2-217.ap-southeast-2.compute.amazonaws.com"
KEY_PATH="/c/Users/DELL/OneDrive/Desktop/insightflow-key.pem"
APP_DIR="/home/ubuntu/insightflow"

echo "Deploying InsightFlow to EC2..."

# Fix key permissions (Git Bash requirement)
chmod 400 $KEY_PATH

# Create remote folder first
echo "Preparing server..."
ssh -i $KEY_PATH -o StrictHostKeyChecking=no ubuntu@$EC2_IP "mkdir -p $APP_DIR"

# Copy project files (NO excludes in scp)
echo "Copying files..."
scp -i $KEY_PATH -o StrictHostKeyChecking=no -r ./ ubuntu@$EC2_IP:$APP_DIR

# SSH and run Docker
echo "Starting Docker containers..."
ssh -i $KEY_PATH -o StrictHostKeyChecking=no ubuntu@$EC2_IP << 'EOF'
  cd /home/ubuntu/insightflow
  docker compose down || true
  docker compose up --build -d
  echo "Containers running!"
  docker compose ps
EOF

echo "Deployed! App running at http://$EC2_IP"