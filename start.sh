redis-server &

mongod --dbpath data/ &

node task_processor.js &

node server.js 

echo "All systems running"
