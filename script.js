document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const routineTitle = document.getElementById('routineTitle');
    const routineDay = document.getElementById('routineDay');
    const timeSlots = document.getElementById('timeSlots');
    const activitySlots = document.getElementById('activitySlots');
    const statusSlots = document.getElementById('statusSlots');
    const newRoutineBtn = document.getElementById('newRoutineBtn');
    const saveRoutineBtn = document.getElementById('saveRoutineBtn');
    const loadRoutineBtn = document.getElementById('loadRoutineBtn');
    const routineList = document.getElementById('routineList');
    const addTimeSlotBtn = document.getElementById('addTimeSlotBtn');
    const printRoutineBtn = document.getElementById('printRoutineBtn');
    const clearRoutineBtn = document.getElementById('clearRoutineBtn');
    const notification = document.getElementById('notification');

    // Sample data for demonstration
    let routines = JSON.parse(localStorage.getItem('routines')) || [];
    let currentRoutineId = null;

    // Initialize the app
    function init() {
        renderRoutineList();
        addDefaultTimeSlots();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        newRoutineBtn.addEventListener('click', createNewRoutine);
        saveRoutineBtn.addEventListener('click', saveRoutine);
        loadRoutineBtn.addEventListener('click', () => {
            if (routines.length === 0) {
                showNotification('No routines saved yet');
                return;
            }
            // Just show the list, clicking on items will load them
        });
        addTimeSlotBtn.addEventListener('click', addTimeSlot);
        printRoutineBtn.addEventListener('click', printRoutine);
        clearRoutineBtn.addEventListener('click', clearRoutine);
    }

    // Add default time slots
    function addDefaultTimeSlots() {
        const defaultTimes = [
            '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
            '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
            '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
            '9:00 PM', '10:00 PM'
        ];

        defaultTimes.forEach(time => {
            addTimeSlot(time);
        });
    }

    // Add a new time slot
    function addTimeSlot(time = '') {
        // Time slot
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.innerHTML = `
            <input type="time" value="${time || ''}" class="time-input">
            <span class="delete-slot"><i class="fas fa-times"></i></span>
        `;
        timeSlots.appendChild(timeSlot);

        // Activity slot
        const activitySlot = document.createElement('div');
        activitySlot.className = 'activity-slot';
        activitySlot.innerHTML = `
            <input type="text" placeholder="Enter activity">
            <span class="delete-slot"><i class="fas fa-times"></i></span>
        `;
        activitySlots.appendChild(activitySlot);

        // Status slot
        const statusSlot = document.createElement('div');
        statusSlot.className = 'status-slot';
        statusSlot.innerHTML = `
            <input type="checkbox" class="status-checkbox">
            <span class="delete-slot"><i class="fas fa-times"></i></span>
        `;
        statusSlots.appendChild(statusSlot);

        // Set up delete buttons
        const deleteButtons = [timeSlot, activitySlot, statusSlot].map(el => 
            el.querySelector('.delete-slot')
        );
        
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                timeSlot.remove();
                activitySlot.remove();
                statusSlot.remove();
            });
        });

        // Convert time input to 12-hour format if a time was provided
        if (time) {
            const timeInput = timeSlot.querySelector('.time-input');
            timeInput.value = convertTo24Hour(time);
        }
    }

    // Convert 12-hour time to 24-hour format for input
    function convertTo24Hour(time12) {
        const [time, modifier] = time12.split(' ');
        let [hours, minutes] = time.split(':');
        
        if (hours === '12') {
            hours = '00';
        }
        
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        
        return `${hours}:${minutes}`;
    }

    // Create a new routine
    function createNewRoutine() {
        routineTitle.value = 'My Daily Routine';
        routineDay.value = 'Everyday';
        
        // Clear all slots
        timeSlots.innerHTML = '';
        activitySlots.innerHTML = '';
        statusSlots.innerHTML = '';
        
        // Add default slots
        addDefaultTimeSlots();
        
        currentRoutineId = null;
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
        
        // Get all time slots
        const timeInputs = Array.from(document.querySelectorAll('.time-input'));
        const activityInputs = Array.from(document.querySelectorAll('.activity-slot input'));
        const statusCheckboxes = Array.from(document.querySelectorAll('.status-checkbox'));
        
        const slots = timeInputs.map((timeInput, index) => ({
            time: formatTimeDisplay(timeInput.value),
            activity: activityInputs[index].value,
            completed: statusCheckboxes[index].checked
        }));
        
        const routine = {
            id: currentRoutineId || Date.now().toString(),
            title,
            day,
            slots,
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

    // Format time for display (24h to 12h)
    function formatTimeDisplay(time24) {
        if (!time24) return '';
        
        const [hours, minutes] = time24.split(':');
        let period = 'AM';
        let hours12 = parseInt(hours, 10);
        
        if (hours12 >= 12) {
            period = 'PM';
            if (hours12 > 12) hours12 -= 12;
        }
        
        if (hours12 === 0) hours12 = 12;
        
        return `${hours12}:${minutes} ${period}`;
    }

    // Load a routine
    function loadRoutine(id) {
        const routine = routines.find(r => r.id === id);
        if (!routine) return;
        
        currentRoutineId = routine.id;
        routineTitle.value = routine.title;
        routineDay.value = routine.day;
        
        // Clear all slots
        timeSlots.innerHTML = '';
        activitySlots.innerHTML = '';
        statusSlots.innerHTML = '';
        
        // Add slots from the routine
        routine.slots.forEach(slot => {
            addTimeSlot(slot.time);
            
            // Set activity and status for the last added slot
            const activityInputs = document.querySelectorAll('.activity-slot input');
            const statusCheckboxes = document.querySelectorAll('.status-checkbox');
            
            if (activityInputs.length > 0) {
                const lastIndex = activityInputs.length - 1;
                activityInputs[lastIndex].value = slot.activity;
                statusCheckboxes[lastIndex].checked = slot.completed;
            }
        });
        
        showNotification('Routine loaded');
    }

    // Render the list of saved routines
    function renderRoutineList() {
        routineList.innerHTML = '';
        
        if (routines.length === 0) {
            routineList.innerHTML = '<li>No routines saved yet</li>';
            return;
        }
        
        routines.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        routines.forEach(routine => {
            const li = document.createElement('li');
            li.textContent = routine.title;
            li.title = `Day: ${routine.day}\nCreated: ${new Date(routine.createdAt).toLocaleDateString()}`;
            li.addEventListener('click', () => loadRoutine(routine.id));
            routineList.appendChild(li);
        });
    }

    // Print the current routine
    function printRoutine() {
        // You could implement a print-specific styling here
        window.print();
    }

    // Clear the current routine
    function clearRoutine() {
        if (confirm('Are you sure you want to clear this routine?')) {
            createNewRoutine();
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification';
        
        // Set color based on type
        if (type === 'error') {
            notification.style.backgroundColor = var(--danger-color);
        } else if (type === 'warning') {
            notification.style.backgroundColor = var(--warning-color);
        } else {
            notification.style.backgroundColor = var(--success-color);
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Initialize the app
    init();
});
