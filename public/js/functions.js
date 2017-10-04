var DEBUG = (window.location.hash.substr(1) == 'watson_debug');

if(window.location.host.indexOf("bluemix") > -1){
  //Si encuentro "Bluemix" en mi host, estoy en PROD
  PROXY_URL = "http://ypf-procesos.mybluemix.net/";
  console.log("ENV PROD:",PROXY_URL);
}else{
  //Sino, estoy en DEV
  PROXY_URL = "http://localhost:3000/";
  console.log("ENV DEV:",PROXY_URL);
}



//
var session = true;
var start_message = "";

var Contextoanterior={"USR_10_current_time":"22:00"};
var pasos;
var rol;
var horario;

// global objets
var $body;
var $openChat;
var $closeChat;
var $minimizeChat;
var $chatMessage;
var $chatWindow;

var $imgViewer;
var $sendButton;
var $messengerBody;

var $closePopup;
// var $acceptClosePopup;
// var $cancelClosePopup;

var $satisfaction;
var $sendSatisfaction;
var $closeSatisfaction;
var $minimizeSatisfaction;
var $stars;

var html_ticket = [];
// ---

// READY

// document ready
document.addEventListener('DOMContentLoaded', function(event) {

    $body = document.getElementsByTagName("BODY")[0];
    $openChat = document.getElementsByClassName('launcher')[0];
    $messengerBody = document.getElementsByClassName('messenger-body')[0];
    $closeChat = document.getElementById('closeChat');
    $minimizeChat = document.getElementById('minimizeChat');
    $chatMessage = document.getElementById('chatMessage');
    $chatWindow = document.getElementById('chatWindow');

    $imgViewer = document.getElementById("img-viewer");
    $sendButton = document.getElementById("send-button");

    //$closePopup = document.getElementById("closePopup");
    // $acceptClosePopup = document.getElementById("acceptClosePopup");
    // $cancelClosePopup = document.getElementById("cancelClosePopup");

    $satisfaction = document.getElementById("satisfaction");
    $sendSatisfaction = document.getElementById("sendSatisfaction");
    $closeSatisfaction = document.getElementById("closeSatisfaction");
    $minimizeSatisfaction = document.getElementById("minimizeSatisfaction");
    $stars = document.querySelectorAll('[data-star]');

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    if(isIE){
        document.getElementById('watson_container').className = 'isIE';
    }

    $openChat.addEventListener("click", openChat, false);
    $closeChat.addEventListener("click", closeChat, false);
    $minimizeChat.addEventListener("click", minimizeChat, false);

    $closeSatisfaction.addEventListener("click", sendNoSatisfaction, false);
    $minimizeSatisfaction.addEventListener("click", minimizeSatisfaction, false);
    $sendSatisfaction.addEventListener("click", sendSatisfaction, false);

    $chatWindow.addEventListener("click", chatWindowClick, false);

    // $acceptClosePopup.addEventListener("click", acceptClosePopup, false);
    // $cancelClosePopup.addEventListener("click", cancelClosePopup, false);

    for(var i = 0; i<$stars.length; i++){
        $stars[i].addEventListener("click", starClick, false);
        $stars[i].addEventListener("mouseover", starOver, false);
        $stars[i].addEventListener("mouseout", starOut, false);
    }

    $chatMessage.onkeypress = function (e) {
        if (e.keyCode == 13 && !e.shiftKey) {
            writeAndSendMessage($chatMessage.value);
            return false;
        }
    };

    $sendButton.addEventListener("click", sendButton, false);


    var stayonthis = true;
    window.onbeforeunload = function(e) {
        var className = $body.className;
        if(stayonthis && className.indexOf('display-chat')>-1) {
            stayonthis = false;
            return true;
        }
    }

    startChat();

});


function startChat(){



    setTimeout(function () {

        $openChat.className += " active";

        setTimeout(function () {
            $openChat.className += " inital-view";
            setTimeout(function () {
                $openChat.className = $openChat.className.replace("inital-view", "");
            }, 4000);
        }, 1000);

    }, 1000);
}

//click listeners
function openChat(e){
    if(DEBUG) console.log('openChat');
    startConversation();
}

function closeChat(e){
    e.preventDefault();
    showSatisfaction();
}

function minimizeChat(event){
    event.preventDefault();
    pauseConversation();
}

// POP UP
// function showClosePopup(){
//     $closePopup.className = $closePopup.className.replace("active", "");
//     $closePopup.className+= " active";
// }

function hideClosePopup(){
    $closePopup.className = $closePopup.className.replace("active", "");
}

// function acceptClosePopup(event){
//     event.preventDefault();
//     showSatisfaction();
// }
//
// function cancelClosePopup(event){
//     event.preventDefault();
//     hideClosePopup();
// }

//SATISFACTION
function showSatisfaction(){
    if(DEBUG) console.log('showSatisfaction');

    resetStars();

    //hideClosePopup();


    $satisfaction.className = $satisfaction.className.replace("active", "");
    $satisfaction.className+= " active";
}

function sendSatisfaction(event){
    event.preventDefault();
    if($sendSatisfaction.className.indexOf('active')>-1 ) {
        //closeSatisfaction();
        $satisfaction.className = $satisfaction.className.replace("success", "");
        $satisfaction.className+= " success";
    }
}

function sendNoSatisfaction(event){
    event.preventDefault();
    closeSatisfaction();
}

function closeSatisfaction(){
    $satisfaction.className = $satisfaction.className.replace("active", "");
    $satisfaction.className = $satisfaction.className.replace("success", "");
    $body.className = $body.className.replace("display-chat", "").trim();
}

function minimizeSatisfaction(event){
    event.preventDefault();
    pauseConversation();
}


function sendButton(e){
    e.preventDefault();
    if ($chatMessage.value) {
        writeAndSendMessage($chatMessage.value);
    }
}


function chatWindowClick(e){
    if(e.target.className == "showPossibleQuestions"){
        showPossibleQuestions(e.target);
    }else{
        if(e.target.className == "removePossibleQuestions"){
            removePossibleQuestions(e.target);
        }
    }
}

//startConversation
function startConversation(){

    $chatWindow.innerHTML = '';
    var className = $body.className;
    className += ' display-chat';
    $body.className = className;
    sendMessage(start_message);

}


//pauseConversation
function pauseConversation(){
    var className = $body.className;
    className = className.replace("display-chat", "").trim();
    $body.className = className;
}



// function continuar(i){
//   i++;
//   var html_message="";
//   var marca = 0;
//   console.log(pasos);

//   html_message+="<ul>";
//     for (i; i < pasos.length; i++) {

//     var paso=pasos[i];
//     if (marca == 0 && rol == paso.Actor) {html_message+= "<span style = 'margin-left: -170px; color: #464646;font-size: 14px;line-height: 14px;font-weight: 500; margin-bottom: 0px'> Debés:<br><br> </p>";
//                 marca = 1
//               }
//     html_message+="<li>";
//     //Si el rol de la URL es igual al actor

//     if(rol == paso.Actor){

//       html_message+=paso.Accion;
//     }
//     else{
//       console.log(pasos.length+" "+i);
//       if(pasos.length>i+1){
//         //En cada uno de los pasos:
//         html_message+="El " + "<strong>"+paso.Actor+ "</strong>" + " debe " + paso.Accion+ "<br><br> <button type='button' class='btn btn-info' style = 'background-color: #106299' onclick='javascript:continuar("+i+")'>Continuar</button>" //"<a href='javascript:continuar("+i+")'>Continuar</a>";
//       }
//       //En el ultimo paso, agrego:
//       else{
//         html_message+="El " +"<strong>"+paso.Actor+ "</strong>" +" debe " + paso.Accion;
//       }
//       break;
//     }

//     html_message+="</li>";
//   }
//   html_message+="</ul>";
//   if (pasos.length <= i+1){

//     html_message += "¿Deseas recibir más información?"
//   }


//   var obj_msg = {
//               'from': 'watson',
//               'message': html_message,
//               //'suggestion': html_suggestion_topics,
//               //'possible_questions': html_possible_questions,
//               // 'confidence': confidence,
//               'time': currentTime()
//           };

//           //obj_msg.context = data.Response.context;
//            writeAnswer(obj_msg);

// }


//answerBack
function answerBack(data) {

    console.log(data);
    if(data){
    //Si vuelve data

        var html_message = '';
        if(data.Response){
          console.log("Entre a generacion de mensajes de Conversation");

          console.log(data.Response);

          //mensaje error
          if(typeof(data.input) == "string"){
              html_message+= 'Hubo un error. Por favor intenta más tarde.';
          }else{

              for (i = 0; i < data.Response.output.text.length; i++) {
                html_message+=data.Response.output.text[i];
              }


              if(data.Response.context.PasosFlag){
                console.log("Existe PASOS. Data es:")
                console.log(data.Response);
                pasos=data.Response.context.Pasos;
                rol=data.Response.context.rol;
                //html_message+="<ul>";
                console.log(rol);
                var marca = 0;

                for (i = 0; i < data.Response.context.Pasos.length; i++) {

                  var paso=data.Response.context.Pasos[i];
                  console.log(paso);

                  // if (i == 0 && rol == paso.Actor){
                  //   html_message+= "Debés:<br>"
                  // }

                  html_message+="<ul>"
                    //alert(paso.Actor);
                    //alert(rol);
                  if(rol==paso.Actor){

                    if (marca == 0) {
                      html_message+= "<br><span style = 'margin-left: -170px; color: #464646;font-size: 14px;line-height: 14px;font-weight: 500; margin-bottom: 0px'> Debés:<br><br> </span>";
                      marca = 1
                    }
                    html_message+="<li>" + paso.Accion; //"El " + "<strong>"+paso.Actor+ "</strong>"+ " debe " +
                  }
                  //else{
                    //html_message+="<li> El "+"<strong>"+paso.Actor+ "</strong>" + " debe " + paso.Accion+"<br><br> <button type='button' class='btn btn-info' style = 'background-color: #106299' onclick='javascript:continuar("+i+")'>Continuar</button>"   //"<a href='javascript:continuar("+i+")'>Continuar</a>";
                    //break;
                  //}
                  html_message+="</li>";
                 }
                 html_message+="</ul>";
             }

           html_message= html_message.replace("<li></li>","");
           html_message= html_message.replace("<li></li>","");
          }



          var obj_msg = {
              'from': 'watson',
              'message': html_message,
              //'suggestion': html_suggestion_topics,
              //'possible_questions': html_possible_questions,
              // 'confidence': confidence,
              'time': currentTime()
          };

          obj_msg.context = data.Response.context;
          writeAnswer(obj_msg);

      }else if(data.Datos.Documentos !== 400 && data.Datos.Code !== 400 && data.Datos.Code !== 400){

          //mensaje error
          if(typeof(data.Datos.Documentos) == "string"){
              html_message+= 'Hubo un error. Por favor intenta más tarde.';
          }else{
              for (i = 0; i < data.Datos.Documentos.length; i++) {

                  if(i === 0){
                    html_message+="<p style='margin-bottom:20px'><i>Encontre esta informacion que puede ayudarte:\n\n</i></p>";
                  }


                  html_ticket[i] = data.Datos.Documentos[i].Cache;

                  //Genero el titulo con un link a una tab nueva y el html - (Elimino el style.featherlight-inner' que me hace mostrar basura)
                  html_message+=`<p style="cursor:pointer" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" onclick="$.featherlight(html_ticket[${i}], {});$('style.featherlight-inner').css('display','none');scrollWindow()"><b>${data.Datos.Documentos[i].Titulo}</b></p>`;

                  if(data.Datos.Documentos[i].ParrafoDestacado.substring(0,2) == '<p'){
                      html_message+=data.Datos.Documentos[i].ParrafoDestacado;
                  }else{
                      html_message+=`<p style='margin-bottom:20px'>${data.Datos.Documentos[i].ParrafoDestacado}</p>`;
                  }

              }
          }

          var obj_msg = {
            'from': 'wex',
            'message': html_message,
            // 'suggestion': html_suggestion_topics,
            // 'possible_questions': html_possible_questions,
            // 'confidence': confidence,
            'time': currentTime()
          };

          writeAnswer(obj_msg);

      }else{
        var obj_msg = {
          'from': 'wex',
          'message': "<p>No encontré información para ayudarte con tu consulta. Por favor, probá preguntandome de otra manera.</p>",
          // 'suggestion': html_suggestion_topics,
          // 'possible_questions': html_possible_questions,
          // 'confidence': confidence,
          'time': currentTime()
        };

        writeAnswer(obj_msg);
      }

    }

}



function writeAnswer(obj){
    hideLoad();

    addWatson();
    console.log(obj);
    messageSuccess = document.createElement("div");
    messageSuccess.className = "message received";
    messageSuccess.innerHTML = '<div class="message-block">'+obj.message+'</div><div class="time">'+obj.time+'</div>';

    $chatWindow.appendChild(messageSuccess);

    addMessageClear();

    var _height = messageSuccess.offsetHeight+20;

    if(obj.possible_questions){


        var possibleQuestions = document.getElementsByClassName('possible-questions');
        for(var i= 0; i<possibleQuestions.length; i++){
            $chatWindow.removeChild(possibleQuestions[i]);
        }

        messagePossibleQuestions = document.createElement("div");
        messagePossibleQuestions.className = "possible-questions";
        messagePossibleQuestions.innerHTML = '<p>¿Esto responde a tu pregunta? <a class="removePossibleQuestions" id="bad">Si</a> - <a class="showPossibleQuestions">No</a></p><div class="hidden-possible-questions"><p>Podria interesarte:</p>'+obj.possible_questions+'</div>';
        messagePossibleQuestions.innerHTML+= '<div class="clear"></div>';
        $chatWindow.appendChild(messagePossibleQuestions);

        _height= _height + messagePossibleQuestions.offsetHeight+20
    }


    if(obj.suggestion){
        messageSuggestionTopics = document.createElement("div");
        messageSuggestionTopics.className = "suggestion-topics";
        messageSuggestionTopics.innerHTML = obj.suggestion;
        $chatWindow.appendChild(messageSuggestionTopics);

        addMessageClear();

        _height= _height + messageSuggestionTopics.offsetHeight+20;
    }

    $chatWindow.scrollTop = $chatWindow.scrollHeight-_height-35;
}



function writeAndSendMessage(message){
    if(message == '') return;

    var formatted_message = message.replace(/(?:\r\n|\r|\n)/g, '<br />');

    var obj_msg = {
        'from': 'user',
        'message': formatted_message,
        'time': currentTime()
    };
    if(DEBUG) console.log(obj_msg);
    writeMessage(obj_msg);
    if(session){
        sendMessage(message);
    }else{
        session = true;
        sendMessage(start_message);
    }
}

function writeMessage(obj){
    if(session){
        $chatMessage.value = '';

        addYo();

        struct = document.createElement("div");
        struct.className = "message send";
        struct.innerHTML = '<div class="message-meta"></div><div class="message-block"><p>'+obj.message+'</p></div><div class="time">'+obj.time+'</div>';

        $chatWindow.appendChild(struct);

        addMessageClear();
    }
}

function sendMessage(message) {

    showLoad();

    // var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

    // xhr.open('POST', PROXY_URL, true);
    //
    // xhr.onreadystatechange = function() {
    //     if(xhr.readyState == 4 && xhr.status == 200) {
    //         var json_data = JSON.parse(xhr.responseText);
    //         answerBack(json_data);
    //     }
    // };
    //
    // xhr.setRequestHeader("Content-Type", "application/json");
    // console.log(JSON.stringify({message:message}));
    // var data = {message:message};
    // xhr.send(message);
    //
    // return xhr;

    $.ajax({
      url: PROXY_URL+'sendData',
      type: "get", //send it through get method
      data: {
        msg:message
      },
      success: function(response) {
        var json_data = JSON.parse(response);
        answerBack(json_data);
        return response;
      },
      error: function(xhr) {
        //Do Something to handle error
      }
    });
}




var showPossibleQuestions = function(target){
    var $parent = target.parentElement.parentElement;

    var html_message = $parent.getElementsByClassName('hidden-possible-questions')[0].innerHTML;

    var obj_msg = {
        'from': 'watson',
        'message': html_message,
        'confidence': '',
        'time': currentTime()
    };

    writeAnswer(obj_msg);

    removePossibleQuestions(target);
}

var removePossibleQuestions = function(target){
    var $parent = target.parentElement.parentElement;
    $chatWindow.removeChild($parent);
}

//stars
var actual_star = 1;

var starOver = function(e){
    var star = parseInt(e.target.getAttribute('data-star'));
    for(var i=1; i<=star; i++){
        var selector = document.querySelectorAll('[data-star="'+i+'"]')[0];
        var className = selector.className;
        if(className.indexOf('active')<0) {
            selector.className+= ' active';
        }
    }
}

var starOut = function(){
    for(var i=0; i<$stars.length; i++){
        var selector = $stars[i];
        var className = selector.className;
        if(className.indexOf('hold')<0) {
            selector.className = '';
        }
    }
}

var starClick = function(event){
    event.preventDefault();
    var star = parseInt(event.target.getAttribute('data-star'));
    actual_star = star;
    for(var i=1; i<$stars.length; i++){
        var selector = $stars[i];
        selector.className = '';
    }
    for(var i=1; i<=star; i++){
        var selector = document.querySelectorAll('[data-star="'+i+'"]')[0];
        selector.className= 'active hold';
    }

    $sendSatisfaction.className = $sendSatisfaction.className.replace("active", "");
    $sendSatisfaction.className+= " active";
}

var resetStars = function(){
    actual_star = 1;
    for(var i=0; i<$stars.length; i++){
        var selector = $stars[i];
        selector.className = '';
    }
    $sendSatisfaction.className = $sendSatisfaction.className.replace("active", "");
}


//MESSAGES

//Load
messageLoad = document.createElement("div");
messageLoad.id = "load-message";
messageLoad.className = "load";


messageLoad.innerHTML = '<div class="load7"><i></i><i></i></div>';

function showLoad(){
    //hideError();
    hideLoad();
    $chatWindow.appendChild(messageLoad);

    addMessageClear('clear-load');

    $chatWindow.scrollTop = $chatWindow.scrollHeight;
}

function hideLoad(){
    var itemNode = document.getElementById("load-message");
    if(itemNode){
        itemNode.parentNode.removeChild(itemNode);
    }
    var itemNode = document.getElementById("clear-load");
    if(itemNode){
        itemNode.parentNode.removeChild(itemNode);
    }
}


//HELPERS


var addMessageClear = function(id){
    var messageClear = document.createElement("div");
    messageClear.className = "clear";
    if(typeof id != "undefined") messageClear.id = id;
    $chatWindow.appendChild(messageClear);
}
var currentTime=function(){var d = new Date();var t=_z(d.getHours(),2)+":"+_z(d.getMinutes(),2);return t;}
var _z=function(n, p){return (''+(Math.pow(10,p)+n)).slice(1)};


//Gala
var addWatson = function(id){
    var sendWatson = document.createElement("div");
    sendWatson.className = "watson";
    sendWatson.innerHTML = '<div class="watson">Watson</div>';
    if(typeof id != "undefined") sendWatson.id = id;
    $chatWindow.appendChild(sendWatson);
}


//usuario
var addYo = function(id){
    var sendYo = document.createElement("div");
    sendYo.className = "yo";
    sendYo.innerHTML = '<div class="yo">Yo</div>';
    if(typeof id != "undefined") sendYo.id = id;
    $chatWindow.appendChild(sendYo);
}

//Creo funcion para reemplazar todas las instancias de algo en un string.
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//Escapo los RegEx special characters
function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function scrollWindow(){
  // $('.featherlight-content').animate({
  //   scrollTop: $("#subrayado").offset().top
  // }, 1000);

  var el = $("#subrayado");
  var elOffset = el.offset().top;
  var elHeight = el.height();
  var windowHeight = $('.featherlight-content').height();
  var offset;

  if (elHeight < windowHeight) {
    offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
  }
  else {
    offset = elOffset;
  }
  var speed = 700;
  $('.featherlight-content').animate({scrollTop:offset}, speed);
}
