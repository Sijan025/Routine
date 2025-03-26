document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const routineTitle = document.getElementById('routineTitle');
    const routineDay = document.getElementById('routineDay');
    const routineTimeline = document.getElementById('routineTimeline');
    const newRoutineBtn = document.getElementById('newRoutineBtn');
    const saveRoutineBtn = document.getElementById('saveRoutineBtn');
    const routineList = document.getElementById('routineList');
    const addBlockBtn = document.getElementById('addBlockBtn');
    const currentTimeDisplay = document.querySelector('.current-time');
    const notification = document.getElementById('notification');

    // State
    let routines = JSON.parse(localStorage.getItem('routines')) || [];
    let currentRoutineId = null;
    let draggedItem = null;

    // Initialize the app
    function init() {
        renderRoutineList();
        updateCurrentTime();
        setInterval(updateCurrentTime, 60000); // Update time every minute
        setupEventListeners();
        setupDragAndDrop();
        
        // Create a default routine if none exists
        if (routines.length === 0) {
            createNewRoutine();
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        newRoutineBtn.addEventListener('click', createNewRoutine);
        saveRoutineBtn.addEventListener('click', saveRoutine);
        addBlockBtn.addEventListener('click', addTimeBlock);
    }

    // Set up drag and drop functionality
    function setupDragAndDrop() {
        routineTimeline.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('time-block')) {
                draggedItem = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', ''); // Required for Firefox
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        routineTimeline.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('time-block')) {
                e.target.classList.remove('dragging');
                draggedItem = null;
            }
        });

        routineTimeline.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(routineTimeline, e.clientY);
            const currentElement = document.querySelector('.dragging');
            
            if (afterElement == null) {
                routineTimeline.appendChild(currentElement);
            } else {
                routineTimeline.insertBefore(currentElement, afterElement);
            }
        });
    }

    // Helper function for drag and drop positioning
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.time-block:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Update current time display
    function updateCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        currentTimeDisplay.textContent = `${hours}:${minutes}`;
        
        // Highlight current time block (simplified for demo)
        highlightCurrentTimeBlock(now);
    }

    // Highlight the time block that should be active now
    function highlightCurrentTimeBlock(now) {
        const blocks = document.querySelectorAll('.time-block');
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        blocks.forEach(block => {
            block.classList.remove('current');
            
            const startTime = block.querySelector('.start-time').value;
            const endTime = block.querySelector('.end-time').value;
            
            if (startTime && endTime) {
                const [startHour, startMinute] = startTime.split(':').map(Number);
                const [endHour, endMinute] = endTime.split(':').map(Number);
                
                if ((currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) {
                    if (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
                        block.classList.add('current');
                        block.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        });
    }

    // Create a new time block
    function createTimeBlock(startTime = '', endTime = '', activity = '', completed = false) {
        const block = document.createElement('div');
        block.className = 'time-block';
        block.draggable = true;
        
        block.innerHTML = `
            <div class="time-block-header">
                <div class="time-range">
                    <input type="time" class="start-time" value="${startTime}">
                    <span class="time-separator">-</span>
                    <input type="time" class="end-time" value="${endTime}">
                </div>
                <div class="block-actions">
                    <button class="block-action-btn delete-block">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="block-content">
                <input type="text" class="activity-input" placeholder="What are you doing?" value="${activity}">
                <label class="completion-toggle-container">
                    <input type="checkbox" class="completion-toggle" ${completed ? 'checked' : ''}>
                </label>
            </div>
        `;
        
        // Add event listeners for the new block
        const deleteBtn = block.querySelector('.delete-block');
        deleteBtn.addEventListener('click', () => {
            block.remove();
        });
        
        return block;
    }

    // Add a new time block to the timeline
    function addTimeBlock() {
        const now = new Date();
        const nextHour = now.getHours() + 1;
        const startTime = `${nextHour.toString().padStart(2, '0')}:00`;
        const endTime = `${(nextHour + 1).toString().padStart(2, '0')}:00`;
        
        const newBlock = createTimeBlock(startTime, endTime);
        routineTimeline.appendChild(newBlock);
        
        // Scroll to the new block
        newBlock.scrollIntoView({ behavior: 'smooth' });
    }

    // Create a new routine
    function createNewRoutine() {
        routineTitle.value = 'My Routine';
        routineDay.value = 'daily';
        routineTimeline.innerHTML = '';
        
        // Add some default blocks
        const morningBlock = createTimeBlock('07:00', '08:00', 'Morning routine');
        const workBlock = createTimeBlock('09:00', '12:00', 'Work session');
        const lunchBlock = createTimeBlock('12:00', '13:00', 'Lunch break');
        
        routineTimeline.appendChild(morningBlock);
        routineTimeline.appendChild(workBlock);
        routineTimeline.appendChild(lunchBlock);
        
        currentRoutineId = Date.now().toString();
        showNotification('New routine created');
    }

    // Save the current routine
    function saveRoutine() {
        const title = routineTitle.value.trim();
        const day = routineDay.value;
        
        if (!title) {
            showNotification('Please enter a routine title', 'error');
            return;
        }
        
        // Collect all time blocks
        const blocks = Array.from(document.querySelectorAll('.time-block'));
        const routineData = blocks.map(block => {
            return {
                startTime: block.querySelector('.start-time').value,
                endTime: block.querySelector('.end-time').value,
                activity: block.querySelector('.activity-input').value,
                completed: block.querySelector('.completion-toggle').checked
            };
        });
        
        const routine = {
            id: currentRoutineId || Date.now().toString(),
            title,
            day,
            blocks: routineData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Update or add the routine
        if (currentRoutineId) {
            const index = routines.findIndex(r => r.id === currentRoutineId);
            if (index !== -1) {
                routines[index] = routine;
            }
        } else {
            routines.push(routine);
            currentRoutineId = routine.id;
        }
        
        // Save to localStorage
        localStorage.setItem('routines', JSON.stringify(routines));
        renderRoutineList();
        showNotification('Routine saved successfully');
    }

    // Load a routine
    function loadRoutine(id) {
        const routine = routines.find(r => r.id === id);
        if (!routine) return;
        
        currentRoutineId = routine.id;
        routineTitle.value = routine.title;
        routineDay.value = routine.day;
        routineTimeline.innerHTML = '';
        
        // Add all blocks from the routine
        routine.blocks.forEach(blockData => {
            const block = createTimeBlock(
                blockData.startTime,
                blockData.endTime,
                blockData.activity,
                blockData.completed
            );
            routineTimeline.appendChild(block);
        });
        
        // Update active state in the list
        const listItems = document.querySelectorAll('#routineList li');
        listItems.forEach(item => {
            item.classList.toggle('active', item.dataset.id === id);
        });
        
        showNotification('Routine loaded');
    }

    // Render the list of saved routines
    function renderRoutineList() {
        routineList.innerHTML = '';
        
        if (routines.length === 0) {
            routineList.innerHTML = '<li class="empty">No routines saved yet</li>';
            return;
        }
        
        // Sort by most recently updated
        routines.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        routines.forEach(routine => {
            const li = document.createElement('li');
            li.textContent = routine.title;
            li.dataset.id = routine.id;
            li.innerHTML = `
                <i class="fas fa-calendar-day"></i>
                ${routine.title}
                <span class="routine-day">${routine.day}</span>
            `;
            
            li.addEventListener('click', () => loadRoutine(routine.id));
            routineList.appendChild(li);
        });
    }

    // Show notification
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification';
        
        // Set color based on type
        if (type === 'error') {
            notification.style.backgroundColor = 'var(--danger)';
        } else if (type === 'warning') {
            notification.style.backgroundColor = 'var(--warning)';
        } else {
            notification.style.backgroundColor = 'var(--primary)';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Initialize the app
    init();
});
