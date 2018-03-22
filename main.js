// ==UserScript==
// @name SipacEletrica_V2
// @namespace https://github.com/tiagolobao/SipacEletrica_V2
// @version 2.0
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
   /*****************************************************************************
      CÓDIGO PARA A PÁGINA PRINCIPAL DO SIPAC - FORMULARIO E INTERFACE DE USUÁRIO
   ******************************************************************************/
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
         sessionStorage.setItem("processoFinalizaAuto",1);
         window.location.href = enderecoBuscaOsPreBusca;
      });
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
         /* Realizando uma nova busca de OS */
         var requisit = [];
         var acess = parseInt( sessionStorage.getItem("acessos") );
         var input = sessionStorage.getItem("requisit");

         var j=0;
         var i;
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
            var barra;
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
               /* Confere se é o momento certo de clicar para alterar a OS
                  1 - Deve estar ativo o processo de finalização automatica
                  2 - Deve acontecer apenas depois que buscar a OS correta a se finalizar
               */
               let enderecoPaginaAtual = window.location.href; //1
               let processoFinalizaAuto = sessionStorage.getItem("processoFinalizaAuto"); //2
               if(enderecoPaginaAtual != enderecoBuscaOsPreBusca && processoFinalizaAuto){
                  let url = jQuery("#conteudo > table > tbody > tr >  td:nth-child(9) > a ").prop("href");
                  jQuery(location).attr("href", url);
               }
         });
      }
      /*************************************************************************
            CÓDIGO PARA FAZER AS ALTERAÇÕES NECESSÁRIAS NA ORDEM DE SERVIÇO
            OBS: Essa parte do código acaba rodando tanto na hora do
            formulário de alteração da OS, quanto na parte em que pode ser feita a
            impressão da OS.
      *************************************************************************/
      if (window.location.pathname.indexOf("cadastraOS") > -1){

         jQuery('[id="ordemServicoForm:statusOrdemServico"]').val('1'); //Muda o status para concluída
         jQuery("textarea[name='ordemServicoForm:j_id_jsp_2030603547_110']").val("Serviço executado."); //Muda o Diagnostico de Vistoria
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
         jQuery("input[id='consultaRequisicoes:ckNumeroAno']").click(); //clique opção de busca
         jQuery("input[id='consultaRequisicoes:numRequisicao']").val("12"); //número da requisição
         jQuery("input[id='consultaRequisicoes:anoRequisicao']").val("12"); //ano da requisição
         jQuery("input[name='consultaRequisicoes:j_id_jsp_1184468779_41']").click(); //confirmar busca
      }

      /*
         Página pós busca de OS
      */
      if (window.location.pathname.indexOf("listagem_requisicoes") > -1){
         jQuery("input[id='consultaRequisicoes:requisicoes:0:chkReq']").click();
      }
   }
  console.log("adieu");
})();
