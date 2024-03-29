#!/bin/bash

git_pull() {
    # get local hash
    LOCAL=$(git rev-parse @)
    OUTPUT=$(git fetch --all 2>&1)
    # get remote hash
    REMOTE=$(git ls-remote --heads origin main | cut -f1)
    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "git pull"
        echo "$LOCAL -> $REMOTE"
        rm -rf .git/HEAD.lock .git/ORIG_HEAD* .git/refs/heads > /dev/null
        OUTPUT=$(git fetch --all 2>&1)
        OUTPUT=$(git reset --hard origin/main 2>&1)
        OUTPUT=$(git pull origin main 2>&1)
        chmod 777 -R .
    fi
}

git_pull

npx nodemon &

while true; do
    sleep 1
    git_pull
done

