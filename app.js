const startCallButton = document.getElementById('startCall');
const endCallButton = document.getElementById('endCall');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};

const startCall = async () => {
    startCallButton.disabled = true;
    endCallButton.disabled = false;

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(servers);

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // Send the candidate to the remote peer
            console.log('New ICE candidate:', event.candidate);
        }
    };

    peerConnection.ontrack = event => {
        if (!remoteStream) {
            remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
    };

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        // Send the offer to the remote peer
        console.log('Offer:', offer);
    } catch (error) {
        console.error('Error creating offer:', error);
    }
};

const endCall = () => {
    peerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
    startCallButton.disabled = false;
    endCallButton.disabled = true;
};

startCallButton.addEventListener('click', startCall);
endCallButton.addEventListener('click', endCall);
