#!/bin/bash

# Function to perform git push
git_push() {
    git add .
    git commit -m "$(date)"
    git push
}

git_push

while true; do
    sleep 0
    git_push
done
