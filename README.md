# rate-limiter-project
This is a very simple end-to-end rate limiter project.

## Architecture
1. There is 1 client
2. There is 1 load balancer
3. There are 3 services
4. There is 1 rate limiter working with 1 redis instance.

                                                                                                 
                                     ┌─────────────────┐                                         
                                     │                 │                                         
                     ┌──────────────►│    Service A    ├───────────────┐                         
                     │               │ (Node + Express)│               │                         
                     │               └─────────────────┘               │                         
                     │                                                 │                         
                     │                                                 │                         
                     │                                                 ▼                         
 ┌──────┐     ┌──────┴─────────┐      ┌────────────────┐        ┌────────────────┐     ┌───────┐ 
 │      │     │                │      │                │        │                │     │       │ 
 │ User ┼─────►  Load Balancer ┼────► │   Service B    ├───────►│  Rate Limiter  ├────►│ Redis │ 
 │      │     │                │      │(Node + Express)│        │(Node + Express)│     │       │ 
 └──────┘     └──────┬─────────┘      └────────────────┘        └────────────────┘     └───────┘ 
                     │                                                 ▲                         
                     │                                                 │                         
                     │                                                 │                         
                     │                ┌────────────────┐               │                         
                     │                │                │               │                         
                     └───────────────►│   Service C    ├───────────────┘                         
                                      │(Node + Express)│                                         
                                      └────────────────┘                                         
                                                                                                 

## Services
The 3 services - Service A, Service B, Service C - are identical.
- Tech: Node.js + Express
- Endpoint - GET "/" - returning "Hello"
- Port - 3000, 3001, 3002. These are defined in .env file per service.

### Dockerfile
    - copies package.json and package-lock.json from code to docker environment
    - installs packages
    - copy source code
    - exposes port (3000, 3001, 3002)
    - start service: `node index.js`

## Rate limiter
Uses Redis cache to implement rate limiting.
- Tech: Node.js + Express
- Endpoint - POST "/check".
- Extracts IP from request and forms a key `rate:${ip}`.
- Increments the count of requests from this IP in Redis - `redisClient.incr(key)`
- Sets expiry of the key in WINDOW_SIZE time - `redisClient.expire(key, WINDOW_SIZE)`
- If count exceeds RATE_LIMIT, throws HTTP 429 error. Otherwise, sends HTTP 200 with "allowed: true".

## Middleware
- Integrates rate limiting in each service
- Each service adds `app.use` middleware (before `app.get`) which calls rate limiter.
    - if response is 200 OK, it calls `next()` to call actual service.
    - otherwise it returns error 429.
- Benefit of having each service add rate limiting call is scalability, reliability and configurability (custom rate limits, logic)
- Cons: code duplication

## Docker Compose
- Each of the 3 services, the rate limiter and redis service is define in docker-compose.yml.
- Docker Compose Networking: Docker compose automatically creates a virtual network for all services defined in docker-compose.yml.
    - each service gets hostname=build name. For e.g., `build: ./rate-limiter` gives hostname `rate-limiter` to this service.
    - this allows services to call rate limiter via `http://rate-limiter:4000`, instead of `localhost`.
    - `localhost` inside a container refers to the _container_ itself.

## Load Balancer
- Nginx defines load balancer in nginx.conf.
    - PORT 80: it means `http:\\localhost` will send the request to Nginx load balancer
    - `upstream backend`: defines URLs to rotate redirection, with default `round-robin` policy.
- docker-compose: nginx is defined outside of all containers
    - `depends_on`: dependency relationship - services to start BEFORE starting nginx

    