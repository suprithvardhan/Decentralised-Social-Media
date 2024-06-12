async function fetchAndDisplaySharedPosts(postid) {
    
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const postid = urlParams.get('postid');
    if (postid) {
        console.log('postid', postid);
       fetchAndDisplaySharedPosts(postid);
    }
});