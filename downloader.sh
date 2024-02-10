#!/bin/bash

# Function to perform git pull
git_pull() {
    cd ~/backend
    rm -rf .git/HEAD.lock .git/ORIG_HEAD* .git/refs/heads
    git fetch --all
    git reset --hard origin/main
    git pull origin main 
}

# Run git pull initially
git_pull

# Start PHP server in the foreground
cd ~/backend
npx nodemon &

# Loop to run git pull every 5 minutes (adjust the sleep duration as needed)
while true; do
    sleep 5
    git_pull
done
