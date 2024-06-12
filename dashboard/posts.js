document.addEventListener('DOMContentLoaded', async () => {
    try {
        const postContainer = document.getElementById('rightSection');
        let web3Provider;

        async function fetchAndDisplayPosts() {
            web3Provider = new Web3(window.ethereum);

            const postContractAddress = '0x79FFFEFB1c5D585703EA33aD0B7c981b69fc56f7'; // Replace with your new contract address
            const postContractAbi =[
                {"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"dislikePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"likePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"PostCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"disliker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostDisliked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"liker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostLiked","type":"event"},{"inputs":[],"name":"getAllPosts","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"getPost","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostCountByUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostIdsByUser","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostsByAddress","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"},{"internalType":"address","name":"_userAddress","type":"address"}],"name":"hasLikedPost","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"postExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"posts","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"likesCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
            ];
            const postContract = new web3Provider.eth.Contract(postContractAbi, postContractAddress);
            const totalPostCount = await postContract.methods.totalPosts().call();

            for (let i = 0; i < totalPostCount; i++) {
                const post = await postContract.methods.posts(i).call();
                const profilePictureUrl = await getProfilePictureUrl(post.author);
                const likeCount = await postContract.methods.posts(i).call(); // Get like count for the post
                post.postId = i;
                post.profilePictureUrl = profilePictureUrl;
                post.likeCount = likeCount.likesCount; // Add like count to post object
                displayPost(post);
            }
        }

        async function getProfilePictureUrl(authorAddress) {
            const pfpContractAddress = '0x1C9ce176f4D2556749e86EDF43a5Ad354ECF0154'; // Replace with your actual pfp contract address
            const pfpContractAbi = [
                {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"cid","type":"string"}],"name":"CIDStored","type":"event"},{"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"registerUsername","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_cid","type":"string"}],"name":"storeCID","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"username","type":"string"}],"name":"UsernameRegistered","type":"event"},{"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"getAddressByUsername","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getUsername","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"isUserAlreadySignedUp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_username","type":"string"}],"name":"usernameAvailability","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}
            ];

            const pfpContract = new web3Provider.eth.Contract(pfpContractAbi, pfpContractAddress);
            const cid = await pfpContract.methods.getCID(authorAddress).call();
            const profilePictureUrl = `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${cid}`;
            return profilePictureUrl;
        }

        function generatePostHTML(post) {
            return `
                <section class="container mt-2 pt-5 mx-5">
                    <div class="row">
                        <div class="col-md-9">
                            <div class="details d-flex align-items-center">
                                <div class="profile-picture-icon">
                                    <img src="${post.profilePictureUrl}" class="rounded-circle" style="width: 40px; height: 40px;" alt="Profile Picture">
                                </div>
                                <a href="../Author/Author.html?address=${post.author}" class="author-name ml-3 text-decoration-none text-white">${post.author}</a>
                                <span class="timestamp ml-auto">${new Date(post.timestamp * 1000).toLocaleString()}</span>
                            </div>
                            <div class="post-content mt-1 ml-3 pt-4">${post.content}</div>
                            <div class="interactive-icons d-flex ml-3 mt-2 pt-4">
                                <div class="like-icon btn btn-secondary" data-post-id="${post.postId}" data-liked="false">
                                    <i class="fas fa-heart"></i>
                                    <span class="like-count">${post.likeCount}</span>
                                </div>
                                <div class="share-icon btn btn-secondary ml-3"  data-post-id="${post.postId}">
                                    <i class="fas fa-share"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr class="bg-secondary mx-2">
                </section>`;
        }
        ``
        

        function displayPost(post) {
            const postHTML = generatePostHTML(post);
            postContainer.innerHTML = postHTML + postContainer.innerHTML;
            addLikeEventListeners();
            addshareEventListeners();
        }

        async function createPost(content) {
            const postContractAddress = '0x79FFFEFB1c5D585703EA33aD0B7c981b69fc56f7'; // Replace with your new contract address
            const postContractAbi =[
                {"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"dislikePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"likePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"PostCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"disliker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostDisliked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"liker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostLiked","type":"event"},{"inputs":[],"name":"getAllPosts","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"getPost","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostCountByUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostIdsByUser","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostsByAddress","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"},{"internalType":"address","name":"_userAddress","type":"address"}],"name":"hasLikedPost","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"postExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"posts","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"likesCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
            ];
            const postContract = new web3Provider.eth.Contract(postContractAbi, postContractAddress);
            const accounts = await web3Provider.eth.requestAccounts();
            const userAccount = accounts[0];

            await postContract.methods.createPost(content).send({ from: userAccount });

            const profilePictureUrl = await getProfilePictureUrl(userAccount);
            const post = {
                author: userAccount,
                content,
                timestamp: Math.floor(Date.now() / 1000),
                profilePictureUrl
                
            };

            displayPost(post);
        }

        async function toggleLike(postId, likeElement) {
            const postContractAddress = '0x79FFFEFB1c5D585703EA33aD0B7c981b69fc56f7'; // Replace with your new contract address
            const postContractAbi =[
                {"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"dislikePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"likePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"PostCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"disliker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostDisliked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"liker","type":"address"},{"indexed":false,"internalType":"uint256","name":"likesCount","type":"uint256"}],"name":"PostLiked","type":"event"},{"inputs":[],"name":"getAllPosts","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"getPost","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostCountByUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostIdsByUser","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_userAddress","type":"address"}],"name":"getPostsByAddress","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"string[]","name":"","type":"string[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"},{"internalType":"address","name":"_userAddress","type":"address"}],"name":"hasLikedPost","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"postExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"posts","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"likesCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
            ];
            const postContract = new web3Provider.eth.Contract(postContractAbi, postContractAddress);
            const accounts = await web3Provider.eth.requestAccounts();
            const userAccount = accounts[0];
            const liked = likeElement.getAttribute('data-liked') === 'true';

            if (liked) {
                await postContract.methods.dislikePost(postId).send({ from: userAccount });
                likeElement.setAttribute('data-liked', 'false');
                likeElement.querySelector('i').classList.remove('text-danger');
            } else {
                await postContract.methods.likePost(postId).send({ from: userAccount });
                likeElement.setAttribute('data-liked', 'true');
                likeElement.querySelector('i').classList.add('text-danger');
            }
        }

        
        function addLikeEventListeners() {
            const likeButtons = document.querySelectorAll('.like-icon');
            likeButtons.forEach(likeButton => {
                const postId = likeButton.getAttribute('data-post-id');
                likeButton.addEventListener('click', async () => {
                    await toggleLike(postId, likeButton);
                    });
            });
        }

        async function sharePost(postId, shareElement) {
            const postLink = `http://127.0.0.1:5500/test_working_project/sharepost/display_shared_post.html?postid=${postId}`; // Example link format
            try {
                await navigator.clipboard.writeText(postLink);
                console.log('Link copied to clipboard:', postLink);
                
                // Create floating overlay div
                const overlayDiv = document.createElement('div');
                overlayDiv.classList.add('overlay');
                overlayDiv.textContent = 'Copied to clipboard';
                document.body.appendChild(overlayDiv);
        
                // Remove the overlay after a short delay (e.g., 3 seconds)
                setTimeout(() => {
                    document.body.removeChild(overlayDiv);
                }, 3000);
            } catch (error) {
                console.error('Failed to copy link to clipboard:', error);
            }
        }
        
        function addshareEventListeners() {
            const shareButtons = document.querySelectorAll('.share-icon');
            shareButtons.forEach(shareButton => {
                const postId = shareButton.getAttribute('data-post-id');
                shareButton.addEventListener('click', async () => {
                    await sharePost(postId, shareButton);
                });
            });
        }

        fetchAndDisplayPosts();
        

        const postButton = document.getElementById('postButton');
        const postContent = document.getElementById('postContent');

        if (postButton && postContent) {
            postButton.addEventListener('click', async () => {
                const content = postContent.value;
                await createPost(content);
                $('#postModal').modal('hide');
                postContent.value = '';
            });
        } else {
            console.error('postButton or postContent element not found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

