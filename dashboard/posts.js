document.addEventListener('DOMContentLoaded', async () => {
    let web3Provider;
    const postContainer = document.getElementById('postsContainer');
    const loadingPosts = document.getElementById('loadingPosts');
    let isLoading = false;
    let currentPage = 1;
    const postsPerPage = 10;
    const mobileNavbar = document.querySelector('.mobile-nav');
    let lastScrollPosition = 0;

    const quotes = [
        "Decentralization is the future of social media.",
        "Connect, share, and grow in a decentralized world.",
        "Your data, your control.",
        "Building bridges in the blockchain universe.",
        "Empowering users through decentralized networks."
    ];

    function showQuotes() {
        const quoteElement = document.getElementById('quote');
        let currentQuote = 0;

        function changeQuote() {
            quoteElement.style.opacity = 0;
            setTimeout(() => {
                quoteElement.textContent = quotes[currentQuote];
                quoteElement.style.opacity = 1;
                currentQuote = (currentQuote + 1) % quotes.length;
            }, 500);
        }

        setInterval(changeQuote, 3000);
        changeQuote();
    }

    function showMainContent() {
        const loadingScreen = document.getElementById('initial-loading');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
        }, 500);
    }

    async function initializeWeb3() {
        if (window.ethereum) {
            web3Provider = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            console.error('No web3 provider detected');
        }
    }

    async function getProfilePictureUrl(authorAddress) {
        const pfpContract = new web3Provider.eth.Contract(
            appConfig.contracts.userRegistry.abi,
            appConfig.contracts.userRegistry.address
        );
        const cid = await pfpContract.methods.getCID(authorAddress).call();
        return `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${cid}`;
    }

    function generatePostHTML(post) {
        const isMobile = window.innerWidth <= 991;
        const displayAuthor = isMobile ? `${post.author.slice(0, 6)}...${post.author.slice(-4)}` : post.author;
        const exactTimestamp = new Date(post.timestamp * 1000).toLocaleString();
        
        return `
            <div class="post" data-post-id="${post.postId}">
                <div class="post-header">
                    <img src="${post.profilePictureUrl}" class="rounded-circle mr-2" style="width: 40px; height: 40px;" alt="Profile Picture">
                    <a href="../Author/Author.html?address=${post.author}" class="author-name text-decoration-none text-white">${displayAuthor}</a>
                    <span class="timestamp ml-auto" title="${exactTimestamp}">${exactTimestamp}</span>
                    <span class="mobile-timestamp ml-auto">${formatPostTimestamp(post.timestamp)}</span>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="btn btn-action like-button ${post.isLiked ? 'liked' : ''}" data-post-id="${post.postId}">
                        <i class="fas fa-heart"></i> <span class="like-count">${post.likeCount}</span>
                    </button>
                    <button class="btn btn-action share-button" data-post-id="${post.postId}">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        `;
    }

    function createPostSkeleton() {
        return `
            <div class="post skeleton">
                <div class="post-header">
                    <div class="skeleton-circle"></div>
                    <div class="skeleton-line"></div>
                </div>
                <div class="post-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
                <div class="post-actions">
                    <div class="skeleton-button"></div>
                    <div class="skeleton-button"></div>
                </div>
            </div>
        `;
    }

    function formatPostTimestamp(timestamp) {
        const now = Math.floor(Date.now() / 1000);
        const timeDiff = now - timestamp;
        if (timeDiff < 60) return `${timeDiff}s ago`;
        if (timeDiff < 3600) return `${Math.floor(timeDiff / 60)}m ago`;
        if (timeDiff < 86400) return `${Math.floor(timeDiff / 3600)}h ago`;
        if (timeDiff < 604800) return `${Math.floor(timeDiff / 86400)}d ago`;
        if (timeDiff < 2592000) return `${Math.floor(timeDiff / 604800)}w ago`;
        if (timeDiff < 31536000) return `${Math.floor(timeDiff / 2592000)}mo ago`;
        return `${Math.floor(timeDiff / 31536000)}y ago`;
    }

    async function fetchAndDisplayPosts(page = 1) {
        if (isLoading) return;
        isLoading = true;

        if (page === 1) {
            postContainer.innerHTML = Array(postsPerPage).fill(createPostSkeleton()).join('');
        }

        const postContract = new web3Provider.eth.Contract(
            appConfig.contracts.post.abi,
            appConfig.contracts.post.address
        );
        const totalPostCount = await postContract.methods.totalPosts().call();
        const userAccount = (await web3Provider.eth.getAccounts())[0];

        const startIndex = Math.max(totalPostCount - 1 - (page - 1) * postsPerPage, 0);
        const endIndex = Math.max(startIndex - postsPerPage + 1, 0);

        const posts = await Promise.all(
            Array.from({ length: startIndex - endIndex + 1 }, async (_, index) => {
                const i = startIndex - index;
                const post = await postContract.methods.getPost(i).call();
                const profilePictureUrl = await getProfilePictureUrl(post[0]);
                const isLiked = await postContract.methods.hasLikedPost(i, userAccount).call();
                return {
                    postId: i,
                    author: post[0],
                    content: post[1],
                    timestamp: parseInt(post[2]),
                    likeCount: parseInt(post[3]),
                    profilePictureUrl: profilePictureUrl,
                    isLiked: isLiked
                };
            })
        );

        if (page === 1) {
            postContainer.innerHTML = '';
        }

        posts.forEach(post => {
            const postHTML = generatePostHTML(post);
            postContainer.innerHTML += postHTML;
        });

        addEventListeners();
        isLoading = false;
        loadingPosts.style.display = 'none';

        if (endIndex === 0) {
            window.removeEventListener('scroll', handleInfiniteScroll);
        }
    }

    function addEventListeners() {
        document.querySelectorAll('.like-button').forEach(button => {
            button.addEventListener('click', handleLikeClick);
        });

        document.querySelectorAll('.share-button').forEach(button => {
            button.addEventListener('click', handleShareClick);
        });
    }

    async function handleLikeClick(event) {
        const button = event.currentTarget;
        const postId = button.getAttribute('data-post-id');
        const likeCount = button.querySelector('.like-count');
        const isLiked = button.classList.contains('liked');

        const postContract = new web3Provider.eth.Contract(
            appConfig.contracts.post.abi,
            appConfig.contracts.post.address
        );
        const userAccount = (await web3Provider.eth.getAccounts())[0];

        try {
            if (isLiked) {
                await postContract.methods.dislikePost(postId).send({ from: userAccount });
                button.classList.remove('liked');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            } else {
                await postContract.methods.likePost(postId).send({ from: userAccount });
                button.classList.add('liked');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }

    async function handleShareClick(event) {
        const postId = event.currentTarget.getAttribute('data-post-id');
        const postLink = `${window.location.origin}/sharepost/display_shared_post.html?postid=${postId}`;
        
        try {
            await navigator.clipboard.writeText(postLink);
            showNotification('Link copied to clipboard', 'success');
        } catch (error) {
            console.error('Failed to copy link to clipboard:', error);
            showNotification('Failed to copy link. Please try again.', 'error');
        }
    }

    async function createPost(content) {
        const postContract = new web3Provider.eth.Contract(
            appConfig.contracts.post.abi,
            appConfig.contracts.post.address
        );
        const userAccount = (await web3Provider.eth.getAccounts())[0];

        try {
            showNotification('Creating post...');
            const transaction = await postContract.methods.createPost(content).send({ from: userAccount });
            const postId = transaction.events.PostCreated.returnValues.postId;
            const profilePictureUrl = await getProfilePictureUrl(userAccount);
            const post = {
                postId: postId,
                author: userAccount,
                content: content,
                timestamp: Math.floor(Date.now() / 1000),
                profilePictureUrl: profilePictureUrl,
                likeCount: 0,
                isLiked: false
            };
            const postHTML = generatePostHTML(post);
            postContainer.insertAdjacentHTML('afterbegin', postHTML);
            addEventListeners();
            showNotification('Post created successfully!', 'success');
        } catch (error) {
            console.error('Error creating post:', error);
            showNotification('Failed to create post. Please try again.', 'error');
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.getElementById('postNotification');
        const notificationText = document.getElementById('postNotificationText');
        notificationText.textContent = message;
        notification.className = `post-notification ${type}`;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    function handleInfiniteScroll() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500 && !isLoading) {
            currentPage++;
            loadingPosts.style.display = 'block';
            fetchAndDisplayPosts(currentPage);
        }

        const currentScrollPosition = window.pageYOffset;
        if (currentScrollPosition > lastScrollPosition) {
            mobileNavbar.classList.add('hide');
        } else {
            mobileNavbar.classList.remove('hide');
        }
        lastScrollPosition = currentScrollPosition;
    }

    async function initialize() {
        await initializeWeb3();
        showQuotes();

        setTimeout(async () => {
            await fetchAndDisplayPosts();
            showMainContent();
        }, 3000);

        window.addEventListener('scroll', handleInfiniteScroll);

        document.getElementById('postButton')?.addEventListener('click', async () => {
            const content = document.getElementById('postContent').value;
            if (content.trim()) {
                await createPost(content);
                $('#postModal').modal('hide');
                document.getElementById('postContent').value = '';
            }
        });

        ['profileButton', 'mobileProfileButton'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', async (e) => {
                e.preventDefault();
                const accounts = await web3Provider.eth.getAccounts();
                window.location.href = `../Profile/profile.html?address=${accounts[0]}`;
            });
        });

        document.getElementById('disconnectButton')?.addEventListener('click', async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    window.location.href = '../signin/signin.html';
                } catch (error) {
                    console.error("Error disconnecting MetaMask:", error);
                }
            }
        });

        await updateUserInfo();
    }

    async function updateUserInfo() {
        const userContract = new web3Provider.eth.Contract(
            appConfig.contracts.userRegistry.abi,
            appConfig.contracts.userRegistry.address
        );
        const userAccount = (await web3Provider.eth.getAccounts())[0];
        const username = await userContract.methods.getUsername(userAccount).call();
        const profilePicCID = await userContract.methods.getCID(userAccount).call();

        document.getElementById('connected_username').textContent = username;
        document.getElementById('fullAddress').textContent = userAccount;
        if (profilePicCID) {
            document.getElementById('userpfp').src = `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${profilePicCID}`;
        }
    }

    function updateTimestamps() {
        document.querySelectorAll('.mobile-timestamp').forEach(timestamp => {
            const postTime = parseInt(timestamp.closest('.post').dataset.postId);
            timestamp.textContent = formatPostTimestamp(postTime);
        });
    }

    setInterval(updateTimestamps, 60000);

    function handleResponsiveDesign() {
        const isMobile = window.innerWidth <= 991;
        document.querySelectorAll('.post').forEach(post => {
            const authorElement = post.querySelector('.author-name');
            const author = authorElement.textContent;
            authorElement.textContent = isMobile ? `${author.slice(0, 6)}...${author.slice(-4)}` : author;
        });
    }

    window.addEventListener('resize', handleResponsiveDesign);

    await initialize();
    handleResponsiveDesign();
});