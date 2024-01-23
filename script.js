//JavaScript will start loading and displaying once html dom is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    let username = 'johnpapa';
    let currentPage = 1;
    let repositoriesPerPage = 10;

    // Function to show the loader
    function showLoader() {
        const loaderContainer = document.getElementById('loader-container');
        loaderContainer.style.display = 'block';
    }
    
    // Function to hide the loader
    function hideLoader() {
        const loaderContainer = document.getElementById('loader-container');
        loaderContainer.style.display = 'none';
    }

    // Function to set headers with authorization and handle rate limits
    async function setHeaders() {
        const githubToken = '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'; // Replace with your GitHub token
        const response = await fetch('https://api.github.com/rate_limit', {
            headers: {
                Authorization: `Bearer ${githubToken}`,
            },
        });

        if (response.ok) {
            const rateLimitInfo = await response.json();
            const remainingRequests = rateLimitInfo.resources.core.remaining;

            if (remainingRequests === 0) {
                const resetTime = new Date(rateLimitInfo.resources.core.reset * 1000);
                console.log(`API rate limit exceeded. Reset at: ${resetTime}`);
            }

            return {
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                },
            };
            
        } else {
            console.error('Error fetching rate limit info:', response.statusText);
            return {};
        }
    }

    //function to fetch all the user details
    const getUserInfo = async(username) => {
        showLoader();
        const headers = await setHeaders();
        const response = await fetch(`https://api.github.com/users/${username}`, headers);
        const data = await response.json();
        displayUserInfo(data);
    }
        
    //function to display all the required user information
    const displayUserInfo = (data) => {  
        const userInfoContainer = document.getElementById('user-info');
        userInfoContainer.innerHTML = `
            <img src="${data.avatar_url}" alt="Profile Picture">
            <h2>${data.name || data.login}</h2>
            <p>${data.bio || 'No bio available'}</p>
            <p>Location: ${data.location || 'Not specified'}</p>
            <p>GitHub: <a href="${data.html_url}" target="_blank">${data.login}</a></p>
            ${socialLinks(data)}
        `;
    }

    //social links
    function socialLinks(data) {
        const socialLinks = [];
        if (data.twitter_username) {
            socialLinks.push(`<a href="https://twitter.com/${data.twitter_username}" target="_blank">Twitter</a>`);
        }
        if (data.blog) {
            socialLinks.push(`<a href="${data.blog}" target="_blank">Blog</a>`);
        }
        hideLoader();
        return socialLinks.join(' | ');    
    }
    
    //function to get repositories info
    const getRepos = async (username, currentPage) => {
        showLoader();
        const headers = await setHeaders();
        const response = await fetch(`https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${repositoriesPerPage}`, headers);
        setHeaders();
        const reposData = await response.json();
        displayRepos(reposData);
    }

    //function to display repos
    const displayRepos = (reposData) => {
        const repositoriesContainer = document.getElementById('repositories');
            repositoriesContainer.innerHTML = '';
            
            reposData.forEach(repository => {    
                const repositoryElement = document.createElement('div');
                repositoryElement.classList.add('repository');
                repositoryElement.innerHTML = `<h3>${repository.name}</h3>`;
                repositoryElement.innerHTML += `<p class="description">${repository.description || 'No description available'}</p>`;
            
                //function to display languages used
                const languages = async function(owner, repoName){
                    const headers = await setHeaders();
                    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`, headers);
                    const allLanguages = await response.json();
                    repositoryElement.innerHTML += `<p class="lang">${Object.keys(allLanguages).join('</p><p class="lang">') || "Not Defined"}</p>`;
                }
                languages(repository.owner.login, repository.name);
                repositoriesContainer.appendChild(repositoryElement);
            });
            
            pagination();
    }

    //pagination
    function pagination() {
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = `
            <label for="perPage">Repositories per page:</label>
            <select id="perPage" onchange="updatePerPage()">
                <option value="10" ${repositoriesPerPage === 10 ? 'selected' : ''}>10</option>
                <option value="30" ${repositoriesPerPage === 30 ? 'selected' : ''}>30</option>
                <option value="50" ${repositoriesPerPage === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${repositoriesPerPage === 100 ? 'selected' : ''}>100</option>
            </select>
            <button onclick="changePage(-1)">Previous</button>
            <button onclick="changePage(1)">Next</button>
        `;
        hideLoader();
    }

    // Function to update repositories per page
    window.updatePerPage = function () {
        repositoriesPerPage = parseInt(document.getElementById('perPage').value, 10);
        currentPage = 1; // Reset current page when changing repositories per page
        getRepos(username, currentPage);
    }

    // Function to change page
    window.changePage = function (delta) {
        currentPage += delta;
        if (currentPage < 1) {
            currentPage = 1;
        }
        getRepos(username, currentPage);
    };

    //function to search github user with username
    window.searchUser = async function () {
        let inputUsername = document.getElementById('username').value;
        if(inputUsername != ''){
            username = inputUsername;
        }

        getUserInfo(username);
        getRepos(username, currentPage)
    };
    searchUser();

 });