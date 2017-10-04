var http = require('http');
var watson = require('watson-developer-cloud');
var qs = require('querystring');
var fs = require('fs');

var wex = require('./routes/index');
var conversation = watson.conversation({
  username: '7f4dde73-bbe7-45c7-b8fb-0ab82d76ce72',
  password: '8sS43ajvvQmw',
  version: 'v1',
  version_date: '2016-09-20'
});
var workspaceID="f47b77c3-3297-4796-bf67-432dd606a07f";
var context;
var json = '';
var wexResponse = '';

//var logfile = fs.createWriteStream('./logfile.log');
var preguntas = fs.createWriteStream('./preguntas.log');

// var respuesta = {
//   "output": {
//     "text": ["Me estan entrenando. En pocos dias voy a estar respondiendo a tus consultas :)"]
//             },
//   "context": {
//     "USR_03_options": [],
//     "USR_01_alt_questions": [],
//     "USR_02_suggestion_topics": []
//   }
// }

var wexResult = '';


http.createServer(function(req,res){

    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

	if (req.method == 'POST') {

        var body = '';

        req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
        });

        req.on('end', function () {

        	var message= "mensaje";

          try {
                preguntas.write(message + "\n");
                console.log("message es: "+message);
          }catch(err) {
        		    console.log("Hay un error");
          }
            //-->JMC - Comentado hasta que este entrenado en fase I
          conversation.message({
      			workspace_id: workspaceID,
      			input: {'text': message},
      			context: context
    			},
    			function(err, response) {
  	    		if (err){
                      console.log('error:'+JSON.stringify(err, null, 2));
      			}else{
        				console.log('response: '+JSON.stringify(response, null, 2));
  	      			context = response.context;
                console.log("confidence is: ",response.intents[0].confidence)

                //Si la confidence de Conversation es mayor o igual a 0.7 devuelvo el msj de Conversation
                if(response.intents[0].confidence >= 0.7){
                  console.log("IM In");
                  res.writeHead(200, {"Content-Type": "application/json"});
                  json = JSON.stringify({
                    msg:response.output.text,
                    context:response.context
                  });
                  res.end(json);
                }
                //Si la confidence de Conversation es menor voy a buscar a WEX y traigo los resultados
                else if(response.intents[0].confidence >= 0.5){

                  wex.listarDocumentos().then((result)=>{
                    console.log("wexResponse: ");
                    console.log(result);
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(result);

                  })

                }
                //Si es menor a 0.6, devuelvo el mensaje de Conversation de "No entendi"
                //IDEAA: definir entre 0.5 y 0.7 el rango de respuestas a WEX como primer IF
                // y que el Else sea Conversation normal
                else{
                  console.log("IM Out");
                }




  	    		}
      		});
            //<--JMC - Comentado hasta que este entrenado en fase I
            //-->JMC - Envio de una misma respuesta sin conexion a Bluemix
          // res.writeHead(200, {"Content-Type": "application/json"});
          // var json = JSON.stringify({
          //       msg:respuesta.output.text,
          //       context:respuesta.context
          // });

                    //logfile.write(json);

          // res.end(json);
            //<--JMC - Envio de una misma respuesta sin conexion a Bluemix

    	});
	}else{
    //Si es un GET, me meto ACA
		res.writeHead(200,{'Content-Type':'text/plain'});
		res.end('Servidor corriendo!!');
	}
}).listen(3000);
console.log('Express app started on port %d', 3000);
