   // ==UserScript==
   // @name SipacEletrica_V2
   // @namespace https://github.com/tiagolobao/SipacEletrica_V2
   // @version 1.2
   // @description Script para gerenciamento das ordens de serviço de forma automática no NOVO site do SIPAC-UFBA
   // @author Tiago Britto Lobão
   // @match https://sipac.ufba.br/*
   // @grant none
   // ==/UserScript==

   (function() {
      'use strict';
      /*********************
         CONSTANTES
      **********************/
      // Endereço em que a busica de OS para se alterar para "concluida" é feita
      const enderecoBuscaOsPreBusca = "https://sipac.ufba.br/sipac/buscaOS.do?acao=3&tipo=11&aba=manutencao-menusupinfra";
      // Endereço da página principal
      const enderecoPaginaPrincipal = "https://sipac.ufba.br/sipac/supinfra/index.jsf";

      /**********************************************
         PROCEDIMENTOS E FUNÇÕES
      ***********************************************/
      /******************************
      Retorna objeto com dados da próxima requisição a ser buscada
      ******************************/
      function getProximaBusca(){
         /* Realizando uma nova busca de OS */
         let numeroDeAcessos = parseInt( sessionStorage.getItem("acessos") );
         let listaDeRequisicoes = sessionStorage.getItem("requisit").split(",").map( function(elem, index, arr){
            return elem.split("/");
         });

         /* Caso ainda existam requisições a serem finalizadas */
         if( numeroDeAcessos<listaDeRequisicoes.length && listaDeRequisicoes[0][0]!='' ){
            sessionStorage.setItem("acessos",numeroDeAcessos+1);
            return {
               "keepGoing": true,
               "numero": listaDeRequisicoes[numeroDeAcessos][0],
               "ano": listaDeRequisicoes[numeroDeAcessos][1]
            };
         }
         /* Caso não exista mais requisições a serem finalizadas */
         else{
            return {
               "keepGoing": false
            };
         }
      }

      /***********************************************************************************************
      Função de redirecionamento para págida das ordens de serviço classificadas como "Em Rota Visita"
      Funciona apenas na página principal (https://sipac.ufba.br/sipac/supinfra/index.jsf)
      ************************************************************************************************/
      function abrirPaginaEmRotaVisita(){
         var a=function(){
            setAba('manutencao-menusupinfra');
         };
         var b=function(){
            if(typeof jsfcljs == 'function'){
               jsfcljs(
                  document.getElementById('infraForm'),
                  {'infraForm:rotaVisita':'infraForm:rotaVisita','operacao':'2'},
                  ''
               );
            }
            return false;
         };
         return (a()==false) ? false : b();
      }

      /***********************************************
      Confirma mudança de estado da ordem de serviço
      *************************************************/
      function confirmChangeServicoExecutado(){
         A4J.AJAX.Submit(
            'confirmaOperacao',
            event,
            {
               'similarityGroupingId':'confirmaOperacao:j_id_jsp_1655664044_7',
               'parameters':{'confirmaOperacao:j_id_jsp_1655664044_7':'confirmaOperacao:j_id_jsp_1655664044_7'} ,
               'containerId':'j_id_jsp_1655664044_0'
            }
         );
      }

      /***************************************************************************
      Termina o processo de finalização, apagando as variáveis de sessão e abrindo página com informações
      ****************************************************************************/
      function terminaFinalizacoes(){
         document.open();
         let html = '<!DOCTYPE html>';
         html = '<head>';
           html += '<title>SIPAC - Log de Finalizações</title>';
           html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
           html += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">';
           html += '<style>';
           html += '@import "https://fonts.googleapis.com/css?family=Dosis";body{margin:0;margin-top:-20px;font-family:"Dosis",sans-serif}footer{position:fixed;right:0;bottom:0;left:0;padding:1rem;background-color:#4286f4;color:#4286f4;padding:0 0 0 0;text-align:center;z-index:1;padding:10px 20px 10px 20px}footer a{background-color:#fff;border-radius:5px;padding:10px;text-decoration:none;line-height:50px;text-overflow:ellipsis;white-space:nowrap}footer a:visited{color:#4286f4}footer a:hover{background-color:blue}footer > table{margin:0 auto}header td{color:#fff;} header{box-sizing:border-box;color:#fff;width:100%;background-color:#4286f4;padding:30px}header div{float:right}div.content{color:#000;margin:20px 20px 100px 0;padding:20px}.fa{font-size:25px!important}header i.fa{color:#fff}section i.fa{margin-left:6px}span.hidden{display:none}';
           html += '</style>';
         html += '</head>';
         html += '<body>';
           html += '<header><h1> As finalizações foram concluidas! </h1><div> <table><tr><td> Criado por Tiago Lobão </td><td><a href="https://github.com/tiagolobao" > <i class="fa fa-github"></i> </a></td><td><a href="https://twitter.com/tiago_blobao" class="content-footer"> <i class="fa fa-twitter"></i> </a></td><td><a href="https://www.instagram.com/lobao_tiago/"> <i class="fa fa-instagram"></i> </a></td></tr></table> </div></header>';
           html += '<div class="content"><section id="reqFin"><h2> Requisições Finalizadas<i class="fa fa-angle-right"></i></h2><span class="hidden"><textarea readonly cols="35" rows="1">';
           html += (sessionStorage.getItem("requisit") == '' ? 'Sem requisições' : sessionStorage.getItem("requisit"));
           html += '</textarea><i class="fa fa-copy"></i></span></section><section id="reqMat"><h2> Requisições com espera de Material <i class="fa fa-angle-right"></i></h2><span class="hidden"><textarea readonly cols="35" rows="1">';
           html += (sessionStorage.getItem("requisitRemanescentes") == '' ? 'Sem requisições' : sessionStorage.getItem("requisitRemanescentes").substr(1));
           html += '</textarea><i class="fa fa-copy"></i></span> </section> <section id="reqNaoAlterada"> <h2> Requisições que já estavam finalizadas <i class="fa fa-angle-right"></i></h2> <span class="hidden"><textarea readonly cols="35" rows="1">'
           html += (sessionStorage.getItem("jaFinalizadas") == '' ? 'Sem requisições' : sessionStorage.getItem("jaFinalizadas").substr(1));
           html += '</textarea><i class="fa fa-copy"></i></span></section><section id="erros"><h2> Erros <i class="fa fa-angle-right"></i></h2><span class="hidden">';
           html += (sessionStorage.getItem("erros") == '' ? 'Sem erros encontrados' : sessionStorage.getItem("erros"));
           html += '</span></section></div>';
           html += '<footer><a href="https://sipac.ufba.br/sipac/supinfra/index.jsf">Voltar ao SIPAC</a><a href="https://github.com/tiagolobao/SipacEletrica_V2/issues">Reportar Erros</a><a href="http://www.pudim.com.br">Ir para o site mais legal de todos</a></footer>';
            html += '<script type="text/javascript">';
              html += 'function copyClipboard(sectionID){let queryElement=document.getElementById(sectionID);queryElement.getElementsByTagName("i")[1].addEventListener("click",()=>{let copyText=queryElement.getElementsByTagName("textarea")[0];copyText.select();document.execCommand("copy");});}function toggleHiddenContent(sectionID){let queryElement=document.getElementById(sectionID);queryElement.getElementsByTagName("i")[0].addEventListener("click",()=>{queryElement.getElementsByTagName("span")[0].classList.toggle("hidden");queryElement.getElementsByTagName("i")[0].classList.toggle("fa-angle-right");queryElement.getElementsByTagName("i")[0].classList.toggle("fa-angle-down");});}';
              html += 'copyClipboard("reqFin");copyClipboard("reqMat");copyClipboard("reqNaoAlterada");toggleHiddenContent("reqFin");toggleHiddenContent("reqMat");toggleHiddenContent("reqNaoAlterada");toggleHiddenContent("erros");';
            html += '</script>';
         html += '</body>';
         html += '</html>'
         sessionStorage.clear();
         document.write( html );
      }

      /***************************************************************************
      Função equivalente ao jQuery(document).ready(function(){});
      ****************************************************************************/
      function ready(fn) {
         if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
            fn();
         } else {
            document.addEventListener('DOMContentLoaded', fn);
         }
      }

      /***************************************************************************
      Função para obter string com data atual
      ****************************************************************************/
      function getHoje() {
        let d = new Date();
        let dateString = ( d.getDate()<10 ? "0"+d.getDate() : d.getDate() );
        dateString    += "/";
        dateString    += ( d.getMonth()<10 ? "0"+d.getMonth() : d.getMonth() );
        dateString    += "/";
        dateString    += d.getFullYear();
        return dateString;
      }
      /*****************************************************************************
         CÓDIGO PARA A PÁGINA PRINCIPAL DO SIPAC - FORMULARIO E INTERFACE DE USUÁRIO
      ******************************************************************************/
      if(window.location.pathname.indexOf("index.jsf") > -1){

         let abaManutencao = document.getElementById('manutencao-menusupinfra');
         if(abaManutencao != null){
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
            abaManutencao.innerHTML += htmlAppend;

            //Ação de clicar para finalizar
            /*
               1 - É adicionado as variáveis de sessão para as finalizações
               2 - Redireciona a página para alterar as requisições
            */
            document.getElementById("fibut").addEventListener('click', function(){
               var input = document.getElementById("finauto").value;
               input = input.replace(/ /g,''); //Removendo todos os espaços
               sessionStorage.setItem("requisit",input);
               sessionStorage.setItem("acessos",0);
               sessionStorage.setItem("processoFinalizaAuto",1);
               sessionStorage.setItem("emRotaVisita","");
               sessionStorage.setItem("requisitRemanescentes","");
               sessionStorage.setItem("jaFinalizadas","");
               sessionStorage.setItem("erros","");
               window.location.href = enderecoBuscaOsPreBusca;
            });
         }
      }

      // Estado em que a finalização automática se encontra
      var processoFinalizaAuto = parseInt( sessionStorage.getItem("processoFinalizaAuto") );
      /*********************************************************************************************
                                PRIMEIRA PARTE DA FINALIZAÇÃO AUTOMATICA
                              MUDAR STATUS DA ORDEM DE SERVIÇO PARA CONCLUIDA
      *********************************************************************************************/
      if(processoFinalizaAuto == 1){
         /*************************************************************************
               CÓDIGO PARA A PÁGINA CONSULTA OS CASO TENHA CLICADO PARA FINALIZAR
         *************************************************************************/
         if (window.location.href == enderecoBuscaOsPreBusca  ||  window.location.pathname.indexOf("populaOS") > -1){

            let OS = getProximaBusca();
            if(OS.keepGoing){
               document.getElementById('consultaPorRequisicaoCheck').checked = true; //Selecionando tipo de pesquisa
               document.querySelector("input[name='ordemServico.requisicao.numero']").value = OS.numero;
               document.querySelector("input[name='ordemServico.requisicao.ano']").value = OS.ano;
               setTimeout(
                  () => document.querySelector("#conteudo > form > table > tfoot >tr > td > input:nth-child(2)").click(),
                  100
               );
            }
            /* Caso não exista mais requisições a serem finalizadas */
            else{
               sessionStorage.setItem("acessos",0);
               sessionStorage.setItem("processoFinalizaAuto",2);
               window.location.href = enderecoPaginaPrincipal;
            }
         }

         /*************************************************************************
               CÓDIGO PARA CLICAR EM ALTERAR OS CASO ESTEJA NO PROCESSO DE FINALIZAÇÃO AUTOMATICA
         *************************************************************************/
         if (window.location.pathname.indexOf("buscaOS") > -1){
            var parser = new DOMParser();
            //Espera a página terminar de carregar
            ready( function() {
               /*Obtem informação de qual é o status da OS*/
               //Obtendo endereço para pegar status da OS
               let onClickOS = document.querySelector("#conteudo > table.listagem > tbody > tr > td:nth-child(5) > a ").getAttribute("onclick");
               let numOS = document.querySelector("#conteudo > table.listagem > tbody > tr > td:nth-child(5) > a").innerHTML;
               let enderecoStatusOS = "https://sipac.ufba.br" + onClickOS.substr(13, onClickOS.indexOf("&popup=popup") - 1);

               //Pegando informações da página VIA AJAX ******
               let request = new XMLHttpRequest();
               request.open('GET', enderecoStatusOS, true);
               request.onload = function() {
                 if (request.status >= 200 && request.status < 400) {
                    let pageString = request.responseText
                    let page = parser.parseFromString(pageString, "text/html");
                    let response = page.querySelector('div[id="container-popup"] > table > tbody > tr > td > table > tbody > tr:nth-child(5) > td').innerHTML;
                    response = response.replace(/(\r\n\t|\n|\r\t)/gm,"");
                    //Separando OS EM ROTA VISITA das outras
                    if(response == '		   			EM ROTA VISITA				' || response == '		   			EM EXECUÇÃO				'){
                       let buffer = sessionStorage.getItem("emRotaVisita");
                       buffer += "," + numOS.replace(/ /g,'');
                       sessionStorage.setItem("emRotaVisita",buffer);
                    }
                    else if("		   			FINALIZADA				"){
                      let buffer = sessionStorage.getItem("jaFinalizadas");
                      buffer += "," + numOS.replace(/ /g,'');
                      sessionStorage.setItem("jaFinalizadas",buffer);
                    }
                    else{
                       let buffer = sessionStorage.getItem("requisitRemanescentes");
                       buffer += "," + numOS.replace(/ /g,'');
                       sessionStorage.setItem("requisitRemanescentes",buffer);
                    }
                    /* Confere se é o momento certo de clicar para alterar a OS
                       1 - Deve estar ativo o processo de finalização automatica
                       2 - Deve acontecer apenas depois que buscar a OS correta a se finalizar
                    */
                    let enderecoPaginaAtual = window.location.href; //1
                    let processoFinalizaAuto = sessionStorage.getItem("processoFinalizaAuto"); //2
                    if(enderecoPaginaAtual != enderecoBuscaOsPreBusca && processoFinalizaAuto){
                       let url = document.querySelector("#conteudo > table > tbody > tr >  td:nth-child(10) > a ").href;
                       location.href = url;
                    }
                 } else {
                   // We reached our target server, but it returned an error
                   let temp_erros = sessionStorage.getItem("erros");
                   sessionStorage.setItem("erros",a+"Não foi possível obter o conteúdo da OS " + numOS + '... Servior retornou erro');
                 }
               };
               request.onerror = function() {
                 // There was a connection error of some sort
                 let temp_erros = sessionStorage.getItem("erros");
                 sessionStorage.setItem("erros",a+"Não foi possível obter o conteúdo da OS " + numOS + '... Erro de conexão');
               };
               request.send();
               //*FIM DO CÓDIGO AJAX */
            });
         }
         /*************************************************************************
               CÓDIGO PARA FAZER AS ALTERAÇÕES NECESSÁRIAS NA ORDEM DE SERVIÇO
               OBS: Essa parte do código acaba rodando tanto na hora do
               formulário de alteração da OS, quanto na parte em que pode ser feita a
               impressão da OS.
         *************************************************************************/
         if (window.location.pathname.indexOf("cadastraOS") > -1){

            //Conferindo se existe o elemento antes de muda-lo
            if(document.getElementById("ordemServicoForm:statusOrdemServico") != null){
               document.getElementById("ordemServicoForm:statusOrdemServico").value = '1'; //Muda o status para concluída
               document.querySelector("textarea[name='ordemServicoForm:j_id_jsp_2030603547_110']").value = "Serviço executado."; //Muda o Diagnostico de Vistoria
            }

            //Click para alterar OS
            if(document.getElementsByName("ordemServicoForm:j_id_jsp_2030603547_131")[0] != null)
               setTimeout(function(){ document.getElementsByName("ordemServicoForm:j_id_jsp_2030603547_131")[0].click(); }, 2500);
            //Alterando a data de conclusão
            if(document.getElementById("ordemServicoForm:dataExecucao") != null)
              document.getElementById("ordemServicoForm:dataExecucao").value = getHoje();
            //Click para voltar busca de OS (Botão "Alterar Outra Ordem de Serviço")
            else if(document.getElementsByName("j_id_jsp_1084759112_1:j_id_jsp_1084759112_35")[0] != null)
               setTimeout(function(){ document.getElementsByName("j_id_jsp_1084759112_1:j_id_jsp_1084759112_35")[0].click(); }, 2500);
         }
      }

      /*********************************************************************************************
                                SEGUNDA PARTE DA FINALIZAÇÃO AUTOMATICA
                              REDIRECIONAMENTO PARA A PAGINA DE OS EM ROTA VISITA
      *********************************************************************************************/
      if(processoFinalizaAuto == 2){
         if (window.location.pathname.indexOf("index.jsf") > -1){
            sessionStorage.setItem("processoFinalizaAuto",3);
            abrirPaginaEmRotaVisita();
         }
      }
      /*********************************************************************************************
                                TERCEIRA PARTE DA FINALIZAÇÃO AUTOMATICA
                              MUDAR DE EM ROTA VISITA PARA SERVIÇO EXECUTADO
      *********************************************************************************************/
      if(processoFinalizaAuto == 3){

         /*
            Preenchimento do formulário de busca de OS
         */
         if (window.location.pathname.indexOf("index.jsf") > -1){

            //Alterando a lista de requisições que se deve finalizar
            let newList = sessionStorage.getItem("emRotaVisita");
            sessionStorage.setItem(
               "requisit",
               newList.substring(1,newList.length)
            );

            let OS = getProximaBusca();
            if(OS.keepGoing){
               document.getElementById('consultaRequisicoes:ckNumeroAno').checked = true; //Selecionando tipo de pesquisa
               document.getElementById('consultaRequisicoes:numRequisicao').value = OS.numero;
               document.getElementById('consultaRequisicoes:anoRequisicao').value = OS.ano;
               setTimeout(
                  function(){document.querySelector("input[name='consultaRequisicoes:j_id_jsp_1184468779_41']").click();},
                  100
               ); //confirmar busca
            }
            else{
               //Quando acaba todas as OS - Improvável pois essa parte do código só roda uma vez
               terminaFinalizacoes();
            }
         }

         /***************************
            Página pós busca de OS -
         ****************************/
         if (window.location.pathname.indexOf("listagem_requisicoes") > -1){
            sessionStorage.setItem("processoFinalizaAuto",4);
            document.querySelector("input[id='consultaRequisicoes:requisicoes:0:chkReq']").click(); //Seleciona requisição
            document.querySelector("input[name='consultaRequisicoes:j_id_jsp_1184468779_166']").click(); //Clica em continuar
         }
      }

      /*********************************************************************************************
                                QUARTA PARTE DA FINALIZAÇÃO AUTOMATICA
                              MUDAR DE EM ROTA VISITA PARA SERVIÇO EXECUTADO
      *********************************************************************************************/
      if(processoFinalizaAuto == 4){
         /*
            Página pós seleção de OS para mudar status
         */
         if (window.location.pathname.indexOf("listagem_requisicoes") > -1){
            document.querySelector("select[name='confirmaOperacao:j_id_jsp_1655664044_4']").value = "1"; //Seleciona Serviço executado
            confirmChangeServicoExecutado(); //Necessário para aparecer a opção de quantidade de horas
            setTimeout(
               function(){
                  //Quantidade de horas
                  document.querySelector("input[name='confirmaOperacao:requisicoes:0:j_id_jsp_1655664044_41']").value = "8";
                  setTimeout(
                     function(){
                        //Evita o aparecimento do alerta
                        document.querySelector("input[name='confirmaOperacao:j_id_jsp_1655664044_42']").setAttribute("onclick", "return true;");
                        setTimeout(
                           function(){
                              //Confirma a operação
                              document.querySelector("input[name='confirmaOperacao:j_id_jsp_1655664044_42']").click();
                           },
                           3000 //Tempo de confirmar a operação
                        );
                     },
                     3000 //Tempo de evitar o aparecimento do alerta
                  );
               },
               3000 //Tempo de colocar a quantidade de horas
            );
         }

         /*
            Página pós confirmar alteração de status da OS
         */
         if (window.location.pathname.indexOf("confirmar_operacao") > -1){
            document.querySelector("input[name='consultaRequisicoes:j_id_jsp_987653318_30']").click();
         }

         /*
            Página de busca de OS após a primeira confirmação de alteração de status for realizada
            ESSA PÁGINA POSSUI O MESMO CÓDIGO DA index.jsf depois que clica para abrir OS "Em rota visita"
         */
         if (window.location.pathname.indexOf("sucesso_operacao") > -1){

            let OS = getProximaBusca();
            if(OS.keepGoing){
               document.getElementById('consultaRequisicoes:ckNumeroAno').checked = true; //Selecionando tipo de pesquisa
               document.getElementById('consultaRequisicoes:numRequisicao').value = OS.numero;
               document.getElementById('consultaRequisicoes:anoRequisicao').value = OS.ano;
               /************************************
                  MOMENTO QUE PODE GERAR CONFUSÃO
                  É NECESSÁRIO VOLTAR PARA O PASSO 3 NESSE MOMENTO POIS VOLTA PRA PÁGINA "listagem_requisicoes"
                  É REALIZADA A SELEÇÃO DA OS E DEPOIS VOLTA PARA A MESMA PÁGINA "listagem_requisicoes" COM O PASSO 4
               ***************************************/
               sessionStorage.setItem("processoFinalizaAuto",3);
               setTimeout(
                  function(){document.querySelector("input[name='consultaRequisicoes:j_id_jsp_1184468779_41']").click();},
                  100
               ); //confirmar busca
            }
            else{
               //Quando acaba todas as OS
               terminaFinalizacoes();
            }
         }
      }

     console.log("adieu");
   })();
