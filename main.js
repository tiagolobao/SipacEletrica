   // ==UserScript==
   // @name SipacEletrica_V2
   // @namespace https://github.com/tiagolobao/SipacEletrica_V2
   // @version 1.1
   // @description Script para gerenciamento das ordens de serviço de forma automática no NOVO site do SIPAC-UFBA
   // @author Tiago Britto Lobão
   // @match https://sipac.ufba.br/*
   // @grant none
   // @require http://code.jquery.com/jquery-latest.js
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
      Gera página web para mostrar Requisições que não foram totalmente finalizadas
      porque não estavam como em rota visita - DEPRECATED
      ****************************************************************************/
      function paginaOsRemanescentes(){
         let html = "<head>";
         html += "";
         html += "</head>";
         html += "<body>";
            html += "<p>";
               html += sessionStorage.getItem("requisitRemanescentes");
            html += "</p>";
            html += "<a href='" + enderecoPaginaPrincipal + "'>";
               html += " Voltar ";
            html += "</a>";
         html += "</body>";
         return html;
      }

      /***************************************************************************
      Termina o processo de finalização, apagando as variáveis de sessão e abrindo página com informações
      ****************************************************************************/
      function terminaFinalizacoes(){
         alert("As ordens de serviço foram finalizadas");
         document.open();
         let html = "<head>";
         html += "";
         html += "</head>";
         html += "<body>";
            html += "<p>";
               html += sessionStorage.getItem("requisitRemanescentes");
            html += "</p>";
            html += "<a href='" + enderecoPaginaPrincipal + "'>";
               html += " Voltar ";
            html += "</a>";
         html += "</body>";
         sessionStorage.clear();
         document.write( html );
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
            //Espera a página terminar de carregar
            jQuery(document).ready( function() {
               /*Obtem informação de qual é o status da OS*/
               //Obtendo endereço para pegar status da OS
               let onClickOS = document.querySelector("#conteudo > table.listagem > tbody > tr > td:nth-child(5) > a ").getAttribute("onclick");
               let numOS = document.querySelector("#conteudo > table.listagem > tbody > tr > td:nth-child(5) > a").innerHTML;
               let enderecoStatusOS = "https://sipac.ufba.br" + onClickOS.substr(13, onClickOS.indexOf("&popup=popup") - 1);
               //Pegando informações da página
               jQuery.ajax(enderecoStatusOS).done(function(page) {
                  var response = page.querySelector('div[id="container-popup"] > table > tbody > tr > td > table > tbody > tr:nth-child(5) > td').innerHTML;
                  response = response.replace(/(\r\n\t|\n|\r\t)/gm,"");
                  //Separando OS EM ROTA VISITA das outras
                  if(response == '		   			EM ROTA VISITA				'){
                     let buffer = sessionStorage.getItem("emRotaVisita");
                     buffer += "," + numOS.replace(/ /g,'');
                     sessionStorage.setItem("emRotaVisita",buffer);
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
               });
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
            /*
            Esse ação acaba funcionando por coincidencia para clicar no botão "Alterar" e no "Alterar Outra Ordem de Serviço"
            */
            setTimeout(function(){ jQuery( "tfoot > tr > td > input:nth-child(1)" ).click(); }, 2500);
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
                  function(){jQuery("input[name='consultaRequisicoes:j_id_jsp_1184468779_41']").click();},
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
            jQuery("input[id='consultaRequisicoes:requisicoes:0:chkReq']").click(); //Seleciona requisição
            jQuery("input[name='consultaRequisicoes:j_id_jsp_1184468779_166']").click(); //Clica em continuar
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
                              jQuery("input[name='confirmaOperacao:j_id_jsp_1655664044_42']").click();
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
            jQuery("input[name='consultaRequisicoes:j_id_jsp_987653318_30']").click();
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
                  function(){jQuery("input[name='consultaRequisicoes:j_id_jsp_1184468779_41']").click();},
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
