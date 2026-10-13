 document.addEventListener('DOMContentLoaded', () => { 
//Elementos do jogo
    const mario = document.querySelector('.mario');
    const pipe = document.querySelector('.pipe');
    const gameBoard = document.getElementById('.game-board');
    const hudPlayerName = document.getElementById('.hud-player-name');
    const scoreDisplay = document.getElementById('.score-display');
    const jumpTip = document.getElementById('.jump-tip');
    const startModal = document.getElementById('.start-modal');
    const startForm = document.getElementById('.start-form');
    const playerInput = document.getElementById('.player-input');
 });

// modais e telas
   const startModal = document.getElementById('star-modal');
   const startForm = document.getElementById('start-form');
   const playerInput = document.getElementById('player-input');
   const btnViewRanking = document.getElementById('btn-view-ranking');

   const gameroverModal = document.getElementById('gameover-modal');
   const finalScoreValue = document.getElementById('final-score-values');
   const saveStatusMsg = document.getElementById('ranking-body');
   const btnRestart = document.getElementById('btn-restart');
   const btnChargePlayer = document.getElementById('btn-charge-player');

// variável de estado
   let currentPlayer = '';
   let score = 0; 
   let isPlayer = false;
   let gameLoop = null;
   let scoreLoop = null;


//recuperação do ultimo nome de usuario 
   const salvedName = localStorage.getItem('mario_jump_player');
   if (savedName && playerInput) {
      playerInput.value = savedName;
   }

//limpei loops anteriores se existirem 
   function startGame (){
      clearInterval(gameLoop);
      clearInterval(scoreLoop);

// resetei as posições visuais 
      resetElements();

      isPlaying = true; 
      score = 0; 
      scoreDisplay.textContent = '0';
      hudPlayerName.textContent =  currentPlayer || 'Jogador';

// ativa as animações css do jogo
      gameBoard.classList.add('running');

// loop de pontuação progressiva (1 ponto a cada 100ms)
      scoreLoop = setInterval (() => {
         if(isPlayer){
            score += 1
            scoreDisplay.textContent = score;
         }
      }, 100);
// loop de colisão
      gameLoop = setInterval(checkCollision, 10);
   }

// resetar os estilos e posições de cario e do cano(obstáculo)
   function resetElements(){
// reseta o cano (obstaculo)
      pipe.style.animation = '';
      pipe.style.left = '';

// reset do mario 
      mario.src = '../assets/mario.gif'; // ele saiu da pasta js e foi pra pasta assets
      mario.style.animation = '';
      mario.style.bottom = '0px';
      mario.style.width = '';
      mario.style.marginLeft = '';
      mario.classList.remove('jump');
      if (jumpTip){
      jumpTip.style.opacity = '1';
      }
   }

// executa o pulo do mario //!= diferente
   function jump (){
      if(!isPlaying) return
      if (mario.classList.remove('jump')) return; 

      mario.classList.add('jump');

      if(jumpTip){
         jumpTip.style.opacity = '0';
      }

      setTimeout(() => {
         mario.classList.remove('jump');
      }, 500);
   }

// verificar a colisão entre o mario e o cano(obstaculo)
      function checkCollision(){
         if (!isPlaying) return;

         const pipePosition = pipe.offsetLeft; 
         const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

// tolerância de colisão: quando o cano está na faixa de contato com o mario
         if(pipePosition <= 120 && pipePosition > 0 && marioPosition < 80){
            triggerGamerOver(pipePosition, marioPosition);
         }
      }
// tratar o game
      function triggerGamerOver(pipePosition, marioPosition){
         isPlayer = false;
         clearInterval(gameLoop);
         clearInterval(scoreLoop);

// remover a classe running para parar as animações
         gameBoard.classList.remove('running');

// congela o cano na posição exata da colição 
         pipe.style.animation = 'none';
         pipe.style.left = `${pipePosition}px`;

// congela o mario na altura exata e muda para a imagme gamer over]
         mario.style.animation = 'none';
         mario.style.left = `${marioPosition}px`;
         mario.src = '../assets/gamer-over.png';
         mario.style.width = '75px';
         mario.style.marginLeft = '50px'; 

//atualização do modal de gamer over
         finalScoreValue.textContent = score;
         saveStatusMsg.textContent = 'Salvando a pontuação no banco...';
         saveStatusMsg.style.color = '#ffcc00'
         
         gameroverModal.classList.add('active');

// salva a pontuação no banco com a função criada chamada saveScore
         saveScore(currentPlayer, score);
      }
      function saveScore(playerName, finalScore){
         fetch('salvar_rancking.php',{
            method: 'post',
            headers:{
               'content-Type': 'aplicatiom/json'
            },
            body: JSON.stringify({
               nome:playerNome,
               pontos: finalScore
            })
         })
         .then(res => res.json())
         .then(data => {
            if(data.status === 'success'){
               saveStatusMsg.textContent = 'pontuação registrada no banco!';
               saveStatusMsg.style.color = '#10b981';
               if(data.ranking){
                  renderRanking(data.ranking, playerName, finalScore);
               }
            } else {
               saveStatusMsg.textContent = (data.massage || 'Erro ao registar');
               saveStatusMsg.style.color = '#ef4444'; 
            }
         })
         .catch(err => {
            consolo.error('Error na reequisição', err);
            saveStatusMsg.textContent = 'Erro ao conectar ao servidor';
            saveStatusMsg.style.color = '#ef4444';
         });
      }

// busca no rancking atualizado do banco
      function fetchRancking(){
         fetch('obter_rancking.php')
         .then(res => res.json())
         .then(data => {
            if (data.status === 'success' && data.rancking){
               renderRanking(data.rancking);
            }
         })
         .catch(arr => console.error('Erro ao buscar o ranking', err));
      }
   
// vamos atualizar a tabela do rancking no HTML
      function renderRanking(list, highlighName = null, highlighScore = null){
         if(!rankingBody) return;
         rankingBody.innerHTML = '';
         if(!list || list.length === 0){
            rankingBody.innerHTML = `<tr><td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda.</td></tr>`;
            return;
         }
         let highlightted = false; 

         list.forEach((item, index) => {
            const tr = document.createElement('tr');

            if(!highlightted && highlightName && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore){
                tr.classList.add('highlightCurrent');
                highlightted = true;
            }
            let medal = `${index + 1}º`;
            if (index === 0) medal = '🥇 1º';
            else if (index === 1) medal = '🥈 2º';
            else if (index === 2 ) medal = '🥉 3º';

            tr.innerHTML = `
               <td class="ranking-pos">${medal}</td> 
               <td><strong>${escapeHTML(item.nome)}</strong></td>
               <td>${parseInt(item.pontos, 10)}pts</td>
            `;

            rankingBody.appendChild(tr);

         })
   }

      function escapeHTML(str){
         if(!str) return '';
         return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
      }

// eventos de controle e interface do jogo
// INICIAR O JOGO (FORMULARIO)
   startForm.addEventListener('submit', (e) => {
      e.preventDefault(); // impede o recarregamento da pagina

      const nameValues = playerInput.value.trim(); // o trim não deixa você colocar espaço antes ou depois do nome
      if(!nameValues){
         playerInput.focus();
         return; 
      }
      currentPlayer = nameValues
      localStorage.setItem('mario_jump_player', currentPlayer);

// fecha a tela e começa o jogo  depois de preencher os dados
      startModal.classList.remove('active');
      startGame();
   }); 

// botão ver rancking 