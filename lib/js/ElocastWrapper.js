// import io from 'socket.io.client'

class ElocastWrapper {
    //must pass in the channelName, the link to the gif that will be used for the alert, as well as the link to be used for the audio.
    constructor(channelName, gifLink, audioLink) {
        this.baseElocastPath = 'https://api.elocast.com'
        this.webSocketPath = 'wss://api.elocast.com/ws/'
        this.oAuthPath = 'https://auth.elocast.com/authorise'
        this.oAuthTokenPath = 'https://api.elocast.com/oauth2/token'
        this.channelName = channelName
        this.gifLink = gifLink
        this.audioLink = audioLink
        this.alertText = '<span id="followername"></span> is now following!'
    }

    openWebSocket() {
        const chatSocket = io('https://api.elocast.com', {
            path: '/ws/',
            transports: ['websocket'],
            reconnect: true
        });
        // var chatSocket = io(`${this.webSocketPath}`, {
        //     reconnect: true
        // });
        chatSocket.on('connect', (data) => {
            // showAdminMessage({
            //     message: 'Joined '+vimmname+' (Vimm)',
            //     timeout: fade
            //   });
            console.log('yo we connected');
        });

        chatSocket.emit('JOIN', 'public.channel', '692dbbcc-748e-43d6-9554-63706d5d6237');
        

        chatSocket.on('chat.message.created', (data) => {
            console.log(data.message.content)
            showAdminMessage({
                message: data.message.content,
                timeout: fade
              });
        });
    }
}

var elocastWrapper = new ElocastWrapper(elocast_name, 'https://media1.tenor.com/images/c7504b9fb03c95b3b5687d744687e11c/tenor.gif?itemid=7212866', 'https://www.vimm.tv/static/sound/newfollow.mp3');
elocastWrapper.openWebSocket();