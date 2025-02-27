
/// Extracts user's name and sends a GET Request to 3000/api route.
/// We then send a request to the api route and get a response. 
/// and we then display the message back.
function fetchTodos(filter='') { 
    let todoHeader = document.getElementById("todos-header");


    let url = `http://localhost:3000/api/todos`;

    if (filter === 'completed') { 
        todoHeader.innerHTML = 'Completed Todos: ';
        url += '?completed=true';
    }
    else if(filter === 'incomplete') { 
        todoHeader.innerHTML = 'Incomplete Todos: ';
        url += '?completed=false';
    } else {
        todoHeader.innerHTML = 'All todos: ';

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

            // Add checkbox
            const checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.checked = todo.completed;
            checkbox.addEventListener("change", () => updateTodo(todo.id, null, checkbox.checked));

            // Editable Task
            const taskSpan = document.createElement("span");
            taskSpan.textContent = todo.task;
            taskSpan.contentEditable = true;
            taskSpan.addEventListener("blur", () => updateTodo(todo.id, taskSpan.textContent, null));

            // Append elements
            // listItem.textContent = `${todo.task} ${todo.completed ? '(Completed)' : ' (Incomplete)'}`;
            listItem.appendChild(taskSpan);
            listItem.appendChild(checkbox);
            todosList.appendChild(listItem);
        })
    })
    .catch(error => console.error('Error fetching todos:', error));
}

function postTodo() { 
    let userInput = document.getElementById("userInput").value; 
    let todoHeader = document.getElementById("todos-header");

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
        addToDOM(data.todo);
        todoHeader.innerHTML = 'Recently added Todos: '
        document.getElementById("userInput").value = ''; // clear input
        alert("Todo added successfully!");
    })
    .catch(error => console.error('Error:', error));
}

function updateTodo(id, newTask = null, newCompleted = null) { 
    const updateData = {};
    if(newTask !== null) { 
        updateData.task = newTask;
    }
    if (newCompleted !== null) { 
        updateData.completed = newCompleted;
    }

    fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then (data => { 
        console.log('todo updated!', data);
    })
    .catch(error => console.error('Error updating: ', error));
}

// Note: So from my understanding. Ajax is a technique and not a function or library. 
// It allows us to send requests and recieve them back without refreshing the page. 
// There exists jQuery and XMLHttpRequest but they are old and not used anymore. We use fetch() still.  
function addToDOM(todo) { // add todo to the list automatically. 
    const todosList = document.getElementById("todos");
    const listItem = document.createElement("li");
    listItem.textContent = `${todo.task} ${todo.completed ? '(Completed)' : ''}`;
    todosList.appendChild(listItem);
}