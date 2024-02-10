#!/bin/bash

# Function to perform git pull
git_pull() {
    rm -rf .git/HEAD.lock .git/ORIG_HEAD* .git/refs/heads
    git fetch --all
    git reset --hard origin/main
    git pull origin main 
}

git_pull

npx nodemon &

while true; do
    sleep 0
    git_pull
done
