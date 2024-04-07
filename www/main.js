socket_init();
media_init();

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peer_connection = new RTCPeerConnection(configuration);

peer_connection.addEventListener('connectionstatechange', event => {
    if (peer_connection.connectionState === 'connected') {
        // Peers connected!
        console.log("Peers connected!");
    }
});

peer_connection.addEventListener('icecandidate', event => {
    console.log("icecandidate listener, event:");
    console.log(event);
    if (event.candidate) {
        socket_send({ 'ice_candidate': JSON.stringify(event.candidate) });
    }
});

peer_connection.addEventListener('track', async (event) => {
    const [stream_remote] = event.streams;
    set_stream_remote(stream_remote);
});

async function make_call() {
    const offer = await peer_connection.createOffer();
    await peer_connection.setLocalDescription(offer);
    try {
        stream_local.getTracks().forEach(track => {
            peer_connection.addTrack(track, stream_local);
        });
    } catch (ex) { }
    socket_send({ 'user_id': 1, 'user_id_target': 2, 'offer': offer });
    peer_connection.addEventListener("signalingstatechange", (e) => {
        // console.log(e);
        // console.log(peer_connection.signalingState);
    });
}

async function got_offer(offer) {
    peer_connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer_connection.createAnswer();
    await peer_connection.setLocalDescription(answer);
    try {
        stream_local.getTracks().forEach(track => {
            peer_connection.addTrack(track, stream_local);
        });
    } catch (ex) { }
    socket_send({ 'user_id': 2, 'user_id_target': 1, 'answer': answer });
}

async function get_remote_desc(answer) {
    const remote_desc = new RTCSessionDescription(answer);
    await peer_connection.setRemoteDescription(remote_desc);
}

// Listen for remote ICE candidates and add them to the local RTCPeerConnection
async function add_ice_remote(ice_candidate) {
    if (ice_candidate) {
        try {
            await peer_connection.addIceCandidate(ice_candidate);
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
}

document.addEventListener("deviceready", check_permissions, false);

function check_permissions() {
    var permissions = cordova.plugins.permissions;
    permissions.checkPermission(permissions.MODIFY_AUDIO_SETTINGS, function (status) {
        if (status.hasPermission) {
            console.log("Yes has CAMERA :D ");
        }
        else {
            var prms = [permissions.CAMERA, permissions.RECORD_AUDIO];
            permissions.requestPermissions(prms, function (rsp) {
                console.log("camera requestPermission, Yes :D ");
                console.log(rsp);
            }, function (err) {
                console.log("WTF!");
                console.log(err);
            });
        }
    });
}