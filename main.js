// ==UserScript==
// @name SipacEletrica_V2
// @namespace https://github.com/tiagolobao/SipacEletrica_V2
// @version 2.0
// @description Script para gerenciamento das ordens de serviço de forma automática no NOVO site do SIPAC-UFBA
// @author Tiago Britto Lobão
// @match https://sipac.ufba.br/*
// @grant none
// @require http://code.jquery.com/jquery-latest.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.2.61/jspdf.min.js
// ==/UserScript==

(function() {


   /******************************************
      CÓDIGO PARA A PÁGINA PRINCIPAL DO SIPAC
   *********************************************/
   if(window.location.pathname.indexOf("index.jsf") > -1){

      //Adicionando Formulário para entrada das requisições que se deseja finalizar
      var htmlAppend =  '<center>';
          htmlAppend += '<br>';
          htmlAppend += '<style>textarea {resize: vertical;}</style>';
          htmlAppend += '<h1> Finalização automática </h1>';
          htmlAppend += '<h3> Separe as ordens de serviço por vírgulas. Espaços serão ignorados. Confira antes de clicar para finalizar </h3>';
          htmlAppend += '<textarea id="finauto" rows="4" cols="60" placeholder="OS"> </textarea>';
          htmlAppend += '<br>';
          htmlAppend += '<button type="button" id="fibut">Finalizar!</button>';
          htmlAppend += '</center>';
      jQuery('#manutencao-menusupinfra').append(htmlAppend);

      //Ação de clicar para finalizar
      /*
         1 - É adicionado as variáveis de sessão para as finalizações
         2 - Redireciona a página para alterar as requisições
      */
      jQuery("#fibut").on("click", function(){
         var input = jQuery("#finauto").val();
         input = input.replace(/ /g,''); //Removendo todos os espaços
         sessionStorage.setItem("requisit",input);
         sessionStorage.setItem("acessos",0);
         sessionStorage.setItem("passo",0);
         window.location.href = "https://sipac.ufba.br/sipac/buscaOS.do?acao=3&tipo=11&aba=manutencao-menusupinfra";
      });
   }

   /*************************************************************************
         CÓDIGO PARA A PÁGINA CONSULTA OS CASO TENHA CLICADO PARA FINALIZAR
   *************************************************************************/
   else if (window.location.href == "https://sipac.ufba.br/sipac/buscaOS.do?acao=3&tipo=11&aba=manutencao-menusupinfra"  ||  window.location.pathname.indexOf("populaOS") > -1){
      /* Realizando uma nova busca de OS */
      var requisit = new Array();
      var acess = sessionStorage.getItem("acessos");
      var input = sessionStorage.getItem("requisit");

      var j=0;
      var anterior=0;
      input = ' ' + input; //Evitando que a primeira execução da substring exclua o primeiro caractere
      input = input + ','; //Evitando que o algoritimo não pegue a ultima requisitão
      for(i=0;i<=input.length;i++){
         if(input[i] == ","){
            requisit[j] = input.substring(anterior+1, i); //Separando em uma array cada requisição
            j = j + 1; //Contando o número de requisições
            anterior = i;
         }
      }

      /* Caso ainda existam requisições a serem finalizadas */
      if(acess<requisit.length){
         sessionStorage.setItem("acessos",acess+1);
         for(i=0;i<=requisit[acess].length;i++){
            if(requisit[acess][i]=='/'){
                  barra=i; //localizando a posição da barra que separa o numero da requisição do ano
            }
         }
         jQuery("#consultaPorRequisicaoCheck").click();
         jQuery("input[name='ordemServico.requisicao.numero']").val(requisit[acess].substring(0,barra)); //numero da req
         jQuery("input[name='ordemServico.requisicao.ano']").val(requisit[acess].substring(barra+1,requisit[acess].length+1)); //ano da req
         setTimeout(function(){ jQuery( "#conteudo > form > table > tfoot >tr > td > input:nth-child(2)" ).click(); }, 100);
      }
      /* Caso não exista mais requisições a serem finalizadas */
      else{
         sessionStorage.setItem("requisit",'');
         sessionStorage.setItem("access",0);
         alert("As requisições foram finalizadas");
      }
   }

  console.log("adieu");
})();
