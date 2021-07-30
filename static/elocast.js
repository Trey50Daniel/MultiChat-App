if(elocast_name){
    connectElocast();
  }
  
  window.txids = [];
  
  /*
  Elocast Functions
  */
  function connectElocast() {
    var chatSocketElocast = new ReconnectingWebSocket('wss://api.elocast.com/ws/');
  
    //This gets executed when the client makes a successful connection to the chat server
    chatSocketElocast.onopen = function(e) {
      console.log('Sucessfully connected to chat.');
      showAdminMessage({
        message: 'Joined '+elocast_name+' (Elocast)',
        timeout: fade
      });
      //$("#chat-log").append('<tr><td class="text-center text-success">Connection Successful! You are now talking in "{{room_name}}".</td></tr>');
      keepAlive();
      setInterval(function(){
        keepAlive();
      }, 30000);
    }
  
    //This gets executed when the client closes the connection to the websocket.
    chatSocketElocast.onclose = function(e) {
      console.log('Chat socket closed unexpectedly');
      //$("#chat-log").append('<tr><td class="text-center text-warning">You have been disconnected from chat. Reconnecting in 3 seconds...</td></tr>');
      setTimeout(function() {
        connect();
      }, 3000);
    }
  
    //This gets executed when an error occurs on the websocket room_name
    chatSocketElocast.onerror = function(e) {
      console.error('An error caused the chat client to disconnect.');
  
      //close the connection to trigger the auto reconnection
      chatSocketElocast.close();
    }
  
    //This catches messages from the websocket and interacts with the DOM according the the type of message
    chatSocketElocast.onmessage = function(e) {
      var data = JSON.parse(e.data);
      var message = data['message'];
      var chatter = data['chatter'];
      var prefix = data['prefix'];
      var type = data['mtype'];
      var prefix2 = prefix.replace('[dev]','<span class="badge badge-primary badge-square" title="Elocast.tv Developer"><i class="fa fa-cog"></i></span>').replace('[op]','<span class="badge badge-primary badge-square" title="Elocast.tv Admin"><i class="fas fa-gavel"></i></span>').replace('[rep]','<span class="badge badge-primary badge-square" title="Elocast.tv Curator"><i class="fa fa-chevron-circle-up"></i></span>').replace('[sup]','<span class="badge badge-warning badge-square" title="Elocast.tv Supporter"><i class="fas fa-hands-helping"></i></span>');
  
      if(type == "message"){
        if (data['chatter'] == "elocast"){
          //$("#chat-log").append('<tr><td style="width: 100%;" class="chatmessagerow text-center text-primary">'+message+'</td></tr>');
          showAdminMessage({
            message: HTMLDecode(data['message'].replace(/(<([^>]+)>)/ig,"")),
            timeout: fade
          });
        } else {
          // TIME STAMP
          timestamp = new Date();
          timestamp1 = timestamp.getHours()+":"+timestamp.getMinutes();
          //$("#chat-log").append('<tr><td style="width: 100%;" class="chatmessagerow">'+prefix2+' <b class="user-name-twitch" data-toggle="tooltip" data-html="true" title="&lt;div class=&quot;row bg-dark&quot;&gt;&lt;div class=&quot;col text-center p-0&quot;&gt;&lt;div style=&quot;background: url(https://www.elocast_.tv/@'+data['chatter']+'/avatar); background-size: cover; background-position: center; width: 64px; height: 64px;&quot;&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class=&quot;col p-10&quot;&gt;&lt;b style=&quot;text-transform: capitalize;&quot;&gt;'+data['chatter']+'&lt;/b&gt;&lt;/div&gt;&lt;/div&gt;">'+data['chatter']+'</b>{% if room_name == request.user.username and "'+data['chatter']+'" != request.user.username %} <i class="fas fa-ban text-danger" onclick="ban(\''+data['chatter']+'\');" title="Ban '+data['chatter']+' from your chat."></i> {% endif %}: '+message+'</td></tr>');
          console.log(data['channel']);
          showMessageElocast(data['channel'],'chat',data['chatter'],data['message'],fade);
        }
      }
    }
  
    //We need a keepAlive signal to maintain the connection between client and server.
    function keepAlive(){
      chatSocketElocast.send(JSON.stringify({
        'mtype': 'signal',
        'message': '',
        'chatter': '{{room_name}}',
        'channel': '{{room_name}}',
      }));
    }
  
  }
  
  // Gem donations chat notifications
  function SortByID(x,y) {
    return x.quantity - y.quantity; 
  }
  function getTokenHistory(chatNotif){
      $.ajax({
          type: "GET",
          beforeSend: function(xhttp) {
              //window.top3 = "";
          },
          url: "https://accounts.hive-engine.com/accountHistory?account="+ steem_id +"&symbol=VIMM",
          //url: "https://api.steem-engine.com/accounts/history?account="+ steem_id +"&limit=1000&offset=0&type=user&symbol=VIMM",
          success: function(tokenHistory) {
              tokenHistory.sort(SortByID);
              for (var i in tokenHistory){
                  if(tokenHistory[i].operation == "tokens_transfer" && tokenHistory[i].from != steem_id){
                      amount = parseFloat(tokenHistory[i].quantity).toFixed(3);
                      if(!window.txids.includes(tokenHistory[i].transactionId)){
                          txids.push(tokenHistory[i].transactionId);
                          if(chatNotif){
                              let memo = "";
                              if(tokenHistory[i].memo != "" && tokenHistory[i].memo != null){
                                  memo = " "+tokenHistory[i].memo;
                              }
                              let gemMsgString = '<b>'+tokenHistory[i].from+' gifted '+amount+' Gems</b>'+memo;
                              showMessageElocast(elocast_name,'chat',"ElocastBot",gemMsgString,fade);
                              console.log(gemMsgString); //debug
                          }
                      }
                  }
              }
          },
          error: function(msg) {
              console.log(msg);
              reject(msg);
          }
      });
  }
  
  document.addEventListener("DOMContentLoaded", function(){
      getTokenHistory(false);
      setInterval(function(){
          getTokenHistory(true);
      }, 30000);
  });
  //////////////////////////////////////////
  
  function showMessageElocast(chan, type, chatter, message, timeout = 0) {
    let chatLine_ = document.createElement('div');
    let chatLine = document.createElement('div');
    chatLine_.classList.add('chat-line');
    chatLine.classList.add('chat-line-inner');
    chatLine_.appendChild(chatLine);
  
    if(chan) {
      chatLine_.setAttribute('channel', chan);
    }
  
    if(type === 'chat') {
      let spaceEle = document.createElement('span');
      spaceEle.innerText = ' ';
      let badgeEle = document.createElement('span');
      let url = "https://www.elocast_.tv/static/img/token.png";
      let bele = document.createElement('img');
      bele.setAttribute('src', url);
      bele.setAttribute('badgeType', type);
      bele.setAttribute('alt', 'elocast_');
      bele.setAttribute('style', 'width: 20px; height: 20px;');
      bele.classList.add('cbadge');
      badgeEle.appendChild(bele);
      if(chatter.toLowerCase() == elocast_name){
        let bcele = document.createElement('i');
        bcele.classList.add('fa');
        bcele.classList.add('fa-crown');
        bcele.setAttribute('style', 'font-size: 18px; margin-left: 5px;');
        badgeEle.appendChild(bcele);
      }
  
      let nameEle = document.createElement('span');
      nameEle.classList.add('user-name-elocast_');
      nameEle.innerText = chatter;
  
      let colonEle = document.createElement('span');
      colonEle.classList.add('message-colon');
      colonEle.innerText = ': ';
  
      let messageEle = document.createElement('span');
      messageEle.classList.add('message');
      messageEle.innerHTML = message;
  
      chatLine.appendChild(badgeEle);
      chatLine.appendChild(spaceEle);
      chatLine.appendChild(nameEle);
      chatLine.appendChild(colonEle);
      chatLine.appendChild(messageEle);
  
      // Sending message to discord webhook
      if(discordwebhook){
        sendToDiscord(chatter, "Elocast", 'https://www.elocast_.tv/@'+chatter+'/avatar', HTMLDecode(message.replace(/(<([^>]+)>)/ig,"")));
      }
    }
    else if(type === 'admin') {
      chatLine_.classList.add('admin');
  
      let messageEle = document.createElement('span');
      messageEle.classList.add('message');
      messageEle.innerText = message;
  
      chatLine.appendChild(messageEle);
    }
  
    chatEle.appendChild(chatLine_);
  
    setTimeout(() => chatLine_.classList.add('visible'), 100);
  
    if(chatEle.childElementCount > 30) {
      chatEle.removeChild(chatEle.children[0]);
    }
  
    if(timeout) {
      setTimeout(() => {
        if(chatLine_.parentElement) {
          chatLine_.classList.remove('visible');
          setTimeout(() => chatEle.removeChild(chatLine_), 1000);
        }
      }, timeout);
    }
  }