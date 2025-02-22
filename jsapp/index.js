#!/usr/bin/env node 

const http = require('http');
const url = require('url');
let todos = [];

// HTTP Server 
const server = http.createServer((req, res) => { 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (req.method === 'OPTIONS') { 
        res.writeHead(204);
        res.end();
        return;
    }

    /// Handle GET Request: Fetch To-Do List
    if (pathName === "/api/todos" && req.method === 'GET') { 
        let filteredTodos = [...todos];

        if (query.completed) { 
            const isCompleted = query.completed === 'true';
            filteredTodos = filteredTodos.filter(todo => todo.completed === isCompleted); // Only accepts completed!
        }

        if (filteredTodos.length === 0) { 
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'No matching todos found.'}));
            return;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({todos}));
    }
    /// Handle POST Request: Add New To-Do
    else if (pathName === "/api/todos" && req.method === 'POST') {

        let body = '';
        req.on('data', chunk => { 
            body += chunk.toString();
        });

        req.on('end', () => { 
            const data = JSON.parse(body);
            const task = data.task;
            if (!task) { // If there is no task entered
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end(JSON.stringify({error: 'Task is required.'}));
                return;
            }
            const newTodo = { id: todos.length + 1, task, completed: false}; // New Task
            todos.push(newTodo);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Todo added.', todo: newTodo }));
        });
    }
    /// User went to an unknown route 
    else { 
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("404 - Not Found");
    }
});

// Start Server 
const PORT = 3000; 
server.listen(PORT, () => { 
    console.log(`API Server running at http://localhost#{PORT}`);
});

