document.addEventListener('DOMContentLoaded', () => {
    // DOM elements by ID
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskPopup = document.getElementById('taskPopup');
    const noTaskMessage = document.getElementById('noTaskMessage'); 
    const noTaskImage = document.getElementById('noTaskImage'); 

    // Cross button to close the taskpopup (Mark the states)
    const closePopupBtn = document.createElement('button');

    // Add cross icon to popup for manual close
    closePopupBtn.innerHTML = '&times;';
    closePopupBtn.className = 'close-popup-btn text-black text-xl absolute top-2 right-2 cursor-pointer';
    taskPopup.appendChild(closePopupBtn);

    // All tasks
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    // Load tasks from local storage (whenn page refresh)
    loadTasks();

    // Add task
    addTaskBtn.addEventListener('click', addTask);

    // Add event listner to add task on pressing the Enter
    taskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Add Task Function
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

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
                icon = '<i class="fas fa-check-circle text-green-500"></i>';
                bgColor = 'bg-green-100';
                break;
            case 'waiting-for-approval':
                icon = '<i class="fas fa-check-circle text-blue-500"></i>';
                bgColor = 'bg-blue-100';
                break;
            case 'in-progress':
                icon = '<i class="fas fa-spinner text-yellow-500"></i>';
                bgColor = 'bg-yellow-100';
                break;
            case 'cancelled':
                icon = '<i class="fas fa-ban text-gray-500"></i>';
                bgColor = 'bg-gray-100';
                break;
            default:
                icon = '';
                bgColor = 'bg-red-100';
        }

        // Create a new li for the task
        const taskItem = document.createElement('li');
        taskItem.className = `${bgColor} text-black p-3 rounded-lg flex justify-between items-center hover:`;

        taskItem.innerHTML = `
            <div class="flex-1 mr-4" style="flex-basis: 70%; min-width: 0;">
                <h3 class="ttext text-xl font-bold text-gray-900 break-words ${task.status === 'cancelled' ? 'line-through' : ''}">
                    ${icon} ${task.text}
                </h3>
                <p class="task-status text-${getStatusColor(task.status)}-500">${task.status}</p>
            </div>
            <div class="flex items-center gap-2 lg:ml-24" style="flex-basis: 30%;">
                <button class="edit-btn text-blue-500">
                    <i class="fas fa-pencil-alt text-purple-700"></i>
                </button>
                <button class="delete-btn text-red-500 mx-2">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="status-btn text-blue-500">
                <i class="fa-solid fa-circle-chevron-down text-purple-700"></i>
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
        statusBtn.addEventListener('click', () => openStatusPopup(task, taskItem));
    }


    // Edit task Function
    function editTask(task) {
        const newText = prompt('Edit Task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText;
            updateTasks();
        }
    }

    // Delete task Function
    function deleteTask(id, taskItem) {
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskItem.remove();
        alert('Task deleted successfully');
        loadTasks();
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
        const textElement = taskItem.querySelector('.ttext');

        // Update status text, icon, background color, and text style on status
        let icon = '';
        let bgColor = 'bg-white'; // Default background color

        switch (status) {
            case 'done':
                icon = '<i class="fas fa-check-circle text-green-500"></i>';
                bgColor = 'bg-green-100';
                textElement.classList.remove('line-through');
                break;
            case 'waiting-for-approval':
                icon = '<i class="fas fa-check-circle text-blue-500"></i>';
                bgColor = 'bg-blue-100';
                textElement.classList.remove('line-through');
                break;
            case 'in-progress':
                icon = '<i class="fas fa-spinner text-yellow-500"></i>';
                bgColor = 'bg-yellow-100';
                textElement.classList.remove('line-through');
                break;
            case 'cancelled':
                icon = '<i class="fas fa-ban text-gray-500"></i>';
                bgColor = 'bg-gray-100';
                textElement.classList.add('line-through');
                break;
            default:
                icon = ''; // No icon for incomplete
                bgColor = 'bg-red-100';
                textElement.classList.remove('line-through');
        }

        // Update the task item background color, icon, and text
        taskItem.className = `${bgColor} text-black p-3 rounded-lg flex justify-between items-center`;
        textElement.innerHTML = `${icon} ${task.text}`;

        // Update status text and color
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
                return 'black';
        }
    }
});
