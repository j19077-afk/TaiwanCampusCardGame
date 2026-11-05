
(()=>{\n// 舊測試頁專用存檔隔離：避免測試用無限金幣覆寫正式版進度。\nconst __nativeStorage=window.localStorage;\nconst __testPrefix='campusSixItemLegacyTest20261102::';\nconst localStorage={getItem(key){return __nativeStorage.getItem(__testPrefix+key)},setItem(key,value){return __nativeStorage.setItem(__testPrefix+key,String(value))},removeItem(key){return __nativeStorage.removeItem(__testPrefix+key)}};\nlet skillMenuOpen=false,selectedCombatAction=null,healingTargetMode=false,healingSelectedTargetId=null;const $=id=>document.getElementById(id);const lobby=$('lobby'),gameApp=$('gameApp');
// 戰鬥返回使用捕獲階段的全域點擊攔截，避免其他事件或畫面狀態令按鈕失效。

// Homepage spotlight: show existing roster data in a focused modal; do not alter other screens.
(function bindFeaturedCharacterModal(){
 const backdrop=document.getElementById('featuredDetailModal'),body=document.getElementById('featuredDetailBody'),title=document.getElementById('featuredDetailTitle'),close=document.getElementById('featuredDetailClose');if(!backdrop||!body||!title||!close)return;
 // The summon page hides #lobby; keep this dialog outside that hidden ancestor.
 if(backdrop.parentElement!==document.body)document.body.appendChild(backdrop);
 const profiles={ruoxue:{department:'醫學系',year:'三年級',description:'感染災變爆發後，她冷靜分析感染者的行動規律，逐步掌握變異體的弱點。'},zihan:{department:'資訊工程系',year:'四年級',description:'擅長分析研究設施資料，利用科技與環境尋找感染者的弱點，協助小隊避開危險。'},anzai_coach:{department:'校園健康中心',year:'教練',description:'負責校園健康中心的緊急救護工作，以專業與沉著守護每一位仍在戰鬥的隊員。'},konan_koyoi:{department:'校園冒險隊',year:'SSR 焦點角色',description:'手機電量只剩下 1%！將焦慮轉化為攻擊力，在手機關機前結束戰鬥！'}};
  const skillNames={yuching:"超商微波便當！",yutong:"先喝水再說！",ruoxue:"冷氣開到 16 度！",xingyao:"外送倒數三分鐘！",keqing:"主管說再撐一下！",zihan:"已讀不回大法！",konan_koyoi:"手機剩 1%！"};
  const skillDesc={yuching:"三上悠亞拿出剛微波好的便當，香氣吸引附近感染者。她趁敵人爭搶便當的混亂時刻發動猛烈攻擊，成功突破包圍。",yutong:"蘇語彤指定一名存活且生命值未滿的出戰隊員進行治療，治療量等於她目前等級的治療能力；消耗 35 點能量，不占用本回合行動，也不觸發敵方反擊。",ruoxue:"沈若雪一本正經地把冷氣調到 16 度！感染者彷彿感受到月底電費帳單的恐懼，她趁亂發動強力攻勢。",xingyao:"許星瑤進入外送倒數模式，以驚人的速度穿越感染者群。為了不讓餐點超時，她爆發出連自己都無法理解的潛能，迅速發動攻擊。",keqing:"江可晴架起防禦姿勢，大喊「主管說再撐一下！」全隊被社畜精神震懾，趁感染者遲疑時反擊，並減少下一次受到的傷害。",zihan:"顧紫涵對感染者發送訊息後立刻已讀不回。敵人陷入無盡等待與混亂，她趁對方失去攻擊節奏時發動猛烈攻勢。",konan_koyoi:"對敵方單體造成目前技能威力 1.5 倍的傷害；消耗 35 點能量並占用本回合行動，敵方會正常反擊。"};
 function open(id){const ch=roster.find(x=>x.id===id);if(!ch)return;const p=profiles[id];if(!p)return;const st=getCardStats(ch),lv=getLevel(ch);title.textContent=ch.name+' · '+ch.rarity;body.innerHTML='<div class="featured-detail-layout"><div class="featured-detail-art"><img src="'+ch.image+'" alt="'+ch.name+'完整卡牌" onerror="this.alt=\'角色卡牌圖片無法載入\'"></div><div class="featured-detail-info"><p class="character-role">'+p.department+'・'+p.year+'</p><p>'+p.description+'</p><div class="featured-detail-stats"><div><small>角色等級</small><strong>Lv.'+lv+' / '+levelCap(ch)+'</strong></div><div><small>攻擊力</small><strong>⚔️ '+st.atk+'</strong></div><div><small>生命值</small><strong>💚 '+st.hp+'</strong></div><div><small>技能威力</small><strong>✨ '+st.skill+'</strong></div></div><h3>專屬技能｜'+skillNames[id]+'</h3><p>'+skillDesc[id]+'</p></div></div>';backdrop.hidden=false;document.body.style.overflow='hidden';close.focus({preventScroll:true});}
 function dismiss(){backdrop.hidden=true;document.body.style.overflow='';}
 document.addEventListener('click',e=>{const target=e.target instanceof Element?e.target:null;const card=target&&target.closest('#summonPage [data-featured-character]');if(card&&$('summonPage')?.style.display!=='none')open(card.dataset.featuredCharacter)});
 document.addEventListener('keydown',e=>{const target=e.target instanceof Element?e.target:null;const card=target&&target.closest('#summonPage [data-featured-character]');if(card&&$('summonPage')?.style.display!=='none'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(card.dataset.featuredCharacter)}});
 close.addEventListener('click',dismiss);backdrop.addEventListener('click',e=>{if(e.target===backdrop)dismiss()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!backdrop.hidden)dismiss()});
})();

function resetBattleForRetreat(){
 const col=readCollection(),team=(col.formation||[]).map(id=>roster.find(ch=>ch.id===id)).filter(Boolean);
 if(!team.length)team.push(roster.find(ch=>ch.id==='yuching'));
 state.challengeMode=false;state.challengeResultActive=false;state.challengeReturnStage=null;state.challengeReplayCompleted=false;
 state.energy=0;state.enemyEnergy=0;state.pendingEnemySkill=null;state.enemySkillNotice=null;
 state.bossCharge=false;state.defendNext=false;state.guardNext=false;state.supplyUsedStage=false;state.potions=1;
 state.stage20Phase=0;state.stage20Rotation=0;state.stage20BossTurns=0;state.stage20SpecialPending=false;state.stage20DebuffTurns=0;
 state.enemyHp=enemy().hp;state.partyHp={};team.forEach(ch=>{state.partyHp[ch.id]=maxHp(ch)});
 state.activeMember=team[0].id;state.playerHp=state.partyHp[state.activeMember];state.stageStorySeen=false;
 selectedCombatAction=null;skillMenuOpen=false;undoStack=[];
 $('victoryBanner')?.remove();if($('log'))$('log').innerHTML='<div class="logline">你返回遊戲大廳，本場戰鬥已撤退。再次進入時將開始新的戰鬥。</div>';
 tell('本場戰鬥已撤退；再次進入遊戲時會以全新戰鬥狀態開始。');
 try{localStorage.removeItem('campusChallengeBattleSave')}catch(e){}
 challengeMainState=null;delete state.challengeMainSnapshot;save();
}
function clearChallengeModeForMainline(){
 if(state&&state.challengeMode){
  if(challengeMainState||state.challengeMainSnapshot){restoreChallengeMainState()}
  else{state.stage=Math.max(1,Number(state.challengeReturnStage)||1);state.challengeMode=false;state.challengeResultActive=false;state.challengeReturnStage=null;state.challengeReplayCompleted=false;delete state.challengeMainSnapshot;challengeMainState=null;try{localStorage.removeItem('campusChallengeBattleSave')}catch(e){}save()}
 }
 if(!state)return;
 state.challengeMode=false;state.challengeResultActive=false;state.challengeReturnStage=null;state.challengeReplayCompleted=false;
 delete state.challengeMainSnapshot;challengeMainState=null;
 try{localStorage.removeItem('campusChallengeBattleSave')}catch(e){}
 const attack=$('attackBtn');
 if(attack){attack.textContent='⚔️ 攻擊';attack.disabled=Number(state.playerHp)<=0||Number(state.enemyHp)<=0;attack.onclick=()=>handleCombatAction('attack')}
 save();
}
function forceLobby(){
 const wasChallenge=!!(state&&state.challengeMode);
 if(wasChallenge){
  const abandonedStage=Math.max(1,Number(state.stage)||1);
  if(challengeMainState||state.challengeMainSnapshot){restoreChallengeMainState()}
  else{state.stage=Math.max(1,Number(state.challengeReturnStage)||1);state.challengeMode=false;state.challengeReturnStage=null;state.challengeReplayCompleted=false;state.challengeResultActive=false}
  state.challengeLastResult={success:false,stage:abandonedStage,message:'已撤退；不計入通關次數，也不發放勝利獎勵。',total:0,retreated:true};
 }
 if(gameApp.style.display!=='none'||wasChallenge)resetBattleForRetreat();
 const notice=$('notice');if(notice)notice.textContent='';
 clearChallengeModeForMainline();gameApp.style.display='none';lobby.style.display='grid';const archive=$('archivePage');if(archive)archive.style.display='none';const summon=$('summonPage');if(summon)summon.style.display='none';const challenge=$('stageCenterPage');if(challenge)challenge.style.display='none';
 try{window.history.replaceState({screen:'lobby'},'','#lobby')}catch(err){}try{refreshLobby()}catch(err){}window.scrollTo(0,0)
}
document.addEventListener('click',function(ev){const btn=ev.target.closest('#gameBackBtn,#lobbyHomeBtn');if(!btn)return;ev.preventDefault();ev.stopImmediatePropagation();forceLobby()},true);

function localDayKey(d=new Date()){try{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));if(p.year&&p.month&&p.day)return p.year+'-'+p.month+'-'+p.day}catch(e){console.error('台灣日期判斷失敗，改用本機日期',e)}return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

function refreshLobby(){let s={stage:1,coins:0,cleared:0};try{s={...s,...JSON.parse(localStorage.getItem('campusCardMiniSave')||'{}')}}catch(e){}const mainStage=Math.min(20,Math.max(1,Number(s.stage)||1));const recordedCleared=Math.max(0,Math.min(20,Number(s.cleared)||0));const recordedStages=Array.isArray(s.clearedStages)?s.clearedStages.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=20):[];const inferredCleared=Math.max(0,mainStage-1,recordedCleared,...recordedStages);if(inferredCleared>recordedCleared||recordedStages.length<inferredCleared){s.cleared=inferredCleared;s.clearedStages=[...new Set([...recordedStages,...Array.from({length:inferredCleared},(_,i)=>i+1)])].sort((a,b)=>a-b);try{localStorage.setItem('campusCardMiniSave',JSON.stringify({...JSON.parse(localStorage.getItem('campusCardMiniSave')||'{}'),cleared:s.cleared,clearedStages:s.clearedStages}))}catch(e){console.warn('主線通關進度補正存檔失敗',e)}}$('lobbyStage').textContent=mainStage;$('lobbyCoins').textContent='∞';$('lobbyCleared').textContent=Math.min(20,Math.max(0,Number(s.cleared)||0));const stageNote=$('stageUpdateNote');if(stageNote)stageNote.textContent=(Number(s.cleared)||0)>=20||s.chapter2Complete?'第一章完成・更多內容待更新':'目前開放第 1–20 關';const testDaily=new URLSearchParams(location.search).get('testDaily')==='1';const day=localDayKey(),got=!testDaily&&localStorage.getItem('campusDailyGift')===day;let streak=0;try{streak=Number(localStorage.getItem('campusDailyStreak')||0)}catch(e){}$('dailyBtn').disabled=got;$('dailyBtn').textContent=got?'✓ 今日已領取':(testDaily?'🧪 測試每日補給':'🎁 領取每日補給');$('dailyNote').textContent=got?'每日補給已領取！目前已連續登入 '+streak+' 天，明日登入可繼續累積天數。':'每日登入可領 20 金幣；連續登入 '+(streak+1)+' 天還可獲得額外獎勵（最多連續 7 天）。'}

const characterProfiles={
 yuching:{name:'三上悠亞',rarity:'SR',role:'啦啦隊隊長・女主角',detail:'感染警報響起後，原本平凡的校園生活徹底改變。她從最初的慌亂中逐漸成長，為了保護同伴，決定深入校園與研究設施，追查災難背後的真相。'},
 yutong:{name:'蘇語彤',rarity:'R',role:'護理系・一年級',detail:'細心善良，擅長照顧傷患並整理有限的醫療物資。她在校園危機中學會處理戰鬥傷勢，成為小隊逃亡途中不可或缺的支援者。'},
 ruoxue:{name:'沈若雪',rarity:'SSR',role:'醫學系・三年級',detail:'感染災變爆發後，她冷靜分析感染者的行動規律，逐步掌握變異體的弱點。她相信只要保持理智，就能在絕境中找到生路。'},
 xingyao:{name:'許星瑤',rarity:'SR',role:'體育系・二年級',detail:'反應敏捷、行動果斷，擅長利用速度穿越被感染者封鎖的走廊。無論救援倖存者或突襲敵人弱點，她總能在危險時刻找到行動機會。'},
 keqing:{name:'江可晴',rarity:'R',role:'園藝系・二年級',detail:'溫柔可靠，總把同伴的安全放在第一位。感染危機爆發後，她努力守住撤離路線、保護受傷的倖存者，即使面對龐大的變異感染體也不輕易退縮。'},
 zihan:{name:'顧紫涵',rarity:'SSR',role:'資訊工程系・四年級',detail:'擅長觀察敵人的行動，並利用環境、光影與聲音製造錯覺。在感染者遍布的校園裡，她總能找到敵人視線的死角，帶領小隊避開致命包圍。'},
 anzai_coach:{name:'安西教練',rarity:'SSR',role:'校園健康中心・治療型',detail:'負責校園健康中心的緊急救護工作，擅長穩定隊員狀態並提供高效治療。面對感染危機時，她以專業與沉著守護每一位仍在戰鬥的隊員。'},
 konan_koyoi:{name:'小宵虎南',rarity:'SSR',role:'高速攻擊型',detail:'小宵虎南發現手機電量只剩下 1%，充電器卻不知道被誰拿走。眼看手機即將關機，她決定不再浪費時間，把所有焦慮轉化成攻擊力，對敵人發動集中突襲，務求在手機關機前結束戰鬥！'}
};

const starterCharacters=['yuching'];
// Character art is managed centrally here. Add each image at its listed path when ready.
const roster=[
 {id:'yuching',name:'三上悠亞',rarity:'SR',icon:'🎓',role:'均衡型冒險者',image:'images/characters/lin-yuqing-sr.png'},
 {id:'yutong',name:'蘇語彤',rarity:'R',icon:'🌷',role:'友善支援',image:'images/characters/su-yutong.png.png'},
 {id:'ruoxue',name:'沈若雪',rarity:'SSR',icon:'❄️',role:'冰霜系策略型',image:'images/characters/shen-ruoxue.png'},
 {id:'xingyao',name:'許星瑤',rarity:'SR',icon:'🌟',role:'敏捷型',image:'images/characters/xu-xingyao.png'},
 {id:'keqing',name:'江可晴',rarity:'R',icon:'🍀',role:'守護型',image:'images/characters/jiang-keqing.png'},
 {id:'zihan',name:'顧紫涵',rarity:'SSR',icon:'🌙',role:'幻術系',image:'images/characters/gu-zihan.png'},
 {id:'anzai_coach',name:'安西教練',rarity:'SSR',icon:'💜',role:'治療型',image:'images/characters/anzai_coach_ssr.png'},
 {id:'konan_koyoi',name:'小宵虎南',rarity:'SSR',icon:'🔋',role:'高速攻擊型',image:'images/characters/konan_koyoi.png'}
];
// 新手免費十連使用獨立固定名單；不包含小宵虎南，未來新增角色亦不自動加入。
const newbieSummonCharacterIds=['yuching','yutong','ruoxue','xingyao','keqing','zihan'];
const modal=$('featureModal'),modalTitle=$('modalTitle'),modalBody=$('modalBody');
// The shared game modal must live outside #lobby because the standalone summon/archive pages hide that ancestor.
if(modal&&modal.parentElement!==document.body)document.body.appendChild(modal);
function readCollection(){try{const v=JSON.parse(localStorage.getItem('campusCardCollection')||'null');if(v&&Array.isArray(v.owned)){const owned=[...new Set(v.owned.filter(id=>roster.some(c=>c.id===id)))];let formation=Array.isArray(v.formation)?[...new Set(v.formation.filter(id=>owned.includes(id)))].slice(0,3):[];if(!formation.length&&owned.includes('yuching'))formation=['yuching'];const formationPresets=Array.isArray(v.formationPresets)?v.formationPresets.filter(p=>p&&typeof p==='object'&&typeof p.id==='string'&&typeof p.name==='string').map(p=>({...p,formation:Array.isArray(p.formation)?[...new Set(p.formation.filter(id=>owned.includes(id)))].slice(0,3):[]})):[];return {...v,owned,formation,formationPresets,levels:v.levels&&typeof v.levels==='object'?v.levels:{},quests:v.quests&&typeof v.quests==='object'?v.quests:{},newbieTenClaimed:v.newbieTenClaimed===true}}}catch(e){}return {owned:starterCharacters.slice(),formation:starterCharacters.slice(),formationPresets:[],levels:{},quests:{},newbieTenClaimed:false}}
const growthByRarity={R:{atk:1.2,skill:1.5,hp:5},SR:{atk:1.8,skill:2.2,hp:7},SSR:{atk:2.5,skill:3.2,hp:9}};
const cardStats={yuching:{atk:20,skill:36,hp:105,heal:0},yutong:{atk:13,skill:22,hp:95,heal:35},ruoxue:{atk:18,skill:52,hp:90,heal:0},xingyao:{atk:25,skill:34,hp:88,heal:0},keqing:{atk:15,skill:26,hp:125,heal:0},zihan:{atk:17,skill:58,hp:85,heal:0},anzai_coach:{atk:14,skill:30,hp:100,heal:60},konan_koyoi:{atk:18,skill:37,hp:74,heal:0}};
function rarityMultiplier(ch){return ch.rarity==='SSR'?1.35:ch.rarity==='SR'?1.12:0.88}
function levelCap(ch){return ch.rarity==='SSR'?50:ch.rarity==='SR'?40:25}
function getLevel(ch){const c=readCollection();return Math.max(1,Math.min(levelCap(ch),Number(c.levels&&c.levels[ch.id])||1))}
function getCardStats(ch){const b=cardStats[ch.id]||cardStats.yuching,m=rarityMultiplier(ch),lv=getLevel(ch),g=growthByRarity[ch.rarity]||growthByRarity.R;return {atk:Math.round(b.atk*m+(lv-1)*g.atk),skill:Math.round(b.skill*m+(lv-1)*g.skill),hp:Math.round(b.hp*m+(lv-1)*g.hp),heal:Math.round((b.heal||0)*m+(lv-1)*(ch.rarity==='SSR'?1:0.5))}}
function maxHp(ch){return getCardStats(ch).hp}

function writeCollection(c){try{localStorage.setItem('campusCardCollection',JSON.stringify(c))}catch(e){}}
// 測試版一次性移除既有小宵虎南持有紀錄；之後仍可透過一般召喚重新取得。
try{if(localStorage.getItem('campusTestKonanOwnershipReset')!=='1'){const c=readCollection();c.owned=c.owned.filter(id=>id!=='konan_koyoi');c.formation=(c.formation||[]).filter(id=>id!=='konan_koyoi');c.formationPresets=(c.formationPresets||[]).map(p=>({...p,formation:(p.formation||[]).filter(id=>id!=='konan_koyoi')}));writeCollection(c);localStorage.setItem('campusTestKonanOwnershipReset','1')}}catch(e){}
const TEST_UNLIMITED_COINS=Number.MAX_SAFE_INTEGER;
function readGameSave(){try{return {...{stage:1,coins:TEST_UNLIMITED_COINS,cleared:0},...JSON.parse(localStorage.getItem('campusCardMiniSave')||'{}'),coins:TEST_UNLIMITED_COINS}}catch(e){return {stage:1,coins:TEST_UNLIMITED_COINS,cleared:0}}}
function showModal(title,html){const wasOpen=!modal.hidden;const previousScrollTop=modalBody.scrollTop;modalTitle.textContent=title;modalBody.innerHTML=html;modal.hidden=false;document.body.style.overflow='hidden';$('modalClose').focus({preventScroll:true});if(wasOpen){requestAnimationFrame(()=>{modalBody.scrollTop=previousScrollTop})}}
function closeModal(){modal.hidden=true;modal.classList.remove('archive-fullscreen');document.body.style.overflow='';}
$('modalClose').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{const healOption=e.target.closest('.healing-target-option');if(healOption){const radio=healOption.querySelector('input[name="healingTarget"]');if(!radio)return;const wasSelected=radio.checked;radio.checked=true;if(wasSelected&&healOption.dataset.selectedOnce==='true'){performCharacterHeal(radio.value);return;}modalBody.querySelectorAll('.healing-target-option').forEach(el=>{el.dataset.selectedOnce='false';el.classList.remove('selected')});healOption.dataset.selectedOnce='true';healOption.classList.add('selected');return}if(e.target.closest('[data-healing-cancel]')){closeModal();return}const rosterArrow=e.target.closest('[data-formation-scroll]');if(rosterArrow){const track=modalBody.querySelector('.formation-roster');if(track)track.scrollBy({left:Number(rosterArrow.dataset.formationScroll)*Math.max(180,track.clientWidth*.75),behavior:'smooth'});return}if(e.target.closest('[data-formation-down]')){const down=e.target.closest('[data-formation-down]'),c=readCollection(),team=(c.formation||[]).slice(0,3),slotIndex=team.indexOf(down.dataset.formationDown);if(slotIndex<0)return;team[slotIndex]=null;while(team.length&&!team[team.length-1])team.pop();c.formation=team;writeCollection(c);formationCandidateId=null;formationSelectedSlot=slotIndex;openFormation();return}const slot=e.target.closest('[data-formation-slot]');if(slot){formationSelectedSlot=Number(slot.dataset.formationSlot)||0;formationCandidateId=null;openFormation();return}const filter=e.target.closest('[data-formation-filter]');if(filter){formationRarityFilter=filter.dataset.formationFilter||'ALL';openFormation();return}const candidate=e.target.closest('[data-formation-candidate]');if(candidate){formationCandidateId=candidate.dataset.formationCandidate;openFormation();return}if(e.target.closest('[data-formation-confirm]')){const c=readCollection(),id=formationCandidateId;if(!id||!c.owned.includes(id))return;let team=(c.formation||[]).filter(x=>c.owned.includes(x));if(team.includes(id)&&team.indexOf(id)!==formationSelectedSlot){alert('此角色已在其他位置，不能重複編入。');return}if(formationSelectedSlot>2)return;team[formationSelectedSlot]=id;while(team.length&&!team[team.length-1])team.pop();c.formation=team.slice(0,3);writeCollection(c);formationCandidateId=null;openFormation();return}const savePreset=e.target.closest('[data-preset-save]');if(savePreset){const c=readCollection(),p=(c.formationPresets||[]).find(x=>x.id===savePreset.dataset.presetSave);if(p){p.formation=(c.formation||[]).slice(0,3);writeCollection(c);openFormation()}return}const loadPreset=e.target.closest('[data-preset-load]');if(loadPreset){const c=readCollection(),p=(c.formationPresets||[]).find(x=>x.id===loadPreset.dataset.presetLoad);if(p&&p.formation&&p.formation.length){c.formation=[...new Set(p.formation.filter(id=>c.owned.includes(id)))].slice(0,3);writeCollection(c);formationSelectedSlot=0;openFormation()}return}const addPreset=e.target.closest('[data-preset-add]');if(addPreset){const name=prompt('請輸入新隊伍名稱：');if(name&&name.trim()){const c=readCollection();c.formationPresets.push({id:'custom-'+Date.now(),name:name.trim().slice(0,24),formation:[]});writeCollection(c);openFormation()}return}const renamePreset=e.target.closest('[data-preset-rename]');if(renamePreset){const c=readCollection(),p=c.formationPresets.find(x=>x.id===renamePreset.dataset.presetRename);if(p){const name=prompt('請輸入新的隊伍名稱：',p.name);if(name&&name.trim()){p.name=name.trim().slice(0,24);writeCollection(c);openFormation()}}return}const deletePreset=e.target.closest('[data-preset-delete]');if(deletePreset){const c=readCollection();c.formationPresets=c.formationPresets.filter(x=>x.id!==deletePreset.dataset.presetDelete);writeCollection(c);openFormation();return}const claim=e.target.closest('[data-claim]');if(claim){e.preventDefault();claimQuest(claim.dataset.claim);return}const invFilter=e.target.closest('[data-inventory-filter]');if(invFilter){inventoryFilter=invFilter.dataset.inventoryFilter;openInventory();return}const up=e.target.closest('[data-level-up]');if(up){e.preventDefault();const id=up.dataset.levelUp,scrollContainer=modalBody,previousScrollTop=scrollContainer.scrollTop,previousWindowY=window.scrollY,c=readCollection(),ch=roster.find(x=>x.id===id);if(!ch)return;const lv=getLevel(ch),cost=lv*20+(ch.rarity==='SSR'?80:ch.rarity==='SR'?40:0),g=readGameSave();if(lv>=levelCap(ch)||Number(g.coins)<cost)return;g.coins=Math.max(0,Number(g.coins)||0)-cost;try{const persisted={...readGameSave(),coins:g.coins};localStorage.setItem('campusCardMiniSave',JSON.stringify(persisted));if(typeof state!=='undefined'&&state){state.coins=g.coins;save()}}catch(err){console.error('金幣存檔失敗',err)}c.levels=c.levels||{};c.levels[id]=lv+1;writeCollection(c);if(typeof state!=='undefined'&&state&&state.activeMember===id&&state.partyHp)state.partyHp[id]=Math.min(getCardStats(ch).hp,(state.partyHp[id]??getCardStats(ch).hp)+growthByRarity[ch.rarity].hp);openInventory();refreshLobby();requestAnimationFrame(()=>{scrollContainer.scrollTop=previousScrollTop;window.scrollTo({top:previousWindowY,behavior:'instant'});requestAnimationFrame(()=>{scrollContainer.scrollTop=previousScrollTop;window.scrollTo({top:previousWindowY,behavior:'instant'})})});return;}if(e.target===modal)closeModal()});
modal.addEventListener('change',e=>{if(e.target.matches('#inventorySort')){inventorySort=e.target.value;openInventory()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()});
function openArchive(){
 const col=readCollection();
 let html='<div class="archive-page-top"><div><p class="eyebrow">CAMPUS CHARACTER ARCHIVE</p><h2>📚 學園角色名冊</h2><p class="muted">已收藏 <strong>'+col.owned.length+' / '+roster.length+'</strong> 位角色。搜尋角色、依稀有度篩選，點選卡片查看屬性與技能。</p></div><button class="btn secondary" id="archiveBackBtn" type="button">← 返回遊戲大廳</button></div>';
 html+='<section class="roster-tools" aria-label="角色名冊搜尋與篩選"><label class="roster-search">🔎 <input id="rosterSearch" type="search" placeholder="搜尋角色名稱、定位或技能…" autocomplete="off"></label><div class="roster-filters" role="group" aria-label="稀有度篩選"><button type="button" class="roster-filter active" data-rarity-filter="ALL">全部 <span>'+roster.length+'</span></button><button type="button" class="roster-filter" data-rarity-filter="SSR">SSR <span>'+roster.filter(x=>x.rarity==="SSR").length+'</span></button><button type="button" class="roster-filter" data-rarity-filter="SR">SR <span>'+roster.filter(x=>x.rarity==="SR").length+'</span></button><button type="button" class="roster-filter" data-rarity-filter="R">R <span>'+roster.filter(x=>x.rarity==="R").length+'</span></button><button type="button" class="roster-filter" data-rarity-filter="OWNED">✓ 已收藏</button></div><div class="roster-sort-wrap"><label for="rosterSort">排序方式</label><select id="rosterSort"><option value="rarity">稀有度優先</option><option value="name">角色名稱</option><option value="atk">攻擊力</option><option value="hp">生命值</option><option value="level">角色等級</option></select><span id="rosterResultCount" class="muted"></span></div></section><div id="rosterGrid" class="character-grid"></div><p id="rosterEmpty" class="panel muted" hidden>找不到符合條件的角色，請調整搜尋或篩選條件。</p><div id="rosterDetailHost"></div>';
 let page=$("archivePage");if(!page){page=document.createElement("main");page.id="archivePage";page.className="lobby-shell";page.style.display="none";$("lobby").parentNode.insertBefore(page,$("lobby").nextSibling)}
 page.innerHTML=html;page.style.display="grid";lobby.style.display="none";gameApp.style.display="none";const summon=$('summonPage');if(summon)summon.style.display='none';modal.hidden=true;document.body.style.overflow="";try{window.history.replaceState({screen:"archive"},"","#archive")}catch(e){}window.scrollTo(0,0);
 let artLightbox=document.getElementById("rosterArtLightbox");
 if(!artLightbox){artLightbox=document.createElement("div");artLightbox.id="rosterArtLightbox";artLightbox.className="roster-art-lightbox";artLightbox.hidden=true;artLightbox.setAttribute("role","dialog");artLightbox.setAttribute("aria-modal","true");artLightbox.setAttribute("aria-label","角色圖片放大檢視");artLightbox.innerHTML='<button type="button" class="roster-art-lightbox-close" aria-label="關閉圖片">×</button><img alt="角色原圖放大檢視">';document.body.appendChild(artLightbox)}
 const closeArtLightbox=()=>{artLightbox.hidden=true;artLightbox.querySelector("img").removeAttribute("src");document.body.style.overflow="";};
 artLightbox.querySelector(".roster-art-lightbox-close").onclick=closeArtLightbox;
 artLightbox.onclick=e=>{if(e.target===artLightbox)closeArtLightbox()};
 if(!artLightbox.dataset.keysBound){document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!artLightbox.hidden)closeArtLightbox()});artLightbox.dataset.keysBound="1"}
 page.onclick=e=>{const img=e.target.closest(".roster-card-art img,.roster-detail-art img");if(!img||!page.contains(img)||!img.getAttribute("src"))return;e.preventDefault();e.stopPropagation();const large=artLightbox.querySelector("img");large.src=img.currentSrc||img.src;large.alt="";artLightbox.hidden=false;document.body.style.overflow="hidden";};

 $("archiveBackBtn").onclick=()=>{window.history.replaceState({screen:"lobby"},"","#lobby");showLobby()};
 let activeRarity="ALL";const search=$("rosterSearch"),sort=$("rosterSort"),grid=$("rosterGrid");
 const rarityOrder={SSR:3,SR:2,R:1};
 function drawRoster(){
  const q=search.value.trim().toLocaleLowerCase();let list=roster.filter(ch=>{const p=characterProfiles[ch.id]||{},owned=col.owned.includes(ch.id);const text=[ch.name,ch.role,p.role,p.detail,ch.rarity].join(" ").toLocaleLowerCase();return (!q||text.includes(q))&&(activeRarity==="ALL"||activeRarity==="OWNED"&&owned||ch.rarity===activeRarity)});
  list.sort((a,b)=>{if(sort.value==="name")return a.name.localeCompare(b.name,"zh-Hant");if(sort.value==="atk")return getCardStats(b).atk-getCardStats(a).atk;if(sort.value==="hp")return getCardStats(b).hp-getCardStats(a).hp;if(sort.value==="level")return getLevel(b)-getLevel(a);return rarityOrder[b.rarity]-rarityOrder[a.rarity]||a.name.localeCompare(b.name,"zh-Hant")});
  grid.innerHTML=list.map(ch=>{const owned=col.owned.includes(ch.id),p=characterProfiles[ch.id]||{},st=getCardStats(ch),lv=getLevel(ch);return '<article class="character-card '+ch.rarity.toLowerCase()+'"><div class="character-art">'+(ch.image?'<img src="'+ch.image+'" alt="'+ch.name+'立繪" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'inv-icon\',textContent:\''+ch.icon+'\'}))">':'<span class="roster-placeholder">'+ch.icon+'</span>')+'</div><h3>'+ch.name+'</h3><p class="character-desc">'+(p.detail||ch.role)+'</p><div class="roster-mini-stats"><span>⚔️ '+st.atk+'</span><span>💚 '+st.hp+'</span><span>✨ '+st.skill+'</span><span><b style="color:#ef626b;font-weight:900">✚</b> '+st.heal+'</span></div><div class="character-tags"><span>'+ch.rarity+'</span><span>'+(owned?'✓ 已收藏':'未收藏')+'</span></div><button type="button" data-archive-character="'+ch.id+'">查看屬性與技能 →</button></article>'}).join("");
  $("rosterResultCount").textContent='顯示 '+list.length+' / '+roster.length+' 位';$("rosterEmpty").hidden=list.length>0;
  grid.querySelectorAll("[data-archive-character]").forEach(btn=>btn.addEventListener("click",()=>showRosterDetail(btn.dataset.archiveCharacter)));
 }
 function showRosterDetail(id){
  const ch=roster.find(x=>x.id===id);if(!ch)return;const p=characterProfiles[id]||{},st=getCardStats(ch),lv=getLevel(ch),owned=col.owned.includes(id);
  const skillNames={yuching:"超商微波便當！",yutong:"先喝水再說！",ruoxue:"冷氣開到 16 度！",xingyao:"外送倒數三分鐘！",keqing:"主管說再撐一下！",zihan:"已讀不回大法！",konan_koyoi:"手機剩 1%！"};
  const skillDesc={yuching:"三上悠亞拿出剛微波好的便當，香氣吸引附近感染者。她趁敵人爭搶便當的混亂時刻發動猛烈攻擊，成功突破包圍。",yutong:"蘇語彤指定一名存活且生命值未滿的出戰隊員進行治療，治療量等於她目前等級的治療能力；消耗 35 點能量，不占用本回合行動，也不觸發敵方反擊。",ruoxue:"沈若雪一本正經地把冷氣調到 16 度！感染者彷彿感受到月底電費帳單的恐懼，她趁亂發動強力攻勢。",xingyao:"許星瑤進入外送倒數模式，以驚人的速度穿越感染者群。為了不讓餐點超時，她爆發出連自己都無法理解的潛能，迅速發動攻擊。",keqing:"江可晴架起防禦姿勢，大喊「主管說再撐一下！」全隊被社畜精神震懾，趁感染者遲疑時反擊，並減少下一次受到的傷害。",zihan:"顧紫涵對感染者發送訊息後立刻已讀不回。敵人陷入無盡等待與混亂，她趁對方失去攻擊節奏時發動猛烈攻勢。",konan_koyoi:"對敵方單體造成目前技能威力 1.5 倍的傷害；消耗 35 點能量並占用本回合行動，敵方會正常反擊。"};
  const host=$("rosterDetailHost");host.innerHTML='<section class="panel archive-detail roster-detail"><div class="section-heading"><div><p class="eyebrow">CHARACTER PROFILE</p><h2>'+ch.name+' · '+ch.rarity+'</h2></div><button type="button" class="nav-btn" id="closeRosterDetail">收起詳情</button></div><div class="roster-detail-layout"><div class="roster-detail-art">'+(ch.image?'<img src="'+ch.image+'" alt="'+ch.name+'" onerror="this.style.display=\'none\'">':'<span>'+ch.icon+'</span>')+'<span class="rarity">'+ch.rarity+'</span></div><div class="roster-detail-info"><p>'+(p.detail||ch.role)+'</p><div class="roster-stat-grid"><div><small>角色等級</small><strong>Lv.'+lv+' / '+levelCap(ch)+'</strong></div><div><small>攻擊力</small><strong>⚔️ '+st.atk+'</strong></div><div><small>生命值</small><strong>💚 '+st.hp+'</strong></div><div><small>技能威力</small><strong>✨ '+st.skill+'</strong></div><div><small>治療力</small><strong><b style="color:#ef626b;font-weight:900">✚</b> '+st.heal+'</strong></div></div><h3>專屬技能｜'+(skillNames[id]||"專屬技能")+'</h3><p>'+ (skillDesc[id]||"使用星輝能量施展專屬技能。")+'</p><div class="character-tags"><span>'+ch.rarity+'</span><span>'+(owned?'✓ 已加入收藏':'尚未收藏')+'</span><span>'+ (owned?'可於角色背包培養':'可透過卡牌召喚取得')+'</span></div></div></div></section>';
  $("closeRosterDetail").onclick=()=>{host.innerHTML=""};host.scrollIntoView({behavior:"smooth",block:"start"});
 }
 search.addEventListener("input",drawRoster);sort.addEventListener("change",drawRoster);
 page.querySelectorAll("[data-rarity-filter]").forEach(btn=>btn.addEventListener("click",()=>{activeRarity=btn.dataset.rarityFilter;page.querySelectorAll("[data-rarity-filter]").forEach(b=>b.classList.toggle("active",b===btn));drawRoster()}));
 drawRoster();
}let formationSelectedSlot=0,formationCandidateId=null,formationRarityFilter='ALL';
function ensureFormationPresets(c){if(!Array.isArray(c.formationPresets)||!c.formationPresets.length){c.formationPresets=[{id:'mainline',name:'主線隊伍',formation:(c.formation||[]).slice()},{id:'challenge',name:'挑戰隊伍',formation:[]},{id:'boss',name:'BOSS 隊伍',formation:[]}];writeCollection(c)}return c.formationPresets}
function formationTeamStats(team){return team.reduce((sum,id)=>{const ch=roster.find(x=>x.id===id);if(ch){const st=getCardStats(ch);sum.hp+=st.hp;sum.atk+=st.atk;sum.skill+=st.skill;sum.heal+=st.heal}return sum},{hp:0,atk:0,skill:0,heal:0})}
function openFormation(){const c=readCollection(),team=(c.formation||[]).slice(0,3),presets=ensureFormationPresets(c);if(formationSelectedSlot>2)formationSelectedSlot=0;const selected=roster.find(ch=>ch.id===formationCandidateId&&c.owned.includes(ch.id)),current=roster.find(ch=>ch.id===team[formationSelectedSlot]),a=current?getCardStats(current):null,b=selected?getCardStats(selected):null,stats=formationTeamStats(team);let html='<div class="formation-center"><section class="formation-team-panel"><div class="formation-section-head"><h3>目前出戰隊伍</h3><b>'+team.filter(Boolean).length+' / 3 人</b></div><div class="formation-slots">';for(let i=0;i<3;i++){const ch=roster.find(x=>x.id===team[i]);html+='<div class="formation-slot '+(formationSelectedSlot===i?'active':'')+'" data-formation-slot="'+i+'" role="button" tabindex="0"><span class="slot-label">位置 '+(i+1)+'</span>'+(ch?'<div class="formation-picked"><img src="'+ch.image+'" alt=""><strong>'+ch.name+'</strong><small>'+ch.rarity+' · Lv.'+getLevel(ch)+'</small><small>HP '+getCardStats(ch).hp+' · 攻擊 '+getCardStats(ch).atk+'</small><button type="button" class="btn secondary" data-formation-down="'+ch.id+'">下陣</button></div>':'<div class="slot-empty">＋ 尚未編入</div>')+'</div>'}html+='</div><div class="formation-power-grid"><div><small>隊伍總 HP</small><strong>'+stats.hp+'</strong></div><div><small>攻擊力總和</small><strong>'+stats.atk+'</strong></div><div><small>技能威力總和</small><strong>'+stats.skill+'</strong></div><div><small>治療能力總和</small><strong>'+stats.heal+'</strong></div></div><p class="muted">統計僅供編成比較，不改變既有戰鬥公式。</p></section><section class="formation-detail-panel"><h3>角色能力比較</h3><p class="muted">選擇隊伍位置及候選角色，確認後立即保存。</p><div class="formation-compare"><div><small>目前角色</small><strong>'+(current?current.name:'空位')+'</strong></div><div><small>候選角色</small><strong>'+(selected?selected.name:'尚未選擇')+'</strong></div></div><div class="formation-compare-stats"><div class="formation-stat-head"><span>能力</span><span>目前</span><span>候選</span><span>差異</span></div>';[['HP','hp'],['攻擊力','atk'],['技能威力','skill'],['治療能力','heal']].forEach(([label,key])=>{const x=a?a[key]:0,y=b?b[key]:0,d=b?y-x:0;html+='<div class="formation-stat-row"><span>'+label+'</span><strong>'+(current?x:'—')+'</strong><strong>'+(selected?y:'—')+'</strong><b class="'+(d>0?'positive':d<0?'negative':'')+'">'+(selected?(d>0?'+':'')+d:'—')+'</b></div>'});html+='</div><button type="button" class="btn primary formation-confirm" data-formation-confirm '+(!selected?'disabled':'')+'>確認替換並立即保存</button><p class="muted">目前角色資料沒有獨立防禦力欄位，因此不虛構防禦數值。</p></section></div><section class="formation-roster-panel"><div class="formation-section-head"><span>'+c.owned.length+' 位已收藏</span></div><div class="formation-rarity-filters"><button type="button" data-formation-filter="ALL" class="'+(formationRarityFilter==='ALL'?'active':'')+'">全部</button><button type="button" data-formation-filter="SSR" class="'+(formationRarityFilter==='SSR'?'active':'')+'">SSR</button><button type="button" data-formation-filter="SR" class="'+(formationRarityFilter==='SR'?'active':'')+'">SR</button><button type="button" data-formation-filter="R" class="'+(formationRarityFilter==='R'?'active':'')+'">R</button></div><div class="formation-roster-wrap"><button type="button" class="formation-roster-arrow" data-formation-scroll="-1" aria-label="向左瀏覽角色" hidden>‹</button><div class="formation-roster">';const visible=roster.filter(ch=>c.owned.includes(ch.id)&&(formationRarityFilter==='ALL'||ch.rarity===formationRarityFilter));visible.forEach(ch=>{const st=getCardStats(ch);html+='<button type="button" class="formation-choice formation-image-only '+(team.includes(ch.id)?'selected ':'')+(formationCandidateId===ch.id?'candidate':'')+'" data-formation-candidate="'+ch.id+'" aria-label="選擇角色：'+ch.name+'，'+ch.rarity+'，'+(team.includes(ch.id)?'目前出戰中':formationCandidateId===ch.id?'已選擇':'未編入')+'"><img src="'+ch.image+'" alt="'+ch.name+'" loading="lazy"><span><strong>'+ch.name+'</strong><small>'+ch.rarity+' · Lv.'+getLevel(ch)+' · '+ch.role+'</small><small>HP '+st.hp+' · 攻擊 '+st.atk+' · 技能 '+st.skill+'</small></span><b>'+(team.includes(ch.id)?'✓ 出戰中':formationCandidateId===ch.id?'已選擇':'選擇角色')+'</b></button>'});if(!visible.length)html+='<p class="muted">此稀有度目前沒有已收藏角色。</p>';html+='</div><button type="button" class="formation-roster-arrow" data-formation-scroll="1" aria-label="向右瀏覽角色" hidden>›</button></div></section><section class="formation-presets-panel"><div class="formation-section-head"><h3>隊伍預設方案</h3><button type="button" class="btn secondary" data-preset-add>＋ 新增隊伍</button></div><div class="formation-presets-grid">';presets.forEach(p=>{const saved=p.formation&&p.formation.length;html+='<article class="formation-preset"><strong>'+String(p.name).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]))+'</strong><small>'+(saved?p.formation.map(id=>roster.find(ch=>ch.id===id)?.name).filter(Boolean).join('、'):'尚未保存隊伍')+'</small><div><button type="button" class="btn primary" data-preset-save="'+p.id+'">保存目前隊伍</button><button type="button" class="btn secondary" data-preset-load="'+p.id+'" '+(!saved?'disabled':'')+'>載入</button><button type="button" class="btn secondary" data-preset-rename="'+p.id+'">改名</button><button type="button" class="btn secondary" data-preset-delete="'+p.id+'">刪除</button></div></article>'});html+='</div></section><div class="modal-actions"><button type="button" class="btn secondary" data-modal-action="inventory">🎒 角色背包</button><button type="button" class="btn primary" data-modal-action="formation-done">完成編成</button></div>';showModal('🛡️ 角色編成中心',html);requestAnimationFrame(()=>{const wrap=modalBody.querySelector('.formation-roster-wrap'),track=modalBody.querySelector('.formation-roster');if(!wrap||!track)return;const overflow=track.scrollWidth>track.clientWidth+2;wrap.querySelectorAll('[data-formation-scroll]').forEach(btn=>btn.hidden=!overflow)})}
function changeFormation(id,remove=false){const c=readCollection();let team=(c.formation||[]).filter(x=>c.owned.includes(x));if(remove)team=team.filter(x=>x!==id);else if(c.owned.includes(id)&&!team.includes(id)&&team.length<3)team.push(id);if(!team.length&&c.owned.includes('yuching'))team=['yuching'];c.formation=team.slice(0,3);writeCollection(c);openFormation()}

let inventoryFilter='all',inventorySort='rarity';
function openInventory(){
const c=readCollection(),coins=Math.max(0,Number(readGameSave().coins)||0),owned=roster.filter(ch=>c.owned.includes(ch.id));
const rarityRank={SSR:0,SR:1,R:2};
let list=owned.filter(ch=>inventoryFilter==='all'||ch.rarity===inventoryFilter||inventoryFilter==='upgrade'&&(getLevel(ch)<50&&coins>=(getLevel(ch)*20+(ch.rarity==='SSR'?80:ch.rarity==='SR'?40:0))));
list.sort((a,b)=>{
const la=getLevel(a),lb=getLevel(b),ca=la*20+(a.rarity==='SSR'?80:a.rarity==='SR'?40:0),cb=lb*20+(b.rarity==='SSR'?80:b.rarity==='SR'?40:0);
if(inventorySort==='level')return lb-la||rarityRank[a.rarity]-rarityRank[b.rarity]||a.name.localeCompare(b.name,'zh-Hant');
if(inventorySort==='cost')return ca-cb||rarityRank[a.rarity]-rarityRank[b.rarity];
return rarityRank[a.rarity]-rarityRank[b.rarity]||lb-la||a.name.localeCompare(b.name,'zh-Hant');
});
let html='<p>消耗金幣提升卡牌等級。R 卡上限 Lv.25、SR 卡上限 Lv.40、SSR 卡上限 Lv.50。升級後會自動保存。</p><div class="inventory-balance">🪙 <span>目前可用金幣</span><strong>'+coins.toLocaleString('zh-TW')+'</strong></div><div class="inventory-toolbar"><div class="inventory-filters">'+[['all','全部'],['SSR','SSR'],['SR','SR'],['R','R'],['upgrade','可升級']].map(([v,label])=>'<button type="button" class="inventory-filter '+(inventoryFilter===v?'active':'')+'" aria-pressed="'+(inventoryFilter===v?'true':'false')+'" data-inventory-filter="'+v+'">'+label+'</button>').join('')+'</div><label class="inventory-sort">排序方式<select id="inventorySort"><option value="rarity" '+(inventorySort==='rarity'?'selected':'')+'>稀有度優先</option><option value="level" '+(inventorySort==='level'?'selected':'')+'>等級由高至低</option><option value="cost" '+(inventorySort==='cost'?'selected':'')+'>升級費用由低至高</option></select></label></div><div class="inventory-count">顯示 '+list.length+' / '+owned.length+' 位角色</div><div class="inventory-list">';
list.forEach(ch=>{const lv=getLevel(ch),st=getCardStats(ch),cap=levelCap(ch),cost=lv*20+(ch.rarity==='SSR'?80:ch.rarity==='SR'?40:0),canUpgrade=lv<cap&&coins>=cost;html+='<div class="inventory-item"><img src="'+(ch.image||'')+'" alt="'+ch.name+'" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'inv-icon\',textContent:\''+ch.icon+'\'}))" style="width:64px;height:82px;object-fit:cover;object-position:center 20%;border-radius:10px;border:1px solid #9b80d2"><div class="inv-meta"><strong>'+ch.name+' <span class="inventory-rarity">'+ch.rarity+'</span> · Lv.'+lv+'</strong><small>⚔️ 攻擊 '+st.atk+'　✨ 技能 '+st.skill+'</small><small>❤️ 生命 '+st.hp+'</small><small>升級費用：'+(lv>=cap?'已達等級上限':cost+' 金幣')+'</small></div><button class="btn secondary" type="button" data-level-up="'+ch.id+'" '+(!canUpgrade?'disabled':'')+'>'+(lv>=cap?'已達上限':coins<cost?'金幣不足，無法升級':'升級')+'</button></div>'});
if(!list.length)html+='<div class="inventory-empty">'+(inventoryFilter==='upgrade'?'目前沒有金幣足夠且尚未滿級的角色。':'這個分類目前沒有角色。')+'</div>';
html+='</div><div class="modal-actions"><button class="btn primary" type="button" data-modal-action="summon">✨ 前往召喚</button></div>';showModal('🎒 角色背包與培養',html)
}
function openSummon(){
 const saveData=readGameSave(),col=readCollection(),cost=100,tenCost=1000;
 const html='<div class="archive-page-top"><div><p class="eyebrow">CAMPUS SUMMONING HALL</p><h2>✨ 卡牌召喚</h2><p class="muted">召集夥伴、擴充收藏，為校園冒險做好準備。</p></div><button class="btn secondary" id="summonBackBtn" type="button">← 返回遊戲大廳</button></div>'+
 '<section class="featured-section summon-featured" aria-labelledby="summonFeaturedTitle"><div class="section-heading"><div><p class="eyebrow">CAMPUS SPOTLIGHT</p><h3 id="summonFeaturedTitle">🌟 本期焦點角色</h3></div><span class="muted">點擊角色查看詳細資料</span></div><div class="featured-grid"><article class="featured-card featured-ssr featured-spotlight-hero" role="button" tabindex="0" data-featured-character="konan_koyoi" aria-label="查看小宵虎南詳細資料"><img class="featured-spotlight-art" src="images/characters/konan_koyoi.png" alt="小宵虎南角色立繪" loading="eager"><div class="featured-info"><span class="featured-tag">SSR · 高速攻擊型</span><h3>小宵虎南</h3><p>手機電量只剩下 1%！將焦慮轉化為攻擊力，在手機關機前結束戰鬥！</p></div></article></div></section>'+
 '<section class="panel summon-page-panel"><div class="summon-page-balance"><span>目前金幣</span><strong>🪙 '+Math.max(0,Number(saveData.coins)||0).toLocaleString('zh-TW')+'</strong></div><div class="summon-banner"><div class="sigil">✦ ✧ ✦</div><strong>校園女神錄召喚陣</strong><span class="muted">召喚你的下一位冒險夥伴</span></div><p>單抽消耗 100 金幣；十連召喚消耗 1000 金幣。新手首次十連抽可免費領取一次，限本機存檔一次性使用。</p><p>每次抽取機率：R 50%、SR 35%、SSR 15%。重複角色轉換為 5 枚金幣。十連召喚至少獲得 1 位 SR 或 SSR（若角色池可用）。</p><div class="modal-actions summon-page-actions">'+(!col.newbieTenClaimed?'<button class="btn primary" type="button" data-modal-action="do-newbie-ten-summon">🎁 新手免費十連（一次性）</button>':'<button class="btn secondary" type="button" disabled>✓ 新手免費十連已領取</button>')+'<button class="btn primary" type="button" data-modal-action="do-summon" '+((Number(saveData.coins)||0)<cost?'disabled':'')+'>✨ 單抽召喚（100 金幣）</button><button class="btn primary" type="button" data-modal-action="do-ten-summon" '+((Number(saveData.coins)||0)<tenCost?'disabled':'')+'>🌟 十連召喚（1000 金幣）</button><button class="btn secondary" type="button" data-modal-action="inventory">🎒 查看背包</button></div><div id="summonResult" aria-live="polite"></div></section>';
 let page=$("summonPage");if(!page){page=document.createElement("main");page.id="summonPage";page.className="lobby-shell";$("lobby").parentNode.insertBefore(page,$("lobby").nextSibling)}
 page.innerHTML=html;page.style.display="grid";lobby.style.display="none";gameApp.style.display="none";const archive=$("archivePage");if(archive)archive.style.display="none";modal.hidden=true;modal.classList.remove("archive-fullscreen");document.body.style.overflow="";try{window.history.replaceState({screen:"summon"},"","#summon")}catch(e){}window.scrollTo(0,0);
 $("summonBackBtn").onclick=()=>{window.history.replaceState({screen:"lobby"},"","#lobby");showLobby()};
}
function saveCoins(s){s.coins=TEST_UNLIMITED_COINS;try{localStorage.setItem('campusCardMiniSave',JSON.stringify({...JSON.parse(localStorage.getItem('campusCardMiniSave')||'{}'),...s}))}catch(e){}if(typeof state!=='undefined'){state.coins=TEST_UNLIMITED_COINS;save();render()}refreshLobby()}
function doSummon(){const s=readGameSave(),cost=100;if((Number(s.coins)||0)<cost){openSummon();return}const c=readCollection();s.coins-=cost;const roll=Math.random(),rarity=roll<.5?'R':roll<.85?'SR':'SSR';let choices=roster.filter(ch=>ch.rarity===rarity);if(!choices.length)choices=roster;let result=choices[Math.floor(Math.random()*choices.length)];if(c.owned.includes(result.id)){s.coins+=5;result={...result,duplicate:true,role:'已持有此角色，轉換為 5 枚金幣。'}}else{c.owned.push(result.id);writeCollection(c)}saveCoins(s);openSummon();const box=$('summonResult');if(box){const card=document.createElement('div');card.className='summon-result';if(result.image&&!result.duplicate){const img=document.createElement('img');img.src=result.image;img.alt=result.name+'立繪';img.style.cssText='display:block;width:min(100%,220px);height:300px;object-fit:contain;margin:0 auto 12px;border-radius:10px';img.onerror=()=>img.remove();card.append(img)}const title=document.createElement('strong');title.textContent=result.duplicate?'🔁 '+result.name:'🎉 召喚成功！ '+result.name+'（'+result.rarity+'）';const p=document.createElement('p');p.textContent=result.duplicate?result.role:(result.icon+' '+result.role+' 已加入角色背包！');p.style.margin='7px 0 0';card.append(title,p);box.append(card)}}
function openQuests(){const c=readCollection(),qs=[{id:'clear1',title:'初次勝利',desc:'通過任意 1 個關卡',reward:20,complete:(Number(readGameSave().cleared)||0)>=1},{id:'collect3',title:'招募夥伴',desc:'收藏至少 3 位角色',reward:30,complete:c.owned.length>=3}];let html='<p>完成任務條件即可領取金幣獎勵，每項任務限領一次。</p><div class="inventory-list">';qs.forEach(q=>{const claimed=!!c.quests[q.id];html+='<div class="inventory-item"><span class="inv-icon">'+(q.complete?'🏆':'📌')+'</span><div class="inv-meta"><strong>'+q.title+'</strong><small>'+q.desc+' · 獎勵 '+q.reward+' 金幣</small></div><button class="modal-close" type="button" data-claim="'+q.id+'" '+(!q.complete||claimed?'disabled':'')+'>'+(claimed?'已領取':q.complete?'領取獎勵':'未完成')+'</button></div>'});html+='</div>';showModal('📜 新手任務',html)}
function claimQuest(id){const c=readCollection(),s=readGameSave(),qs={clear1:{complete:(Number(s.cleared)||0)>=1,reward:20},collect3:{complete:c.owned.length>=3,reward:30}},q=qs[id];if(!q||!q.complete||c.quests[id])return;c.quests[id]=true;writeCollection(c);s.coins=(Number(s.coins)||0)+q.reward;localStorage.setItem('campusCardMiniSave',JSON.stringify(s));refreshLobby();openQuests()}
function doTenSummon(){const s=readGameSave(),cost=1000;if((Number(s.coins)||0)<cost){openSummon();return}const col=readCollection();s.coins-=cost;const results=[];for(let i=0;i<10;i++){const roll=Math.random(),rarity=roll<.5?'R':roll<.85?'SR':'SSR';let choices=roster.filter(ch=>ch.rarity===rarity);if(!choices.length)choices=roster;results.push({...choices[Math.floor(Math.random()*choices.length)]})}if(!results.some(ch=>ch.rarity==='SR'||ch.rarity==='SSR')){const higher=roster.filter(ch=>newbieSummonCharacterIds.includes(ch.id)&&(ch.rarity==='SR'||ch.rarity==='SSR'));if(higher.length)results[results.length-1]={...higher[Math.floor(Math.random()*higher.length)]}}results.forEach(ch=>{if(col.owned.includes(ch.id)){s.coins+=5;ch.duplicate=true;ch.role='已持有此角色，轉換為 5 枚金幣。'}else{col.owned.push(ch.id);ch.duplicate=false}});writeCollection(col);saveCoins(s);openSummon();const box=$('summonResult');if(box){const summary=document.createElement('p');summary.textContent='十連召喚完成！重複角色已各返還 5 枚金幣。';box.append(summary);results.forEach(ch=>{const card=document.createElement('div');card.className='summon-result';card.style.cssText='display:flex;align-items:center;gap:10px;margin-top:8px';if(ch.image&&!ch.duplicate){const img=document.createElement('img');img.src=ch.image;img.alt=ch.name+'立繪';img.style.cssText='width:72px;height:96px;object-fit:contain;border-radius:8px';img.onerror=()=>img.remove();card.append(img)}const info=document.createElement('div');const title=document.createElement('strong');title.textContent=(ch.duplicate?'🔁 ':'✨ ')+ch.name+'（'+ch.rarity+'）';const p=document.createElement('p');p.textContent=ch.duplicate?'重複角色：返還 5 金幣':ch.role+' 已加入角色背包';p.style.margin='5px 0 0';info.append(title,p);card.append(info);box.append(card)})}}function doNewbieTenSummon(){const col=readCollection();if(col.newbieTenClaimed){openSummon();return}col.newbieTenClaimed=true;const s=readGameSave(),results=[];for(let i=0;i<10;i++){const roll=Math.random(),rarity=roll<.5?'R':roll<.85?'SR':'SSR';let choices=roster.filter(ch=>newbieSummonCharacterIds.includes(ch.id)&&ch.rarity===rarity);if(!choices.length)choices=roster.filter(ch=>newbieSummonCharacterIds.includes(ch.id));if(!choices.length)return;results.push({...choices[Math.floor(Math.random()*choices.length)]})}if(!results.some(ch=>ch.rarity==='SR'||ch.rarity==='SSR')){const higher=roster.filter(ch=>newbieSummonCharacterIds.includes(ch.id)&&(ch.rarity==='SR'||ch.rarity==='SSR'));if(higher.length)results[results.length-1]={...higher[Math.floor(Math.random()*higher.length)]}}results.forEach(ch=>{if(col.owned.includes(ch.id)){s.coins+=5;ch.duplicate=true;ch.role='已持有此角色，轉換為 5 枚金幣。'}else{col.owned.push(ch.id);ch.duplicate=false}});writeCollection(col);saveCoins(s);openSummon();const box=$('summonResult');if(box){const summary=document.createElement('p');summary.textContent='🎁 新手免費十連完成！這項新手福利只能領取一次；重複角色各返還 5 枚金幣。';box.append(summary);results.forEach(ch=>{const card=document.createElement('div');card.className='summon-result';card.style.cssText='display:flex;align-items:center;gap:10px;margin-top:8px';if(ch.image&&!ch.duplicate){const img=document.createElement('img');img.src=ch.image;img.alt=ch.name+'立繪';img.style.cssText='width:72px;height:96px;object-fit:contain;border-radius:8px';img.onerror=()=>img.remove();card.append(img)}const info=document.createElement('div');const title=document.createElement('strong');title.textContent=(ch.duplicate?'🔁 ':'✨ ')+ch.name+'（'+ch.rarity+'）';const p=document.createElement('p');p.textContent=ch.duplicate?'重複角色：返還 5 金幣':ch.role+' 已加入角色背包';p.style.margin='5px 0 0';info.append(title,p);card.append(info);box.append(card)})}}function claimQuest(id){const c=readCollection(),s=readGameSave(),p=readDailyMissionProgress();const qs={daily_stage:{complete:p.wins>=1,reward:15},daily_battles:{complete:p.wins>=3,reward:30},daily_summon:{complete:p.summons>=1,reward:20}};const q=qs[id],claimKey=localDayKey()+'_'+id;if(!q||!q.complete||c.quests[claimKey])return;c.quests[claimKey]=true;writeCollection(c);s.coins=(Number(s.coins)||0)+q.reward;saveCoins(s);openQuests()}function showDailyRewardPopup(reward,bonus,streak,already){const dayLabels=['一','二','三','四','五','六','日'];let days='';for(let i=1;i<=7;i++){const active=i<=streak;days+='<div class="daily-streak-day '+(active?'earned':'')+'"><span>第'+dayLabels[i-1]+'天</span><strong>'+(i===7?'🎁':(20+i*5)+'🪙')+'</strong><small>'+(active?'已達成':'待領取')+'</small></div>'}const html='<div class="daily-reward-popup"><div class="daily-reward-glow">'+(already?'🌙':'🎁')+'</div><p class="eyebrow">DAILY LOGIN REWARD</p><h2>'+(already?'今天已領取':'每日登入獎勵')+'</h2><p class="daily-reward-sub">'+(already?'今日獎勵已放入你的錢包，明天再來吧！':'登入成功！獎勵已加入你的金幣。')+'</p>'+(already?'':'<div class="daily-reward-total"><span>本次獲得</span><strong>+'+reward+' <small>金幣</small></strong><p>基本獎勵 20 + 連續登入獎勵 '+bonus+'</p></div>')+'<div class="daily-streak-title"><strong>🔥 連續登入 '+streak+' 天</strong><span>第 7 天起額外獎勵最高 30 金幣</span></div><div class="daily-streak-grid">'+days+'</div><button type="button" class="btn primary daily-reward-close" data-modal-action="daily-reward-close">'+(already?'知道了':'收下獎勵')+'</button></div>';showModal('🎁 每日登入獎勵',html)}
window.addEventListener('pageshow',refreshLobby);refreshLobby();

// 全域委派事件：確保大廳按鈕在手機版與重新渲染後仍可操作。
document.addEventListener('click',function(ev){
 const target=ev.target instanceof Element?ev.target:null;if(!target)return;
 const stageChoice=target.closest('[data-challenge-stage]');if(stageChoice){ev.preventDefault();ev.stopImmediatePropagation();selectChallengeStage(stageChoice.dataset.challengeStage);return;}
 const start=target.closest('#startBtn');
 if(start){ev.preventDefault();ev.stopImmediatePropagation();clearChallengeModeForMainline();showGame();return;}
 const daily=target.closest('#dailyBtn');
 if(daily){ev.preventDefault();ev.stopImmediatePropagation();claimDailyGift();return;}
 const menu=target.closest('[data-menu]');
 if(menu){ev.preventDefault();ev.stopImmediatePropagation();try{switch(menu.dataset.menu){case'archive':openArchive();break;case'summon':openSummon();break;case'inventory':openInventory();break;case'formation':openFormation();break;case'quests':openQuests();break;case'stage-center':openStageCenter();break;}}catch(err){console.error('大廳功能開啟失敗',err);showModal('功能載入失敗','<p>此功能載入時發生錯誤，請截圖回報。</p><p style="word-break:break-word">'+String(err&&err.message||err).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</p>')}return;}
 const action=target.closest('[data-modal-action]');
 if(action){ev.preventDefault();ev.stopImmediatePropagation();switch(action.dataset.modalAction){case'summon':openSummon();break;case'inventory':openInventory();break;case'formation':openFormation();break;case'formation-done':closeModal();break;case'do-summon':doSummon();break;case'do-ten-summon':doTenSummon();break;case'do-newbie-ten-summon':doNewbieTenSummon();break;case'daily-reward-close':closeModal();break;case'challenge-start':startSelectedChallenge();break;case'sweep-confirm':confirmSweep();break;case'sweep-close':closeModal();break;}return;}
 const add=target.closest('[data-add-member]');if(add&&!add.disabled){ev.preventDefault();ev.stopImmediatePropagation();changeFormation(add.dataset.addMember);return;}
 const remove=target.closest('[data-remove-member]');if(remove){ev.preventDefault();ev.stopImmediatePropagation();changeFormation(remove.dataset.removeMember,true);return;}
},true);
function claimDailyGift(){
 const day=localDayKey(),testDaily=new URLSearchParams(location.search).get('testDaily')==='1';
 if(!testDaily&&localStorage.getItem('campusDailyGift')===day){refreshLobby();return;}
 const s=readGameSave(),last=localStorage.getItem('campusDailyGift')||'',yesterday=new Date(Date.now()-86400000),yesterdayKey=localDayKey(yesterday);
 let streak=Number(localStorage.getItem('campusDailyStreak')||0);streak=last===yesterdayKey?Math.min(7,streak+1):1;
 const bonus=Math.min(streak,7),reward=20+bonus;
 s.coins=(Number(s.coins)||0)+reward;localStorage.setItem('campusCardMiniSave',JSON.stringify(s));
 if(!testDaily){localStorage.setItem('campusDailyGift',day);localStorage.setItem('campusDailyStreak',String(streak));}
 if(typeof state!=='undefined'&&state){state.coins=s.coins;save();render();}
 refreshLobby();showModal('🎁 每日登入補給','<p>成功領取 '+reward+' 枚金幣（基本 20 枚＋連續登入獎勵 '+bonus+' 枚）。</p><p>每日補給於台灣時間 00:00 更新。</p><div class="modal-actions"><button type="button" class="btn primary" data-modal-action="daily-reward-close">太好了</button></div>');
}


const defaults=()=>({stage:1,coins:0,cleared:0,playerHp:100,energy:0,enemyEnergy:0,pendingEnemySkill:null,enemySkillNotice:null,potions:1,supplyUsedStage:false,enemyHp:55,guardNext:false,defendNext:false,bossCharge:false,stage20Phase:0,stage20SpecialPending:false,stage20Rotation:0,stage20BossTurns:0});
let state;
let challengeMainState=null;
const BATTLE_FX_KEY='campusBattleFxSettings';
function getBattleFxSettings(){try{const v=JSON.parse(localStorage.getItem(BATTLE_FX_KEY)||'{}');return{enabled:v.enabled!==false,shake:v.shake!==false}}catch(e){return{enabled:true,shake:true}}}
function saveBattleFxSettings(){const v={enabled:!!$('battleFxEnabled')?.checked,shake:!!$('battleShakeEnabled')?.checked};try{localStorage.setItem(BATTLE_FX_KEY,JSON.stringify(v))}catch(e){}}
function battleFx(target,kind){const cfg=getBattleFxSettings();if(!cfg.enabled||!target)return;const el=typeof target==='string'?$(target):target;if(!el)return;if(kind==='death'){battleCardShatter(el);return}const cls='battle-fx-'+kind;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),kind==='ultimate'?1050:kind==='heal'?750:500)}
function battleCardShatter(el){const image=el.querySelector('img');if(!image)return;el.querySelectorAll('.battle-shatter-layer').forEach(n=>n.remove());const layer=document.createElement('div');layer.className='battle-shatter-layer';layer.setAttribute('aria-hidden','true');const pieces=[['top-left','inset(0 50% 50% 0)','-24px','-22px','-13deg'],['top-right','inset(0 0 50% 50%)','24px','-22px','13deg'],['bottom-left','inset(50% 50% 0 0)','-24px','22px','13deg'],['bottom-right','inset(50% 0 0 50%)','24px','22px','-13deg']];pieces.forEach(([name,clip,x,y,rot],i)=>{const shard=image.cloneNode(true);shard.removeAttribute('id');shard.alt='';shard.className='battle-shatter-piece '+name;shard.style.clipPath=clip;shard.style.setProperty('--shard-x',x);shard.style.setProperty('--shard-y',y);shard.style.setProperty('--shard-rot',rot);shard.style.animationDelay=(i*35)+'ms';layer.appendChild(shard)});el.appendChild(layer);image.classList.add('battle-shatter-source');layer.addEventListener('animationend',()=>{}, {once:true});setTimeout(()=>{image.classList.remove('battle-shatter-source');layer.remove()},1150)}
function battleShake(target='battlePanel'){const cfg=getBattleFxSettings();if(!cfg.enabled||!cfg.shake||!target)return;const el=$(target)||document.querySelector(target);if(!el)return;el.classList.remove('battle-fx-shake');void el.offsetWidth;el.classList.add('battle-fx-shake');setTimeout(()=>el.classList.remove('battle-fx-shake'),260)}
function bindBattleFxSettings(){const btn=$('battleFxSettingsBtn'),panel=$('battleFxSettings');if(!btn||!panel)return;const cfg=getBattleFxSettings();$('battleFxEnabled').checked=cfg.enabled;$('battleShakeEnabled').checked=cfg.shake;btn.addEventListener('click',()=>{panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',String(!panel.hidden))});$('battleFxEnabled').addEventListener('change',saveBattleFxSettings);$('battleShakeEnabled').addEventListener('change',saveBattleFxSettings)}
function floatNumber(targetId,text,heal=false){const target=$(targetId);if(!target)return;const fighter=target.closest('.fighter');if(!fighter)return;const n=document.createElement('span');n.className='hp-damage-float '+(fighter.classList.contains('enemy')?'enemy-damage':'player-damage')+(heal?' heal-number':'');n.textContent=text;fighter.append(n);setTimeout(()=>n.remove(),950)}
function animateFighter(id,kind){const el=$(id);if(!el)return;if(kind==='hp-flash'){const bar=el.closest('.bar');const target=bar||el;target.classList.remove('hp-flash');void target.offsetWidth;target.classList.add('hp-flash');setTimeout(()=>target.classList.remove('hp-flash'),450);return}el.classList.remove('hit','attack-pulse','victory');void el.offsetWidth;el.classList.add(kind);setTimeout(()=>el.classList.remove(kind),450)}
function updateHpBar(id,current,maximum,side){const fill=$(id);if(!fill)return;const max=Math.max(1,Number(maximum)||1),hp=Math.max(0,Math.min(max,Number(current)||0)),ratio=hp/max;fill.style.width='100%';fill.style.height='100%';fill.style.transform='scaleX('+ratio+')';fill.style.transformOrigin='left center';fill.style.flex='0 0 auto';fill.style.background=ratio<=0?'#344055':ratio<0.25?'linear-gradient(90deg,#ff334f,#b80f35)':ratio<0.6?'linear-gradient(90deg,#ffd166,#f0a52b)':side==='enemy'?'linear-gradient(90deg,#ff647c,#ffb06e)':'linear-gradient(90deg,#50d6a5,#a6edba)';fill.setAttribute('aria-valuenow',String(hp));fill.setAttribute('aria-valuemin','0');fill.setAttribute('aria-valuemax',String(max));fill.setAttribute('role','progressbar')}
function showGame(){lobby.style.display='none';const archive=$('archivePage');if(archive)archive.style.display='none';const summon=$('summonPage');if(summon)summon.style.display='none';const challenge=$('stageCenterPage');if(challenge)challenge.style.display='none';gameApp.style.display='grid';document.body.style.overflow='';try{window.history.replaceState({screen:'game'},'','#game')}catch(err){}window.scrollTo({top:0,behavior:'smooth'});render();if(!state.stageStorySeen&&state.enemyHp>0)setTimeout(showStageStory,0)}
function showLobby(){gameApp.style.display='none';const archive=$('archivePage');if(archive)archive.style.display='none';const summon=$('summonPage');if(summon)summon.style.display='none';const challenge=$('stageCenterPage');if(challenge)challenge.style.display='none';lobby.style.display='grid';try{window.history.replaceState({screen:'lobby'},'','#lobby')}catch(err){}window.scrollTo({top:0,behavior:'smooth'});refreshLobby()}
function returnToLobby(){forceLobby()}
$('lobbyHomeBtn') && ($('lobbyHomeBtn').onclick=returnToLobby);$('gameBackBtn').onclick=returnToLobby;
let restoredChallengeBattle=null;try{const savedChallenge=JSON.parse(localStorage.getItem('campusChallengeBattleSave')||'null');if(savedChallenge&&savedChallenge.challengeMode===true&&Number.isInteger(Number(savedChallenge.stage))&&Number(savedChallenge.stage)>=1&&Number(savedChallenge.stage)<=20)restoredChallengeBattle=savedChallenge}catch(e){}try{state={...defaults(),...(restoredChallengeBattle||JSON.parse(localStorage.getItem('campusCardMiniSave')||'{}'))}}catch(e){state=defaults()}if(restoredChallengeBattle){state.challengeMode=true;state.challengeResultActive=false;challengeMainState=state.challengeMainSnapshot?cloneChallengeValue(state.challengeMainSnapshot):null}else{state.challengeMode=false;state.challengeResultActive=false;delete state.challengeMainSnapshot;try{localStorage.removeItem('campusChallengeBattleSave')}catch(e){}}if(typeof state.supplyUsedStage!=='boolean')state.supplyUsedStage=Number(state.potions)<=0;state.supplyUsedStage=!!state.supplyUsedStage;state.potions=state.supplyUsedStage?0:1;if(!Number.isFinite(state.energy))state.energy=0;state.energy=Math.max(0,Math.min(100,state.energy));if(!Number.isFinite(state.enemyEnergy))state.enemyEnergy=0;state.enemyEnergy=Math.max(0,Math.min(100,state.enemyEnergy));if(state.energyStartZeroVersion!==3){state.energy=Math.max(100,Number(state.energy)||0);state.enemyEnergy=0;state.pendingEnemySkill=null;state.energyStartZeroVersion=3}state.energy=100;if(!state.pendingEnemySkill||!['A','B','C'].includes(state.pendingEnemySkill.type))state.pendingEnemySkill=null;if(!state.enemySkillNotice||!['warning','cast'].includes(state.enemySkillNotice.status))state.enemySkillNotice=null;state.bossCharge=false;
const enemies=[{name:'校園巡邏者',desc:'在校園裡巡查的普通對手',icon:'👾',hp:55,atk:7},{name:'圖書館石像',desc:'守護古老筆記的石像',icon:'🪨',hp:75,atk:10},{name:'夜巡影獸',desc:'擅長突襲的影子怪物',icon:'🐺',hp:95,atk:13},{name:'學園守門者',desc:'守住舊校舍入口的強敵',icon:'🐉',hp:125,atk:16}];
const stageStories=[["崩壞的第一堂課","警報響起，學生接連感染。小隊必須離開教室。"],["血色教學走廊","迅捷喪屍堵住走廊，小隊突破包圍前往樓梯間。"],["最後的午餐","餐廳仍有食物與倖存者，感染者也被聲響吸引。"],["保健室的求救聲","尋找藥品時，病歷顯示感染早於警報，並留下 E-01 代號。"],["感染女王：醫務室的支配者","感染女王現身校園醫務室，操控感染者阻擋去路；擊敗她後取得校園門禁卡。"],["無聲的圖書館","拿到門禁卡後，小隊躲進圖書館。書架後的終端機顯示，校方曾把一批代號 E 的樣本送往地下設施；此時，黑暗中的感染者已悄悄包圍入口。"],["被封鎖的地下室","小隊從圖書館找到地下室通行碼，發現運送紀錄被刻意刪改。走廊盡頭傳來撞擊聲，一扇標示「生物樣本區」的厚重鐵門正不斷震動。"],["消失的研究紀錄","地下室終端機只留下破碎檔案。小隊修復資料後得知，研究團隊曾試圖以病毒提升人體適應力，事故當晚有人下令清除所有紀錄。"],["禁忌實驗室","門禁卡開啟了最深處的實驗區。警報記錄指出，研究人員在失控前已撤離，但實驗艙仍在運作；一隻變異感染體突破玻璃，擋住小隊前進的路。"],["E-01：初始感染體","小隊迎戰最早完成感染實驗的 E-01。擊敗它後，終端機播放出一段研究員留言：E-01 並非源頭，而是用來測試病毒控制能力的第一個成功樣本。"],["被包圍的中庭","離開實驗室後，小隊發現校園裡的感染者正朝同一方向移動，像是受到某種訊號指揮。中庭已被層層包圍，必須突破包圍才能前往宿舍尋找倖存者。"],["女生宿舍的倖存者","小隊在宿舍找到一群倖存者，其中一人隱瞞了自己曾接觸研究樣本的事實。混亂中感染者闖入房間，小隊必須守住出口，並取得通往天台的鑰匙。"],["天台求救訊號","天台上的求救發射器竟連接到地下研究設施的緊急頻道。回傳訊息揭露：校園封鎖不是單純救援失敗，而是有人試圖把感染事件困在校內；遠處的避難所仍有訊號。"],["失守的避難所","小隊趕到避難所時，防線已經崩潰，倖存者正往外撤離。一隻披著破損防護裝備的重裝感染體堵住唯一出口，必須擊敗它才能帶領眾人離開。"],["校園封鎖線","突破封鎖線後，小隊終於離開校園。救援頻道卻傳來新的警告：E-02 已離開研究中心，並展現出遠超 E-01 的進化能力；訊息附上城市研究中心的座標。"],["死寂的城市街道","城市街道空無一人，沿路的緊急廣播不斷重播同一段撤離指令。小隊循著座標前進，發現感染者也在朝研究中心聚集，彷彿那裡正發出召喚。"],["被遺棄的研究中心","研究中心早已人去樓空，牆上的封鎖紀錄顯示緊急處置曾被人為中止。小隊找到最後一批實驗資料，確認 E-02 正守在核心區入口。"],["E-02：進化個體","E-02 能根據對手的攻擊迅速改變戰鬥模式。激戰後，小隊從它身上的資料模組取得核心區座標，並得知所有感染者的異常訊號都源自更深處的 E-00。"],["病毒核心區","小隊抵達研究中心最深處，發現巨大的訊號中樞與生物核心相連。控制台顯示，只要核心仍在運作，感染者就會持續受到指揮；然而關閉系統可能引發最後一次全面暴走。"],["E-00：原初母體","原初母體 E-00 從核心艙中甦醒，感染訊號瞬間覆蓋整座研究中心。小隊必須突破三個進化階段，摧毀母體並關閉訊號中樞，才能終結這場校園感染災變。"]];
const enemyStageDescs=[
'警報響起後，第一批感染學生在教室附近失控攻擊。',
'迅捷喪屍堵住教學走廊，阻擋小隊前往樓梯間。',
'餐廳的聲響吸引感染者，牠們正逼近食物與倖存者。',
'保健室裡的感染者守住藥品區，病歷指向代號 E-01。',
'感染女王盤據醫務室，操控感染者阻擋小隊並守住門禁卡。',
'圖書館入口遭感染者包圍，牠們似乎察覺小隊正在查找研究紀錄。',
'地下生物樣本區的厚重鐵門後傳來撞擊聲，感染警衛封鎖通道。',
'失控研究員守在地下終端機附近，破碎紀錄揭露禁忌實驗。',
'實驗艙中的變異感染體突破玻璃，阻擋通往實驗區深處的道路。',
'E-01 是最早成功完成感染實驗的樣本，能測試病毒控制能力。',
'初始感染體出現在中庭，牠受到神秘訊號影響，成為小隊必須擊敗的敵人。',
'感染者闖入女生宿舍，威脅倖存者並封鎖通往天台的出口。',
'天台求救訊號連接地下研究設施，感染者正阻止小隊發送訊息。',
'披著破損防護裝備的重裝感染體堵住避難所唯一出口。',
'校園封鎖線附近爆發激戰，救援頻道警告 E-02 已經進化。',
'城市街道的感染者正朝研究中心聚集，像是受到核心訊號召喚。',
'被遺棄的研究中心內，感染者守住核心區入口與最後實驗資料。',
'E-02 能迅速適應對手攻擊，是遠比 E-01 更危險的進化個體。',
'病毒核心區的守衛受訊號中樞控制，必須阻止感染訊號持續擴散。',
'E-00 原初母體啟動全面感染訊號，小隊必須摧毀母體並關閉中樞。'
];
function stageKind(n){return n%10===0?'大 BOSS':n%5===0?'小 BOSS':'普通關卡'}
function stageTitle(n){return stageStories[n-1]?.[0]||('新的校園謎團（第 '+n+' 關）')}
function stageStory(n){return stageStories[n-1]?.[1]||('深入校園的冒險仍在繼續。新的線索指向第 '+n+' 關的危機，你必須擊敗守關敵人，才能追查下一段真相。')}
function baseReward(n){if(n>=1&&n<=4)return 10;if(n<=8)return 15;if(n<=12)return 20;if(n<=16)return 25;if(n<=19)return 30;return 50}
function firstBossBonus(n){return n%10===0?20:n%5===0?10:0}
function replayReward(n){return Math.floor(baseReward(n)*0.2)}
function replayBossBonus(n){return Math.floor(firstBossBonus(n)*0.2)}
function mainlineClearedStages(){
 const recorded=Array.isArray(state.clearedStages)?state.clearedStages:[];
 const set=new Set(recorded.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=20));
 const clearedProgress=Math.max(0,Math.min(20,Number(state.cleared)||0));
 const currentMainlineStage=state.challengeMode?0:Math.max(0,Math.min(20,Number(state.stage)||1));
 const progress=Math.max(clearedProgress,currentMainlineStage);
 for(let n=1;n<=progress;n++)set.add(n);
 return [...set].sort((a,b)=>a-b);
}
function unlockedChallengeStages(){
 const newlyUnlocked=mainlineClearedStages();
 const previouslyUnlocked=Array.isArray(state.challengeUnlockedStages)?state.challengeUnlockedStages.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=20):[];
 const permanent=[...new Set([...previouslyUnlocked,...newlyUnlocked])].sort((a,b)=>a-b);
 if(JSON.stringify(permanent)!==JSON.stringify(previouslyUnlocked)){state.challengeUnlockedStages=permanent;save()}
 return permanent;
}
function openStageCenter(){
 const unlocked=unlockedChallengeStages(),cleared=clearedSweepStages();
 const opts=a=>a.map(n=>'<option value="'+n+'">第 '+String(n).padStart(2,'0')+' 關｜'+stageTitle(n)+'</option>').join('');
 const resultStage=state.challengeLastResult&&state.challengeLastResult.success?Number(state.challengeLastResult.stage):NaN;const preferred=Number.isInteger(resultStage)&&resultStage>=1&&resultStage<=20?resultStage:Number(state.challengeLastStage);const selected=unlocked.includes(preferred)?preferred:(unlocked.includes(Number(state.challengeLastStage))?Number(state.challengeLastStage):unlocked[0]);state.challengeLastStage=selected;
 const stageButtons=unlocked.map(n=>'<button type="button" class="challenge-stage-choice '+(n===selected?'selected':'')+'" data-challenge-stage="'+n+'" aria-pressed="'+(n===selected)+'"><strong>第 '+String(n).padStart(2,'0')+' 關</strong><span>'+stageTitle(n)+'</span><small>'+stageKind(n)+'</small></button>').join('');

 const html='<div class="stage-center-head"><div><p class="eyebrow">CAMPUS SYSTEM</p><h1>⚔️ 關卡挑戰</h1><p class="stage-center-intro">自行挑戰與掃蕩獎勵分開計算；每關各自每日最多 3 次。</p></div><button class="btn secondary" id="stageCenterBackBtn" type="button">← 返回遊戲功能</button></div><div class="stage-center-grid"><section class="stage-center-panel"><strong>自行挑戰</strong><p class="muted">點擊已解鎖關卡卡片選擇挑戰目標。</p><div class="challenge-stage-choices" id="challengeStageChoices">'+stageButtons+'</div><div id="challengeRewardPreview" class="notice" style="margin-top:12px"></div><div class="modal-actions"><button class="btn primary" type="button" data-modal-action="challenge-start">開始挑戰</button></div></section><section class="stage-center-panel"><strong>一鍵掃蕩</strong><p class="muted">僅限已通關關卡；每關每日最多 3 次，與自行挑戰額度分開。</p>'+
 (cleared.length?'<label for="sweepStage">選擇掃蕩關卡</label><select id="sweepStage">'+opts(cleared)+'</select><div id="sweepPreview" class="notice" style="margin-top:12px"></div><div class="modal-actions" id="sweepActions"></div>':'<p class="muted">目前尚無已通關關卡，完成關卡後即可使用掃蕩。</p>')+'</section></div>';
 let page=$('stageCenterPage');if(!page){page=document.createElement('main');page.id='stageCenterPage';page.className='stage-center-page';$('lobby').parentNode.insertBefore(page,$('lobby').nextSibling)}
 page.innerHTML=html;page.style.display='grid';lobby.style.display='none';gameApp.style.display='none';const archive=$('archivePage');if(archive)archive.style.display='none';const summon=$('summonPage');if(summon)summon.style.display='none';modal.hidden=true;document.body.style.overflow='';try{window.history.replaceState({screen:'stage-center'},'','#stage-center')}catch(e){}window.scrollTo(0,0);
 $('stageCenterBackBtn').onclick=showLobby;
 const sweepSelect=$('sweepStage');if(sweepSelect)sweepSelect.onchange=updateSweepPreview;
 updateChallengeRewardPreview();if(cleared.length)updateSweepPreview();
}
function updateChallengeRewardPreview(){
 const preview=$('challengeRewardPreview');if(!preview)return;
 preview.style.color='';
 const n=Math.max(1,Number(state.challengeLastStage)||1),daily=challengeRewardState(n,'play');
 preview.innerHTML='<strong>第 '+String(n).padStart(2,'0')+' 關｜'+stageTitle(n)+'</strong><br>今日自行挑戰通關獎勵剩餘：<strong>'+daily.remaining+' / 3 次</strong>'+(daily.remaining===0?'<p style="color:#ffd780;margin:7px 0 0">今日挑戰獎勵已領完，仍可繼續挑戰。</p>':'');
}
function selectChallengeStage(n){if(!unlockedChallengeStages().includes(Number(n)))return;state.challengeLastStage=Number(n);document.querySelectorAll('[data-challenge-stage]').forEach(b=>{const active=Number(b.dataset.challengeStage)===state.challengeLastStage;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});updateChallengeRewardPreview();save()}

function startSelectedChallenge(){
 const n=Number(state.challengeLastStage),available=unlockedChallengeStages();
 if(!Number.isInteger(n)||!available.includes(n)){
  openStageCenter();
  const preview=$('challengeRewardPreview');
  if(preview)preview.textContent='第20關尚未正確載入可挑戰清單，請重新選擇關卡。';
  return;
 }
 const mainState=state;
 try{
  challengeMainState=mainState;save();
  const battle={...defaults(),coins:Number(mainState.coins)||0,challengeLastStage:n,challengeClearedStages:cloneChallengeValue(mainState.challengeClearedStages||[]),challengeUnlockedStages:cloneChallengeValue(mainState.challengeUnlockedStages||[]),challengePlayRewardCounts:cloneChallengeValue(mainState.challengePlayRewardCounts||{}),challengeSweepRewardCounts:cloneChallengeValue(mainState.challengeSweepRewardCounts||{}),challengeLastResult:null,challengeMode:true,challengeResultActive:false,challengeReturnStage:Math.max(1,Number(mainState.stage)||1),challengeReplayCompleted:false,stage:n,stage20Phase:0,stage20Rotation:0,stage20BossTurns:0,stage20SpecialPending:false,stage20DebuffTurns:0,stageStorySeen:false};
  battle.energy=0;battle.enemyEnergy=0;battle.pendingEnemySkill=null;battle.enemySkillNotice=null;battle.bossCharge=false;battle.defendNext=false;battle.guardNext=false;battle.supplyUsedStage=false;battle.potions=1;
  const col=readCollection(),team=(col.formation||[]).map(id=>roster.find(ch=>ch.id===id)).filter(Boolean);if(!team.length)team.push(roster.find(ch=>ch.id==='yuching'));
  battle.partyHp={};team.forEach(ch=>{battle.partyHp[ch.id]=maxHp(ch)});battle.activeMember=team[0].id;battle.playerHp=battle.partyHp[battle.activeMember];
  state=battle;state.enemyHp=enemy().hp;selectedCombatAction=null;skillMenuOpen=false;
  try{localStorage.removeItem('campusChallengeBattleSave')}catch(e){}
  save();closeModal();showGame();setTimeout(()=>{if(state.enemyHp>0)showStageStory()},0);
 }catch(err){
  state=mainState;challengeMainState=null;delete state.challengeMainSnapshot;
  try{localStorage.removeItem('campusChallengeBattleSave')}catch(e){}
  save();console.error('第'+n+'關挑戰啟動失敗',err);
  openStageCenter();showModal('挑戰啟動失敗','<p>戰鬥初始化發生錯誤，已返回關卡挑戰中心，原本進度不會被覆蓋。</p><p style="word-break:break-word">'+String(err&&err.message||err).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</p><div class="modal-actions"><button type="button" class="btn primary" data-modal-action="sweep-close">關閉</button></div>');
 }
}
document.getElementById('stageCenterBtn')?.addEventListener('click',openStageCenter);
function cloneChallengeValue(value,seen=new WeakMap()){if(value===null||typeof value!=='object')return value;if(seen.has(value))return seen.get(value);const copy=Array.isArray(value)?[]:{};seen.set(value,copy);Object.keys(value).forEach(key=>{copy[key]=cloneChallengeValue(value[key],seen)});return copy}
function challengeRewardState(n,mode){const day=taiwanDayKey(),key=day+'-'+String(n),field=mode==='sweep'?'challengeSweepRewardCounts':'challengePlayRewardCounts';state[field]=state[field]&&typeof state[field]==='object'?state[field]:{};const used=Math.max(0,Math.min(3,Number(state[field][key])||0));return {day,key,field,used,remaining:Math.max(0,3-used)}}
function sweepDailyState(n=Number($('sweepStage')?.value)||1){return challengeRewardState(n,'sweep')}
function clearedSweepStages(){
 const mainline=new Set(mainlineClearedStages());
 return [...new Set((Array.isArray(state.challengeClearedStages)?state.challengeClearedStages:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=20&&mainline.has(n)))].sort((a,b)=>a-b);
}
function sweepReward(n){return replayReward(n)+replayBossBonus(n)}
function openSweep(){
 const daily=sweepDailyState(),stages=clearedSweepStages();
 const options=stages.map(n=>'<option value="'+n+'">第 '+String(n).padStart(2,'0')+' 關｜'+stageTitle(n)+'（'+stageKind(n)+'）</option>').join('');
 const html='<div class="panel" style="padding:14px;margin-bottom:14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><strong>今日掃蕩額度</strong><strong style="color:var(--gold);font-size:1.15rem">'+daily.remaining+' / 3 次</strong></div><div class="bar" style="margin-top:10px"><div class="fill" style="width:'+(daily.remaining/3*100)+'%"></div></div><p class="muted" style="margin:9px 0 0">每日 00:00（台灣時間）重置；普通關卡與已通關 BOSS 關皆可選擇。</p></div>'+
 (stages.length?'<label for="sweepStage" style="display:block;font-weight:800;margin-bottom:7px">選擇已通關關卡</label><select id="sweepStage" style="width:100%;padding:12px;border-radius:10px;border:1px solid #526985;background:#111d2e;color:#eef4ff;font:inherit">'+options+'</select><div id="sweepPreview" class="notice" style="margin-top:12px" aria-live="polite"></div><div class="modal-actions"><button type="button" class="btn secondary" data-modal-action="sweep-close">取消</button><button type="button" class="btn primary" id="sweepConfirmBtn" data-modal-action="sweep-confirm" '+(daily.remaining<=0?'disabled':'')+'>⚡ 確認掃蕩</button></div>':'<div class="notice">目前尚無已通關關卡。成功通關任一關後即可使用掃蕩。</div><div class="modal-actions"><button type="button" class="btn secondary" data-modal-action="sweep-close">關閉</button></div>');
 showModal('⚡ 已通關關卡一鍵掃蕩',html);
 updateSweepPreview();
}
function updateSweepPreview(){
 const select=$('sweepStage'),preview=$('sweepPreview'),actions=$('sweepActions');
 if(!select||!preview||!actions)return;
 const n=Number(select.value),allowed=clearedSweepStages().includes(n),daily=sweepDailyState(n),reward=sweepReward(n);
 preview.innerHTML=allowed?'<strong>第 '+String(n).padStart(2,'0')+' 關｜'+stageTitle(n)+'</strong><p style="margin:7px 0 0">關卡類型：'+stageKind(n)+'<br>今日掃蕩獎勵剩餘：<strong>'+daily.remaining+' / 3 次</strong><br>預計獲得：<span class="reward">'+reward+' 枚金幣</span></p><p class="muted" style="margin:7px 0 0">掃蕩額度與自行挑戰獨立計算，不影響目前戰鬥關卡或角色生命值。</p>':'目前選擇的關卡尚未通關。';
 actions.innerHTML=allowed&&daily.remaining>0?'<button type="button" class="btn primary" data-modal-action="sweep-confirm">確認掃蕩</button>':'<p class="muted">今日掃蕩次數已用完，請明日再使用。</p>';
}
function confirmSweep(){
 const select=$('sweepStage');if(!select)return;
 const n=Number(select.value),daily=sweepDailyState(n);
 if(daily.remaining<=0||!clearedSweepStages().includes(n)){updateSweepPreview();return}
 const reward=sweepReward(n);
 state.coins=Math.max(0,Number(state.coins)||0)+reward;state[daily.field][daily.key]=daily.used+1;save();render();refreshLobby();
 showModal('⚡ 掃蕩完成','<div class="summon-result"><strong>第 '+String(n).padStart(2,'0')+' 關｜'+stageTitle(n)+'</strong><p>成功完成掃蕩！</p><p class="reward">獲得 '+reward+' 枚金幣</p><p>本關今日掃蕩獎勵剩餘：'+(3-state[daily.field][daily.key])+' / 3 次</p></div><div class="modal-actions"><button type="button" class="btn primary" data-modal-action="sweep-close">完成</button></div>');
}

document.addEventListener('change',function(ev){if(ev.target&&ev.target.id==='sweepStage')updateSweepPreview()},true);
function taiwanDayKey(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
const enemyCardNames=["校園感染學生","迅捷感染者","食堂感染者","護理感染者","巨型感染體","圖書館潛伏者","寄生感染體","實驗型感染者","變異實驗體","E-01 原型體","初始感染體","宿舍感染學生","飛撲型感染體","裝甲感染體","重裝鎮壓體","城市感染者","研究中心感染者","E-02 進化個體","核心守衛","E-00 原初母體"];
const enemySkillSets=[
 [{type:'A',name:'感染撲擊'}],
 [{type:'A',name:'高速突襲'}],
 [{type:'A',name:'獵食追擊'}],
 [{type:'B',name:'藥劑干擾'}],
 [{type:'A',name:'異變重擊'}],
 [{type:'A',name:'暗處伏擊'}],
 [{type:'B',name:'寄生侵蝕'}],
 [{type:'B',name:'失控實驗波'}],
 [{type:'A',name:'突破重擊'}],
 [{type:'A',name:'原型重擊'}],
 [],
 [{type:'A',name:'突入撲擊'}],
 [{type:'A',name:'天台飛撲'}],
 [{type:'A',name:'裝甲衝撞'}],
 [{type:'A',name:'異變重擊'}],
 [{type:'B',name:'訊號污染'}],
 [{type:'B',name:'研究區干擾波'}],
 [{type:'A',name:'進化重擊'},{type:'B',name:'適應干擾'}],
 [{type:'B',name:'核心封鎖'}],
 [{type:'A',name:'核心暴走'}]
];
const stage20PhaseConfigs=[
{name:'第一階段｜原初甦醒',hp:400,desc:'核心艙停止運作，E-00 緩緩睜開雙眼。控制台警告：原初樣本甦醒，核心限制解除。',special:{type:'single',name:'原初核心爆發',damage:50}},
{name:'第二階段｜異變增殖',hp:650,desc:'母體遭受重創後，骨質增生覆蓋軀幹，黑灰色骨甲與觸肢迅速增殖。研究中心終端顯示：進化超出預測，限制程序失效。',special:{type:'all',name:'觸肢狂襲',damage:30}},
{name:'第三階段｜完全暴走',hp:950,desc:'警報聲戛然而止。E-00 的觸肢完全展開，胸腹核心暴露並發出紅光。感染訊號源頭就在眼前——摧毀母體核心，終結感染。',special:{type:'all',name:'原初終焉',damage:45}}
];
function stage20Config(){return stage20PhaseConfigs[Math.max(0,Math.min(2,Number(state.stage20Phase)||0))]}
function showStage20Story(){
 const p=stage20Config(),idx=Number(state.stage20Phase)||0;
 let o=document.getElementById('stageStoryOverlay');
 if(!o){o=document.createElement('div');o.id='stageStoryOverlay';o.style.cssText='position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:18px;box-sizing:border-box;background:rgba(5,10,20,.94);color:#f4f6ff;font:16px/1.7 system-ui,sans-serif;';document.body.appendChild(o)}
 o.innerHTML=`<section style="width:min(640px,100%);max-height:calc(100dvh - 36px);overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #b34b5d;border-radius:18px;background:linear-gradient(145deg,#241522,#111b35);">
 <div style="font-size:.8rem;letter-spacing:.12em;color:#ffb4bd;font-weight:800">FINAL BOSS · PHASE ${idx+1}/3</div><h2 style="margin:8px 0 12px">第20關：${p.name}</h2>
 <div id="stage20StoryImage" style="width:min(230px,70%);height:310px;margin:0 auto 14px;border:2px solid #bd5265;border-radius:14px;background:#111827;display:grid;place-items:center;overflow:hidden"></div>
 <p style="line-height:1.9;color:#d7def0">${p.desc}</p><p>敵人：E-00 原初母體　｜　階段生命值：${p.hp} HP</p>
 <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><button id="storyStartBtn" style="padding:12px 18px;border:0;border-radius:10px;background:#62d8c4;color:#102033;font-weight:800;font-size:1rem">⚔️ ${idx===0?'開始戰鬥':'繼續戰鬥'}</button><button id="storyLobbyBtn" style="padding:12px 18px;border:1px solid #8293ad;border-radius:10px;background:transparent;color:#f4f6ff;font-size:1rem">返回大廳</button></div></section>`;
 const imageBox=document.getElementById('stage20StoryImage');
 if(idx===0||idx===1||idx===2){const img=document.createElement('img');img.src=idx===0?'https://github.com/j19077-afk/TaiwanCampusCardGame/raw/refs/heads/main/%E6%96%B0%E5%A2%9E%E5%9C%96%E7%89%87/%E6%95%B5%E6%96%B9%E5%8D%A1%E7%89%8C/stage20-E00-original-mother.png':idx===1?'https://github.com/j19077-afk/TaiwanCampusCardGame/raw/refs/heads/main/%E6%96%B0%E5%A2%9E%E5%9C%96%E7%89%87/%E6%95%B5%E6%96%B9%E5%8D%A1%E7%89%8C/stage-20-phase-2.png':'https://github.com/j19077-afk/TaiwanCampusCardGame/raw/refs/heads/main/%E6%96%B0%E5%A2%9E%E5%9C%96%E7%89%87/%E6%95%B5%E6%96%B9%E5%8D%A1%E7%89%8C/stage-20-phase-3.png';img.alt='E-00：第'+(idx+1)+'階段';img.style.cssText='display:block;width:100%;height:100%;object-fit:contain';img.onerror=()=>{imageBox.textContent=idx===0?'🧬':idx===1?'🦠':'👹'};imageBox.appendChild(img)}else{imageBox.textContent='👹';imageBox.style.fontSize='76px'}
 o.style.display='flex';o.setAttribute('aria-modal','true');document.body.style.overflow='hidden';
 document.getElementById('storyStartBtn').onclick=()=>{state.stageStorySeen=true;save();o.style.display='none';document.body.style.overflow='';tell('E-00 '+p.name+' 戰鬥開始！')};
 document.getElementById('storyLobbyBtn').onclick=()=>{o.style.display='none';document.body.style.overflow='';showLobby()};
}
function advanceStage20Phase(){if(Number(state.stage)!==20)return false;const next=(Number(state.stage20Phase)||0)+1;if(next>2)return false;state.stage20Phase=next;state.enemyHp=stage20Config().hp;state.enemyEnergy=0;state.pendingEnemySkill=null;state.enemySkillNotice=null;state.stage20Rotation=0;state.stage20BossTurns=0;state.stage20SpecialPending=false;state.stage20DebuffTurns=0;state.defendNext=false;state.guardNext=false;state.stageStorySeen=false;addLog('⚠️ E-00 進化！進入'+stage20Config().name+'，全隊生命值與我方能量保留。');save();showStage20Story();return true}
function stage20EnemyCounter(e){
 const col=readCollection(),team=col.formation||[],active=roster.find(ch=>ch.id===state.activeMember)||roster[0];
 state.partyHp=state.partyHp||{};
 const living=team.map(id=>roster.find(ch=>ch.id===id)).filter(ch=>ch&&(state.partyHp[ch.id]??maxHp(ch))>0);
 if(!living.length){state.playerHp=0;return 0}
 const p=stage20Config();
 const pending=state.stage20SpecialPending===true;
 let targets=[],damage=0,skill=null;
 if(pending){
  skill=p.special;
  state.stage20SpecialPending=false;
  state.enemyEnergy=0;
  state.stage20BossTurns=0;
  addLog('💥 E-00 上一回合能量已滿100/100，本回合施放特殊必殺技「'+skill.name+'」！');
  setEnemySkillNotice('cast',skill.name,e.name);battleFx('enemyAvatar','ultimate');battleShake();
  targets=skill.type==='all'?living:[living[Math.floor(Math.random()*living.length)]];
  damage=skill.damage;
 }else{
  const energyAfter=Math.min(100,Math.max(0,Number(state.enemyEnergy)||0)+20);
  state.enemyEnergy=energyAfter;
  state.stage20BossTurns=(Number(state.stage20BossTurns)||0)+1;
  targets=[living.find(ch=>ch.id===active.id)||living[0]];
  damage=Math.max(1,Number(e.atk)||20)+Math.floor(Math.random()*5);
  addLog('E-00 發動普通攻擊！');
  if(energyAfter>=100){
   state.stage20SpecialPending=true;
   setEnemySkillNotice('warning',p.special.name,e.name);battleFx('enemyAvatar','charge');
   addLog('⚠️ E-00 能量已滿100/100！下一個敵方回合才會施放特殊必殺技「'+p.special.name+'」，請做好防禦！');
  }else{
   state.enemySkillNotice=null;
  }
 }
 let total=0;
 for(const target of targets){
  let hit=damage;
  if(state.defendNext){hit=Math.ceil(hit*.7);addLog('防禦生效！本次傷害減少30%。')}
  if(state.guardNext){hit=Math.ceil(hit*.5);addLog('星盾守護生效！額外抵擋部分傷害。')}
  const before=state.partyHp[target.id]??maxHp(target),actual=Math.min(before,hit);
  state.partyHp[target.id]=Math.max(0,before-hit);total+=actual;
  if(target.id===state.activeMember)state.playerHp=state.partyHp[target.id];
  floatNumber('playerHpBar','-'+actual);animateFighter('playerHpBar','hp-flash');
  addLog(skill?'「'+skill.name+'」命中：'+target.name+' 受到 '+actual+' 點固定傷害。':'敵方普通攻擊：'+target.name+' 受到 '+actual+' 點傷害。');
  if(state.partyHp[target.id]<=0){
   addLog(target.name+' 倒下了！');
   const next=living.find(ch=>ch.id!==target.id&&(state.partyHp[ch.id]??0)>0);
   if(next&&target.id===state.activeMember){state.activeMember=next.id;state.playerHp=state.partyHp[next.id];tell(target.name+' 倒下了！已切換至 '+next.name+'。')}
   else if(!team.some(id=>(state.partyHp[id]??0)>0)){state.playerHp=0;tell('💫 全隊倒下！請重新挑戰第20關。')}
  }
 }
 state.defendNext=false;state.guardNext=false;return total
}
function enemy(){const n=Math.max(1,Number(state.stage)||1),b=enemies[(n-1)%enemies.length],cycle=Math.floor((n-1)/4),boss=n%10===0,mini=n%5===0&&!boss;if(n===20){const p=stage20Config();return {...b,name:'E-00 原初母體',desc:p.desc,icon:'👑',hp:p.hp,atk:20,reward:50}}return {...b,name:enemyCardNames[n-1]||(boss?({10:'暗影監督者',20:'深淵支配者'}[n]||'深淵領主'):mini?({5:'巡夜隊長',15:'封印守衛'}[n]||'精英隊長'):b.name),desc:boss?'篇章核心敵人':mini?'阻擋主線的強大敵人':b.desc,icon:boss?'👑':mini?'🐉':b.icon,hp:Math.round((b.hp+cycle*35)*(boss?2.8:mini?1.8:1)),atk:Math.round((b.atk+cycle*4)*(boss?2.0:mini?1.55:1.15)),reward:baseReward(n)}}
function showStageStory(){
 if(Number(state.stage)===20){showStage20Story();return}
 const n=Math.max(1,Number(state.stage)||1),e=enemy(),kind=stageKind(n),bonus=firstBossBonus(n);
 let overlay=document.getElementById('stageStoryOverlay');
 if(!overlay){overlay=document.createElement('div');overlay.id='stageStoryOverlay';overlay.style.cssText='position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:18px;box-sizing:border-box;background:rgba(5,10,20,.94);color:#f4f6ff;font:16px/1.7 system-ui,sans-serif;';document.body.appendChild(overlay)}
 overlay.innerHTML='<section style="width:min(620px,100%);max-height:calc(100dvh - 36px);overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #7d79d8;border-radius:18px;background:linear-gradient(145deg,#111b35,#211a40);"><div style="font-size:.8rem;letter-spacing:.12em;color:#c4bfff;font-weight:800">'+kind+' · STAGE '+n+'</div><h2 style="margin:8px 0 12px">📖 第 '+n+' 關：'+stageTitle(n)+'</h2>'+(n<=19?'<img src="新增圖片/敵方卡牌/stage-'+String(n).padStart(2,'0')+'.png" alt="第 '+n+' 關敵方卡牌" style="display:block;width:min(240px,70%);max-height:42vh;object-fit:contain;margin:0 auto 16px;border-radius:12px" onerror="this.style.display=\'none\'">':'')+'<p style="line-height:1.9;color:#d7def0">'+stageStory(n)+'</p><p>敵人：'+e.name+'　｜　勝利獲得：'+e.reward+' 金幣'+(bonus?'　｜　首次擊敗額外：'+bonus+' 金幣':'')+'</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><button id="storyStartBtn" style="padding:12px 18px;border:0;border-radius:10px;background:#62d8c4;color:#102033;font-weight:800;font-size:1rem">⚔️ 開始戰鬥</button><button id="storyLobbyBtn" style="padding:12px 18px;border:1px solid #8293ad;border-radius:10px;background:transparent;color:#f4f6ff;font-size:1rem">返回大廳</button></div></section>';
 overlay.style.display='flex';overlay.setAttribute('aria-modal','true');document.body.style.overflow='hidden';
 document.getElementById('storyStartBtn').onclick=()=>{state.stageStorySeen=true;save();overlay.style.display='none';document.body.style.overflow='';tell('戰鬥開始！擊敗敵人，推進劇情。')};
 document.getElementById('storyLobbyBtn').onclick=()=>{overlay.style.display='none';document.body.style.overflow='';showLobby()};
}
function save(){try{if(state)state.coins=TEST_UNLIMITED_COINS;if(state&&state.challengeMode){localStorage.setItem('campusChallengeBattleSave',JSON.stringify(state));return}localStorage.setItem('campusCardMiniSave',JSON.stringify(state))}catch(e){}}
function addLog(t){const n=document.createElement('div');n.className='logline';n.textContent=t;$('log').prepend(n);while($('log').children.length>8)$('log').lastElementChild.remove()}
function tell(t){$('notice').textContent=t}
function render(){const resetButton=$('resetBtn');if(resetButton)resetButton.hidden=!!state.challengeMode;const gameBackButton=$('gameBackBtn');if(gameBackButton){const hideChallengeBack=!!state.challengeMode;gameBackButton.hidden=hideChallengeBack;gameBackButton.style.display=hideChallengeBack?'none':'';const gameNav=gameBackButton.closest('nav');if(gameNav){gameNav.hidden=hideChallengeBack;gameNav.style.display=hideChallengeBack?'none':'';}}const e=enemy();if(Number(state.stage)===20&&Number(state.enemyHp)>0){$('attackBtn').textContent='⚔️ 普通攻擊';$('attackBtn').disabled=false;$('attackBtn').onclick=()=>{skillMenuOpen=false;handleCombatAction('attack')}}const col=readCollection(),team=(col.formation||[]).map(id=>roster.find(ch=>ch.id===id)).filter(Boolean);if(!team.length)team.push(roster.find(ch=>ch.id==='yuching'));if(!state.partyHp||typeof state.partyHp!=='object')state.partyHp={};team.forEach(ch=>{if(!Number.isFinite(Number(state.partyHp[ch.id])))state.partyHp[ch.id]=getCardStats(ch).hp});const livingTeam=team.filter(ch=>Number(state.partyHp[ch.id])>0);const allPartyDown=livingTeam.length===0;const active=allPartyDown?(team.find(ch=>ch.id===state.activeMember)||team[0]):(livingTeam.find(ch=>ch.id===state.activeMember)||livingTeam[0]);const party=$("battleParty");if(party){party.innerHTML=(healingTargetMode?'<p class="healing-party-hint">請先選取受傷隊員，再按「確認補血」</p>':'')+team.map(ch=>{const hp=Math.max(0,Number(state.partyHp[ch.id])||0),eligible=hp>0&&hp<maxHp(ch),chosen=healingSelectedTargetId===ch.id;return '<button type="button" class="battle-ally '+(ch.id===active.id?'active ':'')+(healingTargetMode&&eligible?'healing-target-ready ':'')+(healingTargetMode&&chosen?'healing-target-selected':'')+'" data-active-member="'+ch.id+'" '+(healingTargetMode?(eligible?'':'disabled'):(hp<=0?'disabled':''))+'><span class="ally-name">'+ch.name+'</span>'+(ch.id===active.id?'<small class="ally-active-label">目前操作</small>':'')+(healingTargetMode&&eligible?'<small class="healing-prompt">'+(chosen?'✓ 已選取':'點擊選取')+'</small>':'')+'<span class="ally-hp">HP '+hp+' / '+maxHp(ch)+'</span></button>'}).join('')}if(healingTargetMode&&healingSelectedTargetId){const selected=roster.find(ch=>ch.id===healingSelectedTargetId);party.insertAdjacentHTML('beforeend','<div class="heal-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="healConfirmTitle"><div class="heal-confirm-modal"><h3 id="healConfirmTitle">💚 確認治療</h3><strong>'+(selected?.name||'隊員')+'</strong><p>預計恢復：<strong>+'+Math.min(Math.max(0,maxHp(selected)-Number(state.partyHp?.[selected.id]??maxHp(selected))),getCardStats(roster.find(ch=>ch.id===state.activeMember)||roster[0]).heal*((roster.find(ch=>ch.id===state.activeMember)||roster[0]).id==='anzai_coach'?2:1))+' HP</strong><br>消耗 35 點能量</p><div class="heal-confirm-actions"><button type="button" class="btn primary" id="healConfirmBtn">確定</button><button type="button" class="btn secondary" id="healCancelSelectBtn">取消</button></div></div></div>')}state.activeMember=active.id;state.playerHp=allPartyDown?0:Number(state.partyHp[active.id]);$('stageModeLabel').textContent=state.challengeMode?'關卡挑戰':'主線關卡';$('stageTop').textContent=state.stage;$('stageTitle').textContent='第 '+state.stage+' 關：'+stageTitle(state.stage)+'（'+stageKind(state.stage)+'）';$('coinsTop').textContent=state.coins;$('playerHpText').textContent='HP '+state.playerHp+' / '+getCardStats(roster.find(ch=>ch.id===state.activeMember)||roster[0]).hp;updateHpBar('playerHpBar',state.playerHp,100,'player');$('playerAtk').textContent=18+Math.floor((state.stage-1)/3)*2;const energyPct=Math.max(0,Math.min(100,state.energy));$('playerEnergyText').textContent='能量 '+state.energy+' / 100';const enemyEnergyPct=Math.max(0,Math.min(100,Number(state.enemyEnergy)||0));$('enemyEnergyText').textContent='能量 '+state.enemyEnergy+' / 100';$('playerEnergyBar').style.width=energyPct+'%';$('enemyEnergyBar').style.width=enemyEnergyPct+'%';const currentCard=roster.find(ch=>ch.id===state.activeMember)||roster[0];const playerPortrait=$('playerAvatar');if(playerPortrait){playerPortrait.innerHTML='<img src="'+currentCard.image+'" alt="'+currentCard.name+'" style="display:block;width:100%;height:100%;object-fit:contain;object-position:center center" onerror="this.parentElement.textContent=\'🎓\'">';playerPortrait.setAttribute('aria-label','目前操作角色：'+currentCard.name);playerPortrait.title='目前操作角色：'+currentCard.name;}const playerName=playerPortrait?.parentElement?.querySelector('h3');if(playerName)playerName.textContent=currentCard.name;const playerRole=playerPortrait?.parentElement?.querySelector('.muted');if(playerRole)playerRole.textContent=currentCard.role||'目前操作角色';$('playerAtk').textContent=getCardStats(currentCard).atk;$('playerHpText').textContent='HP '+Math.max(0,state.playerHp)+' / '+getCardStats(currentCard).hp;updateHpBar('playerHpBar',state.playerHp,getCardStats(currentCard).hp,'player');const skillNames={yuching:'超商微波便當！',yutong:'先喝水再說！',ruoxue:'冷氣開到 16 度！',xingyao:'外送倒數三分鐘！',keqing:'主管說再撐一下！',zihan:'已讀不回大法！',anzai_coach:'健康中心緊急補血',konan_koyoi:'手機剩 1%！'};if(skillMenuOpen){$('skillBtn').textContent=skillNames[state.activeMember]||'星輝衝擊';$('skillBtn').disabled=state.playerHp<=0||state.enemyHp<=0;}else{$('skillBtn').textContent='✦ 必殺技｜消耗 35 能量';$('skillBtn').disabled=state.playerHp<=0||state.enemyHp<=0||state.energy<35;}if($('skillBackBtn')){$('skillBackBtn').hidden=!skillMenuOpen&&!healingTargetMode;$('skillBackBtn').textContent=healingTargetMode?'✕ 取消治療':'↩ 返回';}$('enemyName').textContent=e.name;$('enemyDesc').textContent=Number(state.stage)===20?(stage20Config().name+'｜'+e.desc):(enemyStageDescs[state.stage-1]||e.desc);
const noticeState=state.enemySkillNotice;
let skillNotice=null;
if(noticeState){
 const skill=(Number(state.stage)===20?stage20Config().special:(enemySkillSets[Math.max(0,Number(state.stage)-1)]||[]).find(x=>x.name===noticeState.name));
 skillNotice=document.createElement('div');
 skillNotice.id='enemySkillNotice';
 skillNotice.className='enemy-skill-notice enemy-card-full-skill-notice';
 skillNotice.setAttribute('aria-live','polite');
 skillNotice.innerHTML='<div class="skill-notice-top"><span>'+(noticeState.status==='warning'?'⚠️ 敵方必殺技預告':'✓ 必殺技施放中')+'</span></div><div class="skill-notice-name">'+noticeState.name+'</div><div class="skill-notice-desc">'+enemySkillDescription(state.stage,skill)+'</div>';
}
$('enemyAvatar').classList.toggle('enemy-skill-warning',!!noticeState&&noticeState.status==='warning');$('enemyAvatar').classList.toggle('enemy-skill-cast',!!noticeState&&noticeState.status==='cast');const enemyAvatar=$('enemyAvatar');enemyAvatar.classList.toggle('enemy-skill-warning',!!noticeState&&noticeState.status==='warning');enemyAvatar.classList.toggle('enemy-skill-cast',!!noticeState&&noticeState.status==='cast');const stage20ImageSrc=Number(state.stage)===20&&Number(state.stage20Phase)===0?'https://github.com/j19077-afk/TaiwanCampusCardGame/raw/refs/heads/main/%E6%96%B0%E5%A2%9E%E5%9C%96%E7%89%87/%E6%95%B5%E6%96%B9%E5%8D%A1%E7%89%8C/stage20-E00-original-mother.png':Number(state.stage)===20&&Number(state.stage20Phase)===1?'https://github.com/j19077-afk/TaiwanCampusCardGame/raw/refs/heads/main/%E6%96%B0%E5%A2%9E%E5%9C%96%E7%89%87/%E6%95%B5%E6%96%B9%E5%8D%A1%E7%89%8C/stage-20-phase-2.png':Number(state.stage)===20&&Number(state.stage20Phase)===2?'https://github.com/j19077-afk/TaiwanCampusCardGame/raw/refs/heads/main/%E6%96%B0%E5%A2%9E%E5%9C%96%E7%89%87/%E6%95%B5%E6%96%B9%E5%8D%A1%E7%89%8C/stage-20-phase-3.png':null;if(Number(state.stage)<=19){const img=document.createElement('img');img.src='新增圖片/敵方卡牌/stage-'+String(state.stage).padStart(2,'0')+'.png';img.alt='第 '+state.stage+' 關敵方卡牌';img.style.cssText='display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;object-position:center center;border-radius:14px';img.onerror=()=>{enemyAvatar.textContent=e.icon};enemyAvatar.replaceChildren(img)}else if(stage20ImageSrc){const img=document.createElement('img');img.src=stage20ImageSrc;img.alt='E-00：第'+(Number(state.stage20Phase)+1)+'階段';img.style.cssText='display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;object-position:center center;border-radius:14px';img.onerror=()=>{enemyAvatar.textContent=e.icon};enemyAvatar.replaceChildren(img)}else{enemyAvatar.textContent=e.icon}if(skillNotice){enemyAvatar.appendChild(skillNotice)}$('enemyHpText').textContent='HP '+Math.max(0,state.enemyHp)+' / '+e.hp;updateHpBar('enemyHpBar',state.enemyHp,e.hp,'enemy');$('enemyAtk').textContent=e.atk;$('cleared').textContent=state.cleared;$('reward').textContent='+'+e.reward+' 金幣';$('potions').textContent=state.supplyUsedStage?'0 / 1':'1 / 1';$('attackBtn').disabled=state.playerHp<=0;$('defendBtn').disabled=state.playerHp<=0||state.enemyHp<=0;$('healBtn').disabled=state.playerHp<=0||state.playerHp>=getCardStats(currentCard).hp||state.supplyUsedStage||state.enemyHp<=0;$('healBtn').classList.toggle('supply-full-disabled',!state.supplyUsedStage&&state.playerHp>0&&state.playerHp>=getCardStats(currentCard).hp&&state.enemyHp>0);['attackBtn','defendBtn','healBtn'].forEach(id=>$(id).classList.toggle('combat-action-selected',selectedCombatAction===id.replace('Btn','')));$('skillBtn').classList.toggle('combat-action-selected',skillMenuOpen);if(!state.challengeMode){$('attackBtn').textContent='⚔️ 攻擊';$('attackBtn').disabled=state.playerHp<=0||state.enemyHp<=0;$('attackBtn').onclick=()=>handleCombatAction('attack')}if(state.challengeMode&&allPartyDown){$('attackBtn').textContent='失敗/撤退';$('attackBtn').disabled=false;$('attackBtn').onclick=finishChallengeDefeat;$('defendBtn').disabled=true;$('healBtn').disabled=true;$('skillBtn').disabled=true}else if(state.challengeMode&&state.challengeResultActive){$('attackBtn').textContent='↩️ 返回關卡挑戰中心';$('attackBtn').disabled=false;$('attackBtn').onclick=returnToChallengePage;$('defendBtn').disabled=true;$('healBtn').disabled=true;$('skillBtn').disabled=true}else if(state.challengeMode){$('attackBtn').textContent='⚔️ 普通攻擊';$('attackBtn').disabled=state.playerHp<=0;$('attackBtn').onclick=()=>{skillMenuOpen=false;handleCombatAction('attack')}}else if(state.enemyHp<=0&&state.playerHp>0&&Math.max(Number(state.cleared)||0,Array.isArray(state.clearedStages)?state.clearedStages.reduce((max,value)=>Math.max(max,Number(value)||0),0):0)>=Number(state.stage)){const finalStage=Number(state.stage)>=20;$('attackBtn').textContent=finalStage?'🎉 查看第一章結局':'➡️ 前往下一關';$('attackBtn').disabled=false;$('attackBtn').onclick=()=>finalStage?showChapterEnding(0):nextStage();$('defendBtn').disabled=true;$('healBtn').disabled=true;$('skillBtn').disabled=true}else{$('attackBtn').textContent='⚔️ 攻擊';$('attackBtn').disabled=state.playerHp<=0||state.enemyHp<=0;$('attackBtn').onclick=()=>handleCombatAction('attack')}save()}
function showChapterEnding(goldEarned){let overlay=document.getElementById('chapterEndingOverlay');if(!overlay){overlay=document.createElement('div');overlay.id='chapterEndingOverlay';overlay.style.cssText='position:fixed;inset:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:18px;box-sizing:border-box;background:rgba(5,10,20,.96);color:#f4f6ff;font:16px/1.7 system-ui,sans-serif;';document.body.appendChild(overlay)}const earned=Math.max(0,Number(goldEarned)||0);overlay.innerHTML='<section style="width:min(900px,100%);max-height:calc(100dvh - 36px);overflow:auto;box-sizing:border-box;padding:clamp(18px,4vw,34px);border:1px solid #e4c778;border-radius:22px;background:radial-gradient(circle at 50% 0,#9c7ad044,transparent 45%),linear-gradient(145deg,#172541,#241b3c);box-shadow:0 20px 80px #0009;text-align:center"><div style="font-size:clamp(.68rem,2vw,.85rem);letter-spacing:.16em;color:#ffe2a0;font-weight:900">CAMPUS IDOL CHRONICLES · CHAPTER 1</div><div style="font-size:clamp(2.6rem,7vw,3.5rem);line-height:1.2;margin:12px 0">🏆</div><h2 style="font-size:clamp(1.7rem,5vw,2.5rem);margin:0 0 10px;color:#ffe2a0">🎉 第一章完成！</h2><div style="display:inline-block;padding:6px 15px;border:1px solid #7f8fb0;border-radius:999px;color:#dce8ff;font-weight:800">主線進度 20 / 20</div><div style="margin:18px auto 8px;padding:10px 14px;max-width:680px;border:1px solid #8e7846;border-radius:12px;background:#0e192a;color:#ffe2a0;font-weight:800;letter-spacing:.04em">第一章：終焉與真相</div><div style="max-width:760px;margin:0 auto;text-align:left;color:#e0e7f5;font-size:clamp(.98rem,2.1vw,1.08rem);line-height:1.85"><p style="margin:16px 0 12px">原初母體 E-00 終於倒下。</p><p style="margin:0 0 14px">隨著訊號中樞停止運作，失控的感染者逐漸失去指揮，研究中心的警報也終於歸於沉寂。歷經重重危機，小隊成功阻止了感染者的集體行動，為仍在校園中掙扎求生的倖存者爭取到撤離的機會。</p><p style="margin:0 0 14px">然而，勝利並未帶來所有答案。</p><p style="margin:0 0 14px">小隊在研究中心取得的最後一批資料顯示，這場災難背後仍有許多無法解釋的疑點。部分實驗紀錄遭到刻意刪除，關鍵人物的行蹤也依舊成謎。E-00 的倒下，或許只是這場陰謀的一個終點，而不是一切的終結。</p><p style="margin:0 0 14px">帶著僅存的研究資料與倖存者的希望，小隊踏上撤離之路。</p><p style="margin:0;font-weight:900;color:#ffe2a0">第一章主線至此完結。但關於這場災難的真正答案，仍等待著他們揭開。</p></div><div style="padding:16px;border-radius:14px;background:#101a2c;border:1px solid #485977;margin:20px 0 14px"><div style="color:#a9bad4;font-size:.9rem;font-weight:700">第一章通關獎勵</div><strong style="display:block;font-size:clamp(1.5rem,4vw,2rem);line-height:1.5;color:#ffe2a0">🪙 +'+earned.toLocaleString('en-US')+' 金幣</strong><div style="margin-top:4px;color:#a9bad4;font-size:.9rem">領取後金幣：'+Math.max(0,Number(state.coins)||0).toLocaleString('en-US')+'</div></div><p style="color:#c8d4e8;font-weight:800;margin:12px 0">🏁 第一章主線已全部完成</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px"><button id="endingLobbyBtn" style="flex:1;min-width:170px;padding:12px 16px;border:1px solid #8293ad;border-radius:11px;background:transparent;color:#f4f6ff;font-weight:800;font-size:1rem;cursor:pointer">返回遊戲大廳</button></div></section>';overlay.style.display='flex';overlay.setAttribute('aria-modal','true');document.body.style.overflow='hidden';$('endingLobbyBtn').onclick=()=>{overlay.style.display='none';document.body.style.overflow='';showLobby()}}
function nextStage(){if(state.challengeReplayCompleted){state.challengeReplayCompleted=false;state.stage=Math.max(1,(Number(state.stage)||1)-1)}if((Number(state.stage)||1)>=20){showChapterEnding(0);return}state.stage=Math.min(20,(Number(state.stage)||1)+1);if(state.stage===20){state.stage20Phase=0;state.stage20Rotation=0;state.stage20BossTurns=0;state.stage20SpecialPending=false}state.energy=0;state.supplyUsedStage=false;state.potions=1;selectedCombatAction=null;skillMenuOpen=false;state.partyHp=state.partyHp||{};const col=readCollection(),team=(col.formation||[]).map(id=>roster.find(ch=>ch.id===id)).filter(Boolean);if(!team.length)team.push(roster.find(ch=>ch.id==='yuching'));team.forEach(ch=>{if(!Number.isFinite(state.partyHp[ch.id]))state.partyHp[ch.id]=maxHp(ch)});state.activeMember=team.some(ch=>ch.id===state.activeMember)?state.activeMember:team[0].id;state.playerHp=state.partyHp[state.activeMember];state.enemyHp=enemy().hp;state.energy=0;state.enemyEnergy=0;state.pendingEnemySkill=null;state.enemySkillNotice=null;state.bossCharge=false;state.defendNext=false;state.guardNext=false;$('victoryBanner')?.remove();$('attackBtn').textContent='⚔️ 攻擊';$('attackBtn').disabled=false;$('attackBtn').onclick=attack;state.stageStorySeen=false;save();tell('第 '+state.stage+' 關開始！全隊保留上一場戰鬥的剩餘生命值。');addLog('進入第 '+state.stage+' 關，保留全隊剩餘生命值。');render();setTimeout(()=>{if(state.enemyHp>0)showStageStory()},0)}
function restoreChallengeMainState(){
 const battle=state,main=challengeMainState;
 if(main){
  main.coins=Number(battle.coins)||Number(main.coins)||0;
  main.challengeLastStage=battle.challengeLastStage??main.challengeLastStage;
  main.challengeClearedStages=cloneChallengeValue(battle.challengeClearedStages||main.challengeClearedStages||[]);
  main.challengeUnlockedStages=cloneChallengeValue(battle.challengeUnlockedStages||main.challengeUnlockedStages||[]);
  main.challengePlayRewardCounts=cloneChallengeValue(battle.challengePlayRewardCounts||main.challengePlayRewardCounts||{});
  main.challengeSweepRewardCounts=cloneChallengeValue(battle.challengeSweepRewardCounts||main.challengeSweepRewardCounts||{});
  main.challengeLastResult=cloneChallengeValue(battle.challengeLastResult||null);
  state=main;
 }
 challengeMainState=null;state.challengeMode=false;state.challengeReturnStage=null;state.challengeReplayCompleted=false;state.challengeResultActive=false;
 try{localStorage.removeItem('campusChallengeBattleSave')}catch(e){}save();
}
function returnToChallengePage(){if(state.challengeMode&&challengeMainState)restoreChallengeMainState();state.challengeResultActive=false;save();openStageCenter();updateSweepPreview()}
function finishChallengeDefeat(){if(!state.challengeMode)return;const n=Math.max(1,Number(state.stage)||1);restoreChallengeMainState();state.challengeLastResult={success:false,stage:n,message:'挑戰失敗；主線進度、角色、隊伍 HP 與戰鬥狀態均已保留。',total:0};save();selectedCombatAction=null;skillMenuOpen=false;openStageCenter()}
function win(){battleFx("enemyAvatar","death");const e=enemy(),n=Math.max(1,Number(state.stage)||1),bonus=firstBossBonus(n),key=String(n);
 if(state.challengeMode){
  state.challengeClearedStages=Array.isArray(state.challengeClearedStages)?state.challengeClearedStages:[];
  const first=!state.challengeClearedStages.some(x=>Number(x)===n);if(first)state.challengeClearedStages.push(n);
  const daily=challengeRewardState(n,'play');let base=0,boss=0,limited=false;
  if(daily.remaining>0){base=first?e.reward:replayReward(n);boss=first?bonus:replayBossBonus(n);state[daily.field][daily.key]=daily.used+1}else limited=true;
  const total=base+boss;state.coins=(Number(state.coins)||0)+total;
  const message=limited?'今日此關自行挑戰獎勵已領完，本次不再發放獎勵':'獲得 '+base+' 枚金幣'+(boss?'，BOSS 額外獎勵 '+boss+' 枚':'');
  state.challengeLastResult={success:true,stage:n,message,total};state.challengeResultActive=true;selectedCombatAction=null;skillMenuOpen=false;save();
  tell('🎉 自行挑戰勝利！'+message+'。');addLog('🎉 自行挑戰勝利：'+message+'。按下「返回關卡挑戰中心」即可離開戰鬥結果。');
  $('defendBtn').disabled=true;$('healBtn').disabled=true;$('skillBtn').disabled=true;render();return;
 }let firstBonus=0;state.coins=Number(state.coins)||0;state.clearedStages=Array.isArray(state.clearedStages)?state.clearedStages:[];const firstClear=!state.clearedStages.some(x=>Number(x)===n);let baseEarned=0,bossEarned=0,replayLimited=false;if(firstClear){baseEarned=e.reward;bossEarned=bonus;state.clearedStages.push(n);if(bonus){state.bossFirstRewards=Array.isArray(state.bossFirstRewards)?state.bossFirstRewards:[];if(!state.bossFirstRewards.some(x=>String(x)===key))state.bossFirstRewards.push(key)}}else{state.replayRewardCounts=state.replayRewardCounts&&typeof state.replayRewardCounts==='object'?state.replayRewardCounts:{};const day=taiwanDayKey(),dayKey=day+'-'+key,count=Number(state.replayRewardCounts[dayKey])||0;if(count<3){baseEarned=replayReward(n);bossEarned=replayBossBonus(n);state.replayRewardCounts[dayKey]=count+1}else{replayLimited=true}}state.coins+=baseEarned+bossEarned;state.cleared=Math.max(Number(state.cleared)||0,n);state.enemyHp=0;state.enemyEnergy=0;state.pendingEnemySkill=null;state.enemySkillNotice=null;state.bossCharge=false;state.stageStorySeen=false;if(state.challengeMode&&n<Math.max(1,Number(state.challengeReturnStage)||1)){state.stage=Math.max(1,Number(state.challengeReturnStage)||1);state.challengeReplayCompleted=true;}else{state.challengeReplayCompleted=false;}state.challengeMode=false;state.challengeReturnStage=null;save();refreshLobby();const total=baseEarned+bossEarned;let message=firstClear?'首次通關獎勵 '+baseEarned+' 枚金幣'+(bossEarned?'，BOSS 額外獎勵 '+bossEarned+' 枚':''):'重玩獎勵 '+baseEarned+' 枚金幣'+(bossEarned?'，BOSS 額外獎勵 '+bossEarned+' 枚':'');if(replayLimited)message='今日本關重玩獎勵已達 3 次上限，本次不再獲得金幣';tell('🎉 勝利！'+message+'。');$('attackBtn').textContent='➡️ 前往下一關';$('attackBtn').disabled=false;$('healBtn').disabled=true;addLog('🎉 戰鬥勝利！擊敗 '+e.name+'，'+message+'，合計獲得 '+total+' 枚。');$('victoryBanner')?.remove();animateFighter('enemyAvatar','victory');if(n>=20){state.chapter2Complete=true;save();$('attackBtn').textContent='🎉 查看第一章結局';$('attackBtn').onclick=()=>showChapterEnding(total)}else{$('attackBtn').textContent='➡️ 前往下一關';$('attackBtn').onclick=()=>nextStage()}render()}
function setEnemySkillNotice(status,name,enemyName){state.enemySkillNotice={status,name,enemyName};if(status==='cast'){const noticeName=name,stageAtCast=Number(state.stage),phaseAtCast=Number(state.stage20Phase)||0;setTimeout(()=>{if(state.enemySkillNotice&&state.enemySkillNotice.status==='cast'&&state.enemySkillNotice.name===noticeName&&Number(state.stage)===stageAtCast&&(Number(state.stage20Phase)||0)===phaseAtCast){state.enemySkillNotice=null;render();save()}},1200)}}
function enemySkillDescription(stage,skill){if(Number(stage)===20){const p=stage20Config().special;return (p.type==='single'?'單體攻擊':'全體攻擊')+'：造成 '+p.damage+' 點固定傷害。'}if(!skill)return '特殊技能效果依關卡設定。';if(skill.type==='B')return '全隊能量減少 20 點。';if(skill.type==='C')return '敵方恢復最大 HP 的 15%。';const n=Number(stage)||1,boss=n%5===0,big=n%10===0;return (big?'全體攻擊':'單體攻擊')+'：'+(boss?'造成強力傷害。':'造成約 2 倍攻擊力傷害。');}
function enemyCounter(e){
 if(Number(state.stage)===20)return stage20EnemyCounter(e);
 const col=readCollection(),team=col.formation||[],active=roster.find(ch=>ch.id===state.activeMember)||roster[0],n=Math.max(1,Number(state.stage)||1),boss=n%5===0,bigBoss=n%10===0;
 state.partyHp=state.partyHp||{};
 state.enemyEnergy=Math.max(0,Math.min(100,Number(state.enemyEnergy)||0));
 const livingTeam=team.map(id=>roster.find(ch=>ch.id===id)).filter(ch=>ch&&(state.partyHp[ch.id]??maxHp(ch))>0);
 if(state.pendingEnemySkill){
  const skill=state.pendingEnemySkill;
  state.pendingEnemySkill=null;
  setEnemySkillNotice('cast',skill.name,e.name);
  state.enemyEnergy=0;
  if(skill.type==='B'){
   const before=Math.max(0,Number(state.energy)||0),after=Math.max(0,before-20),reduced=before-after;
   state.energy=after;
   addLog('⚠️ '+e.name+' 施放「'+skill.name+'」！全隊總能量降低 '+reduced+' 點（'+before+' → '+after+'）。');
   state.defendNext=false;state.guardNext=false;return null;
  }
  if(skill.type==='C'){
   const cap=Math.max(1,Number(e.hp)||1),before=Math.max(0,Number(state.enemyHp)||0),after=Math.min(cap,before+Math.round(cap*0.15)),restored=after-before;
   state.enemyHp=after;
   if(restored>0){floatNumber('enemyHpBar','+'+restored,true);animateFighter('enemyHpBar','hp-flash')}
   addLog('💚 '+e.name+' 施放「'+skill.name+'」！恢復 '+restored+' 點生命值（'+after+' / '+cap+'）。');
   state.defendNext=false;state.guardNext=false;return null;
  }
  let hit=0,targets=[];
  if(boss){
   hit=e.atk+Math.floor(Math.random()*5);
   if(bigBoss){hit=Math.round(hit*(n>=16?2.05:n>=11?1.75:1.45));targets=livingTeam;addLog('💥 '+e.name+' 施放 BOSS 必殺技「'+skill.name+'」！')}
   else{hit=Math.round(hit*(n>=16?2.25:n>=11?1.9:1.55));targets=[active];addLog('💥 '+e.name+' 施放 BOSS 必殺技「'+skill.name+'」！')}
  }else{hit=Math.max(1,Math.round(e.atk*2));targets=[active];addLog('💥 '+e.name+' 施放技能「'+skill.name+'」！')}
  let total=0;
  for(const target of targets){
   if(!target||(state.partyHp[target.id]??0)<=0)continue;
   let damage=hit;
   if(team.includes('keqing'))damage=Math.max(1,damage-3);
   if(state.defendNext){const reduction=boss&&bigBoss?0.15:0.30;damage=Math.ceil(damage*(1-reduction));addLog('防禦生效！本次傷害減少 '+Math.round(reduction*100)+'%。')}
   if(state.guardNext){damage=Math.ceil(damage*0.5);addLog('星盾守護生效！抵擋部分傷害。')}
   const hpBefore=state.partyHp[target.id]??maxHp(target),actualHit=Math.min(hpBefore,damage);
   state.partyHp[target.id]=Math.max(0,hpBefore-damage);total+=actualHit;
   if(target.id===state.activeMember)state.playerHp=state.partyHp[target.id];
   floatNumber('playerHpBar','-'+actualHit);animateFighter('playerHpBar','hp-flash');
   addLog('「'+skill.name+'」命中：'+target.name+' 受到 '+actualHit+' 點傷害。');
   if(state.partyHp[target.id]<=0){
    addLog(target.name+' 倒下了！');
    const next=livingTeam.find(ch=>ch.id!==target.id&&(state.partyHp[ch.id]??0)>0);
    if(next&&target.id===state.activeMember){state.activeMember=next.id;state.playerHp=state.partyHp[next.id];tell(target.name+' 倒下了！已切換至 '+next.name+'。')}
    else if(!team.some(id=>(state.partyHp[id]??0)>0)){state.playerHp=0;tell('💫 全隊死亡！請按下「失敗/撤退」返回。')}
   }
  }
  state.defendNext=false;state.guardNext=false;return total;
 }
 state.enemyEnergy=Math.min(100,state.enemyEnergy+20);
 let announcedSkill=null;
 if(state.enemyEnergy>=100){
  const options=enemySkillSets[n-1]||[];
  if(options.length){announcedSkill=options[Math.floor(Math.random()*options.length)];state.pendingEnemySkill={type:announcedSkill.type,name:announcedSkill.name};setEnemySkillNotice('warning',announcedSkill.name,e.name),battleFx('enemyAvatar','charge')}
 }
 const targets=[active],hit=e.atk+Math.floor(Math.random()*5);let total=0;
 for(const target of targets){
  if(!target)continue;
  let damage=hit;
  if(team.includes('keqing'))damage=Math.max(1,damage-3);
  if(state.defendNext){damage=Math.ceil(damage*0.7);addLog('防禦生效！本次傷害減少 30%。')}
  if(state.guardNext){damage=Math.ceil(damage*0.5);addLog('星盾守護生效！抵擋部分傷害。')}
  const hpBefore=state.partyHp[target.id]??maxHp(target),actualHit=Math.min(hpBefore,damage);
  state.partyHp[target.id]=Math.max(0,hpBefore-damage);total+=actualHit;
  if(target.id===state.activeMember)state.playerHp=state.partyHp[target.id];
  floatNumber('playerHpBar','-'+actualHit);animateFighter('playerHpBar','hp-flash');
  addLog('敵人普通攻擊：'+target.name+' 受到 '+actualHit+' 點傷害。');
  if(state.partyHp[target.id]<=0){
   addLog(target.name+' 倒下了！');
   const next=livingTeam.find(ch=>ch.id!==target.id&&(state.partyHp[ch.id]??0)>0);
   if(next&&target.id===state.activeMember){state.activeMember=next.id;state.playerHp=state.partyHp[next.id];tell(target.name+' 倒下了！已切換至 '+next.name+'。')}
   else if(!team.some(id=>(state.partyHp[id]??0)>0)){state.playerHp=0;tell('💫 全隊死亡！請按下「失敗/撤退」返回。')}
  }
 }
 if(announcedSkill)addLog('⚠️ '+e.name+' 能量達到 100/100！即將施放「'+announcedSkill.name+'」，請做好防禦！');
 state.defendNext=false;state.guardNext=false;return total;
}
function handleCombatAction(action){if(state.playerHp<=0||state.enemyHp<=0)return;const label={attack:'普通攻擊',defend:'防禦',heal:'補給'}[action];if(!label)return;if(selectedCombatAction!==action){skillMenuOpen=false;selectedCombatAction=action;addLog('已選擇「'+label+'」指令，再按一次即可執行；也可改選其他指令。');tell('已選擇：'+label+'。再次點選同一按鍵即可執行。');render();return;}selectedCombatAction=null;if(action==='attack')attack();else if(action==='defend')defend();else if(action==='heal')heal()}
function attack(){if(state.playerHp<=0||state.enemyHp<=0)return;$('victoryBanner')?.remove();const e=enemy(),team=readCollection().formation||[],teamSize=team.length,active=roster.find(ch=>ch.id===state.activeMember)||roster[0],d=getCardStats(active).atk+Math.floor((state.stage-1)/3)*2+Math.max(1,teamSize)*2+Math.floor(Math.random()*5),actualDamage=Math.min(state.enemyHp,d);state.enemyHp=Math.max(0,state.enemyHp-d);state.energy=Math.min(100,state.energy+10);floatNumber('enemyHpBar','-'+actualDamage);animateFighter('enemyHpBar','hp-flash');animateFighter('enemyAvatar','hit');battleFx('enemyAvatar','slash');battleShake();addLog(active.name+' 發動普通攻擊，造成 '+actualDamage+' 點傷害，恢復 10 點能量。');if(state.enemyHp<=0){if(Number(state.stage)===20&&advanceStage20Phase()){render();return}render();win();return}const hit=enemyCounter(e);if(state.playerHp>0&&hit!==null)tell('你造成 '+actualDamage+' 點傷害，恢復 10 點能量；敵人反擊造成 '+hit+' 點傷害。');render()}
function openHealingTargetPicker(caster){if(state.energy<35){tell('能量不足！治療必殺技需要 35 點能量。');return;}const team=(readCollection().formation||[]).map(id=>roster.find(ch=>ch.id===id)).filter(Boolean),targets=team.filter(ch=>{const hp=Number(state.partyHp?.[ch.id]??maxHp(ch));return hp>0&&hp<maxHp(ch)});if(!targets.length){tell('目前沒有可治療的隊友（包含自己）。');return;}healingTargetMode=true;healingSelectedTargetId=null;skillMenuOpen=false;selectedCombatAction=null;tell('💚 請先點選一名受傷的存活隊員，選取後再按「確認補血」。');render()}
function performCharacterHeal(targetId){const caster=roster.find(ch=>ch.id===state.activeMember)||roster[0],target=roster.find(ch=>ch.id===targetId),team=readCollection().formation||[];if(!['yutong','anzai_coach'].includes(caster.id)||getCardStats(caster).heal<=0||!target||!team.includes(targetId)||state.playerHp<=0||state.enemyHp<=0||state.energy<35)return;const before=Number(state.partyHp?.[targetId]??maxHp(target));if(before<=0||before>=maxHp(target))return;const amount=getCardStats(caster).heal*(caster.id==='anzai_coach'?2:1),after=Math.min(maxHp(target),before+amount),restored=after-before;if(restored<=0)return;state.energy-=35;healingTargetMode=false;healingSelectedTargetId=null;state.partyHp=state.partyHp||{};state.partyHp[targetId]=after;if(targetId===state.activeMember)state.playerHp=after;$('skillBackBtn').textContent='↩ 返回';$('skillBackBtn').hidden=true;$('victoryBanner')?.remove();if(targetId===state.activeMember)floatNumber('playerHpBar','+'+restored,true);addLog(caster.name+'施放「'+(caster.id==='anzai_coach'?'健康中心緊急補血':'先喝水再說！')+'」，消耗 35 點能量，指定治療 '+target.name+'，恢復 '+restored+' HP；不占用行動且不觸發敵方反擊。');tell('💚 '+target.name+' 恢復 '+restored+' HP，消耗 35 點能量。');save();render()}
function useSkill(){const active=roster.find(ch=>ch.id===state.activeMember)||roster[0];if(state.playerHp<=0||state.enemyHp<=0)return;if(active.id==='yutong'||active.id==='anzai_coach'){if(getCardStats(active).heal<=0)return;if(state.energy<35){tell('能量不足！治療必殺技需要 35 點能量。');return;}openHealingTargetPicker(active);return;}if(state.energy<35)return;$('victoryBanner')?.remove();const e=enemy(),team=readCollection().formation||[],cost=35,enemyHpBefore=state.enemyHp;state.energy-=cost;let d=0,msg='';state.partyHp=state.partyHp||{};if(active.id==='konan_koyoi'){const base=getCardStats(active).skill;d=Math.round(base*1.5)+Math.floor((state.stage-1)/3)*3+Math.floor(Math.random()*5);msg='小宵虎南施放「手機剩 1%！」';state.enemyHp=Math.max(0,state.enemyHp-d);addLog(msg+'，對敵方單體造成技能威力 1.5 倍傷害（另計關卡加成與隨機值），消耗 35 點能量，造成 '+Math.min(enemyHpBefore,d)+' 點傷害。')}else if(active.id==='keqing'){state.guardNext=true;d=18+Math.floor(Math.random()*6);msg='江可晴施放「主管說再撐一下！」';state.enemyHp=Math.max(0,state.enemyHp-d);addLog(msg+'，造成 '+Math.min(enemyHpBefore,d)+' 點傷害，並使下次受到的傷害減半。')}else{const base=getCardStats(active).skill;d=base+Math.floor((state.stage-1)/3)*3+Math.floor(Math.random()*5);if(active.id==='ruoxue')msg='沈若雪施放「冷氣開到 16 度！」';else if(active.id==='xingyao')msg='許星瑤施放「外送倒數三分鐘！」';else if(active.id==='zihan')msg='顧紫涵施放「已讀不回大法！」';else msg='三上悠亞施放「超商微波便當！」';state.enemyHp=Math.max(0,state.enemyHp-d);if(active.id!=='konan_koyoi')addLog(msg+'，消耗 35 能量並造成 '+Math.min(enemyHpBefore,d)+' 點傷害.')}const actualDamage=Math.min(enemyHpBefore,d);if(actualDamage>0){floatNumber('enemyHpBar','-'+actualDamage);animateFighter('enemyHpBar','hp-flash');animateFighter('enemyAvatar','hit');battleFx('enemyAvatar','ultimate');battleShake()}if(state.enemyHp<=0){if(Number(state.stage)===20&&advanceStage20Phase()){render();return}render();win();return}const hit=enemyCounter(e);if(state.playerHp>0&&!['yutong','anzai_coach'].includes(active.id)&&hit!==null)tell(msg+'造成 '+actualDamage+' 點傷害；敵人反擊造成 '+hit+' 點傷害。');render()}
function defend(){if(state.playerHp<=0||state.enemyHp<=0)return;$('victoryBanner')?.remove();const e=enemy();state.defendNext=true;state.energy=Math.min(100,state.energy+5);battleFx('playerAvatar','shield');addLog((roster.find(ch=>ch.id===state.activeMember)?.name||'目前角色')+' 採取防禦姿態：下一次敵方攻擊傷害減少 30%，恢復 5 點能量。');const hit=enemyCounter(e);if(state.playerHp>0&&hit!==null)tell('🛡️ 防禦成功！敵人反擊造成 '+hit+' 點傷害。');render()}
function heal(){const active=roster.find(ch=>ch.id===state.activeMember)||roster[0],cap=maxHp(active);if(state.supplyUsedStage||state.playerHp>=cap||state.enemyHp<=0)return;state.partyHp=state.partyHp||{};state.partyHp[active.id]=Math.min(cap,(state.partyHp[active.id]??state.playerHp)+50);const a=state.partyHp[active.id]-state.playerHp;state.playerHp=state.partyHp[active.id];battleFx('playerAvatar','heal');state.supplyUsedStage=true;state.potions=0;floatNumber('playerHpBar','+'+a,true);addLog('使用本關補給，恢復 '+a+' 點生命值（上限 50）。');tell('補給生效！恢復 '+a+' 點生命值；本關補給已使用。');render()}
function reset(){if(!confirm('確定要重新開始遊戲嗎？已獲得的金幣會保留，其他遊戲進度將重置。'))return;const savedChallengeUnlocks=unlockedChallengeStages();const savedCoins=Math.max(0,Number(state.coins)||0);undoStack=[];state=defaults();state.challengeUnlockedStages=savedChallengeUnlocks;state.coins=savedCoins;state.supplyUsedStage=false;state.potions=1;state.energy=0;state.enemyEnergy=0;selectedCombatAction=null;skillMenuOpen=false;$('victoryBanner')?.remove();$('log').innerHTML='<div class="logline">新旅程開始！祝你冒險順利。</div>';$('attackBtn').textContent='⚔️ 攻擊';$('attackBtn').disabled=false;$('attackBtn').onclick=()=>handleCombatAction('attack');tell('冒險開始！本關補給已恢復，可使用 1 次（最多恢復 50 HP）。');save();refreshLobby();render();updateUndo()}
$('battleParty').addEventListener('click',ev=>{const btn=ev.target.closest('[data-active-member]');if(!btn||btn.disabled)return;const id=btn.getAttribute('data-active-member');if(!id)return;if(healingTargetMode){const ch=roster.find(x=>x.id===id),hp=Number(state.partyHp?.[id]??0);if(ch&&hp>0&&hp<maxHp(ch)){healingSelectedTargetId=id;tell('已選取 '+ch.name+'。請按「確認補血」執行治療，或重新選取其他隊員。');render()}return;}if(id===state.activeMember)return;selectedCombatAction=null;skillMenuOpen=false;state.activeMember=id;state.playerHp=state.partyHp[id]??maxHp(roster.find(ch=>ch.id===id)||roster[0]);addLog('切換操作角色：'+(roster.find(ch=>ch.id===id)?.name||id)+'。');tell('已切換操作角色。');render()});
const logBox=$('log'),logToggle=$('toggleFullLog');if(logBox&&logToggle){logToggle.addEventListener('click',()=>{const all=logBox.classList.toggle('show-all');logToggle.textContent=all?'收合紀錄 ↑':'查看全部紀錄 ↓';logToggle.setAttribute('aria-expanded',String(all));const hint=document.querySelector('.battle-history-hint');if(hint)hint.textContent=all?'完整戰鬥歷史 · 最新紀錄置頂':'最新 3 筆紀錄 · 點擊可查看完整戰鬥歷史';});}
$('battleParty').addEventListener('click',ev=>{if(ev.target.closest('#healConfirmBtn')){if(!healingTargetMode||!healingSelectedTargetId)return;performCharacterHeal(healingSelectedTargetId)}if(ev.target.closest('#healCancelSelectBtn')){healingSelectedTargetId=null;tell('已取消本次選取，請重新選擇治療隊員。');render()}});$('attackBtn').onclick=()=>handleCombatAction('attack');$('defendBtn').onclick=()=>handleCombatAction('defend');$('skillBtn').onclick=()=>{selectedCombatAction=null;if(!skillMenuOpen){skillMenuOpen=true;render();return;}if(state.energy<35){tell('能量不足！必殺技需要 35 點能量。');addLog('必殺技執行失敗：能量不足（需要 35 點）。');return;}skillMenuOpen=false;useSkill()};$('skillBackBtn').onclick=()=>{if(healingTargetMode){healingTargetMode=false;healingSelectedTargetId=null;tell('已取消治療選擇。');}$('skillBackBtn').textContent='↩ 返回';skillMenuOpen=false;render()};$('healBtn').onclick=()=>handleCombatAction('heal');$('resetBtn').onclick=reset;window.history.replaceState({screen:location.hash==='#game'?'game':'lobby'},'',location.hash==='#game'?'#game':'#lobby');const syncScreen=()=>{if(location.hash==='#game')showGame();else if(location.hash==='#archive')openArchive();else if(location.hash==='#summon')openSummon();else showLobby()};window.addEventListener('popstate',syncScreen);window.addEventListener('hashchange',syncScreen);state.coins=TEST_UNLIMITED_COINS;save();if(!Number.isFinite(state.stage)||state.stage<1)state=defaults();
state.stage=Math.min(20,Math.max(1,Number(state.stage)||1));state.cleared=Math.min(20,Math.max(0,Number(state.cleared)||0));if(Number(state.stage)===20&&!Number.isInteger(Number(state.stage20Phase))){state.stage20Phase=0;state.stage20SpecialPending=false;state.stage20Rotation=0;state.stage20BossTurns=0;state.enemyHp=stage20Config().hp;state.enemyEnergy=0;state.pendingEnemySkill=null;state.enemySkillNotice=null}if(state.enemyHp<=0)state.enemyHp=enemy().hp;if(typeof state.bossCharge!=='boolean')state.bossCharge=false;if(state.playerHp<=0)tell('你目前已經被擊倒。按「重新開始遊戲」再次挑戰。');bindBattleFxSettings();render();if(location.hash==='#archive')openArchive();else if(location.hash==='#game'||(typeof restoredChallengeBattle!=='undefined'&&restoredChallengeBattle))showGame();else showLobby();})();

;

(function(){
  function syncPortraitBars(){
    const pairs=[
      [document.querySelector('.player-fighter #playerAvatar'),document.querySelector('.player-fighter #playerHpBar')?.closest('.hp-bar-with-text'),document.querySelector('.player-fighter .player-energy-hud')],
      [document.querySelector('.fighter.enemy #enemyAvatar'),document.querySelector('.fighter.enemy #enemyHpBar')?.closest('.hp-bar-with-text'),document.querySelector('.fighter.enemy .enemy-energy-hud')]
    ];
    pairs.forEach(([portrait,bar,energyHud])=>{
      if(!portrait)return;
      const width=Math.round(portrait.getBoundingClientRect().width);
      if(width>0){
        if(bar){
          bar.style.setProperty('width',width+'px','important');
          bar.style.setProperty('min-width',width+'px','important');
          bar.style.setProperty('max-width',width+'px','important');
          bar.style.setProperty('flex-basis','24px','important');
          bar.style.setProperty('margin-left','auto','important');
          bar.style.setProperty('margin-right','auto','important');
        }
        if(energyHud){
          energyHud.style.setProperty('width',width+'px','important');
          energyHud.style.setProperty('min-width',width+'px','important');
          energyHud.style.setProperty('max-width',width+'px','important');
          energyHud.style.setProperty('margin-left','auto','important');
          energyHud.style.setProperty('margin-right','auto','important');
        }
      }
    });
  }
  function start(){
    syncPortraitBars();
    if('ResizeObserver' in window){
      const ro=new ResizeObserver(syncPortraitBars);
      document.querySelectorAll('#playerAvatar,#enemyAvatar').forEach(el=>ro.observe(el));
    }
    window.addEventListener('resize',syncPortraitBars);
    setTimeout(syncPortraitBars,100);
    setTimeout(syncPortraitBars,500);
    setTimeout(syncPortraitBars,1500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
