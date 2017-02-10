redis-server &

#pm2 start server.js

#pm2 start task_processor.js

node task_processor.js &

node server.js 

echo "All systems running"
