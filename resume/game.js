
const lieIndex = 0; // Lie 

const statements = document.querySelectorAll('.statement');
const submitButton = document.getElementById('submit');
const result = document.getElementById('result');

let selectedIndex = null;

// Need to add event listeners to all the statements 
statements.forEach( statement => { 
    statement.addEventListener('click', () => { 
        statements.forEach(s => s.classList.remove('selected')); // Removes all selected statements when a statement is clicked 
        statement.classList.add('selected');
        selectedIndex = statement.getAttribute('data-index');
    });
});

// Event listener to the submit button 
submitButton.addEventListener('click', () => { 
    if (selectedIndex === null ) { 
        result.textContent = 'Please select a statement before submitting.';
        return;
    }
    if (selectedIndex == lieIndex) { 
        result.textContent = 'Correct! That statement is the lie.';
    } else { 
        result.textContent = 'Incorrect! That statement is true.';
    }
})