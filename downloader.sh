#!/bin/bash
git_pull() {
    rm -rf .git/HEAD.lock .git/ORIG_HEAD* .git/refs/heads
    git fetch --all > /dev/null
    LOCAL=$(git rev-parse origin/main)
    REMOTE=$(git rev-parse origin/main)
    
    if [ $LOCAL != $REMOTE ]; then
        echo "Pulling changes..."
        git reset --hard origin/main
        git pull origin main
    # else
        # echo "Already up to date."
    fi
}

git_pull

npx nodemon &

while true; do
    sleep 0
    git_pull
done
