document.addEventListener('DOMContentLoaded', () => {
    // DOM elements by ID
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskPopup = document.getElementById('taskPopup');
    const noTaskMessage = document.getElementById('noTaskMessage');
    const noTaskImage = document.getElementById('noTaskImage');

    // Get references to the edit and delete popups and close buttons
    const editPopup = document.getElementById('editPopup');
    const deletePopup = document.getElementById('deletePopup');
    const editCloseBtn = document.getElementById('editCloseBtn');
    const deleteNoBtn = document.getElementById('deleteNoBtn');
    const editTaskInput = document.getElementById('editTaskInput');

    // Cross button to close the taskpopup (Mark the states)
    const closePopupBtn = document.createElement('button');

    // Add cross icon to popup for manual close
    closePopupBtn.innerHTML = '&times;';
    closePopupBtn.className = 'close-popup-btn text-purple-900 font-bold text-xl absolute top-2 right-2 cursor-pointer';
    taskPopup.appendChild(closePopupBtn);

    // All tasks
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    // Load tasks from local storage (whenn page refresh)
    loadTasks();

    // Add task
    addTaskBtn.addEventListener('click', addTask);

    // Add event listner to add task on pressing the enter
    taskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Add Task Function
    function addTask() {
        const taskText = taskInput.value.trim();

        // Necessary Checks
        if (taskText === '') {
            alert('Please enter a task');
            return;
        };

        if (taskText.length > 255) {
            alert("Task text cannot be greater than 255 characters.");
            return;
        };

        // Create an object to store the task
        const task = {
            id: Date.now(),
            text: taskText,
            // By default, assign an incomplete state to the task
            status: 'incomplete'
        };

        // Add the task to the beginning of the list
        tasks.unshift(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = '';

        // Clear the task list and render all tasks to maintain the correct order
        taskList.innerHTML = '';
        loadTasks();
    }

    // Function to load all the tasks from storage
    function loadTasks() {
        taskList.innerHTML = ''; // Clear the list before loading

        if (tasks.length === 0) {
            // Show the no task message and image if there are no tasks in the list
            noTaskMessage.style.display = 'block';
            noTaskImage.style.display = 'block';
        } else {
            // Hide the no task message and image if there are tasks
            noTaskMessage.style.display = 'none';
            noTaskImage.style.display = 'none';
            tasks.forEach(task => {
                renderTask(task);
            });
        }
    }

    // Function to render the single task
    function renderTask(task) {
        // Assign the icon and bg color on the basis of status
        // By Default
        let icon = '';
        let bgColor = 'bg-white';

        switch (task.status) {
            case 'done':
                icon = '<i class="fas fa-check-circle text-green-500 text-sm"></i>';
                bgColor = 'bg-green-100';
                break;
            case 'waiting-for-approval':
                icon = '<i class="fas fa-check-circle text-blue-500 text-sm"></i>';
                bgColor = 'bg-blue-100';
                break;
            case 'in-progress':
                icon = '<i class="fas fa-spinner text-yellow-500 text-sm"></i>';
                bgColor = 'bg-yellow-100';
                break;
            case 'cancelled':
                icon = '<i class="fas fa-ban text-gray-500 text-sm"></i>';
                bgColor = 'bg-gray-100';
                break;
            default:
                icon = '<i class="fa-solid fa-circle-exclamation text-red-500 text-sm"></i>';
                bgColor = 'bg-red-100';
        }

        // Create a new li for the task
        const taskItem = document.createElement('li');
        taskItem.className = `${bgColor} text-black p-3 rounded-lg flex justify-between items-center lg:transition lg:duration-300 lg:ease-in-out lg:transform lg:hover:scale-95 lg:hover:bg-${bgColor} `;

        taskItem.innerHTML = `
            <div class="flex items-start" style="flex-basis: 70%; min-width: 0%;">
                <span class="mr-2">${icon}</span>
                <div class="flex-1">
                    <h3 class="text text-md pr-2 font-bold text-gray-900 break-words ${task.status === 'cancelled' ? 'line-through' : ''}">
                        ${task.text}
                    </h3>
                    <p class="task-status text-sm text-${getStatusColor(task.status)}-500">${task.status}</p>
                </div>
            </div>
            <div class="flex items-center gap-2 lg:ml-24" style="flex-basis: 30%;">
                <button class="edit-btn text-blue-500">
                    <i class="fas fa-pencil-alt text-sm text-purple-700"></i>
                </button>
                <button class="delete-btn text-red-500 mx-2">
                    <i class="fas fa-trash text-sm"></i>
                </button>
                <button class="status-btn text-blue-500">
               <svg class="text-purple-700 mt-1 text-lg" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="currentColor" d="M16 2H7.979C6.88 2 6 2.88 6 3.98V12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 10H8V4h8zM4 10H2v6c0 1.1.9 2 2 2h6v-2H4z"/></svg>
                </button>
            </div>
        `;
        taskList.appendChild(taskItem);

        // Event listners on buttons to handle th edit , delete and states
        const editBtn = taskItem.querySelector('.edit-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        const statusBtn = taskItem.querySelector('.status-btn');

        editBtn.addEventListener('click', () => editTask(task));
        deleteBtn.addEventListener('click', () => deleteTask(task.id, taskItem));
        statusBtn.addEventListener('click', () => toggleStatusPopup(task, taskItem));
    }

    // Edit task function
    function editTask(task) {
        // Set the current task text in the edit input field
        editTaskInput.value = task.text;

        // Show the edit popup
        editPopup.classList.remove('hidden');

        // Handle the update action
        document.getElementById('editOkBtn').onclick = () => {
            const newText = editTaskInput.value.trim();

            // Necessary Checks
            if (newText !== '' && newText.length < 255) {
                task.text = newText;
                updateTasks();
                editPopup.classList.add('hidden'); // Close popup after editing
            }
        };
    }

    // Delete task function
    function deleteTask(id, taskItem) {
        // Show the delete confirmation popup
        deletePopup.classList.remove('hidden');

        // Handle the delete confirmation
        document.getElementById('deleteYesBtn').onclick = () => {
            tasks = tasks.filter(task => task.id !== id);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            taskItem.remove();
            deletePopup.classList.add('hidden'); // Close popup after deletion
            loadTasks();
        };
    }

    // Close popups when clicking the cancel buttons
    editCloseBtn.addEventListener('click', () => {
        editPopup.classList.add('hidden');
    });

    deleteNoBtn.addEventListener('click', () => {
        deletePopup.classList.add('hidden');
    });

    // Close popups when clicking outside the popup content
    window.addEventListener('click', (event) => {
        if (event.target === editPopup) {
            editPopup.classList.add('hidden');
        } else if (event.target === deletePopup) {
            deletePopup.classList.add('hidden');
        }
    });

    // Close Status popup Function
    function closeStatusPopup() {
        taskPopup.classList.remove('active');
    }

    // Toggle stataus popup (used by status btn icon in li)
    function toggleStatusPopup(task, taskItem) {
        // Check if the popup is already open
        if (taskPopup.classList.contains('active')) {
            closeStatusPopup();
        } else {
            openStatusPopup(task, taskItem);
        }
    }

    // Open Status popup Function
    function openStatusPopup(task, taskItem) {
        taskPopup.classList.add('active');

        const closePopup = () => {
            taskPopup.classList.remove('active');
        };

        // event listeners for states button (done, incomplete, in progress, cancel, waiting for approval)
        taskPopup.querySelector('.incomplete').onclick = () => setStatus(task, 'incomplete', taskItem, closePopup);
        taskPopup.querySelector('.mark-done').onclick = () => setStatus(task, 'done', taskItem, closePopup);
        taskPopup.querySelector('.waiting-for-approval').onclick = () => setStatus(task, 'waiting-for-approval', taskItem, closePopup);
        taskPopup.querySelector('.in-progress').onclick = () => setStatus(task, 'in-progress', taskItem, closePopup);
        taskPopup.querySelector('.cancel').onclick = () => setStatus(task, 'cancelled', taskItem, closePopup);
        closePopupBtn.onclick = closePopup;

        // Close the task popup if clicks outside
        taskPopup.addEventListener('click', (event) => {
            if (event.target === taskPopup) {
                closePopup();
            }
        });
    }

    // Set status function to update the specific li
    function setStatus(task, status, taskItem, closePopup) {
        task.status = status;

        // Update the task status in local storage
        tasks = tasks.map(t => t.id === task.id ? { ...t, status: status } : t);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        const statusElement = taskItem.querySelector('.task-status');
        const textElement = taskItem.querySelector('h3');

        // Update status text, icon, background color, and text style on status
        let icon = '';
        let bgColor = 'bg-white'; // Default background color

        switch (status) {
            case 'done':
                icon = '<i class="fas fa-check-circle text-green-500 text-sm"></i>';
                bgColor = 'bg-green-100';
                textElement.classList.remove('line-through');
                break;
            case 'waiting-for-approval':
                icon = '<i class="fas fa-check-circle text-blue-500 text-sm"></i>';
                bgColor = 'bg-blue-100';
                textElement.classList.remove('line-through');
                break;
            case 'in-progress':
                icon = '<i class="fas fa-spinner text-yellow-500 text-sm"></i>';
                bgColor = 'bg-yellow-100';
                textElement.classList.remove('line-through');
                break;
            case 'cancelled':
                icon = '<i class="fas fa-ban text-gray-500 text-sm"></i>';
                bgColor = 'bg-gray-100';
                textElement.classList.add('line-through');
                break;
            default:
                icon = '<i class="fa-solid fa-circle-exclamation text-red-500"></i>';
                bgColor = 'bg-red-100';
                textElement.classList.remove('line-through');
        }

        // Update the task item background color, icon, and text
        taskItem.className = `${bgColor} text-black p-3 rounded-lg flex justify-between items-center`;
        taskItem.querySelector('span').innerHTML = icon;
        statusElement.textContent = status;
        statusElement.className = `task-status text-${getStatusColor(status)}-500`;

        if (closePopup) closePopup();
    }


    // Update localStorage and re-render the tasks
    function updateTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    }

    // Get color based on status
    function getStatusColor(status) {
        switch (status) {
            case 'done':
                return 'green';
            case 'waiting-for-approval':
                return 'blue';
            case 'in-progress':
                return 'yellow';
            case 'incomplete':
                return 'red';
            case 'cancelled':
                return 'gray';
            default:
                return 'white';
        }
    }
});
