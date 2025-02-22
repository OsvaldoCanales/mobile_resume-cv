
/// Extracts user's name and sends a GET Request to 3000/api route.
/// We then send a request to the api route and get a response. 
/// and we then display the message back.
function fetchTodos(filter='') { 

    let url = `http://localhost:3000/api/todos`;

    if (filter === 'completed') { 
        url += '?completed=true';
    }
    else if(filter === 'incomplete') { 
        url += '?completed=false';
    }

    fetch(url) // Get Request
    .then(response => response.json())
    .then(data => { 
        const todosList = document.getElementById("todos");

        if (!data.todos || data.todos.length === 0) { 
            alert(" Error 404: No Completed Tasks. Note: Feature to complete tasks not implemented yet. This is to demonstrate 404 on backend.");
        }
        todosList.innerHTML = '';
        data.todos.forEach(todo => { 
            const listItem = document.createElement("li");
            listItem.textContent = `${todo.task} ${todo.completed ? '(Completed)' : ' (Incomplete)'}`;
            todosList.appendChild(listItem);
        })
    })
    .catch(error => console.error('Error fetching todos:', error));
}

function postTodo() { 
    let userInput = document.getElementById("userInput").value; 
    if (!userInput.trim()) { 
        alert(" Error 404: Please enter a task.");
    }
    fetch('http://localhost:3000/api/todos', {
        method: 'POST', // We have to specify POST
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({task: userInput})
    })
    .then(response => response.json())
    .then(data => { 
        document.getElementById("userInput").value = ''; // clear input
    })
    .catch(error => console.error('Error:', error));
}