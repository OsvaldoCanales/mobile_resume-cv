#!/usr/bin/env node 

const http = require('http');
const url = require('url');
const fs = require('node:fs');
const path = require('path');
const { createHmac, randomUUID} = require('node:crypto');
const secret = 'abcdefg';

// Load users 
const dbPath = path.join(__dirname, 'password.db.json');
let rawData = fs.readFileSync(dbPath, 'utf-8');
let passwordDB = JSON.parse(rawData);

const hash = (str) => { 
    return createHmac('sha256', secret).update(str).digest('hex');
}

let todos = [];

// HTTP Server 
const server = http.createServer((req, res) => { 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

        if (query.completed) { // Checkbox feature
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

        if(!authenticate(req, res)) return;
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
    /// Handle PUT Request: Update To-Do
    else if (pathName.startsWith("/api/todos/") && req.method === 'PUT') { 

        if(!authenticate(req, res)) return;

        const id = parseInt(pathName.split('/')[3], 10);

        let body = '';
        req.on('data', chunk =>  { 
            body += chunk.toString();
        });

        req.on('end', () => { 
                const data = JSON.parse(body);
                const todo = todos.find(t => t.id === id);

                if (!todo) { 
                    res.writeHead(404, {'Content-Type': 'application.json'});
                    res.end(JSON.stringify({error: 'Todo not found'}));
                    return;
                }

                // Updates fields
                if (data.task !== undefined) { 
                    todo.task = data.task; 
                }
                if (data.completed !== undefined) { 
                    todo.completed = data.completed
                }
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: "Todo updated"}));
        });
    }
    // Handle DELETE Requests: Remove todo task
    else if(pathName.startsWith("/api/todos/") && req.method === "DELETE") {
        if(!authenticate(req, res)) return;
        const id = parseInt(pathName.split('/')[3], 10);

        const index = todos.findIndex(t => t.id === id);
        if (index === -1) { 
            res.writeHead(404, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: "Id not found"}));
            return;
        }

        todos.splice(index, 1); // remove todo
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: "Todo deleted"}));
    }
    // Handle Adding users
    else if (pathName === '/api/users' && req.method === 'POST') {
        // 1. Must be authenticated
        if (!authenticate(req, res)) return;
        if (!requireRole('admin')(req, res)) return;
      
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });
        req.on('end', () => {
          let { username, password, role } = {};
          try {
            ({ username, password, role } = JSON.parse(body));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }
    
          if (!username || !password || !role) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'username, password, and role are required.' }));
            return;
          }
      
          // Check if user already exists
          const existingUser = passwordDB.users.find(u => u.username === username);
          if (existingUser) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User already exists.' }));
            return;
          }
      
          // 5. Hash the password
          const hashedPassword = hash(password + username);
      
          // 6. Insert into password.db.json
          const newUser = {
            username,
            hashedPassword,
            role
          };
          passwordDB.users.push(newUser);
          fs.writeFileSync(dbPath, JSON.stringify(passwordDB, null, 2));
      
          // 7. Return success
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'User created successfully.',
            user: { username, role }
          }));
        });
    }

    // Returns list of users 
    else if (pathName === '/api/users' && req.method === 'GET') {
        if (!authenticate(req, res)) return;
        if (!requireRole('admin')(req, res)) return;
      
        // Return user list, but do NOT expose hashedPassword
        const sanitizedUsers = passwordDB.users.map(u => ({
          username: u.username,
          role: u.role
          // hashedPassword: intentionally omitted
        }));
      
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sanitizedUsers));
    }

    // Delete users 
    else if (pathName.startsWith('/api/users/') && req.method === 'DELETE') {
        if (!authenticate(req, res)) return;
        if (!requireRole('admin')(req, res)) return;
      
        // Extract username from the URL
        const parts = pathName.split('/');
        const userToDelete = parts[parts.length - 1]; // e.g., /api/users/someUser
      
        // Find the user in passwordDB
        const index = passwordDB.users.findIndex(u => u.username === userToDelete);
        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'User not found.' }));
          return;
        }
      
        // Remove from the array
        passwordDB.users.splice(index, 1);
        fs.writeFileSync(dbPath, JSON.stringify(passwordDB, null, 2));
      
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `User '${userToDelete}' deleted.` }));
    }
      
    /// User went to an unknown route 
    else { 
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("404 - Not Found");
    }
});

function authenticate(req, res) { 
    const authHeader = req.headers['authorization'];
    if(!authHeader) { 
        // No authorization header! -> 401 with WWW-Authenticate
        res.writeHead(401, { 
            'WWW-Authenticate': 'Basic realm="Restricted Area"',
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({error: 'Authentication required.'}));
        return false;
    }

    // Need to decrrypt the Credentials. 
    const baseCredentials = authHeader.split(' ')[1];
    const decoded = Buffer.from(baseCredentials, 'base64').toString('ascii'); // it should look like this "username:password"
    const [username, plainPassword] = decoded.split(':');

    // Recreate hashed version
    const candidateHash = hash(plainPassword + username);
    console.log(`Hashed value for admin/secret is: ${candidateHash}`);

    // Find user
    const user = passwordDB.users.find( (u) => 
       u.username === username && u.hashedPassword  === candidateHash
    );

    // Contains invalid credentials 
    if(!user) { 
        res.writeHead(403, {
            'WWW-Authenticate': 'Basic realm="Restricted Area"',
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({ error: 'Invalid credentials.' }));
          return false;
    }

    // If valid 
    req.user = user;
    return true;
}

function requireRole(requiredRole) { 
    return function (req, res) { 
        // No authenticated user at all 
        if (!req.user) { 
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not authenticated.' }));
            return false;
        }

        // Check role 
        if (req.user.role !== requiredRole) { 
            // User accounts cannot modify or create other user accounts: 
            res.writeHead(403, { 'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Not Authorized: User accounts not allowed!'}));
            return false;
        }

        return true;
    }
}

// Start Server 
const PORT = 3000; 
server.listen(PORT, () => { 
    console.log(`API Server running at http://localhost${PORT}`);
});

