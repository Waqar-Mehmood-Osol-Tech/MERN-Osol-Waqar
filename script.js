document.addEventListener('DOMContentLoaded', () => {
    // DOM elements by ID
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskPopup = document.getElementById('taskPopup');
    const noTaskMessage = document.getElementById('noTaskMessage');
    const noTaskImage = document.getElementById('noTaskImage');

    // Get references to the edit and delete popups, close buttons, success and error popups
    const editPopup = document.getElementById('editPopup');
    const deletePopup = document.getElementById('deletePopup');
    const editCloseBtn = document.getElementById('editCloseBtn');
    const deleteNoBtn = document.getElementById('deleteNoBtn');
    const editTaskInput = document.getElementById('editTaskInput');
    const errorPopup = document.getElementById('errorPopup');
    const err1 = document.getElementById('err1');
    const successPopup = document.getElementById('successPopup');
    const success1 = document.getElementById('success1');
    const editErr = document.getElementById('editErr');

    // Cross button to close the taskpopup (Mark the states popup)
    const closePopupBtn = document.createElement('button');

    // Add cross icon to popup for manual close
    closePopupBtn.innerHTML = '&times;';
    closePopupBtn.className = 'close-popup-btn text-purple-900 font-bold text-xl absolute top-2 right-2 cursor-pointer';
    taskPopup.appendChild(closePopupBtn);

    // All tasks
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    // Load tasks from local storage (whenn page refresh)
    loadTasks();

    // Add task event listner
    addTaskBtn.addEventListener('click', addTask);

    // Add event listner to add task on pressing the enter
    taskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Add a event listner on the enter key to confirm update task
    editTaskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('editOkBtn').click();
        }
    });


    // Add Task Function
    function addTask() {
        const taskText = taskInput.value.trim();

        // Necessary Checks
        if (taskText === '') {
            err1.innerHTML = 'Empty value not accepted!';
            errorPopup.classList.remove('hidden');
            setTimeout(function () {
                errorPopup.classList.add('hidden');
            }, 1000); // 1000 ms = 2 seconds
            return;
        };

        if (taskText.length > 50) {
            err1.innerHTML = 'Task length cannot be greater than 50 characters!';
            errorPopup.classList.remove('hidden');
            setTimeout(function () {
                errorPopup.classList.add('hidden');
            }, 1000); // 1000 ms = 2 seconds
            return;
        };

        // Create an object to store the task
        const task = {
            id: Date.now(),
            text: taskText,
            // By default, we assign incomplete state to the task
            status: 'incomplete',
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

    // Initialize Sortable to add the functionality of the Drag and Drop in the Task List
    const sortable = Sortable.create(taskList, {
        handle: '.draggable-handle',
        onEnd: (event) => {
            // Update task order in localStorage after reordering
            const reorderedTasks = Array.from(taskList.children).map(li => {
                return tasks.find(task => task.id === parseInt(li.getAttribute('data-id')));
            });
            tasks = reorderedTasks;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    });

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
        taskItem.className = `${bgColor} text-black p-3 rounded-lg flex justify-between items-center lg:hover:bg-${bgColor} ;`
        taskItem.setAttribute('data-id', task.id);

        taskItem.innerHTML = `
            <div class="draggable-handle flex items-start" style="flex-basis: 70%; min-width: 0%;">
                <span class="mr-2 ml-2 text-sm">${icon}</span>
                <div class="flex-1">
                    <h3 class="text text-sm pr-2 font-bold text-gray-900 break-words ${task.status === 'cancelled' ? 'line-through' : ''}">
                        ${task.text}
                    </h3>
                    <p class="task-status text-xs text-${getStatusColor(task.status)}-500">${task.status}</p>
                </div>
            </div>
            <div class="flex items-center gap-2 lg:ml-24 lg:gap-4 lg:pl-4" >
                <button class="edit-btn text-blue-500">
                    <i class="fas fa-pencil-alt text-xs text-purple-700"></i>
                </button>
                <button class="delete-btn text-red-500 mx-2" >
                    <i class="fas fa-trash text-xs"></i>
                </button>
                <button class="status-btn text-blue-500"  >
                <svg class="text-purple-700 mt-1.5 font-bold " xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 8 8"><path fill="currentColor" d="M0 0v7h7V3.41l-1 1V6H1V1h3.59l1-1zm7 0L4 3L3 2L2 3l2 2l4-4z"/></svg>    
                </button>
            </div>
        `;

        taskList.appendChild(taskItem);

        // Event listners on buttons to handle th edit , delete and states of a specific task
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
            const prevTextVal = task.text;
            const newText = editTaskInput.value.trim();
            // Necessary Checks
            if (newText === '') {
                editErr.innerHTML = 'Empty value not accepted!';
                editErr.classList.remove('hidden');
                setTimeout(function () {
                    editErr.classList.add('hidden');
                    editTaskInput.value = task.text; // Reset the input field to the original task text
                }, 2000); // 2000 ms = 2 seconds
            }
            else if (newText.length > 50) {
                editErr.innerHTML = 'Task length must be in 50 characters!';
                editErr.classList.remove('hidden');
                setTimeout(function () {
                    editErr.classList.add('hidden');
                    editTaskInput.value = task.text; // Reset the input field to the original task text
                }, 2000); // 2000 ms = 2 seconds
            }
            else {
                task.text = newText;
                updateTasks();
                editPopup.classList.add('hidden'); // Close popup after editing
                success1.innerHTML = `Task edited from '${prevTextVal}' to '${newText}'.`
                successPopup.classList.remove('hidden');
                setTimeout(function () {
                    successPopup.classList.add('hidden');
                }, 2000); // 2000 ms = 2 seconds
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
            success1.innerHTML = 'Task deleted successfully!';
            successPopup.classList.remove('hidden');
            setTimeout(function () {
                successPopup.classList.add('hidden');
            }, 500); // 2000 ms = 2 seconds
            loadTasks();
            return;
        };
    }

    // Close popups when clicking the cancel buttons in edit and delete popups
    editCloseBtn.addEventListener('click', () => {
        editPopup.classList.add('hidden');
    });

    deleteNoBtn.addEventListener('click', () => {
        deletePopup.classList.add('hidden');
    });

    // Close popups when clicking outside the popups content (edit, delete and mark states popup)
    window.addEventListener('click', (event) => {
        if (event.target === editPopup) {
            editPopup.classList.add('hidden');
        } else if (event.target === deletePopup) {
            deletePopup.classList.add('hidden');
        } else if (taskPopup.classList.contains('active') && !taskPopup.contains(event.target) && !event.target.closest('.status-btn')) {
            taskPopup.classList.remove('active');

            // Remove any specific styles or changes when the popup is closed
            const taskItems = document.querySelectorAll('li[data-id]');
            taskItems.forEach((taskItem) => {
                taskItem.style.border = 'none';
            });
        }

    });

    // Close Status popup function
    function closeStatusPopup(taskItem) {
        taskItem.style.transition = 'none';
        taskItem.style.border = 'none';
        taskPopup.classList.remove('active');
    }

    // Toggle Status popup function
    function toggleStatusPopup(task, taskItem) {
        event.stopPropagation();

        const originalBorderStyle = taskItem.style.border;
        // Check if the popup is already open
        if (taskPopup.classList.contains('active')) {
            closeStatusPopup(taskItem);
            // Restore the original border style
        } else {
            openStatusPopup(task, taskItem);
            // Add border with a transition effect
            taskItem.style.transition = 'border 0.2s ease-out-in';
            taskItem.style.border = '4px solid #570987';
            // Add an event listener to get the original border style when popup is closed
            taskPopup.addEventListener('click', () => {
                closeStatusPopup(taskItem);
                taskItem.style.border = originalBorderStyle;
            });
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
            event.stopPropagation();
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

        // adding a delay before re-rendering the task list
        setTimeout(() => {
            loadTasks();
        }, 100);

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