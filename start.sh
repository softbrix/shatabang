redis-server &

mongod --dbpath data/ &

node server.js

echo "All systems running"
