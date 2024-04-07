var stream_local;
async function media_init() {
    try {
        const cameras = await get_connected_devices('videoinput');
        // updateCameraList(cameras);
        if (cameras && cameras.length > 0) {
            // Open first available video camera with a resolution of 1280x720 pixels
            stream_local = await open_camera(cameras[0].deviceId, 1280, 720);
            // console.log('Got MediaStream:', stream_local);
            set_stream_local(stream_local);
        }
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

function set_stream_local(stream) {
    const el = document.querySelector('video#local');
    el.srcObject = stream;
}

function set_stream_remote(stream) {
    const el = document.querySelector('video#remote');
    el.srcObject = stream;
}

async function open_camera(cameraId, minWidth, minHeight) {
    const constraints = {
        'audio': true,
        'video': {
            'deviceId': cameraId,
            // 'width': { 'min': minWidth },
            // 'height': { 'min': minHeight }
        }
    }
    return await navigator.mediaDevices.getUserMedia(constraints);
}

// Updates the select element with the provided set of cameras
function update_camera_list(cameras) {
    cameras.forEach(camera => console.log(`${camera.label}, ${camera.label}`));
}

// Fetch an array of devices of a certain type
async function get_connected_devices(type) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === type)
}

// Listen for changes to media devices and update the list accordingly
navigator.mediaDevices.addEventListener('devicechange', async event => {
    const newCameraList = await get_connected_devices('video');
    update_camera_list(newCameraList);
});