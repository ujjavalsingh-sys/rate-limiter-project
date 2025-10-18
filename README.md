# rate-limiter-project
This is a very simple end-to-end rate limiter project.

## Architecture
1. There is 1 client
2. There is 1 load balancer
3. There are 3 services
4. There is 1 rate limiter working with 1 redis instance.

## Tech stack
1. Client: Postman/Insomnia
2. Load balancer: Nginx
3. MicroServices: Node.js with Express, Docker with docker compose for multi-container setup
4. Rate limiter
5. Redis