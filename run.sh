#!/bin/bash
PROJECT_DIR=$(dirname $0)
cd $PROJECT_DIR/node_modules/ark-rpc
node server.js &
sleep 1
echo .
sleep 0.5
echo .
sleep 0.5
echo .
cd ../../
setsid node ./client.js
kill -- -$$
