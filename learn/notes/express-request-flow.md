# How Express handles a request

Notes for Stockfolio. The diagrams are Mermaid: GitHub renders them automatically, and in VS Code use the "Markdown Preview Mermaid Support" extension.

---

## 1. Two phases: startup vs. every request

```mermaid
flowchart LR
    subgraph STARTUP["Startup (runs once)"]
        A["const app = express()"] --> B["app.get('/hello/:name', fn)<br/>pushes a layer onto the stack"]
        B --> C["app.get('/stocks/:ticker', fn2)<br/>pushes another layer"]
        C --> D["app.listen(3000)<br/>OS opens TCP socket"]
    end

    subgraph RUNTIME["Every request"]
        E["Bytes arrive on socket"] --> F["Node parses HTTP"]
        F --> G["Node calls app(req, res)"]
        G --> H["Express walks the stack"]
        H --> I["Matching handler sends response"]
    end

    D -.-> E
```

**Registering a handler = adding an entry to a list.** Nothing runs until a request arrives.

---

## 2. The full journey of one request

```mermaid
sequenceDiagram
    participant C as Client (curl)
    participant OS as Operating system
    participant N as Node (event loop + http)
    participant E as Express app
    participant H as Your handler

    C->>OS: TCP connect to :3000, send "GET /hello/marko"
    OS->>N: socket readable
    N->>N: parse raw bytes into req (method, url, headers)
    N->>E: app(req, res)
    E->>E: walk router stack top to bottom
    E->>E: GET matches, /hello/:name matches, set req.params.name = "marko"
    E->>H: handler(req, res, next)
    H->>E: res.json({ greeting: "Hello, marko" })
    E->>N: write status, headers, body
    N->>C: HTTP/1.1 200 OK + JSON
```

---

## 3. How Express picks a handler (the stack walk)

```mermaid
flowchart TD
    START(["Request arrives: GET /stocks/aapl"]) --> NEXT["Take next layer from stack"]
    NEXT --> END{"Any layers left?"}
    END -- No --> F404["Built-in fallback: 404 HTML page"]
    END -- Yes --> M{"Method matches?"}
    M -- No --> NEXT
    M -- Yes --> P{"Path matches pattern?"}
    P -- No --> NEXT
    P -- Yes --> PARAMS["Extract params: req.params.ticker = 'aapl'"]
    PARAMS --> RUN["Call handler(req, res, next)"]
    RUN --> R{"What did the handler do?"}
    R -- "Sent a response" --> DONE(["Done"])
    R -- "Called next()" --> NEXT
    R -- "Threw / next(err)" --> ERR["Skip to error middleware"]
```

---

## 4. The router stack as a list

```
app.get('/', h1)              ->  [0] GET  /               h1
app.get('/hello/:name', h2)   ->  [1] GET  /hello/:name    h2
app.get('/stocks/:ticker', h3)->  [2] GET  /stocks/:ticker h3
                                  [ ] (end)  -> built-in 404

GET /stocks/aapl
  [0] GET /              path no match -> next
  [1] GET /hello/:name   path no match -> next
  [2] GET /stocks/:ticker MATCH -> h3 runs with req.params.ticker = 'aapl'
```

---

## Key takeaways

| Fact                                                      | Consequence                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `app` is the single callback Node calls for every request | `app.listen(3000)` = `http.createServer(app).listen(3000)`                                  |
| Routes are stored in registration order                   | **Order matters**: `/stocks/:ticker` registered before `/stocks/top` swallows `/stocks/top` |
| A handler either responds or calls `next()`               | Forgetting both leaves the request hanging until it times out                               |
| `app.use(fn)` adds a layer matching every path            | That is all middleware is (App 3)                                                           |
| Everything runs on one thread (the event loop)            | CPU-heavy work in a handler blocks all users. Awaiting I/O (DB, HTTP) is fine               |
