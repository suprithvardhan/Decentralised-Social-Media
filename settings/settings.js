document.addEventListener('DOMContentLoaded', async () => {
    let web3Provider;
    let userRegistryContract;
    let userAccount;

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
    }

    async function updateSettings(event) {
        event.preventDefault();
        const newUsername = document.getElementById('username').value;
        const profilePicture = document.getElementById('profilePicture').files[0];

        if (newUsername) {
            try {
                await userRegistryContract.methods.updateUsername(newUsername).send({ from: userAccount });
                console.log('Username updated successfully');
            } catch (error) {
                console.error('Error updating username:', error);
            }
        }

        if (profilePicture) {
            try {
                const formData = new FormData();
                formData.append('file', profilePicture);

                const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${appConfig.pinataJWT}`
                    },
                    body: formData
                });

                const result = await response.json();
                const cid = result.IpfsHash;

                await userRegistryContract.methods.storeCID(cid).send({ from: userAccount });
                console.log('Profile picture updated successfully');
            } catch (error) {
                console.error('Error updating profile picture:', error);
            }
        }

        alert('Settings updated successfully');
    }

    await initializeWeb3();
    await loadCurrentSettings();

    document.getElementById('settingsForm').addEventListener('submit', updateSettings);
});