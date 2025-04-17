
/// Extracts user's name and sends a GET Request to 3000/api route.
/// We then send a request to the api route and get a response. 
/// and we then display the message back.
function fetchTodos(filter='') { 
  let todoHeader = document.getElementById("todos-header");
  // let url = `http://localhost:3000/api/todos`;
  let url = `https://ocanales.duckdns.org/api/todos`;

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
  
  // Define the fetch logic as a function
  function doFetch() {
    fetch(url) // Get Request
      .then(response => response.json())
      .then(data => { 
        const todosList = document.getElementById("todos");
        todosList.innerHTML = '';
        data.todos.forEach(todo => { 
          const listItem = document.createElement("li");
          // Editable Button
          const editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.addEventListener("click", () => updateTodo(todo.id, taskSpan));

          const taskSpan = document.createElement("span");
          taskSpan.textContent = todo.task;

          // Created by 
          const createdBy = document.createElement("span");
          createdBy.textContent = ` (by ${todo.createdBy || "unknown"})`;

          // Created At 
          const createdAt = document.createElement("span");
          createdAt.textContent = ` (Created at ${new Date(todo.createdAt).toLocaleString()})`;

          // Delete Button
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.addEventListener("click", () => deleteTodo(todo.id, listItem));

          // Append elements
          listItem.appendChild(editButton);
          listItem.appendChild(taskSpan);
          listItem.appendChild(deleteButton);
          listItem.appendChild(createdBy);
          listItem.appendChild(createdAt);
          todosList.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error fetching todos:', error));
  }
  doFetch();  
  // Set up polling to fetch todos every 5 seconds
  setInterval(doFetch, 5000);
}

function postTodo() { 
    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;
    let userInput = document.getElementById("userInput").value; 
    let todoHeader = document.getElementById("todos-header");
    // let url = `http://localhost:3000/api/todos`;
    let url = `https://ocanales.duckdns.org/api/todos`;

    if (!userInput.trim()) { 
        alert(" Error 404: Please enter a task.");
    }
    fetch(url, {
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        },
        body: JSON.stringify({task: userInput})
    })
    .then(response => response.json())
    .then(data => { 
        addToDOM(data.todo);
        todoHeader.innerHTML = 'Recently added Todos: '
        document.getElementById("userInput").value = ''; // clear input
    })
    .catch(error => console.error('Error:', error));
}

function updateTodo(id, taskSpan) { 

    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;
    const currentText = taskSpan.textContent;

    const inputField = document.createElement("input");
    inputField.type = "text"; // Allows users to enter new text in a new field
    inputField.value = currentText;

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => { 
    const updatedTask = inputField.value.trim();
    // let url = `http://localhost:3000/api/todos/${id}`;
    let url = `https://ocanales.duckdns.org/api/todos/${id}`;

        if (updatedTask) { 
            fetch(url, { // Send PUT Request
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)},
                body: JSON.stringify( { task: updatedTask})
            })
            .then(response => response.json())
            .then(data => { 
                console.log('Todo updated:', data);
                taskSpan.textContent = updatedTask;
                resetEditView(taskSpan, inputField, saveButton);
            })
            .catch(error => console.error('Error updating todo: ', error));
        } else { 
            alert("Task cannot be empty!");
        }
    });

    // format 
    taskSpan.style.display = "none";
    taskSpan.parentNode.insertBefore(inputField, taskSpan);
    taskSpan.parentNode.insertBefore(saveButton, taskSpan.nextSibling);

}

function deleteTodo(id, listItem) { 
    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;
    if (confirm("Are you sure you want to delete this task?")) { // prompt confirmation to user
        // let url = `http://localhost:3000/api/todos/${id}`;
        let url = `https://ocanales.duckdns.org/api/todos/${id}`;
        fetch(url, { 
            method: 'DELETE',
            headers: {'Authorization': 'Basic ' + btoa(`${username}:${password}`)}
        })
        .then(response => response.json())
        .then(data => { 
            listItem.remove();
        }) 
        .catch(error => console.error("Failed to delete todo!: ", error));
    }
}

function createUser() {
    // Get admin credentials from the form
    const adminUsername = document.getElementById("admin-username").value;
    const adminPassword = document.getElementById("admin-password").value;
  
    // Get new user details from the form
    const newUsername = document.getElementById("new-username").value;
    const newPassword = document.getElementById("new-password").value;
    const newRole = document.getElementById("new-role").value;
  
    // const url = `http://localhost:3000/api/users`;
    let url = `https://ocanales.duckdns.org/api/users`;

  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${adminUsername}:${adminPassword}`)
      },
      body: JSON.stringify({
        username: newUsername,
        password: newPassword,
        role: newRole
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log("User creation response:", data);
        if (data.message) {
          alert(data.message);
        } else if (data.error) {
          alert("Error: " + data.error);
        }
      })
      .catch(error => console.error('Error creating user:', error));
}

function fetchUsers() {
    const adminUser = document.getElementById('admin-username').value;
    const adminPass = document.getElementById('admin-password').value;
    // const url = `http://localhost:3000/api/users`;
    let url = `https://ocanales.duckdns.org/api/users`;
  
    // function getUsers() {
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${adminUser}:${adminPass}`)
      }
    })
      .then(response => {
        if (!response.ok) {
          // Could be 401 (invalid creds) or 403 (not admin)
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        return response.json();
      })
      .then(users => {
        // Build table rows
        const tableBody = document.querySelector('#users-table tbody');
        tableBody.innerHTML = ''; // Clear old rows
        users.forEach(user => {
          const row = document.createElement('tr');
  
          // Username cell
          const usernameCell = document.createElement('td');
          usernameCell.textContent = user.username;
          row.appendChild(usernameCell);
  
          // Role cell
          const roleCell = document.createElement('td');
          roleCell.textContent = user.role;
          row.appendChild(roleCell);
  
          // Actions cell
          const actionsCell = document.createElement('td');
          
          // Delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.onclick = () => deleteUser(user.username, adminUser, adminPass);
          actionsCell.appendChild(deleteBtn);

              // Change Role button
          const changeRoleBtn = document.createElement('button');
          changeRoleBtn.textContent = 'Change Role';
          changeRoleBtn.onclick = () => {
            const newRole = prompt(`Enter new role for ${user.username} (current: ${user.role}):`);
            if (newRole && newRole !== user.role) {
              updateUserRole(user.username, newRole, adminUser, adminPass);
            }
          };
          actionsCell.appendChild(changeRoleBtn);
          row.appendChild(actionsCell);
          tableBody.appendChild(row);
        });
      })
      .catch(err => {
        console.error('Error:', err);
        alert('Failed to fetch users. Are you an admin?');
      });
    // }
    // getUsers();  
    // // Set up polling to fetch users every 5 seconds
    // setInterval(getUsers, 5000);
  }

  function updateUserRole(username, newRole, adminUser, adminPass) {
    // const url = `http://localhost:3000/api/users/${username}`;
    let url = `https://ocanales.duckdns.org/api/users/${username}`;

    fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + btoa(`${adminUser}:${adminPass}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newRole })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to update role: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        alert(data.message);
        // Refresh the user list after update
        fetchUsers();
      })
      .catch(err => {
        console.error('Error updating user role:', err);
        alert('Error updating user role.');
      });
  }
  
  function deleteUser(username, adminUser, adminPass) {
    // const url = `http://localhost:3000/api/users/${username}`;
    let url = `https://ocanales.duckdns.org/api/users/${username}`;

    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }
  
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${adminUser}:${adminPass}`)
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to delete user: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        alert(data.message);
        // Refresh the user list
        fetchUsers();
      })
      .catch(err => {
        console.error('Error:', err);
        alert('Error deleting user.');
      });
  }
  
function resetEditView(taskSpan, inputField, saveButton) { 
    taskSpan.style.display = "inline",
    inputField.remove();
    saveButton.remove();
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