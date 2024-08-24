document.addEventListener('DOMContentLoaded', async () => {
    let web3Provider;
    let userRegistryContract;
    let userAccount;
    let cropper;

    const PINATA_API_KEY = '3db15efd4462cbddeeb2';
    const PINATA_SECRET_API_KEY = '81cb93e99da565a57aca234048af75c4083a5e49274016e4bba47258abf0e3dc';

    async function initializeWeb3() {
        if (window.ethereum) {
            web3Provider = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                userAccount = (await web3Provider.eth.getAccounts())[0];
                userRegistryContract = new web3Provider.eth.Contract(
                    appConfig.contracts.userRegistry.abi,
                    appConfig.contracts.userRegistry.address
                );
                await loadCurrentSettings();
                await updateUserInfo();
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            console.error('No web3 provider detected');
        }
    }

    async function loadCurrentSettings() {
        const username = await userRegistryContract.methods.getUsername(userAccount).call();
        document.getElementById('username').value = username;
        
        const cid = await userRegistryContract.methods.getCID(userAccount).call();
        if (cid) {
            updateProfilePicture(`https://ipfs.io/ipfs/${cid}`);
        }
    }

    function updateProfilePicture(src) {
        const profilePreview = document.getElementById('profilePreview');
        const userpfp = document.getElementById('userpfp');
        profilePreview.src = src;
        userpfp.src = src;
        profilePreview.style.display = 'block';
        document.querySelector('.camera-icon').style.display = 'none';
    }

    async function updateUserInfo() {
        const username = await userRegistryContract.methods.getUsername(userAccount).call();
        document.getElementById('connected_username').textContent = username;
        document.getElementById('fullAddress').textContent = userAccount;
    }

    async function uploadImageToPinata(imageBlob) {
        const formData = new FormData();
        formData.append('file', imageBlob, 'profile_image.png');
        try {
            updateLoadingMessage("Uploading image to Pinata...");
            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_API_KEY
                }
            });

            const data = response.data;
            console.log("Uploaded to Pinata:", data.IpfsHash);
            updateLoadingMessage("Image uploaded successfully");
            return data.IpfsHash;
        } catch (error) {
            console.error('Error uploading file to Pinata:', error);
            throw error;
        }
    }

    async function updateSettings(event) {
        event.preventDefault();
        showLoadingOverlay();

        const newUsername = document.getElementById('username').value;
        const profilePicture = document.getElementById('profilePicture').files[0];

        try {
            if (newUsername !== await userRegistryContract.methods.getUsername(userAccount).call()) {
                updateLoadingMessage("Checking username availability...");
                const isAvailable = await userRegistryContract.methods.usernameAvailability(newUsername).call();
                if (!isAvailable) {
                    throw new Error('Username is not available');
                }
                updateLoadingMessage("Updating username...");
                await userRegistryContract.methods.updateUsername(newUsername).send({ from: userAccount });
                console.log('Username updated successfully');
            }

            if (profilePicture) {
                updateLoadingMessage("Preparing image for upload...");
                const croppedCanvas = cropper.getCroppedCanvas({
                    width: 200,
                    height: 200,
                });

                croppedCanvas.toBlob(async (blob) => {
                    try {
                        const cid = await uploadImageToPinata(blob);
                        updateLoadingMessage("Storing CID in contract...");
                        await userRegistryContract.methods.storeCID(cid).send({ from: userAccount });
                        console.log('Profile picture updated successfully');
                        updateProfilePicture(`https://ipfs.io/ipfs/${cid}`);
                    } catch (error) {
                        console.error('Error updating profile picture:', error);
                        alert('Error updating profile picture. Please try again.');
                    }
                }, 'image/png');
            }

            updateLoadingMessage("Settings updated successfully!");
            await updateUserInfo();
            simulateProgress(80, 100, 1000);
            setTimeout(() => {
                hideLoadingOverlay();
            }, 2000);
        } catch (error) {
            console.error('Error updating settings:', error);
            updateLoadingMessage(error.message);
            simulateProgress(80, 100, 1000);
            setTimeout(() => {
                hideLoadingOverlay();
            }, 3000);
        }
    }

    function initializeCropper() {
        const profileImageContainer = document.getElementById('profileImageContainer');
        const profilePictureInput = document.getElementById('profilePicture');
        const cropModal = document.getElementById('cropModal');
        const cropButton = document.getElementById('cropButton');

        profileImageContainer.addEventListener('click', () => profilePictureInput.click());

        profilePictureInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('cropperImage').src = e.target.result;
                    $(cropModal).modal('show');
                };
                reader.readAsDataURL(file);
            }
        });

        $(cropModal).on('shown.bs.modal', () => {
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(document.getElementById('cropperImage'), {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                cropBoxMovable: false,
                cropBoxResizable: false,
                minCropBoxWidth: 200,
                minCropBoxHeight: 200,
            });
        });

        cropButton.addEventListener('click', () => {
            const croppedCanvas = cropper.getCroppedCanvas({
                width: 200,
                height: 200,
            });

            croppedCanvas.toBlob((blob) => {
                const file = new File([blob], 'profile_picture.png', { type: 'image/png' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                profilePictureInput.files = dataTransfer.files;

                updateProfilePicture(croppedCanvas.toDataURL());
                $(cropModal).modal('hide');
            }, 'image/png');
        });
    }

    function showLoadingOverlay() {
        document.getElementById('loadingOverlay').style.display = 'flex';
        updateProgressBar(0);
    }

    function hideLoadingOverlay() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    function updateLoadingMessage(message) {
        document.getElementById('loadingMessage').textContent = message;
    }

    function updateProgressBar(percentage) {
        document.getElementById('progressBar').style.width = `${percentage}%`;
    }

    let progressInterval;
    function simulateProgress(startPercentage, endPercentage, duration) {
        clearInterval(progressInterval);
        let progress = startPercentage;
        const step = (endPercentage - startPercentage) / (duration / 100);
        progressInterval = setInterval(() => {
            progress += step;
            if (progress >= endPercentage) {
                progress = endPercentage;
                clearInterval(progressInterval);
            }
            updateProgressBar(progress);
        }, 100);
    }

    // Initialize everything
    await initializeWeb3();
    initializeCropper();

    // Event listeners
    document.getElementById('settingsForm').addEventListener('submit', updateSettings);
    document.getElementById('disconnectButton').addEventListener('click', () => {
        // Implement disconnect logic here
        console.log('Disconnect clicked');
    });

    // Implement search functionality
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length > 0) {
            try {
                const [addresses, usernames] = await userRegistryContract.methods.getAllUsernames().call();
                const filteredResults = usernames
                    .map((username, index) => ({ username, address: addresses[index] }))
                    .filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));

                searchResults.innerHTML = '';
                filteredResults.forEach(user => {
                    const resultItem = document.createElement('div');
                    resultItem.textContent = user.username;
                    resultItem.addEventListener('click', () => {
                        // Implement navigation to user profile
                        console.log(`Navigate to profile of ${user.username} (${user.address})`);
                    });
                    searchResults.appendChild(resultItem);
                });
                searchResults.style.display = 'block';
            } catch (error) {
                console.error('Error searching users:', error);
            }
        } else {
            searchResults.style.display = 'none';
        }
    });

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
});