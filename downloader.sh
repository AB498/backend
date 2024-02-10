#!/bin/bash

git_pull() {
    rm -rf .git/HEAD.lock .git/ORIG_HEAD* .git/refs/heads > /dev/null
    OUTPUT=$(git fetch --all 2>&1)
    OUTPUT=$(git reset --hard origin/main 2>&1)
    OUTPUT=$(git pull origin main 2>&1)
    chmod 777 -R .
}

git_pull

npx nodemon &

while true; do
    sleep 1
    git_pull > /dev/null
done
