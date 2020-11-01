const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// var peer = new Peer(undefined,{
//     path:'/peerjs',
//     host:'/',
//     port:'3030'
// });
var peer = new Peer();

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connecToNewUser(userId, stream);
    })

    //chat
    let mensaje = $('input')

    $('html').keydown((e) => {
        if (e.which == 13 && mensaje.val().length !== 0) {
            socket.emit('message', mensaje.val());
            mensaje.val('');
        }
    })

    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>User</b><br/>${message}</li>`);
        scrollToBottom();
    })

})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

const connecToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let dea = $('.main__chat__window');
    dea.scrollTop(dea.prop("scrollHeight"));
}

const muteUnMute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone text-danger"></i>
    <span class="text-danger">Mute</span>`;
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash text-success"></i>
    <span class="text-success">Unmute</span>`;
    document.querySelector('.main__mute__button').innerHTML = html;
}

//stop el video
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }else{
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () => {
    const html = `
    <i class="fas fa-video-slash text-success"></i>
    <span class="text-success">Play video</span>`;
    document.querySelector('.main__video__button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video text-danger"></i>
    <span class="text-danger">Stop video</span>`;
    document.querySelector('.main__video__button').innerHTML = html;
}

