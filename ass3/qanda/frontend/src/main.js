import { BACKEND_PORT } from './config.js';
import { fileToDataUrl } from './helpers.js';

document.addEventListener('DOMContentLoaded', () => {
    // This function is called when the document is fully loaded
    console.log('Let\'s go!');

    // Function to hide all pages (sections) in the application
    function hideAllPages() {
        const pages = ['page-reg', 'page-log', 'page-dashboard', 'create-thread', 'thread-screen', 'page-editform', 'profile-container'];
        pages.forEach(pageId => {
            document.getElementById(pageId).style.display = 'none';
        });
    }

    // Function to navigate to a specific page
    function goto_page(pgname) {
        hideAllPages();  // Hide all pages first
        document.getElementById(pgname).style.display = 'block';  // Display the selected page
    }

    // Function to validate email format using regex
    function isValidEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    // Event listener for the "Register" button to show the registration page
    document.getElementById('register-fbtn').addEventListener('click', () => {
        goto_page('page-reg');
    });

    // Event listener for the "Back" button to go back to the login page
    document.getElementById('back-btn').addEventListener('click', () => {
        goto_page('page-log');
    });

    // Event listener for the "Submit" button on the registration form
    document.getElementById('register-sbtn').addEventListener('click', () => {
        const email = document.getElementById('E-mail-r').value;
        const name = document.getElementById('Name').value;
        const password = document.getElementById('Password-r').value;
        const password2 = document.getElementById('Password-r2').value;

        // Ensure all fields are filled out
        if (!email || !password || !name || !password2) {
            alert('Please fill out all fields');
            return;
        }

        // Check if the passwords match
        if (password != password2) {
            alert('Passwords do not match, please try again');
            return;
        }

        // Validate the email format
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        console.log(`Email: ${email}`);

        // Create the request body with email, password, and name
        const requestBody = {
            email: email,
            password: password,
            name: name
        };

        // Clear the input fields
        ['E-mail-r', 'Password-r', 'Password-r2', 'Name'].forEach(id => {
            document.getElementById(id).value = '';
        });

        // Send a POST request to the backend to register the user
        fetch(`http://127.0.0.1:${BACKEND_PORT}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            // Handle registration response
            if (data.error) {
                alert('Registration failed: ' + data.error);
            } else {
                console.log(data.token);
                alert('Registration successful!');
            }
        })
        .catch(error => {
            console.error('Request failed:', error);
            alert('Registration request failed');
        });
    });

    // Event listener for the "Login" button to submit login credentials
    document.getElementById('login-sbtn').addEventListener('click', () => {
        const email = document.getElementById('E-mail-l').value;
        const password = document.getElementById('Password-l').value;

        // Ensure both email and password fields are filled
        if (!email || !password) {
            alert('Please fill out all fields');
            return;
        }

        // Create the request body with email and password
        const requestBody = {
            email: email,
            password: password
        };

        // Clear the input fields after submission
        document.getElementById('E-mail-l').value = '';
        document.getElementById('Password-l').value = '';

        // Send a POST request to the backend to log the user in
        fetch(`http://127.0.0.1:${BACKEND_PORT}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            // Handle login response
            if (data.error) {
                alert('Login failed: ' + data.error);
            } else {
                console.log(data.token);
                console.log(data.userId);
                localStorage.setItem('authToken', data.token);  // Save the token in local storage
                localStorage.setItem('userid', data.userId);    // Save the user ID in local storage
                alert('Login successful!');
                location.reload();  // Reload the page after successful login
            }
        })
        .catch(error => {
            console.error('Request failed:', error);
            alert('Login request failed');
        });
    });


    function checkLogin() {
        // Check if the user is logged in by checking for the presence of the token
        const token = localStorage.getItem('authToken');
        if (!token) {
            // If not logged in, hide the profile link and navigate to the login page
            document.getElementById('profile-link-container').style.display = 'none';
            goto_page('page-log');
        } else {
            // If logged in, display the profile link and navigate to the dashboard
            document.getElementById('profile-link-container').style.display = 'block';
            goto_page('page-dashboard');
        }
    }
    
    function logout() {
        // Remove the token and user ID from local storage, effectively logging out the user
        localStorage.removeItem('authToken');
        localStorage.removeItem('userid');
        alert('You have successfully logged out');
        goto_page('page-log');  // Navigate back to the login page
    }
    
    // Add an event listener for the logout button to trigger the logout function
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Check the login status when the page loads
    checkLogin();
    
    // Add an event listener for the profile link to fetch and display the user profile when clicked
    document.getElementById('profile-link').addEventListener('click', (event) => {
        event.preventDefault();  // Prevent default link behavior
        goto_page('profile-container');  // Navigate to the profile page
        
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userid');
    
        // Fetch user data from the server using the stored user ID and token
        fetch(`http://localhost:5005/user?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(userData => {
            // Display user information on the profile page
            document.getElementById('profile-username').textContent = userData.name;
            document.getElementById('profile-email').textContent = userData.email;
            document.getElementById('profile-avatar').src = userData.image;
    
            // Fetch the user's threads (posts) and display them
            let curPage = 0;
            const postsContainer = document.getElementById('user-posts');
            postsContainer.innerHTML = '';  // Clear any existing posts
            
            function loadcomments() {
                // Fetch the user's threads, starting from the current page
                fetch(`http://localhost:5005/threads?start=${curPage * 5}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // If there are no more threads, stop loading more
                    if (data.length === 0 || data.length < 5) return;
    
                    // Iterate through the thread IDs and fetch each thread's details
                    data.forEach(threadId => {
                        fetchThreadDetails(threadId, token).then(thread => {
                            console.log(thread.creatorId);
    
                            // Only display the threads created by the logged-in user
                            if (Number(thread.creatorId) === Number(userId)) {
                                const postItem = document.createElement('div');
                                postItem.classList.add('post-item');
                                postItem.innerHTML = `
                                    <h3>${thread.title}</h3>
                                    <p>${thread.content}</p>
                                    <p>Likes: ${thread.likes.length}</p>
                                `;
                                postsContainer.appendChild(postItem);
    
                                // Fetch and display the number of comments for each thread
                                fetch(`http://localhost:5005/comments?threadId=${thread.id}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                })
                                .then(response => response.json())
                                .then(comments => {
                                    const commentCount = document.createElement('p');
                                    commentCount.textContent = `Comments: ${comments.length}`;
                                    postItem.appendChild(commentCount);
                                })
                                .catch(error => console.error('Error fetching comments:', error));
                            }
                        }).catch(error => console.error('Error fetching thread details:', error));
                    });
    
                    curPage++;  // Increment the page counter
                    loadcomments();  // Recursive call to load the next page of threads
                })
                .catch(error => console.error('Error fetching threads:', error));
            }
    
            // Start loading the user's threads
            loadcomments();
        })
        .catch(error => console.error('Error fetching user data:', error));
    });
    
    


    let currentPage = 0;  // Keep track of the current page of threads

    // Get references to various elements in the DOM
    const threadList = document.getElementById('thread-list');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const createThreadBtn = document.getElementById('create-thread-btn');
    const createThreadDiv = document.getElementById('create-thread');
    const dashboardDiv = document.getElementById('page-dashboard');
    const threadScreenDiv = document.getElementById('thread-screen');
    const createThreadForm = document.getElementById('create-thread-form');

    // Function to load threads from the server
    function loadThreads() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Token not found, please log in');
            return;
        }

        // Fetch threads from the server, starting from the current page
        fetch(`http://localhost:5005/threads?start=${currentPage * 5}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // If fewer than 5 threads are returned, hide the "Load More" button
            if (data.length < 5) {
                loadMoreBtn.style.display = 'none'; // Hide the button
            } else {
                // Check if more threads exist by making an additional request
                fetch(`http://localhost:5005/threads?start=${currentPage * 5 + 5}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(nextData => {
                    if (nextData.length === 0) {
                        loadMoreBtn.style.display = 'none';  // Hide the button if no more threads
                    }
                });
            }

            // If threads are returned, display them
            if (data.length != 0) {
                data.forEach(threadId => {
                    console.log(`Fetching details for thread ID: ${threadId}`);
                    
                    // Fetch and display thread details
                    fetchThreadDetails(threadId, token)
                    .then(threadDetails => {
                        console.log(`Title: ${threadDetails.title}, Created at: ${threadDetails.createdAt}, Author: ${threadDetails.creatorId}, Likes: ${threadDetails.likes}`);

                        // Create a new thread item in the thread list
                        const threadItem = document.createElement('div');
                        threadItem.classList.add('thread-item');
                        threadItem.innerHTML = `
                            <strong>Title:</strong> ${threadDetails.title}<br>
                            <strong>Created at:</strong> ${threadDetails.createdAt}<br>
                            <strong>Author:</strong> ${threadDetails.creatorId}<br>
                            <strong>Likes:</strong> ${threadDetails.likes.length}
                        `;
                        threadItem.addEventListener('click', () => {
                            showThread(threadDetails.id);  // Click to show a single thread
                        });
                        document.getElementById('thread-list').appendChild(threadItem);
                    })
                    .catch(error => {
                        console.error('Error fetching thread details:', error);
                    });
                });

                currentPage++;  // Increment the page counter to load the next set of threads
            }
        })
        .catch(error => {
            console.error('Error loading threads:', error);
        });
    }

    // Event listener for the "Load More" button to load more threads when clicked
    loadMoreBtn.addEventListener('click', loadThreads);

    // Initially load threads when the page loads
    loadThreads();

    // Event listener for the "Create Thread" button to display the thread creation form
    createThreadBtn.addEventListener('click', () => {
        dashboardDiv.style.display = 'none';
        createThreadDiv.style.display = 'block';
    });

    // Event listener for submitting the thread creation form
    createThreadForm.addEventListener('submit', (event) => {
        event.preventDefault();  // Prevent the form from being submitted in the default way
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Token not found, please log in');
            alert('You are not logged in, please log in first');
            return;
        }

        // Get the values for the new thread from the form
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const isPublic = !document.getElementById('private').checked;

        // Create the request body with the thread data
        const requestBody = {
            title: title,
            content: content,
            isPublic: isPublic
        };

        // Send a POST request to create the thread
        fetch('http://localhost:5005/thread', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            // Handle any errors or display success messages
            if (data.error) {
                alert('Error creating thread: ' + data.error);
            } else {
                alert('Thread created successfully!');
                createThreadDiv.style.display = 'none';  // Hide the create thread form
                dashboardDiv.style.display = 'block';    // Show the dashboard
                showThread(data.id);  // Display the newly created thread
            }
        })
        .catch(error => {
            console.error('Error creating thread:', error);
        });
    });


    function showThread(threadId) {
        const userId = localStorage.getItem('userid');
        const token = localStorage.getItem('authToken');
    
        fetchThreadDetails(threadId, token)
            .then(thread => {
                displayThreadInfo(thread);
                setupLikeButton(thread, threadId, userId, token);
                
                setupWatchButton(thread, threadId, userId, token);
                checkUserPermissions(thread, userId, token);
            })
            .catch(error => {
                console.error('Error loading thread:', error);
            });
    
        dashboardDiv.style.display = 'none';
        threadScreenDiv.style.display = 'block';
    }
    
    function fetchThreadDetails(threadId, token) {
        return fetch(`http://localhost:5005/thread?id=${threadId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => response.json());
    }


    
    function renderComments(comments, thread, parentElement = document.getElementById('comment-list'), level = 0) {
        const token = localStorage.getItem('authToken')
        const userId = localStorage.getItem('userid'); // Get the current user's ID
        parentElement.innerHTML = '';  // Clear existing comments
        const commentsArray = Object.values(comments);
        commentsArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        commentsArray.forEach(comment => {
            console.log(comment)
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');
            commentItem.style.marginLeft = `${level * 100}px`;  // Add indent for nested comments
            fetch(`http://localhost:5005/user?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(userData => {
                    const isLikedByUser = comment.likes.includes(Number(userId));
                    const likeButtonText = isLikedByUser ? 'Unlike' : 'Like';
                    commentItem.innerHTML = `
                        <img src="${userData.image}" alt="(Profile Image)" class="profile-image">
                        <strong>${userData.name}</strong><br>
                        ${comment.content}<br>
                        <span>${getTimeAgo(comment.createdAt)}</span><br>
                        Likes: ${comment.likes.length}
                        <button class="reply-btn">reply</button>
                        <button id="like-btn-${comment.id}">${likeButtonText}</button>
                    `;
                    
                    
                    
                    if (userId == comment.creatorId || userData.admin) {
                        const editButton = document.createElement('button');
                        editButton.textContent = 'Edit';
                        editButton.addEventListener('click', () => showEditModal(comment,thread));
                        commentItem.appendChild(editButton);
                    }

                    parentElement.appendChild(commentItem);
                    document.getElementById(`like-btn-${comment.id}`).addEventListener('click', () => {
                        toggleLikecom(thread, comment.id, isLikedByUser, token);
                    });
                    commentItem.querySelector('.reply-btn').addEventListener('click', () => {
                        showReplyModal(comment.id,thread);
                    });
                })
                .catch(error => console.error('Error loading user data:', error));
            // Recursively render child comments
        });
    }

    function showEditModal(comment,thread) {
        // Display the edit modal
        const modal = document.getElementById('edit-modal');
        modal.style.display = 'block';
        
        // Pre-fill the edit textarea with the current comment content
        const editTextarea = document.getElementById('edit-comment');
        editTextarea.value = comment.content;
        
        // Handle the "Save" button click for editing the comment
        document.getElementById('save-edit-btn').addEventListener('click', () => {
            const updatedContent = editTextarea.value;
            const commentId = comment.id;

            const token = localStorage.getItem('authToken');
            const requestBody = { 
                id: commentId, 
                content: updatedContent
            };
            fetch(`http://localhost:5005/comment`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
            .then(() => {
                modal.style.display = 'none';  // Close the modal after saving
                displayThreadInfo(thread);  // Reload the comments
            })
            .catch(error => console.error('Error updating comment:', error));
        });
    }

    // Function to calculate how long ago a date occurred
    function getTimeAgo(date) {
        const now = new Date();  // Get the current time
        const past = new Date(date);  // Convert the input date to a Date object
        const diff = Math.floor((now - past) / 1000);  // Calculate the difference in seconds

        // Return a human-readable string indicating how long ago the date occurred
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minute(s) ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
        return `${Math.floor(diff / 604800)} week(s) ago`;
    }

    // Function to display the information of a thread
    function displayThreadInfo(thread) {
        const token = localStorage.getItem('authToken');  // Get the auth token from local storage
        // Set the thread title, content, and likes count
        document.getElementById('thread-title').textContent = thread.title;
        document.getElementById('thread-content').textContent = thread.content;
        document.getElementById('likes-count').textContent = thread.likes.length;
        const threadId = thread.id;

        // Fetch comments for the thread
        fetch(`http://localhost:5005/comments?threadId=${thread.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(comments => {
            console.log(comments);  // Log the comments data
            renderComments(comments, thread);  // Render the comments on the page

            // Show or hide the comment input box based on whether the thread is locked
            if (!thread.lock) {
                document.getElementById('comment-input-box').style.display = 'block';
            } else {
                document.getElementById('comment-input-box').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error loading comments:', error);  // Log any errors
        });

        // Add event listener for posting a comment
        document.getElementById('post-comment-btn').addEventListener('click', () => {
            const commentText = document.getElementById('new-comment').value;
            if (!commentText) return;  // Don't post if the comment is empty

            const requestBody = { 
                content: commentText, 
                threadId: threadId, 
                parentCommentId: null  // This is a top-level comment, so no parent
            };

            // Send the comment to the server
            fetch('http://localhost:5005/comment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
            .then(() => {
                displayThreadInfo(thread);  // Reload the thread to show the new comment
            })
            .catch(error => console.error('Error posting comment:', error));
        });
    }

    // Function to show the reply modal for replying to a comment
    function showReplyModal(commentId, thread) {
        const modal = document.getElementById('reply-modal');  // Get the reply modal
        modal.style.display = 'block';  // Display the modal

        // Add event listener for posting a reply
        document.getElementById('post-reply-btn').addEventListener('click', () => {
            const replyText = document.getElementById('reply-comment').value;
            if (!replyText) return;  // Don't post if the reply is empty

            const requestBody = { 
                content: replyText, 
                threadId: thread.id, 
                parentCommentId: commentId  // This is a reply, so we need the parent comment ID
            };

            // Send the reply to the server
            fetch('http://localhost:5005/comment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
            .then(() => {
                modal.style.display = 'none';  // Close the reply modal
                displayThreadInfo(thread);  // Reload the thread to show the new reply
            })
            .catch(error => console.error('Error posting reply:', error));
        });
    }

    // Function to set up the like button for a thread
    function setupLikeButton(thread, threadId, userId, token) {
        const likeButton = document.getElementById('like-btn');  // Get the like button element
        let isLikedByUser = thread.likes.includes(Number(userId));  // Check if the user has liked the thread
        likeButton.textContent = isLikedByUser ? 'Unlike' : 'Like';  // Update the button text

        // Disable the like button if the thread is locked
        likeButton.disabled = threadId.lock;

        // Add event listener to toggle the like status when clicked
        likeButton.addEventListener('click', () => toggleLike(threadId, isLikedByUser, token));
    }

    // Function to toggle like status for a comment
    function toggleLikecom(thread, commentId, isLikedByUser, token) {
        const updatedLike = { id: commentId, turnon: !isLikedByUser };  // Payload with updated like status
        fetch(`http://localhost:5005/comment/like`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedLike)  // Send updated like data
        })
        .then(() => {
            isLikedByUser = !isLikedByUser;  // Update local like status
            document.getElementById(`like-btn-${commentId}`).likeButtonText = isLikedByUser ? 'Unlike' : 'Like';  // Update button text
            displayThreadInfo(thread);  // Reload thread to reflect changes
        })
        .catch(error => console.error('Error updating like status:', error));  // Log errors
    }

    // Function to toggle like status for a thread
    function toggleLike(threadId, isLikedByUser, token) {
        const updatedLike = { id: threadId, turnon: !isLikedByUser };  // Payload with updated like status
        fetch(`http://localhost:5005/thread/like`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedLike)  // Send updated like data
        })
        .then(() => {
            isLikedByUser = !isLikedByUser;  // Update local like status
            document.getElementById('like-btn').textContent = isLikedByUser ? 'Unlike' : 'Like';  // Update button text
            showThread(threadId);  // Reload thread to reflect changes
        })
        .catch(error => console.error('Error updating like status:', error));  // Log errors
    }

    // Function to set up the watch button for a thread
    function setupWatchButton(thread, threadId, userId, token) {
        const watchButton = document.getElementById('watch-btn');
        let isWatchedByUser = thread.watchees.includes(Number(userId));  // Check if the user is watching the thread
        watchButton.textContent = isWatchedByUser ? 'Unwatch' : 'Watch';  // Update button text

        // Add event listener to toggle watch status when clicked
        watchButton.addEventListener('click', () => toggleWatch(threadId, isWatchedByUser, token));
    }

    // Function to toggle watch status for a thread
    function toggleWatch(threadId, isWatchedByUser, token) {
        const updatedWatch = { id: threadId, turnon: !isWatchedByUser };  // Payload with updated watch status
        fetch(`http://localhost:5005/thread/watch`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedWatch)  // Send updated watch data
        })
        .then(() => {
            isWatchedByUser = !isWatchedByUser;  // Update local watch status
            document.getElementById('watch-btn').textContent = isWatchedByUser ? 'Unwatch' : 'Watch';  // Update button text
            showThread(threadId);  // Reload thread to reflect changes
        })
        .catch(error => console.error('Error updating watch status:', error));  // Log errors
    }

    // Function to check if the user has permissions to edit or delete the thread
    function checkUserPermissions(thread, userId, token) {
        fetch(`http://localhost:5005/user?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(userData => {
            // If user is an admin or the creator of the thread, show edit and delete buttons
            if (userData.admin || userData.id === thread.creatorId) {
                document.getElementById('edit-btn').style.display = 'block';
                document.getElementById('delete-btn').style.display = 'block';

                // Add event listener for deleting the thread
                document.getElementById('delete-btn').addEventListener('click', () => deleteThread(thread.id));

                // Set up edit thread functionality
                setupEditThread(thread);
            } else {
                // Hide edit and delete buttons if no permission
                document.getElementById('edit-btn').style.display = 'none';
                document.getElementById('delete-btn').style.display = 'none';
            }
        })
        .catch(error => console.error('Error checking permissions:', error));  // Log errors
    }

    // Function to set up editing functionality for a thread
    function setupEditThread(thread) {
        document.getElementById('edit-btn').addEventListener('click', () => {
            goto_page('page-editform');  // Navigate to the edit form page

            // Pre-fill the edit form with the thread's current data
            document.getElementById('edit-title').value = thread.title;
            document.getElementById('edit-content').value = thread.content;
            document.getElementById('edit-private').checked = thread.isPrivate;
            document.getElementById('edit-locked').checked = thread.lock;

            // Set up event listener for saving changes
            document.getElementById('save-thread-btn').addEventListener('click', () => saveThreadChanges(thread.id));

            // Set up event listener for canceling the edit and going back to the thread
            document.getElementById('cancel-edit-btn').addEventListener('click', () => {
                hideAllPages();  // Hide all pages
                showThread(thread.id);  // Return to the thread view
            });
        });
    }

    // Function to delete a thread
    function deleteThread(threadId) {
        const updatedThread = { id: threadId };  // Prepare the thread ID to delete
        const token = localStorage.getItem('authToken');  // Get the auth token

        // Send DELETE request to remove the thread
        fetch(`http://localhost:5005/thread`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedThread)  // Send thread ID as the payload
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error deleting thread: ' + data.error);  // Show error if any
            } else {
                alert('Thread deleted successfully!');  // Show success message
                hideAllPages();  // Hide all pages
                document.getElementById('delete-btn').style.display = 'none';  // Hide delete button
                showLatestThread();  // Show the latest thread
            }
        })
        .catch(error => {
            console.error('Error deleting thread:', error);  // Log errors
        });
    }

    // Function to show the latest thread after a deletion
    function showLatestThread() {
        const token = localStorage.getItem('authToken');  // Get the auth token

        // Fetch the latest thread
        fetch('http://localhost:5005/threads?start=0', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const latestThread = data[0];  // Get the latest thread
                showThread(latestThread);  // Display the latest thread
            } else {
                alert('No threads found.');  // Alert if no threads available
            }
        })
        .catch(error => {
            console.error('Error fetching latest thread:', error);  // Log errors
        });
    }


    // Function to save changes to a thread
    function saveThreadChanges(threadId) {
        const updatedThread = {
            id: threadId,  // Thread ID to update
            title: document.getElementById('edit-title').value,  // Updated title
            content: document.getElementById('edit-content').value,  // Updated content
            isPrivate: document.getElementById('edit-private').checked,  // Privacy status
            lock: document.getElementById('edit-locked').checked,  // Locked status
        };

        const token = localStorage.getItem('authToken');  // Get the auth token

        // Send PUT request to update the thread
        fetch(`http://localhost:5005/thread`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedThread)  // Send updated thread data
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error updating thread: ' + data.error);  // Show error if any
            } else {
                alert('Thread updated successfully!');  // Show success message
                hideAllPages();  // Hide all pages after updating
                document.getElementById('edit-btn').style.display = 'none';  // Hide edit button
                showThread(threadId);  // Display the updated thread page
            }
        })
        .catch(error => {
            console.error('Error saving thread:', error);  // Log errors
        });
    }

    // Event listener to return to the dashboard
    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => {
        goto_page('page-dashboard');  // Navigate to the dashboard page
        location.reload();  // Refresh the page
    });

    // Event listener to open the edit profile modal
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        document.getElementById('edit-profile-modal').style.display = 'block';  // Show the profile edit modal
    });

    // Event listener to handle profile form submission
    document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
        e.preventDefault();  // Prevent default form submission

        const token = localStorage.getItem('authToken');  // Get the auth token
        const formData = {
            email: document.getElementById('edit-email').value,  // Updated email
            password: document.getElementById('edit-password').value,  // Updated password
            name: document.getElementById('edit-name').value,  // Updated name
        };

        const imageFile = document.getElementById('edit-image').files[0];  // Get the selected image file
        if (imageFile) {
            const reader = new FileReader();  // Create FileReader to read the image
            reader.onloadend = function() {
                formData.image = reader.result;  // Add image data to form
            }
        }

        console.log(formData);  // Log form data for debugging

        // Send PUT request to update user profile
        fetch(`http://localhost:5005/user`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)  // Send updated profile data
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error updating profile: ' + data.error);  // Show error if any
            } else {
                alert('Profile updated successfully!');  // Show success message
                document.getElementById('edit-profile-modal').style.display = 'none';  // Close the profile edit modal
            }
        })
        .catch(error => console.error('Error updating profile:', error));  // Log errors
    });

    // Event listener to close the profile edit modal when cancel button is clicked
    document.getElementById('cancel-edit-btnc').addEventListener('click', (e) => {
        e.preventDefault();  // Prevent default action
        document.getElementById('edit-profile-modal').style.display = 'none';  // Hide the profile edit modal
    });

    // Event listener to navigate back to the dashboard from the edit page
    document.getElementById('edit-back-btn').addEventListener('click', () => {
        goto_page('page-dashboard');  // Navigate to the dashboard
    });

    
});
