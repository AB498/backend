#!/bin/bash

git_pull() {
    rm -rf .git/HEAD.lock .git/ORIG_HEAD* .git/refs/heads > /dev/null
    git fetch --all > /dev/null
    git reset --hard origin/main > /dev/null
    git pull origin main > /dev/null
}

git_pull

npx nodemon &

while true; do
    sleep 0
    git_pull > /dev/null
done
