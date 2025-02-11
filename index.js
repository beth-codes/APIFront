// Get the taskId from the URL query parameters
const taskIdUrlParam = new URLSearchParams(window.location.search);
const taskId = taskIdUrlParam.get('taskId');
const urlParams = new URLSearchParams(window.location.search);
const taskCategoryId = parseInt(urlParams.get('categoryId'));
const body = document.body;
let selectedCategoryId = null;
let UrlEndpoint = "https://tr-projeect-cbg9cvchhbg4bta9.ukwest-01.azurewebsites.net";

//Reuseables 
//reuseable shuffle click display function
function setupTabNavigation(navSelector, contentSelector, activeClass = 'active') {
    const navItems = document.querySelectorAll(navSelector);
    const contentItems = document.querySelectorAll(contentSelector);

    if (navItems.length && contentItems.length) {
        navItems[0].classList.add(activeClass);
        contentItems[0].classList.add(activeClass);
    }

    navItems.forEach(navItem => {
        navItem.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(`${navSelector}.${activeClass}`)?.classList.remove(activeClass);
            document.querySelector(`${contentSelector}.${activeClass}`)?.classList.remove(activeClass);

            this.classList.add(activeClass);
            document.querySelector(`${contentSelector}[data-id="${this.dataset.id}"]`)?.classList.add(activeClass);
        });
    });
}

// Check if user is not logged in and not already on login, register, home, or about us page
if (!localStorage.getItem('authToken')) {
    const currentPath = window.location.pathname;

    // Redirect to login page only if the user is not on allowed pages
    if (currentPath !== '/register/login.html' && 
        currentPath !== '/register/register.html' &&
        currentPath !== '/' && 
        currentPath !== '/about-us.html') {
        window.location.href = '/register/login.html';
    }
}

// Continue uncompleted task
function editTask(taskId, categoryId) {
    window.location.href = `/register/recommendation.html?categoryId=${categoryId}&taskId=${taskId}`;
}

// Attach click listeners to category buttons
function setupCategorySelection() {
    const categoryButtons = document.querySelectorAll("button[category-id]");
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            categoryButtons.forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            selectedCategoryId = button.getAttribute("category-id");
            window.location.href = `/register/book-task.html?categoryId=${selectedCategoryId}`;
        });
    });
}

//fetch category list
async function fetchCategories() {
    try {
        const response = await fetch(`${UrlEndpoint}/User/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error.message);
        return [];
    }
}

// render category list in selcet tag with options
function renderCategoryList(categories) {
    const categorySelect = document.getElementById('category-list');

    categories.map(category => {
        const categoryItems = category.category;
        const option = document.createElement('option');
        const optionValue = categoryItems.toLowerCase();
        option.value = optionValue;
        option.setAttribute('data-tasker-category', category.id)
        option.textContent = categoryItems;
        categorySelect.appendChild(option);
    });
}

// call fetched category list into render categorylist
async function categoryList() {
    const categories = await fetchCategories(); 
    renderCategoryList(categories);
}
// Select between user and tasker form
const selectFrom = document.querySelector('.select-from');
if(selectFrom){
    selectFrom.addEventListener('click', function (e) {
        if (e.target.tagName === 'SPAN') {
            selectFrom.querySelectorAll('span').forEach(el => el.classList.remove('active'));
            e.target.classList.add('active');
    
            if (e.target.classList.contains('js-register-user')) {
                registerForm.style.display = 'block';
                registerTaskerForm.style.display = 'none';
            } else {
                registerForm.style.display = 'none';
                registerTaskerForm.style.display = 'block';
            }
        }
    });
}

// submit register user form 
const registerForm = document.getElementById("register")
const registerUser = document.querySelector(".js-register-user.active")
if(registerUser){
    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();
        register();
    });
}
function displayError(message, appendError) {
    errorElement = document.createElement('small');
    errorElement.id = "error-message";
    errorElement.textContent = message;
    document.querySelector(appendError).appendChild(errorElement);
}
// register users form
function register() {
    const fullName = document.getElementById("full-name").value;
    const username = document.getElementById("user-name").value;
    const password = document.getElementById("passcode").value;
    const email = document.getElementById("email").value;

    async function asyncRegister() {
        try {
            const response = await fetch(`${UrlEndpoint}/User/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Fullname: fullName,
                    Username: username,
                    Password: password,
                    Email: email
                })
            })
            const responseData = await response.json();

            if (response.ok && responseData.statusCode === 200) {
                window.location.href = "/register/login.html";
            } else {
                displayError(responseData.message, "#register");
            }
        } catch (error) {
            console.error("User is not registered:", error.message);
        }
    }
    asyncRegister();
}

// submit register tasker form
const registerTaskerForm = document.getElementById('register-tasker');

if(registerTaskerForm){
    this.addEventListener("submit", function(e) {
        e.preventDefault();
        registerTasker();
    });

}
if (registerTaskerForm) {
    categoryList();
}
// Register tasker form
function registerTasker() {
    const fullName = document.getElementById("tasker-fullname").value;
    const username = document.getElementById("tasker-username").value;
    const email = document.getElementById("tasker-email").value;
    const password = document.getElementById("tasker-passcode").value;
    const skills = document.getElementById("tasker-skills").value;
    const experirnceLevel = document.getElementById("tasker-experience").value;
    const hourlyRate = parseInt(document.getElementById("tasker-rate").value);
    let categorySelect = document.getElementById("category-list");
    const categoryOption = categorySelect.value;
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    const taskerCategory = selectedOption.getAttribute("data-tasker-category");
    
    async function asyncRegisterTasker() {
        try {
            const response = await fetch(`${UrlEndpoint}/User/registertasker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: fullName,
                    userName: username,
                    password: password,
                    email: email,
                    Skills: skills,
                    ExperienceLevel: experirnceLevel,
                    HourlyRate: hourlyRate,
                    SelectedCategory: categoryOption,
                    categoryId: taskerCategory
                })
            });

            const responseData = await response.json();

            if (response.ok && responseData.statusCode === 200) {
                window.location.href = "/register/login.html";
            } else {
                displayError(responseData.message, "#register-tasker");
            }
        } catch (error) {
            console.error("Error:", error)
        }
    }
    asyncRegisterTasker();
}

// Submit login form
const loginID = document.getElementById("login")
if(loginID){
    this.addEventListener("submit", function(e) {
        e.preventDefault();
        loginForm();
    });
}

async function loginForm() {
    const usernameOrEmail = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${UrlEndpoint}/User/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error("Login failed");
        }
        localStorage.setItem('authToken', result.data.token);
        const loggedInUser = result.data.isTasker;
        if (loggedInUser.isTasker) {
            window.location.href = "/register/welcome-tasker.html";
        } else{
            window.location.href = "/register/welcome.html";
        }

    } catch (error) {
        displayError('Please try again. Username or password incorrect.', "#login")
    }
}

// check out payment for tasks
async function initiatePayment(taskerId, amount, assignedToId) {
    const response = await fetch(`${UrlEndpoint}/api/Payment/create-checkout-session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskerId,
            amount,
            assignedToId
        }),
    });

    const data = await response.json();
    if (response.ok) {
        const stripe = Stripe(data.pubKey);
        stripe.redirectToCheckout({ sessionId: data.sessionId });
    } else {
        console.error('Failed to create session:', data);
    }
}

// assign assignedtoid value
async function assignTaskToTasker(taskId, assignedToId) {
    const response = await fetch(`${UrlEndpoint}/User/task/${taskId}/assign`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            assignedToId
        }),
    });

    if (!response.ok) {
        console.error('Failed to assign task:', await response.text());
    }
}

// tasker list to be displayed after book a task form is completed
const usersList = document.getElementById("users-list");
function usersInfo() {
    async function getData() {
        const url = `${UrlEndpoint}/User/tasker-users`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const buttonDataMap = new Map();

            const json = await response.json();
            usersList.innerHTML = "";

            json.forEach(user => {
                if (user.categoryId == taskCategoryId) {
                    const taskerContainer = document.createElement('div');
                    taskerContainer.className = 'tasker-container';

                    const taskerInfo = `
                        <div class="tasker-info">
                            <div class="tasker-image">
                                <img src="https://images.unsplash.com/photo-1733521101235-192affad9fec?q=80&w=1740&auto=format&fit=crop" alt="Tasker Photo" />
                            </div>
                            <a class="profile-btn" href="#">View Profile</a>
                            <small>You can adjust task details, or change task time after booking.</small>
                        </div>
                    `;
                    const taskerDescription = `
                        <div class="tasker-description">
                            <p class="name">${user.user?.fullName || "N/A"}</p>
                            <p class="name">Rate: $${user.hourlyRate || "N/A"}</p>
                            <p class="task-details">${user.skills || "No Skills Provided"}</p>
                            <p>Experience Level: ${user.experienceLevel || "No Experience"}</p>
                        </div>
                    `;
                    taskerContainer.innerHTML = taskerInfo + taskerDescription;
                    // Create the button dynamically
                    const button = document.createElement('button');
                    button.className = 'continue-btn';
                    button.textContent = 'Select and Continue';

                    // Store data in a Map
                    buttonDataMap.set(button, {
                        taskerId: user.id,
                        rate: user.hourlyRate || "N/A",
                        assignedToId: user.userId || null
                    });

                    // Attach event listener
                    button.addEventListener('click', () => {
                        const { taskerId, rate, assignedToId } = buttonDataMap.get(button);
                        initiatePayment(taskerId, rate, assignedToId);
                        assignTaskToTasker(taskId, assignedToId);

                    });
                  
                    taskerContainer.querySelector('.tasker-info').appendChild(button);
                    usersList.appendChild(taskerContainer);
                }
            });
        } catch (error) {
            console.error(error.message);
        }
    }
    getData();
}
if(usersList){
    usersInfo();
}

// fetch logged in user details
async function fetchUserData() {
    try {
        const response = await fetch(`${UrlEndpoint}/user/id`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        return await response.json();
    } catch (error) {
        console.error("Error in fetchUserData:", error.message);
        throw error;
    }
}

// welcome text on individual user login
const welcomeText = document.getElementById("welcome-text");
async function IndividualUser() {
    try {
        const userData = await fetchUserData();
        const userName = userData.userName;
        const para = document.createElement("p");
        para.innerHTML = `Hi ${userName.charAt(0).toUpperCase() + userName.slice(1)}, welcome to TR. You have successfully registered and logged in to TR. Select a category to book a task`;
        welcomeText.appendChild(para);
    } catch (error) {
        console.error("Error in IndividualUser:", error.message);
    }
}
if(welcomeText){
    IndividualUser();
}

// user account profile
const account = document.getElementById("account");
async function displayUserProfile() {
    try {
        const userData = await fetchUserData();
        const userDetails = {
            name: userData.name,
            userName: userData.userName,
            email: userData.email
        };
        
        const detailsList = document.getElementById("proile-details-list");
    
        // Loop through user details and create list items
        Object.values(userDetails).forEach(detail => {
            const listItem = document.createElement("li");
            listItem.textContent = detail;
            detailsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error in displayUserProfile:", error.message);
    }
}

if(account){
    displayUserProfile();
}

//shola
const taskListContainer = document.querySelector('.task-list-container')
if(taskListContainer){
    setupTabNavigation('.js-task-tab', '.user-tasks'); // Example for another section
}

// user's created active task list
async function fetchTaskList() {
    const url = `${UrlEndpoint}/User/tasks`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.json();
        
    } catch (error) {
        console.error("Error in displayUserProfile:", error.message);
    }
}

// user's created active task list
async function fetchActiveTaskList() {
    const url = `${UrlEndpoint}/User/active-tasks`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.json();
        
    } catch (error) {
        console.error("Error in displayUserProfile:", error.message);
    }
}

async function fetchUserDetails(userId) {
    const response = await fetch(`${UrlEndpoint}/User/details/${userId}`);
   
    if (!response.ok) {
        throw new Error(`Failed to fetch user details for ID: ${userId}`);
    }
    return await response.json();
}

// notify user on completed nd cancelled task
function checkTaskStatusUpdate(tasks, statusType) {
    setTimeout(() => {
        const seenTasksKey = `seen${statusType.charAt(0).toUpperCase() + statusType.slice(1)}Tasks`;
        const seenTasks = JSON.parse(localStorage.getItem(seenTasksKey)) || [];

        // Filter tasks that match the status and haven't been acknowledged
        const newTasks = tasks.filter(task => task.status === statusType && !seenTasks.includes(task.id));

        if (newTasks.length > 0) {
            const taskTitles = newTasks.map(task => task.title).join(", ");
            const message = statusType === "cancelled"
                ? `Your task(s) "${taskTitles}" have been cancelled.`
                : `Your task(s) "${taskTitles}" have been marked as completed.`;

            const confirmation = confirm(message);

            if (confirmation) {
                // Update localStorage to mark tasks as acknowledged
                const updatedSeenTasks = [...seenTasks, ...newTasks.map(task => task.id)];
                localStorage.setItem(seenTasksKey, JSON.stringify(updatedSeenTasks));
            }
        }
    }, 600);
}

// list all booked task by user
const bookList = document.getElementById("booked-tasks");
if(bookList){
    displayAllBookedTask() 
}
async function displayAllBookedTask() {
    const results = await fetchTaskList();
    const userData = await fetchUserData();
    const userId = userData.id;
    const userTasks = results.filter(result => result.postedById === userId);

    bookList.innerHTML = userTasks.length
    ? userTasks
        .map(task => 
            `
            <div class="task-list-item">
       
                <div class="task-box flex"> 
                ${!task.assignedToId ?
                    `<div class="more">
                        <svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" ></rect> <circle cx="7" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="12" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="17" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>
                    </div>`: ''}
                    <p class="title">${task.title}</p>
                    <div class="task-status">
                        Status: <strong class="status ${!task.assignedToId ? 'complete-booking' : task.status}">${!task.assignedToId ? 'Complete Booking' : task.status}</strong>
                    </div>
                </div>
                ${!task.assignedToId ? `
                    <div class="task-dropdown">
                        <div class="task-dropdown-container flex">
                            <div class="task-action-message">
                                <p>It looks like you haven't selected a tasker yet.</p>
                                <p>Complete the booking by assigning a tasker and proceeding with payment.</p>
                            </div>
                            <svg class="cancel" width="20px" height="20px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke-width="3" stroke="#000000" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="8.06" y1="8.06" x2="55.41" y2="55.94"></line><line x1="55.94" y1="8.06" x2="8.59" y2="55.94"></line></g></svg>
                            <div class="buttons flex">
                                <button onclick="editTask('${task.id}', '${task.categoryId}')">Edit Task</button>
                                <button onclick="deleteTask('${task.id}')">Delete Task</button>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join("")
    : `
        <div class="task-list-item">
            <p>No tasks found. <a href="/register/welcome.html">Book a Task</a></p>
        </div>
    `;

      // Close modal functionality when clicking on the cancel icon
      const body = document.body;
      document.querySelectorAll('.cancel').forEach(cancelIcon => {
        cancelIcon.addEventListener('click', function(event) {
            event.stopPropagation();
            const taskDropdown = this.closest('.task-list-item');
            taskDropdown.classList.remove('active');
            body.classList.remove("menu-open");
        });
    });

    const taskItems = document.querySelectorAll(".more");
    taskItems.forEach(taskItem => {
        taskItem.addEventListener('click', function(){
            const displayItem = this.closest('.task-list-item');
            displayItem.classList.add("active");
            body.classList.add("menu-open");
        });
    });
}

// display only active tasks from user
const UserActiveTasks = document.getElementById("user-active-tasks");
if(UserActiveTasks){
    displayActivetask();
}
async function displayActivetask() {
    const results = await fetchActiveTaskList();
    const userData = await fetchUserData();
    const userId = userData.id;
    const userTasks = results.filter(result => result.postedById === userId);

    checkTaskStatusUpdate(userTasks, "Cancelled");
    checkTaskStatusUpdate(userTasks, "Completed");
  
    const tasksWithTaskerDetails = await Promise.all(
        userTasks.map(async (task) => {
            const val = task.assignedToId;
            const taskerDetails = await fetchUserDetails(val);
            return { ...task, assignedTo: taskerDetails.name, userName: taskerDetails.userName, taskerEmail: taskerDetails.email};
            
        })
    );
    
    UserActiveTasks.innerHTML = tasksWithTaskerDetails.length
    ? tasksWithTaskerDetails
        .map(task => 
            `
            <div class="task-list-item">
            <div class="task-box flex">
                <div class="more">
                    <svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" ></rect> <circle cx="7" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="12" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="17" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>
                </div>
                <p class="title">${task.title}</p>
                <div class="task-status">
                    Status: <strong class="status ${task.status}">${task.status}</strong>
                </div>
                <p>Tasker: ${task.assignedTo}</p>
            </div>
            <div class="task-dropdown">
             <div class="task-dropdown-container flex">
                <svg class="cancel" width="20px" height="20px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke-width="3" stroke="#000000" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="8.06" y1="8.06" x2="55.41" y2="55.94"></line><line x1="55.94" y1="8.06" x2="8.59" y2="55.94"></line></g></svg>                            
                <div class="avatar-img"> 
                    <img src="/images/male-avatar.png" alt="${task.createdBy}'s avatar">
                </div>
                <div class="flex">
                    <h3>${task.title}</h3>
                    <p><strong>Description:</strong> ${task.description}</p>
                    <div class="task-status">
                        Status: <strong class="status ${task.status}">${task.status}</strong>
                    </div>
                   <p><strong>Tasker:</strong> ${task.assignedTo} (${task.taskerEmail})</p>
                </div>
            </div>
            </div>
            </div>
        `)
        .join("")
    : `
        <div class="task-list-item">
            <p>No tasks found. <a href="/register/welcome.html">Book a Task</a></p>
        </div>
    `;
     
      document.querySelectorAll('.cancel').forEach(cancelIcon => {
        cancelIcon.addEventListener('click', function(event) {
            event.stopPropagation();
            const taskDropdown = this.closest('.task-list-item');
            taskDropdown.classList.remove('active');
            body.classList.remove("menu-open");
        });
    });

    const taskItems = document.querySelectorAll(".more");
    taskItems.forEach(taskItem => {
        taskItem.addEventListener('click', function(){
            const displayItem = this.closest('.task-list-item');
            displayItem.classList.add("active");
            body.classList.add("menu-open");
        });
    });
}

// delete uncompleted task
async function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        try {
            const response = await fetch(`${UrlEndpoint}/User/task/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert("Task deleted successfully.");
                location.reload();
            } else {
                console.error("Failed to delete task:", await response.text());
            }
        } catch (error) {
            console.error("Error deleting task:", error.message);
        }
    }
}

// update task status on taskers task list
async function updateTaskStatus(taskId) {
    const taskItem = document.querySelector(`[data-id="${taskId}"]`).closest('.task-list-item');
    const statusDropdown = taskItem.querySelector("#status-dropdown");
    let selectedStatus = statusDropdown.value;

    // Store a state to track if confirmation has been shown
    const taskItemUpdate = document.querySelector('.task-list-item');
    if (selectedStatus === 'Completed' && !taskItem.classList.contains('confirmed')) {
        const confirmation = confirm('Are you sure the task is completed? You cannot undo this changes.');
        if (!confirmation) return;
        taskItem.classList.add('confirmed');
    } else if(selectedStatus === 'Cancelled' && !taskItem.classList.contains('cancelled')){
        const confirmation = confirm('Are you sure you want to cancel this task? You cannot undo this changes.');
        if (!confirmation) return;
        taskItem.classList.add('cancelled');
    }

    // Update the task status on the server
    await fetch(`${UrlEndpoint}/User/task/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedStatus),
    });

    const statusElement = taskItem.querySelector(".task-status strong");
    statusElement.textContent = selectedStatus;
    taskItemUpdate.classList.add(selectedStatus)
    await displayAssignedTasks();
    body.classList.remove("menu-open");
}

// display taskers assigned tasklist
const taskList = document.getElementById("task-list");
if(taskList){
    setupTabNavigation('.js-task-item-tab', '.task-item-container');
    displayAssignedTasks();
}
async function displayAssignedTasks() {
    try {
        const userData = await fetchUserData();
        const userId = userData.id;

        const response = await fetch(`${UrlEndpoint}/User/assigned-tasks?taskerId=${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch assigned tasks");
        }

        const tasks = await response.json();
        const taskDetails = await Promise.all(
            tasks.map(async (task) => {
                const userDetails = await fetchUserDetails(task.postedById);
                return { 
                    ...task, 
                    createdBy: userDetails.name, 
                    userName: userDetails.userName, 
                    email: userDetails.email, 
                    price: userDetails.HourlyRate 
                };
            })
        );

        const completedList = document.querySelector("#completed");
        const taskList = document.querySelector("#task-list");

        taskList.innerHTML = "";
        completedList.innerHTML = "";

        if (taskDetails.length > 0) {
            taskDetails.forEach(task => {
                const taskElement = document.createElement("div");
                taskElement.classList.add("task-list-item");
                taskElement.dataset.id = task.id;
                taskElement.innerHTML = 
                `
                    <div class="task-box flex">
                        <div class="more">
                            <svg width="35px" height="35px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" ></rect> <circle cx="7" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="12" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> <circle cx="17" cy="12" r="0.5" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>
                        </div>
                        <div class="task-info flex">
                            <p class="title">${task.title}</p>
                            <p class="description">${task.description}</p>
                            <p class="location">${task.location}</p>
                        </div>
                        <div class="task-status">
                            Status: <strong class="status ${task.status}">${task.status}</strong>
                        </div>
                    </div>
                    <div class="task-dropdown">
                        <div class="task-dropdown-container">
                            <svg class="cancel" width="20px" height="20px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke-width="3" stroke="#000000" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line x1="8.06" y1="8.06" x2="55.41" y2="55.94"></line><line x1="55.94" y1="8.06" x2="8.59" y2="55.94"></line></g></svg>                          
                            <div class="task-creator-info">
                                <div class="avatar-img"> 
                                    <img src="/images/lady-avatar.jpg" alt="${task.createdBy}'s avatar">
                                </div>
                                <p class="creator-name">${task.createdBy}</p>
                                <p class="creator-name">${task.userName}</p>
                                <p class="creator-name">${task.email}</p>
                            </div>
                            <div class="task-creator-info flex">
                                <h3 class="creator-name">${task.title}</h3>
                                <p><strong>Description: </strong>${task.description}</p>
                                <p><strong>Location: </strong>${task.location}</p>
                            </div>
                            <div class="dropdown-container">
                                <select id="status-dropdown">
                                    <option value="Pending">Pending</option>
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <button data-id="${task.id}" class="status-button">Save Changes</button>
                            </div>
                        </div>
                    </div>
                `;

                if (task.status === "Completed") {
                    completedList.appendChild(taskElement);
                } else {
                    taskList.appendChild(taskElement);
                }
            });
        } else {
            taskList.innerHTML = `<div class="task-list-item"><p>No tasks assigned yet.</p></div>`;
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }

    // Close modal functionality when clicking on the cancel icon
    document.querySelectorAll('.cancel').forEach(cancelIcon => {
        cancelIcon.addEventListener('click', function(event) {
            event.stopPropagation();
            const taskDropdown = this.closest('.task-list-item');
            taskDropdown.classList.remove('active');
            body.classList.remove("menu-open");
        });
    });

    // Open task details on clicking "more"
    document.querySelectorAll(".more").forEach(taskItem => {
        taskItem.addEventListener('click', function() {
            const displayItem = this.closest('.task-list-item');
            displayItem.classList.add("active");
            body.classList.add("menu-open");
        });
    });

    // Handle status update click
    document.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('status-button')) {
            event.stopPropagation();
            const taskId = event.target.getAttribute('data-id');
            updateTaskStatus(taskId);
        }
    }); 
}


// delete user
const deleteUser = document.getElementById("delete-account");
async function deleteProfile() {
    try {
        const userData = await fetchUserData();
        const userId = userData.id;

        const response = await fetch(`${UrlEndpoint}/User/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (response.ok) {
            window.location.href = "/";
        } else {
            const error = await response.text();
            console.error("Server Error:", error);
        }
        
    } catch (error) {
        console.error("Error in displayUserProfile:", error.message);
    }
}

if(deleteUser){
    const deleteBtn = document.querySelector(".js-delete");
    deleteBtn.addEventListener('click', function(e){
        e.preventDefault();
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            deleteProfile();
        }
    })
}

// logout function
const logOut = document.querySelector('.js-log-out');
if (logOut) {
    logOut.addEventListener('click', async (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        window.history.replaceState(null, '', '/register/login.html');
        window.location.href = '/register/login.html';
    });
}

// select a task category to be booked on user login
const categoryContainer = document.getElementById('category-container');
async function selectCategory() {
    const categories = await fetchCategories(); 
    
    categories.map(category => {
        const categoryItem = document.createElement('li');
        // categoryItem.setAttribute('class', 'continue-btn');
        const categoryButton = document.createElement('button');
        categoryButton.setAttribute('category-id', category.id);
        categoryButton.textContent = category.category;
        categoryItem.appendChild(categoryButton);
        categoryContainer.appendChild(categoryItem);
    });
    setupCategorySelection();
}
if (categoryContainer) {
    selectCategory();
}

// submit book task form
const BookForm = document.getElementById("task-request");
if(BookForm){
    BookForm.addEventListener('submit', function(e){
        e.preventDefault();
        BookTask();
    })
}

// book a task form
function BookTask(){
    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const description = document.getElementById("description").value;

    async function fetchTaskRequest() {
        try {
            const response = await fetch(`${UrlEndpoint}/User/taskrequest`,{
                method: "POST",
                headers:  {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    location: location,
                    description: description,
                    categoryId: taskCategoryId, 
                })
            })

            if (response.ok) {
                const result = await response.json();
                const taskId = result.id;
                window.location.href = `/register/recommendation.html?categoryId=${taskCategoryId}&taskId=${taskId}`;
            } else {
                const error = await response.json();
                console.error("Server Error:", error);
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    }
    fetchTaskRequest(); 
}
     
// User profile nav click
const profileContainer = document.querySelector('.profile-banner');
if (profileContainer) {
    // Initialize for multiple sections
    setupTabNavigation('.js-profile-nav', '.account-item');

}






