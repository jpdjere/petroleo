var http = require('http');
var watson = require('watson-developer-cloud');
var qs = require('querystring');
var fs = require('fs');
var express = require('express');
var path = require('path');
var router = express.Router();
const util = require('util')
var _ = require('underscore');
var axios = require('axios');

var wex = require('./routes/index');
//Credenciales Conversation-YPF-Procesos                  (de Conversation-GCBA-2)
var conversation = watson.conversation({
  username: 'd92f7963-e5fc-4f85-8903-84bbb5da2e74',      // la que estaba antes: '1e57fec7-79fd-41b9-96d6-f35f1182423b',
  password: 'eQQ2v5Qb35vW',                  // la que estaba antes'jdTHdcSG2xbr',
  version: 'v1',
  version_date: '2017-05-26'
});
//gcba1
// var workspaceID="b69e22e3-bf63-4718-b778-221abdae8823";

//gcba-NuevaPropuesta
var workspaceID= 'ac210b5e-7945-4baf-90d1-ed79a051f255';//'7ec49ddb-0f25-43e2-b731-a54583056bf2'    //"65b8bc85-1f01-4a79-8f04-e3357702aa8f";
//var fecha6meses = new Date().setMonth(new Date().getMonth() - 6);
var context = {
    //"6meses": new Date(fecha6meses)
    //"rol":"vendedor"
};
var json = '';
var wexResponse = '';

//var logfile = fs.createWriteStream('./logfile.log');
var preguntas = fs.createWriteStream('./preguntas.log');

var wexResult = '';

var confidenceLevel = 0.75;
var numeroArchivosTraer = 5;

var cfenv = require("cfenv")

var appEnv = cfenv.getAppEnv();
console.log(appEnv);

var request = require('request');

/*------ TEMPS VARS A LLENAR -----*/
var a = null;
var pasosJSON = null;

request.post({url:'http://200.41.164.62/umc/api/tokens', form: {
  tenant: 'default',
  name: 'system',
  password: 'manager',
  key:'MIIC1DCCAbwCAwMUDTANBgkqhkiG9w0BAQsFADBTMQswCQYDVQQGEwJERTELMAkGA1UECAwCSEUxEjAQBgNVBAcMCURhcm1zdGFkdDEUMBIGA1UECgwLU29mdHdhcmUgQUcxDTALBgNVBAsMBEFSSVMwHhcNMTcwOTI5MTEyNjM1WhcNMTcxMjI5MTEyNjM1WjCBjjELMAkGA1UEBhMCQ0wxETAPBgNVBAcMCFNhbnRpYWdvMRQwEgYDVQQKDAtTb2Z0d2FyZV9BRzENMAsGA1UECwwETGFyYTEcMBoGA1UEAwwTOnd3dy5zb2Z0d2FyZWFnLmNvbTEpMCcGCSqGSIb3DQEJARYabGVvbmVsLmxhcmFAc29mdHdhcmVhZy5jb20wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAKBZ6kqa60ovTnegB93i+xl6TsmUfzH5JGBeqDJPJOf/dO9BKkCwwaAvPwcxNT8CB8gEbNyPub18V3jQLJbqm0Mf68Bh15UJVKMx7zRZkinhaQ6dcmmCdvwiIWk3qPutgsCgz6atz21S0RlczFF7TEWlEPF6PYAoqxtiZRzi0O4ZAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAF+3RkPgBW63zhQR3uCYvUT+IIxeKyW/m21ukY0VYRR7pDC4meh2d+w1pg+84/StpUeX7nfA8/oNCqP3WdvFPa1/FNtBSoaFck9m+kIIPCag1xweWndLWNk7bMloEX95WedbHRevSEgubiU0AMPf2a1gJRPFPXhel37ittHOdOtijxeG9GhzHzVPTjIqxML4EC8KIPfg23VQjBYss3oLdlDSFmqKdCkHwHOOapiFDsP0wrrA2BByft+nvoxPiNnEecsQWLOrKoRJ7o6ZiPQa3NqWXPrLpuAHH2HVNX/3GUMoyDzNiUjlaZElw5E6teO0MET3TR0xIjl0fDY9Yq/+Ol4='
}}, function(err,httpResponse,body){
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log(httpResponse.statusCode)//logs as 201 sucess
  console.log("heres the cookie: "+httpResponse.headers['set-cookie']) //returns cookie in correct format
  var cookie = httpResponse.headers['set-cookie'];
  request({url: 'http://200.41.164.62/abs/api/models/YPF%20Naturalizaci%C3%B3n/bd0dc8a0-d8a8-11e4-3656-18a9055adb12?withcontent=true&language=es_ES?umcsession=eyJ0eXBlIjoidW1jIiwidGVuYW50SWQiOiJkZWZhdWx0IiwidXNlcm5hbWUiOiJzeXN0ZW0iLCJzZXNzaW9uIjoidW8zRG1kZEtzYmQzbTF5aU1DdEdfOU5FeW9RLXNCbEF5SUwtWTdDV1I5bGYtU25XUmZ6RDl2ODEifQ', headers: {Cookie: cookie}}, function(error, response, body) {
    // console.log(body); //this console.logs my login page since requests w/o valid cookies get redirected to login
    a = JSON.parse(body)

    /*--------------- CARGO EL JSON Y LO PROCESO A RESULT---------------*/

    modelobjects = a.items[0].modelobjects;
    modelconnections = a.items[0].modelconnections;

    //Cada loop es un paso por un model
    var result = []
    for (var i = 0; i < modelconnections.length; i++) {
      var source = _.where(modelobjects, {'occid': modelconnections[i].source_occid});
      //Filtro los que no son OT_ORG_UNIT_TYPE
      var source = _.filter(source, function(obj){ return obj.apiname === "OT_ORG_UNIT_TYPE"; })
      var target = _.where(modelobjects, {'occid': modelconnections[i].target_occid});

      /*------- Recorro los sources extraidos porque del grep se obtienen más de uno -------------*/
      /*------- En cambio, Target siempre es un array de un solo objeto, por eso entro al 0 -------------*/
      for (var j = 0; j < source.length; j++) {
        // console.log(source[j].attributes[0].value + " " + modelconnections[i].typename + " " + target[0].attributes[0].value);
        var obj = {
          Actor:source[j].attributes[0].value.trim(),
          Accion:target[0].attributes[0].value
        }

        result.push(obj);
        if(obj.Accion === "07.Recoger absorbente mineral "){
          result.push({
            Actor:"VENDEDOR",
            Accion:"<a class='btn btn-info' onclick=\"writeAndSendMessage('Control Exitoso')\"> Control Exitoso</a> <br><br> <a class='btn btn-danger' onclick=\"writeAndSendMessage('Control Insuficiente')\"> Control Insuficiente</a>"
          });
        }

      }

    }
    /*------------- Agrego el último que fue hardcodeado----------------*/
    result.push({
      Actor:"SUPERVISOR DE PLAYA",
      Accion:"</li></ul>¿Esta respuesta te fue de utilidad?<br><ul><li>"
    });
    /*------------- ORDENO POR ACTOR Y POR ACCION usando chain()----------------*/
    pasosJSON = _(result).chain().sortBy(function(el) {
      return el.Actor;
    }).sortBy(function(el) {
      return el.Accion;
    }).value();

    print("desgrabacion4.json",JSON.stringify(pasosJSON,null,2));

  })
});
/*---------------CIERRO LA CARGA DE DATOS------------------*/

/*-------------------------------------------------------------------*/

router.get('/sendData', (req, res) => {

    var message= req.query.msg;

    console.log("\n\n\n\n\n\n\n-----------------------------------");

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
      context: context,
      alternate_intents: true
    },
    function(err, response) {
      if (err){
          console.log("Hubo un error en la respuesta de Conversation: "+err)
          json = JSON.stringify({
            Response:response,
            Code:400,
            DescriptionMessage:err,
          });
          res.send(json);
          console.log(" ");

          console.log("-----------------------------------");
          console.log('error:'+JSON.stringify(err, null, 2));
      }else{
          console.log('response: '+JSON.stringify(response, null, 2));
          modifiedResponse = response;
          if(modifiedResponse.context.PasosFlag){
            modifiedResponse.context.Pasos = pasosJSON;
          }
          context = modifiedResponse.context;
          console.log("context is \n",context);
          json = JSON.stringify({
            Response:modifiedResponse,
            Code:200,
            DescriptionMessage:"OK"
          });
          res.send(json);
      }

  })

});

//Creo funcion para reemplazar todas las instancias de algo en un string.
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/*---------------------GET REQUEST ----------------------*/
router.get('/', function(req, res, next) {
  var rol = req.query.rol;
  rol = rol.toUpperCase();
  if(rol === "SUPERVISORDEPLAYA"){
    rol = "SUPERVISOR DE PLAYA"
  }
  console.log(rol);
  context = {};
  context = {"rol":rol};
  res.header("Content-Type", "text/html; charset=utf-8");
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
/*--------------------------------------------------------*/

let print = (route,vars) =>{
  fs.writeFile(route, vars, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  });
}

module.exports = router;
