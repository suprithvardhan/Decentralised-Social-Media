document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const postid = urlParams.get('postid');
    if (postid) {
        console.log('postid', postid);
        fetchAndDisplaySharedPosts(postid);
    }
});

async function fetchAndDisplaySharedPosts(postid) {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.requestAccounts();
     
        const postContract = new web3.eth.Contract(
            appConfig.contracts.post.abi,
            appConfig.contracts.post.address);
        const userRegistryContract = new web3.eth.Contract(
            appConfig.contracts.userRegistry.abi,
            appConfig.contracts.userRegistry.address);

        try {
            const post = await postContract.methods.getPost(postid).call();
            const author = post.author;
            const content = post.content;
            const timestamp = new Date(post.timestamp * 1000).toLocaleString();
            const likesCount = post.likesCount;

            const username = await userRegistryContract.methods.getUsername(author).call();
            const profileCID = await userRegistryContract.methods.getCID(author).call();
            const profilePictureUrl = `https://purple-wonderful-jay-289.mypinata.cloud/ipfs/${profileCID}`;

            const postContent = `
                <div class="shared-post">
                    <div class="details d-flex align-items-center">
                        <div class="profile-picture-icon">
                            <img src="${profilePictureUrl}" class="rounded-circle" style="width: 40px; height: 40px;" alt="Profile Picture">
                        </div>
                        <a href="../Author/Author.html?address=${author}" class="author-name ml-2 text-decoration-none text-white">${username}</a>
                        <span class="timestamp ml-auto">${timestamp}</span>
                    </div>
                    <div class="post-content mt-2 ml-2">${content}</div>
                    <div class="interactive-icons d-flex ml-2 mt-3">
                        <div class="like-icon btn btn-secondary" data-post-id="${postid}" data-liked="false">
                            <i class="fas fa-heart"></i>
                            <span class="like-count">${likesCount}</span>
                        </div>
                        <div class="share-icon btn btn-secondary ml-3" data-post-id="${postid}">
                            <i class="fas fa-share"></i>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('postContent').innerHTML = postContent;
        } catch (error) {
            console.error('Error fetching post:', error);
        }
    } else {
        console.error('MetaMask is not installed');
    }
}
