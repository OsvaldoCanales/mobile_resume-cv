
/// Extracts user's name and sends a GET Request to 3000/api route.
/// We then send a request to the api route and get a response. 
/// and we then display the message back.
function fetchTodos() { 
    fetch(`http://localhost:3000/api/todos`) // We send a GET Request to 3000/api 
    .then(response => response.json())
    .then(data => { 
        const todosList = document.getElementById("todo");
        data.todos.forEach(todo => { 
            const listItem = document.createElement("li");
            listItem.textContent = `${todo.task} ${todo.completed ? '(Completed)': ''}`;
            todosList.appendChild(listItem);
        })
    })
    .catch(error => console.error('Error fetching todos:', error));
}

function postTodo() { 
    let userInput = document.getElementById("userInput").value; 
    if (!userInput.trim()) { 
        alert("Please enter a task.");
        return;
    }
    fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: userInput})
    })
    .then(response => response.json())
    .then(data => { 
        console.log('Todo added:', data);
        document.getElementById("userInput").value = ''; // clear input
    })
    .catch(error => console.error('Error:', error));
}