// HVQ_CLOUD_SYNC_V1_GOOGLE_APPS_SCRIPT - đồng bộ thư mục/bộ thẻ theo Gmail qua cloud
// HVQ_MOBILE_BOTTOM_NAV_V12_ROOT_DECKS - bấm tab Đã tạo luôn về danh sách thư mục, không tự mở thư mục cũ
const routes = {
  home:["Trang chủ","home"], courses:["Khoá học","book-open"], decks:["Bộ từ vựng","layers"],
  inputData:["Nhập liệu","table-properties"], quizExcel:["Quiz từ Excel","file-spreadsheet"], practice:["Luyện tập","pen-tool"], exam:["Luyện thi","file-check"], community:["Cộng đồng","users"],
  stats:["Thống kê","bar-chart-3"], calendar:["Lịch học","calendar"], leaderboard:["Bảng xếp hạng","trophy"],
  settings:["Cài đặt","settings"]
};
const topRoutes=[
  {route:"home",label:"Trang chủ",icon:"home"},
  {route:"courses",label:"Khóa học",icon:"graduation-cap"},
  {route:"decks",label:"Đã tạo",icon:"folder"},
  {route:"inputData",label:"Nhập liệu",icon:"table-properties"},
  {route:"quizExcel",label:"Quiz Excel",icon:"file-spreadsheet"},
  {route:"community",label:"Lớp học",icon:"users"},
  {route:"leaderboard",label:"Xếp hạng",icon:"trophy"}
];
const mainRoutes=["home","courses","decks","quizExcel","practice","exam","community"];
const toolRoutes=["stats","calendar","leaderboard","settings"];
const decks=[
  {id:1,name:"Hán Việt cơ bản",term:"基礎漢越",total:200,learned:156,newCount:12,icon:"🎯"},
  {id:2,name:"TOPIK II từ vựng",term:"TOPIK II",total:500,learned:287,newCount:25,icon:"🇰🇷"},
  {id:3,name:"Thành ngữ Hán Việt",term:"成語",total:150,learned:89,newCount:8,icon:"📚"},
  {id:4,name:"Chữ Hán theo chủ đề",term:"主題漢字",total:300,learned:134,newCount:18,icon:"🏷️"},
  {id:5,name:"Hán Việt giao tiếp",term:"交際",total:180,learned:45,newCount:30,icon:"💬"},
  {id:6,name:"Từ vựng N3",term:"N3語彙",total:400,learned:210,newCount:15,icon:"🇯🇵"}
];
const courses=[
  {id:1,name:"Hán Việt TOPIK II - Khóa đầy đủ",level:"Trung cấp",lessons:48,done:31,icon:"🇰🇷"},
  {id:2,name:"250 thành ngữ Hán Việt thông dụng",level:"Cơ bản → Nâng cao",lessons:30,done:12,icon:"📚"},
  {id:3,name:"Chữ Hán theo chủ đề hàng ngày",level:"Sơ cấp",lessons:60,done:8,icon:"🏷️"}
];
const words=[
  {term:"勉強",reading:"Miện cường",meaning:"Học tập, nỗ lực"},
  {term:"學習",reading:"Học tập",meaning:"Tiếp thu kiến thức"},
  {term:"經濟",reading:"Kinh tế",meaning:"Hoạt động sản xuất và trao đổi"},
  {term:"社會",reading:"Xã hội",meaning:"Cộng đồng con người"},
  {term:"文化",reading:"Văn hóa",meaning:"Giá trị vật chất và tinh thần"},
  {term:"自然",reading:"Tự nhiên",meaning:"Thế giới không do con người tạo ra"}
];
const quizQuestions=[
  {q:"經濟 có âm Hán Việt là gì?",options:["Kinh tế","Văn hóa","Xã hội","Tự nhiên"],answer:0},
  {q:"社會 nghĩa là gì?",options:["Học tập","Xã hội","Kinh tế","Văn hóa"],answer:1},
  {q:"Chữ nào mang nghĩa “văn hóa”?",options:["自然","學習","文化","經濟"],answer:2}
];
const blankDraftCard=()=>({term:"",definition:"",pronunciation:"",wordType:"",example:"",synonyms:"",image:""});
const defaultLearnSettings={answerDefinition:true,answerTerm:false,starredOnly:false,unmasteredOnly:false,inOrder:false,acceptSynonyms:true,autoAdvance:true,showExample:false,fillBlank:false,multipleChoice:true};
const defaultUser={name:"Khách",email:"",picture:"",sub:"",signedIn:false};
const defaultBackground={mode:"preset",preset:"dotGrid",customUrl:"",opacity:1,overlay:0.08,blur:0};
const defaultExcelQuiz={sourceUrl:"",pasteData:"",questions:[],index:0,score:0,answered:null,shuffle:true,autoAdvance:false,onlyWrong:false,onlyStarred:false,onlyUnmastered:false,pageFilter:"all",wrongIds:[],starredIds:[],correctIds:[],sourceName:"Chưa có dữ liệu"};
const blankLearnSessionStats=()=>({correctIds:[],wrongMap:{},wrongOrder:[],mode:"normal"});
const savedInputSheets={
  "NhapLieu":"https://docs.google.com/spreadsheets/d/188bSTqmXvvU55ht8yJt-wlIwfP3mLiOhebhEStcAwvw/edit?gid=881137373#gid=881137373",
  "trang 21-24":"https://docs.google.com/spreadsheets/d/188bSTqmXvvU55ht8yJt-wlIwfP3mLiOhebhEStcAwvw/edit?gid=418545698#gid=418545698",
  "ngu phap":"https://docs.google.com/spreadsheets/d/188bSTqmXvvU55ht8yJt-wlIwfP3mLiOhebhEStcAwvw/edit?gid=268035535#gid=268035535"
};
const savedInputColumns={
  "NhapLieu":{termCol:"B",meaningCol:"A",exampleCol:"C",synonymCol:"",mergeRows:false},
  "trang 21-24":{termCol:"C",meaningCol:"",exampleCol:"E,F,I",synonymCol:"G",mergeRows:true},
  "ngu phap":{termCol:"D",meaningCol:"E",exampleCol:"F",synonymCol:"G",mergeRows:true}
};
const defaultInputData={sourceType:"sheet",sheetUrl:savedInputSheets.NhapLieu,savedSheet:"NhapLieu",termCol:"B",meaningCol:"A",exampleCol:"C",synonymCol:"",autoDetect:true,mergeRows:false,folderSize:50,lastFileName:"",selected:true,lastAppliedAt:"",lastResult:null};
const defaultState={route:"home",lastOpenedTab:"decks",streak:7,today:146,minutes:42,xp:2340,quizIndex:0,quizScore:0,quizAnswered:null,flashIndex:0,activeCreatedDeck:null,activeCreatedFolder:"",detailCardIndex:0,detailFlipped:false,detailMode:"flashcard",detailSearch:"",detailFilter:"all",detailSort:"original",detailProgress:{},detailStars:{},deckStudyStats:{},learnOrder:[],learnIndex:0,learnOptions:[],learnAnswered:null,learnCorrect:0,learnUnknown:0,learnCompleted:0,learnSessionStats:blankLearnSessionStats(),learnSettings:defaultLearnSettings,excelQuiz:defaultExcelQuiz,inputData:defaultInputData,theme:"dark",dailyGoal:30,notifications:true,background:defaultBackground,calendar:[2,4,6,8,10,12,14,16,18,20,22,24,26],favorites:[1,2],user:defaultUser,createdDecks:[],deckDraft:{title:"",description:"",isPublic:false,suggestions:true,cards:[blankDraftCard()]}};
const googleClientId=document.querySelector('meta[name="google-signin-client_id"]')?.content?.trim()||"";
const freshDefaultState=()=>JSON.parse(JSON.stringify(defaultState));
const storedState=JSON.parse(localStorage.getItem("hvq-state")||"{}");
let state={...freshDefaultState(),...storedState};
state.user={...defaultUser,...(state.user||{})};
state.deckDraft={...defaultState.deckDraft,...(state.deckDraft||{})};
state.deckDraft.cards=state.deckDraft.cards?.length?state.deckDraft.cards.map(card=>({...blankDraftCard(),...card})):[blankDraftCard()];
state.learnSettings={...defaultLearnSettings,...(state.learnSettings||{})};
state.learnSessionStats={...blankLearnSessionStats(),...(state.learnSessionStats||{})};
state.learnSessionStats.wrongMap={...(state.learnSessionStats.wrongMap||{})};
state.learnSessionStats.wrongOrder=Array.isArray(state.learnSessionStats.wrongOrder)?state.learnSessionStats.wrongOrder:[];
state.learnSessionStats.correctIds=Array.isArray(state.learnSessionStats.correctIds)?state.learnSessionStats.correctIds:[];
state.excelQuiz={...defaultExcelQuiz,...(state.excelQuiz||{})};
state.inputData={...defaultInputData,...(state.inputData||{})};
state.deckStudyStats={...(state.deckStudyStats||{})};
state.background={...defaultBackground,...(state.background||{})};
if(state.inputData.savedSheet==="NhapLieu")state.inputData.mergeRows=false;

// ===== HVQ PERSONAL ACCOUNT SCOPE v7 =====
// Mọi dữ liệu cá nhân của 3 tab Đã tạo / Nhập liệu / Quiz Excel được lưu theo từng Gmail.
// Dữ liệu cũ trước đây được tự động chuyển vào Gmail chính dưới đây, không còn hiện ở Khách/Gmail khác.
const HVQ_OWNER_EMAIL="buivantoan1998@gmail.com";
const HVQ_PERSONAL_SCOPE_VERSION="v7";

// ===== HVQ CLOUD SYNC CONFIG =====
// Để máy tính và điện thoại dùng chung thư mục/bộ thẻ theo Gmail:
// 1) Tạo Google Apps Script bằng file hvq_cloud_sync_google_apps_script.gs đi kèm.
// 2) Deploy dạng Web app: Execute as Me, Who has access: Anyone.
// 3) Dán URL /exec vào đây, ví dụ: const HVQ_CLOUD_SYNC_URL="https://script.google.com/macros/s/AKfycb.../exec";
// Khi để trống, app vẫn chạy bình thường nhưng dữ liệu chỉ lưu trên từng thiết bị.
const HVQ_CLOUD_SYNC_URL="https://script.google.com/macros/s/AKfycbz6vt-7sjdo1sWL-B9LriOf6rwn2E3sy2dgqZstMD-m0Kn95Q2WE8NL721ON9UJOj7x7g/exec";
const HVQ_CLOUD_SYNC_APP="hanvietquiz";
const HVQ_PERSONAL_FIELDS=[
  "activeCreatedDeck","activeCreatedFolder","detailCardIndex","detailFlipped","detailMode","detailSearch","detailFilter","detailSort",
  "detailProgress","detailStars","deckStudyStats","learnOrder","learnIndex","learnOptions","learnAnswered","learnCorrect","learnUnknown",
  "learnCompleted","learnSessionStats","learnSettings","excelQuiz","inputData","deckDraft","editingDeckIndex","flashIndex"
];
function hvqClone(value){return JSON.parse(JSON.stringify(value))}
function hvqSafeJson(raw,fallback={}){try{return raw?JSON.parse(raw):fallback}catch{return fallback}}
function hvqNormalizedEmail(value=""){return String(value||"").trim().toLowerCase()}
function hvqAccountKeyFromEmail(email){email=hvqNormalizedEmail(email);return email?`gmail:${email}`:"guest"}
function hvqCurrentAccountKey(){return state.user?.signedIn?hvqAccountKeyFromEmail(state.user.email):"guest"}
function hvqOwnerAccountKey(){return hvqAccountKeyFromEmail(HVQ_OWNER_EMAIL)}
function hvqPersonalStateKey(accountKey=hvqCurrentAccountKey()){return `hvq-personal-state::${accountKey}`}
function hvqPersonalDecksKey(accountKey=hvqCurrentAccountKey()){return `createdDecks::${accountKey}`}
function hvqBlankPersonalState(){return {
  activeCreatedDeck:null,activeCreatedFolder:"",detailCardIndex:0,detailFlipped:false,detailMode:"flashcard",detailSearch:"",detailFilter:"all",detailSort:"original",
  detailProgress:{},detailStars:{},deckStudyStats:{},learnOrder:[],learnIndex:0,learnOptions:[],learnAnswered:null,learnCorrect:0,learnUnknown:0,
  learnCompleted:0,learnSessionStats:blankLearnSessionStats(),learnSettings:hvqClone(defaultLearnSettings),excelQuiz:hvqClone(defaultExcelQuiz),
  inputData:hvqClone(defaultInputData),deckDraft:hvqClone(defaultState.deckDraft),editingDeckIndex:null,flashIndex:0
}}
function hvqNormalizePersonalState(personal={}){
  const next={...hvqBlankPersonalState(),...(personal||{})};
  next.learnSettings={...defaultLearnSettings,...(next.learnSettings||{})};
  next.learnSessionStats={...blankLearnSessionStats(),...(next.learnSessionStats||{})};
  next.learnSessionStats.wrongMap={...(next.learnSessionStats.wrongMap||{})};
  next.learnSessionStats.wrongOrder=Array.isArray(next.learnSessionStats.wrongOrder)?next.learnSessionStats.wrongOrder:[];
  next.learnSessionStats.correctIds=Array.isArray(next.learnSessionStats.correctIds)?next.learnSessionStats.correctIds:[];
  next.excelQuiz={...defaultExcelQuiz,...(next.excelQuiz||{})};
  next.inputData={...defaultInputData,...(next.inputData||{})};
  if(next.inputData.savedSheet==="NhapLieu")next.inputData.mergeRows=false;
  next.deckDraft={...hvqClone(defaultState.deckDraft),...(next.deckDraft||{})};
  next.deckDraft.cards=next.deckDraft.cards?.length?next.deckDraft.cards.map(card=>({...blankDraftCard(),...card})):[blankDraftCard()];
  next.detailProgress={...(next.detailProgress||{})};
  next.detailStars={...(next.detailStars||{})};
  next.deckStudyStats={...(next.deckStudyStats||{})};
  next.learnOrder=Array.isArray(next.learnOrder)?next.learnOrder:[];
  next.learnOptions=Array.isArray(next.learnOptions)?next.learnOptions:[];
  return next;
}
function hvqApplyPersonalState(personal={}){const next=hvqNormalizePersonalState(personal);HVQ_PERSONAL_FIELDS.forEach(k=>state[k]=next[k])}
function hvqCollectPersonalStateFrom(source=state){const out={};HVQ_PERSONAL_FIELDS.forEach(k=>{if(k in source)out[k]=source[k]});return hvqNormalizePersonalState(out)}
function hvqLightStateWithoutPersonal(){const copy={...state};delete copy.createdDecks;HVQ_PERSONAL_FIELDS.forEach(k=>delete copy[k]);return copy}
async function hvqMigrateLegacyPersonalDataToOwner(){
  const flag=`hvq-personal-migrated-owner-${HVQ_PERSONAL_SCOPE_VERSION}`;
  if(localStorage.getItem(flag)==="1")return;
  const ownerKey=hvqOwnerAccountKey();
  const ownerStateKey=hvqPersonalStateKey(ownerKey);
  if(!localStorage.getItem(ownerStateKey)){
    const legacyPersonal=hvqCollectPersonalStateFrom(storedState||{});
    localStorage.setItem(ownerStateKey,JSON.stringify(legacyPersonal));
  }
  try{
    const legacyDecks=await idbGet("createdDecks");
    const ownerDecks=await idbGet(hvqPersonalDecksKey(ownerKey));
    if(Array.isArray(legacyDecks)&&legacyDecks.length&&!(Array.isArray(ownerDecks)&&ownerDecks.length)){
      await idbSet(hvqPersonalDecksKey(ownerKey),legacyDecks);
    }
  }catch{}
  localStorage.setItem(flag,"1");
}
async function hvqLoadCurrentAccountPersonalData(){
  const accountKey=hvqCurrentAccountKey();
  const personal=hvqSafeJson(localStorage.getItem(hvqPersonalStateKey(accountKey)),{});
  hvqApplyPersonalState(personal);
  try{const decks=await idbGet(hvqPersonalDecksKey(accountKey));state.createdDecks=Array.isArray(decks)?decks:[]}catch{state.createdDecks=[]}
  if(!Array.isArray(state.createdDecks))state.createdDecks=[];
}
function hvqSaveCurrentAccountPersonalData(){
  const accountKey=hvqCurrentAccountKey();
  try{localStorage.setItem(hvqPersonalStateKey(accountKey),JSON.stringify(hvqCollectPersonalStateFrom(state)))}catch{}
  persistCreatedDecks();
}


// ===== HVQ CLOUD SYNC v1 =====
// Đồng bộ dữ liệu cá nhân theo Gmail qua Google Apps Script.
// GitHub Pages là web tĩnh nên không tự có database; phần này dùng Web App URL ở HVQ_CLOUD_SYNC_URL làm backend.
let hvqCloudReady=false;
let hvqCloudApplyingRemote=false;
let hvqCloudPushTimer=null;
let hvqCloudLastPayloadHash="";
let hvqCloudLastStatus="local";
function hvqCloudEnabled(){return !!String(HVQ_CLOUD_SYNC_URL||"").trim()}
function hvqCloudLocalStampKey(accountKey=hvqCurrentAccountKey()){return `hvq-cloud-updated-at::${accountKey}`}
function hvqCloudLastSyncKey(accountKey=hvqCurrentAccountKey()){return `hvq-cloud-last-sync-at::${accountKey}`}
function hvqCloudNow(){return new Date().toISOString()}
function hvqCloudGetLocalStamp(accountKey=hvqCurrentAccountKey()){return localStorage.getItem(hvqCloudLocalStampKey(accountKey))||""}
function hvqCloudSetLocalStamp(stamp=hvqCloudNow(),accountKey=hvqCurrentAccountKey()){try{localStorage.setItem(hvqCloudLocalStampKey(accountKey),stamp)}catch{}return stamp}
function hvqCloudMarkLocalChange(){if(hvqCloudApplyingRemote)return;hvqCloudSetLocalStamp()}
function hvqCloudDeckStamp(){return (state.createdDecks||[]).map(d=>d?.updatedAt||d?.createdAt||"").sort().pop()||""}
function hvqCloudHasLocalData(){
  const deckCount=(state.createdDecks||[]).length;
  const draftHasData=!!(state.deckDraft?.title||state.deckDraft?.cards?.some?.(c=>c.term||c.definition||c.example||c.synonyms));
  const excelHasData=!!(state.excelQuiz?.sourceUrl||state.excelQuiz?.pasteData||state.inputData?.sheetUrl);
  return deckCount>0||draftHasData||excelHasData;
}
function hvqCloudLocalUpdatedAt(){return [hvqCloudGetLocalStamp(),hvqCloudDeckStamp()].filter(Boolean).sort().pop()||""}
function hvqCloudBuildSnapshot(){
  const updatedAt=hvqCloudLocalUpdatedAt()||hvqCloudSetLocalStamp();
  return {
    app:HVQ_CLOUD_SYNC_APP,
    version:"1",
    email:hvqNormalizedEmail(state.user?.email||""),
    ownerEmail:HVQ_OWNER_EMAIL,
    updatedAt,
    user:{name:state.user?.name||"",email:state.user?.email||"",picture:state.user?.picture||"",sub:state.user?.sub||""},
    personal:hvqCollectPersonalStateFrom(state),
    createdDecks:Array.isArray(state.createdDecks)?state.createdDecks:[]
  };
}
function hvqCloudSimpleHash(text=""){
  let h=0;for(let i=0;i<text.length;i++)h=((h<<5)-h+text.charCodeAt(i))|0;
  return `${text.length}:${h}`;
}
function hvqCloudJsonp(params={},timeoutMs=9000){
  return new Promise((resolve,reject)=>{
    const callbackName=`hvqCloudCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script=document.createElement("script");
    const done=(ok,value)=>{clearTimeout(timer);try{delete window[callbackName]}catch{}script.remove();ok?resolve(value):reject(value)};
    const timer=setTimeout(()=>done(false,new Error("cloud_timeout")),timeoutMs);
    window[callbackName]=data=>done(true,data);
    const url=new URL(HVQ_CLOUD_SYNC_URL);
    Object.entries({...params,callback:callbackName,_:Date.now()}).forEach(([k,v])=>url.searchParams.set(k,String(v??"")));
    script.onerror=()=>done(false,new Error("cloud_script_error"));
    script.src=url.toString();
    document.head.appendChild(script);
  });
}
function hvqCloudNormalizeSnapshot(data={}){
  if(!data||typeof data!=="object")return null;
  const snap=data.data&&typeof data.data==="object"?data.data:data;
  if(!snap||typeof snap!=="object")return null;
  return {
    updatedAt:String(snap.updatedAt||snap.savedAt||""),
    personal:hvqNormalizePersonalState(snap.personal||snap.state||{}),
    createdDecks:Array.isArray(snap.createdDecks)?snap.createdDecks:[],
    user:snap.user||{}
  };
}
async function hvqCloudApplySnapshot(snapshot,reason="load"){
  if(!snapshot)return false;
  hvqCloudApplyingRemote=true;
  try{
    hvqApplyPersonalState(snapshot.personal||{});
    state.createdDecks=Array.isArray(snapshot.createdDecks)?snapshot.createdDecks:[];
    await idbSet(hvqPersonalDecksKey(),state.createdDecks||[]);
    try{localStorage.setItem(hvqPersonalStateKey(),JSON.stringify(hvqCollectPersonalStateFrom(state)))}catch{}
    hvqCloudSetLocalStamp(snapshot.updatedAt||hvqCloudNow());
    try{localStorage.setItem(hvqCloudLastSyncKey(),hvqCloudNow())}catch{}
    hvqCloudLastStatus="synced";
    return true;
  }finally{hvqCloudApplyingRemote=false}
}
async function hvqCloudPullAndApply(reason="auto"){
  if(!hvqCloudEnabled()||!state.user?.signedIn||!state.user?.email)return false;
  const accountKey=hvqCurrentAccountKey();
  const localStamp=hvqCloudLocalUpdatedAt();
  const localHasData=hvqCloudHasLocalData();
  try{
    const response=await hvqCloudJsonp({action:"load",app:HVQ_CLOUD_SYNC_APP,email:state.user.email,ownerEmail:HVQ_OWNER_EMAIL});
    const snapshot=hvqCloudNormalizeSnapshot(response);
    if(snapshot&&snapshot.updatedAt){
      const cloudIsNewer=!localStamp||snapshot.updatedAt>localStamp;
      const localIsEmpty=!localHasData;
      if(cloudIsNewer||localIsEmpty){
        await hvqCloudApplySnapshot(snapshot,reason);
        if(reason!=="init")showToast("Đã tải dữ liệu từ cloud","cloud");
        return true;
      }
      if(localStamp>snapshot.updatedAt&&localHasData){
        hvqCloudSchedulePush("local-newer");
      }
      return false;
    }
    if(localHasData)hvqCloudSchedulePush("first-upload");
    return false;
  }catch(err){
    hvqCloudLastStatus="offline";
    console.warn("HVQ cloud sync load failed",err);
    if(reason!=="init")showToast("Chưa tải được dữ liệu cloud, app vẫn dùng dữ liệu máy này","wifi-off");
    return false;
  }
}
function hvqCloudSchedulePush(reason="auto"){
  if(!hvqCloudReady||hvqCloudApplyingRemote||!hvqCloudEnabled()||!state.user?.signedIn||!state.user?.email)return;
  clearTimeout(hvqCloudPushTimer);
  hvqCloudPushTimer=setTimeout(()=>hvqCloudPushNow(reason),1400);
}
async function hvqCloudPushNow(reason="manual"){
  if(!hvqCloudEnabled()||!state.user?.signedIn||!state.user?.email)return false;
  const snapshot=hvqCloudBuildSnapshot();
  const payload=JSON.stringify(snapshot);
  const hash=hvqCloudSimpleHash(payload);
  if(hash===hvqCloudLastPayloadHash&&reason!=="manual")return true;
  hvqCloudLastPayloadHash=hash;
  const form=new FormData();
  form.append("action","save");
  form.append("app",HVQ_CLOUD_SYNC_APP);
  form.append("email",snapshot.email);
  form.append("ownerEmail",HVQ_OWNER_EMAIL);
  form.append("updatedAt",snapshot.updatedAt);
  form.append("payload",payload);
  try{
    await fetch(HVQ_CLOUD_SYNC_URL,{method:"POST",mode:"no-cors",body:form});
    try{localStorage.setItem(hvqCloudLastSyncKey(),hvqCloudNow())}catch{}
    hvqCloudLastStatus="synced";
    if(reason==="manual")showToast("Đã gửi dữ liệu lên cloud","cloud");
    return true;
  }catch(err){
    hvqCloudLastStatus="offline";
    console.warn("HVQ cloud sync save failed",err);
    if(reason==="manual")showToast("Chưa gửi được dữ liệu lên cloud","wifi-off");
    return false;
  }
}
async function hvqCloudManualSync(){
  if(!state.user?.signedIn){showToast("Hãy đăng nhập Gmail trước","log-in");return}
  if(!hvqCloudEnabled()){showToast("Chưa cấu hình HVQ_CLOUD_SYNC_URL trong app.js","circle-alert");return}
  await hvqCloudPullAndApply("manual");
  await hvqCloudPushNow("manual");
  render();
}
const app=document.querySelector("#app");

const BACKGROUND_PRESETS={dotGrid:"assets/bg-dot-grid.png"};
function ensureBackgroundStyle(){
  if(document.querySelector("#hvqBackgroundStyle"))return;
  const style=document.createElement("style");
  style.id="hvqBackgroundStyle";
  style.textContent=`
    body.hvq-custom-bg{
      background:#f8fafc !important;
      background-image:none !important;
    }
    body.hvq-custom-bg::before{
      content:"";
      position:fixed;
      inset:0;
      z-index:-2;
      pointer-events:none;
      background-image:var(--hvq-bg-image);
      background-size:cover;
      background-position:center;
      background-repeat:no-repeat;
      background-attachment:fixed;
      opacity:var(--hvq-bg-opacity,1);
      filter:blur(var(--hvq-bg-blur,0px));
      transform:scale(var(--hvq-bg-scale,1));
    }
    body.hvq-custom-bg::after{
      content:"";
      position:fixed;
      inset:0;
      z-index:-1;
      pointer-events:none;
      background:rgba(2,6,23,var(--hvq-bg-overlay,0.08));
    }
    body.hvq-custom-bg #app,
    body.hvq-custom-bg .app,
    body.hvq-custom-bg .app-shell,
    body.hvq-custom-bg .main,
    body.hvq-custom-bg main,
    body.hvq-custom-bg .main-content,
    body.hvq-custom-bg .page,
    body.hvq-custom-bg .content,
    body.hvq-custom-bg .layout,
    body.hvq-custom-bg .workspace{
      background:transparent !important;
    }
    .background-preview-box{
      min-height:160px;
      border:1px solid rgba(148,163,184,.35);
      border-radius:18px;
      background-image:var(--preview-bg-image);
      background-size:cover;
      background-position:center;
      box-shadow:inset 0 0 0 999px rgba(2,6,23,var(--preview-bg-overlay,.08));
    }
    .bg-action-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .range-row{display:flex;align-items:center;gap:12px}.range-row input{flex:1}
  `;
  document.head.appendChild(style);
}
function applyBackgroundStyle(){
  ensureBackgroundStyle();
  const bg={...defaultBackground,...(state.background||{})};
  const url=bg.mode==="custom"&&bg.customUrl?bg.customUrl:bg.mode==="preset"?(BACKGROUND_PRESETS[bg.preset]||BACKGROUND_PRESETS.dotGrid):"";
  document.body.classList.toggle("hvq-custom-bg",!!url);
  if(url){
    document.documentElement.style.setProperty("--hvq-bg-image",`url("${String(url).replace(/"/g,"%22")}")`);
    document.documentElement.style.setProperty("--hvq-bg-opacity",String(Math.max(0.1,Math.min(1,Number(bg.opacity)||1))));
    document.documentElement.style.setProperty("--hvq-bg-overlay",String(Math.max(0,Math.min(0.75,Number(bg.overlay)||0))));
    document.documentElement.style.setProperty("--hvq-bg-blur",`${Math.max(0,Math.min(12,Number(bg.blur)||0))}px`);
    document.documentElement.style.setProperty("--hvq-bg-scale",bg.blur?"1.03":"1");
  }
}
function backgroundPreviewUrl(){
  const bg={...defaultBackground,...(state.background||{})};
  if(bg.mode==="custom"&&bg.customUrl)return bg.customUrl;
  if(bg.mode==="preset")return BACKGROUND_PRESETS[bg.preset]||BACKGROUND_PRESETS.dotGrid;
  return "";
}
function pickBackgroundImage(){
  const input=document.createElement("input");
  input.type="file";
  input.accept="image/*";
  input.onchange=()=>{
    const file=input.files?.[0];
    if(!file)return;
    if(file.size>1800000){showToast("Ảnh nền nên nhỏ hơn 1,8 MB để lưu ổn định","circle-alert");return}
    const reader=new FileReader();
    reader.onload=()=>{
      state.background={...defaultBackground,...(state.background||{}),mode:"custom",customUrl:reader.result};
      save();applyBackgroundStyle();closeQuickBackgroundPanel();render();showToast("Đã đổi ảnh nền");
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
function resetBackground(){
  state.background={...defaultBackground,mode:"preset",preset:"dotGrid",customUrl:""};
  save();applyBackgroundStyle();closeQuickBackgroundPanel();render();showToast("Đã dùng ảnh nền chấm bi");
}

function deckDb(){return new Promise((resolve,reject)=>{if(!window.indexedDB){resolve(null);return}const req=indexedDB.open("hvq-large-store",1);req.onupgradeneeded=()=>req.result.createObjectStore("kv");req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function idbGet(key){const db=await deckDb();if(!db)return null;return new Promise((resolve,reject)=>{const tx=db.transaction("kv","readonly"),req=tx.objectStore("kv").get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function idbSet(key,value){const db=await deckDb();if(!db)return;return new Promise((resolve,reject)=>{const tx=db.transaction("kv","readwrite"),req=tx.objectStore("kv").put(value,key);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})}
async function idbDelete(key){const db=await deckDb();if(!db)return;return new Promise((resolve,reject)=>{const tx=db.transaction("kv","readwrite"),req=tx.objectStore("kv").delete(key);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error)})}
function lightState(){return hvqLightStateWithoutPersonal()}
function persistCreatedDecks(){idbSet(hvqPersonalDecksKey(),state.createdDecks||[]).catch(()=>showToast("Không lưu được bộ thẻ lớn","circle-alert"))}
async function loadCreatedDecks(){await hvqLoadCurrentAccountPersonalData()}
function save(){try{localStorage.setItem("hvq-state",JSON.stringify(lightState()));hvqSaveCurrentAccountPersonalData();hvqCloudMarkLocalChange();hvqCloudSchedulePush("save")}catch{showToast("Bộ thẻ lớn đã được lưu ngoài localStorage","database")}}
function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
function escapeAttr(value=""){return escapeHtml(value)}
function escapeRegExp(value=""){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function normalizeHtmlMarkerText(value=""){return String(value||"").replace(/<br\s*\/?\s*>/gi,"\n")}
function candidateUnderlineTerms(card){
  const term=cleanInputText(card?.term||"");
  const items=[];
  const add=x=>{x=cleanInputText(x);if(x&&x.length>=2&&!items.some(y=>normalizeLearnText(y)===normalizeLearnText(x)))items.push(x)};
  add(term);
  // Thử lấy phần lõi của ngữ pháp để tự gạch chân khi dữ liệu Google Sheet bị mất rich-text.
  const stripped=term
    .replace(/^[VAN]\s*\/\s*[ANV]\s*\+\s*/i,"")
    .replace(/^[VAN]\s*\+\s*/i,"")
    .replace(/^[-~\s]+/,"")
    .replace(/^\(?으\)?\s*/,"")
    .replace(/^\(?ㄴ\)?\/?\(?는\)?\s*/,"")
    .replace(/^\(?으\)?로\s*/,"")
    .replace(/^에\s+/,"")
    .trim();
  add(stripped);
  const words=stripped.split(/\s+/).filter(Boolean);
  if(words.length>=2)add(words.slice(-2).join(" "));
  if(words.length>=3)add(words.slice(-3).join(" "));
  return items.sort((a,b)=>b.length-a.length).slice(0,6);
}
function autoUnderlineHtml(html,card){
  const terms=candidateUnderlineTerms(card).filter(Boolean);
  if(!terms.length)return html;
  let out=html;
  for(const term of terms){
    const re=new RegExp(`(${escapeRegExp(escapeHtml(term))})`,"g");
    out=out.replace(re,"<u>$1</u>");
  }
  return out;
}
function richExampleHtml(value="",card=null){
  let text=normalizeHtmlMarkerText(value);
  if(!text)return "";
  const chunks=[];
  const stash=html=>{const key=`%%HVQ_MARK_${chunks.length}%%`;chunks.push(html);return key};
  text=text.replace(/<u>([\s\S]*?)<\/u>/gi,(_,inner)=>stash(`<u>${escapeHtml(inner)}</u>`));
  text=text.replace(/\[u\]([\s\S]*?)\[\/u\]/gi,(_,inner)=>stash(`<u>${escapeHtml(inner)}</u>`));
  text=text.replace(/__([^_\n][\s\S]*?[^_\n])__/g,(_,inner)=>stash(`<u>${escapeHtml(inner)}</u>`));
  let html=escapeHtml(text);
  chunks.forEach((chunk,i)=>{html=html.replace(`%%HVQ_MARK_${i}%%`,chunk)});
  if(!chunks.length)html=autoUnderlineHtml(html,card);
  return html;
}
function icon(name){return `<span class="iconify" data-icon="lucide:${name}"></span>`}
function button(label,action,kind=""){return `<button class="button ${kind}" data-action="${action}">${label}</button>`}
function progress(value){return `<div class="progress"><i style="width:${value}%"></i></div>`}
function header(title,subtitle,actions=""){return `<header class="page-header"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="flex flex-wrap gap-2">${actions}</div></header>`}
function showToast(text,ico="check-circle"){const el=document.querySelector("#toast");el.querySelector("#toastIcon").dataset.icon=`lucide:${ico}`;el.querySelector("#toastText").textContent=text;el.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.remove("show"),2200)}
function modal(title,body){document.querySelector("#modalTitle").textContent=title;document.querySelector("#modalBody").innerHTML=body;document.querySelector("#modal").classList.add("show")}
function closeModal(){document.querySelector("#modal").classList.remove("show");document.querySelector(".modal-card")?.classList.remove("import-modal","learn-settings-modal")}
function currentUser(){return state.user?.signedIn?state.user:{...defaultUser,name:"Khách"}}
function initials(name="Khách"){return name.trim().split(/\s+/).map(x=>x[0]).join("").slice(-2).toUpperCase()||"HV"}
function userAvatar(user=currentUser()){return user.picture?`<img class="avatar avatar-image" src="${escapeAttr(user.picture)}" alt="${escapeAttr(user.name)}">`:`<span class="avatar">${initials(user.name)}</span>`}
function isGoogleConfigured(){return googleClientId&&googleClientId.includes(".apps.googleusercontent.com")&&!googleClientId.startsWith("PASTE_")}
function parseJwt(token){try{let payload=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");payload+=Array((4-payload.length%4)%4+1).join("=");return JSON.parse(decodeURIComponent(atob(payload).split("").map(c=>`%${("00"+c.charCodeAt(0).toString(16)).slice(-2)}`).join("")))}catch{return null}}
async function handleGoogleCredential(response){const profile=parseJwt(response.credential);if(!profile){showToast("Không đọc được phản hồi từ Google","circle-alert");return}state.user={name:profile.name||profile.given_name||"Người dùng Google",email:profile.email||"",picture:profile.picture||"",sub:profile.sub||"",signedIn:true};await hvqLoadCurrentAccountPersonalData();await hvqCloudPullAndApply("login");hvqCloudReady=true;save();closeModal();render();showToast(`Xin chào ${state.user.name}`)}
function openLoginModal(){modal("Đăng nhập",`<div class="login-panel"><div class="login-icon">${icon("user-round-check")}</div><h3>Đăng nhập HanVietQuiz</h3><p class="muted text-sm">Dùng tài khoản Google để hiển thị hồ sơ và lưu phiên học trên trình duyệt này.</p><div id="googleSignInButton" class="google-signin-slot"></div>${isGoogleConfigured()?"":`<p class="auth-note">${icon("circle-alert")} Chưa có Google Client ID. Hãy thay giá trị meta <strong>google-signin-client_id</strong> trong index.html.</p>`}</div>`);renderGoogleButton()}
async function signOut(){if(state.user?.signedIn)await hvqCloudPushNow("signout");if(window.google?.accounts?.id)google.accounts.id.disableAutoSelect();state.user={...defaultUser};await hvqLoadCurrentAccountPersonalData();save();render();showToast("Đã đăng xuất")}
function renderUserUi(){const user=currentUser();const buttonEl=document.querySelector("#profileButton");buttonEl.innerHTML=`${userAvatar(user)}<span class="hidden sm:inline">${escapeHtml(user.name)}</span>`;document.querySelector("#profileMenu").innerHTML=user.signedIn?`<div class="profile-summary">${userAvatar(user)}<div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email||"Đã đăng nhập Google")}</small></div></div><button class="dropdown-item" data-route="settings">Hồ sơ & cài đặt</button><button class="dropdown-item" data-action="sync-cloud-now">${icon("cloud")} Đồng bộ ngay</button><button class="dropdown-item" data-action="upgrade">Nâng cấp Pro</button><button class="dropdown-item text-red-400" data-action="sign-out">Đăng xuất</button>`:`<div class="profile-summary"><span class="avatar">HV</span><div><strong>Khách</strong><small>Đăng nhập để cá nhân hóa hồ sơ</small></div></div><button class="dropdown-item" data-action="sign-in-google">${icon("log-in")} Đăng nhập Google</button><button class="dropdown-item" data-route="settings">Cài đặt</button>`}
function ensureFixedTopbarStyle(){
  if(document.querySelector("#hvqFixedTopbarStyle"))return;
  const style=document.createElement("style");
  style.id="hvqFixedTopbarStyle";
  style.textContent=`
    :root{--hvq-topbar-height:64px}
    body.hvq-topbar-fixed{padding-top:var(--hvq-topbar-height)!important}
    .hvq-fixed-topbar{
      position:fixed!important;
      top:0!important;
      left:0!important;
      right:0!important;
      width:100%!important;
      min-height:var(--hvq-topbar-height)!important;
      z-index:2147483000!important;
      background:rgba(15,23,42,.92)!important;
      border-bottom:1px solid rgba(148,163,184,.18)!important;
      backdrop-filter:blur(18px)!important;
      -webkit-backdrop-filter:blur(18px)!important;
      display:flex!important;
      visibility:visible!important;
      opacity:1!important;
      transform:none!important;
      pointer-events:auto!important;
    }
    body.hvq-custom-bg .hvq-fixed-topbar{background:rgba(15,23,42,.78)!important}
    body.learn-mode .hvq-fixed-topbar,
    body.learn-mode header.hvq-fixed-topbar,
    body.learn-mode .topbar.hvq-fixed-topbar,
    body.learn-mode .app-header.hvq-fixed-topbar{
      display:flex!important;
      visibility:visible!important;
      opacity:1!important;
      transform:none!important;
      pointer-events:auto!important;
      position:fixed!important;
    }
    #hvqQuickBackgroundButton,
    .hvq-top-bg-button{
      display:inline-flex!important;
      align-items:center;
      justify-content:center;
      gap:8px;
      min-height:38px;
      padding:0 12px;
      border:0;
      border-radius:12px;
      color:#e5e7eb;
      background:transparent;
      font-weight:700;
      cursor:pointer;
      white-space:nowrap;
    }
    #hvqQuickBackgroundButton:hover,
    .hvq-top-bg-button:hover{background:rgba(148,163,184,.14)}
    
    .hvq-fixed-topbar .page-header,
    .hvq-fixed-topbar h1,
    .hvq-fixed-topbar .page-header h1{position:static!important}
    body.hvq-topbar-fixed #app,
    body.hvq-topbar-fixed .app,
    body.hvq-topbar-fixed main,
    body.hvq-topbar-fixed .main-content,
    body.hvq-topbar-fixed .workspace,
    body.hvq-topbar-fixed .page{padding-top:0!important;margin-top:0!important}
    body.hvq-topbar-fixed .sidebar,
    body.hvq-topbar-fixed aside,
    body.hvq-topbar-fixed #mainSidebar,
    body.hvq-topbar-fixed #toolSidebar{padding-top:12px}

    
    


    /* GitHub Pages fix: giữ cụm phải nằm ngang, không bị xếp dọc/làm tối màn hình */
    .hvq-fixed-topbar{
      height:var(--hvq-topbar-height)!important;
      min-height:var(--hvq-topbar-height)!important;
      max-height:var(--hvq-topbar-height)!important;
      flex-direction:row!important;
      align-items:center!important;
      overflow:visible!important;
    }
    #hvqTopbarRightActions{
      display:flex!important;
      flex-direction:row!important;
      align-items:center!important;
      justify-content:flex-end!important;
      gap:10px!important;
      margin-left:auto!important;
      height:var(--hvq-topbar-height)!important;
      min-height:var(--hvq-topbar-height)!important;
      position:static!important;
      float:none!important;
      transform:none!important;
      white-space:nowrap!important;
    }
    #hvqTopbarRightActions > *{
      display:inline-flex!important;
      flex-direction:row!important;
      align-items:center!important;
      justify-content:center!important;
      position:static!important;
      float:none!important;
      transform:none!important;
      margin:0!important;
      visibility:visible!important;
      opacity:1!important;
    }

    /* Căn lại cụm bên phải của top bar: Đổi hình nền / tìm kiếm / thông báo / profile */
    .hvq-fixed-topbar{
      flex-direction:row!important;
      align-items:center!important;
      gap:14px!important;
      overflow:visible!important;
    }
    .hvq-fixed-topbar #topNav{
      flex:1 1 auto!important;
      min-width:0!important;
    }
    #hvqTopbarRightActions{
      margin-left:auto!important;
      margin-right:14px!important;
      padding-right:0!important;
      min-height:var(--hvq-topbar-height)!important;
      display:flex!important;
      flex-direction:row!important;
      align-items:center!important;
      justify-content:flex-end!important;
      gap:10px!important;
      flex:0 0 auto!important;
      white-space:nowrap!important;
      position:static!important;
      visibility:visible!important;
      opacity:1!important;
      z-index:2147483002!important;
    }
    #hvqTopbarRightActions > *{
      position:static!important;
      float:none!important;
      transform:none!important;
      margin-top:0!important;
      margin-bottom:0!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      visibility:visible!important;
      opacity:1!important;
    }
    #hvqQuickBackgroundButton{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      gap:8px!important;
      min-height:38px!important;
      padding:0 12px!important;
      color:#e5e7eb!important;
      background:transparent!important;
      border:0!important;
      border-radius:12px!important;
      font-weight:700!important;
      cursor:pointer!important;
      white-space:nowrap!important;
    }
    #hvqQuickBackgroundButton:hover{background:rgba(148,163,184,.14)!important}
    .hvq-fixed-topbar #searchButton,
    .hvq-fixed-topbar #notificationButton{
      width:38px!important;
      height:38px!important;
      min-width:38px!important;
      border-radius:12px!important;
      color:#cbd5e1!important;
      background:transparent!important;
    }
    .hvq-fixed-topbar #profileButton{
      min-height:40px!important;
      padding:0 10px!important;
      border-radius:14px!important;
      color:#f8fafc!important;
      background:transparent!important;
      gap:8px!important;
    }
    .hvq-fixed-topbar #profileButton .avatar,
    .hvq-fixed-topbar #profileButton img.avatar{
      width:34px!important;
      height:34px!important;
      min-width:34px!important;
    }
    @media(max-width:980px){
      #hvqQuickBackgroundButton span{display:none!important}
      #hvqTopbarRightActions{gap:6px!important;margin-right:8px!important}
    }

    /* Xóa gạch chân dưới tab đang chọn trên thanh menu trên cùng */
    .hvq-fixed-topbar .nav-button,
    .hvq-fixed-topbar .nav-button.active,
    .hvq-fixed-topbar [data-route]{
      text-decoration:none!important;
      border-bottom:0!important;
      box-shadow:none!important;
    }
    .hvq-fixed-topbar .nav-button::after,
    .hvq-fixed-topbar .nav-button.active::after,
    .hvq-fixed-topbar [data-route]::after{
      display:none!important;
      content:none!important;
      width:0!important;
      height:0!important;
      border:0!important;
      background:transparent!important;
    }

    .page-header.hvq-fixed-topbar{position:static!important;display:flex!important;background:transparent!important;border-bottom:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;z-index:auto!important;min-height:auto!important;width:auto!important}
    #topNav{display:flex!important;align-items:center!important;visibility:visible!important;opacity:1!important}
    .hvq-fixed-topbar #topNav{display:flex!important}

    #hvqQuickBackgroundButton .iconify{font-size:18px}
    #hvqQuickBackgroundPanel{
      position:fixed;
      top:calc(var(--hvq-topbar-height) + 10px);
      right:18px;
      width:min(360px,calc(100vw - 28px));
      z-index:2147483001;
      border:1px solid rgba(148,163,184,.25);
      border-radius:18px;
      background:rgba(15,23,42,.96);
      box-shadow:0 20px 60px rgba(0,0,0,.38);
      backdrop-filter:blur(18px);
      -webkit-backdrop-filter:blur(18px);
      padding:14px;
      color:#e5e7eb;
    }
    .quick-bg-menu{display:flex;flex-direction:column;gap:12px}
    .quick-bg-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .quick-bg-actions .button{width:100%;justify-content:center}
    .quick-bg-actions .button.full{grid-column:1/-1}
    .quick-bg-preview{min-height:130px;border:1px solid rgba(148,163,184,.25);border-radius:16px;background-image:var(--quick-bg-preview);background-size:cover;background-position:center;box-shadow:inset 0 0 0 999px rgba(2,6,23,.08)}
    .quick-bg-title{display:flex;justify-content:space-between;align-items:center;font-weight:800}
    .quick-bg-close{border:0;background:rgba(148,163,184,.12);color:#e5e7eb;border-radius:10px;min-width:34px;min-height:30px;cursor:pointer}
    @media(max-width:820px){#hvqQuickBackgroundButton span{display:none}#hvqQuickBackgroundButton{padding:0 10px}}


    /* HVQ_MOBILE_TOPBAR_FIXED_V9_CSS - Mobile fix: trên điện thoại chỉ hiện 4 tab chính để không bị chồng chữ */
    @media(max-width:640px){
      :root{--hvq-topbar-height:66px}
      .hvq-fixed-topbar{
        gap:6px!important;
        padding:0 6px!important;
        overflow:hidden!important;
      }
      #hvqBrandLogoLink{
        width:34px!important;
        height:34px!important;
        min-width:34px!important;
        margin-right:2px!important;
      }
      #hvqBrandLogoLink img{
        width:38px!important;
        height:38px!important;
      }
      .hvq-fixed-topbar #topNav,
      #topNav{
        flex:1 1 auto!important;
        min-width:0!important;
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        align-items:center!important;
        gap:2px!important;
        width:auto!important;
        overflow:visible!important;
      }
      .hvq-fixed-topbar #topNav .nav-button{
        min-width:0!important;
        width:100%!important;
        max-width:none!important;
        height:46px!important;
        padding:3px 2px!important;
        border-radius:12px!important;
        display:none!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        gap:2px!important;
        font-size:10.5px!important;
        line-height:1.05!important;
        white-space:normal!important;
        text-align:center!important;
      }
      .hvq-fixed-topbar #topNav .nav-button[data-route="home"],
      .hvq-fixed-topbar #topNav .nav-button[data-route="decks"],
      .hvq-fixed-topbar #topNav .nav-button[data-route="inputData"],
      .hvq-fixed-topbar #topNav .nav-button[data-route="quizExcel"]{
        display:inline-flex!important;
      }
      .hvq-fixed-topbar #topNav .nav-button .iconify{
        font-size:15px!important;
        min-width:15px!important;
      }
      .hvq-fixed-topbar #topNav .nav-button span:not(.iconify){
        display:block!important;
        max-width:100%!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      #hvqTopbarRightActions{
        display:none!important;
        width:0!important;
        min-width:0!important;
        margin:0!important;
        padding:0!important;
      }
      body.hvq-topbar-fixed .sidebar,
      body.hvq-topbar-fixed aside,
      body.hvq-topbar-fixed #mainSidebar,
      body.hvq-topbar-fixed #toolSidebar{
        display:none!important;
      }
      body.hvq-topbar-fixed main,
      body.hvq-topbar-fixed .main,
      body.hvq-topbar-fixed .main-content,
      body.hvq-topbar-fixed .workspace,
      body.hvq-topbar-fixed .page{
        width:100%!important;
        margin-left:0!important;
        padding-left:12px!important;
        padding-right:12px!important;
      }
    }
  `;
  document.head.appendChild(style);
}
function findTopbarElement(){
  const topNav=document.querySelector("#topNav");
  if(!topNav)return null;

  // Chỉ nhận thanh chứa #topNav. Tuyệt đối không lấy header nội dung như "Xin chào, Khách" hoặc "Đã tạo".
  let el=topNav;
  for(let depth=0; depth<5 && el && el!==document.body && el!==document.documentElement; depth++, el=el.parentElement){
    const hasTopNav=!!el.querySelector?.("#topNav");
    const hasPageHeader=!!el.querySelector?.(".page-header");
    const text=(el.textContent||"").trim();
    const isContentHeader=/^(Xin chào|Đã tạo|Trang chủ|Khoá học|Khóa học|Quiz|Nhập liệu|Luyện tập)/i.test(text);
    if(hasTopNav && !hasPageHeader && !isContentHeader){
      return el;
    }
  }
  return topNav.parentElement || null;
}


function ensureFixedTopbar(){
  ensureFixedTopbarStyle();

  // Khôi phục mọi page-header nếu lỡ bị fixed từ bản cũ.
  document.querySelectorAll(".page-header").forEach(el=>{
    el.classList.remove("hvq-fixed-topbar");
    el.style.removeProperty("position");
    el.style.removeProperty("top");
    el.style.removeProperty("left");
    el.style.removeProperty("right");
    el.style.removeProperty("z-index");
    el.style.removeProperty("width");
    el.style.removeProperty("display");
    el.style.removeProperty("visibility");
    el.style.removeProperty("opacity");
  });

  const topbar=findTopbarElement();
  if(!topbar || !topbar.querySelector?.("#topNav")){
    document.body.classList.remove("hvq-topbar-fixed");
    return;
  }

  document.body.classList.add("hvq-topbar-fixed");

  topbar.classList.add("hvq-fixed-topbar");
  topbar.style.setProperty("display","flex","important");
  topbar.style.setProperty("align-items","center","important");
  topbar.style.setProperty("visibility","visible","important");
  topbar.style.setProperty("opacity","1","important");
  topbar.style.setProperty("position","fixed","important");
  topbar.style.setProperty("top","0","important");
  topbar.style.setProperty("left","0","important");
  topbar.style.setProperty("right","0","important");
  topbar.style.setProperty("width","100%","important");
  topbar.style.setProperty("z-index","2147483000","important");

  ensureTopBackgroundButton(topbar);
}


function ensureTopBackgroundButton(topbar=null){
  ensureMobileBottomNavStyle();
  topbar = topbar || document.querySelector(".hvq-fixed-topbar") || findTopbarElement();
  if(!topbar)return;

  // Khóa chiều cao topbar để GitHub không làm nó phình xuống thành lớp phủ tối.
  topbar.style.setProperty("height","var(--hvq-topbar-height)","important");
  topbar.style.setProperty("min-height","var(--hvq-topbar-height)","important");
  topbar.style.setProperty("max-height","var(--hvq-topbar-height)","important");
  topbar.style.setProperty("display","flex","important");
  topbar.style.setProperty("flex-direction","row","important");
  topbar.style.setProperty("align-items","center","important");
  topbar.style.setProperty("gap","14px","important");
  topbar.style.setProperty("overflow","visible","important");

  const topNav=document.querySelector("#topNav");
  if(topNav){
    topNav.style.setProperty("display","flex","important");
    topNav.style.setProperty("flex-direction","row","important");
    topNav.style.setProperty("align-items","center","important");
    topNav.style.setProperty("gap","6px","important");
    topNav.style.setProperty("flex","1 1 auto","important");
    topNav.style.setProperty("min-width","0","important");
  }

  let rightHost=document.querySelector("#hvqTopbarRightActions");
  if(!rightHost){
    rightHost=document.createElement("div");
    rightHost.id="hvqTopbarRightActions";
    rightHost.className="hvq-topbar-right-actions";
  }

  if(!topbar.contains(rightHost)){
    topbar.appendChild(rightHost);
  }

  // Ép layout bằng inline style để khi chạy GitHub cũng giống localhost.
  rightHost.style.setProperty("display","flex","important");
  rightHost.style.setProperty("flex-direction","row","important");
  rightHost.style.setProperty("align-items","center","important");
  rightHost.style.setProperty("justify-content","flex-end","important");
  rightHost.style.setProperty("gap","10px","important");
  rightHost.style.setProperty("margin-left","auto","important");
  rightHost.style.setProperty("margin-right","14px","important");
  rightHost.style.setProperty("padding","0","important");
  rightHost.style.setProperty("height","var(--hvq-topbar-height)","important");
  rightHost.style.setProperty("min-height","var(--hvq-topbar-height)","important");
  rightHost.style.setProperty("position","static","important");
  rightHost.style.setProperty("float","none","important");
  rightHost.style.setProperty("transform","none","important");
  rightHost.style.setProperty("white-space","nowrap","important");
  rightHost.style.setProperty("visibility","visible","important");
  rightHost.style.setProperty("opacity","1","important");
  rightHost.style.setProperty("z-index","2147483002","important");

  let bgBtn=document.querySelector("#hvqQuickBackgroundButton");
  if(!bgBtn){
    bgBtn=document.createElement("button");
    bgBtn.id="hvqQuickBackgroundButton";
    bgBtn.type="button";
    bgBtn.className="hvq-top-bg-button";
    bgBtn.dataset.action="quick-background";
    bgBtn.innerHTML=`${icon("image")}<span>Đổi hình nền</span>`;
  }

  const search=document.querySelector("#searchButton");
  const notification=document.querySelector("#notificationButton");
  const profile=document.querySelector("#profileButton");

  [bgBtn,search,notification,profile].forEach(el=>{
    if(!el)return;
    if(!rightHost.contains(el))rightHost.appendChild(el);
    el.classList.remove("hvq-old-logo-hidden");
    el.style.setProperty("display","inline-flex","important");
    el.style.setProperty("flex-direction","row","important");
    el.style.setProperty("align-items","center","important");
    el.style.setProperty("justify-content","center","important");
    el.style.setProperty("visibility","visible","important");
    el.style.setProperty("opacity","1","important");
    el.style.setProperty("position","static","important");
    el.style.setProperty("float","none","important");
    el.style.setProperty("transform","none","important");
    el.style.setProperty("margin","0","important");
    el.style.setProperty("white-space","nowrap","important");
  });

  if(bgBtn){
    bgBtn.style.setProperty("height","38px","important");
    bgBtn.style.setProperty("min-height","38px","important");
    bgBtn.style.setProperty("padding","0 12px","important");
    bgBtn.style.setProperty("gap","8px","important");
  }
  if(search){
    search.style.setProperty("width","38px","important");
    search.style.setProperty("height","38px","important");
    search.style.setProperty("min-width","38px","important");
  }
  if(notification){
    notification.style.setProperty("width","38px","important");
    notification.style.setProperty("height","38px","important");
    notification.style.setProperty("min-width","38px","important");
  }
  if(profile){
    profile.style.setProperty("min-height","40px","important");
    profile.style.setProperty("padding","0 10px","important");
    profile.style.setProperty("gap","8px","important");
  }
  applyMobileTopbarCompactMode(topbar);

}




function ensureMobileBottomNavStyle(){
  if(document.querySelector("#hvqMobileBottomNavStyle"))return;
  const style=document.createElement("style");
  style.id="hvqMobileBottomNavStyle";
  style.textContent=`
    @media (max-width:640px){
      :root{--hvq-mobile-bottom-nav-height:72px}
      body.hvq-topbar-fixed{
        padding-top:0!important;
        padding-bottom:calc(var(--hvq-mobile-bottom-nav-height) + env(safe-area-inset-bottom,0px))!important;
      }
      .hvq-fixed-topbar{
        top:auto!important;
        bottom:0!important;
        left:0!important;
        right:0!important;
        width:100%!important;
        height:var(--hvq-mobile-bottom-nav-height)!important;
        min-height:var(--hvq-mobile-bottom-nav-height)!important;
        max-height:var(--hvq-mobile-bottom-nav-height)!important;
        border-top:1px solid rgba(148,163,184,.18)!important;
        border-bottom:0!important;
        padding-bottom:env(safe-area-inset-bottom,0px)!important;
      }
      .hvq-fixed-topbar #topNav{
        width:100%!important;
      }
    }
  `;
  document.head.appendChild(style);
}

function applyMobileTopbarCompactMode(topbar=null){
  topbar = topbar || document.querySelector(".hvq-fixed-topbar") || findTopbarElement();
  const topNav=document.querySelector("#topNav");
  const rightHost=document.querySelector("#hvqTopbarRightActions");
  const brand=document.querySelector("#hvqBrandLogoLink");
  const isMobile=window.matchMedia && window.matchMedia("(max-width:640px)").matches;
  if(!topbar || !topNav)return;

  const mobileRoutes=new Set(["home","decks","inputData","quizExcel"]);
  topNav.querySelectorAll(".nav-button").forEach(btn=>{
    const keep=mobileRoutes.has(btn.dataset.route||"");
    if(isMobile){
      btn.style.setProperty("display",keep?"inline-flex":"none","important");
      btn.style.setProperty("width","100%","important");
      btn.style.setProperty("min-width","0","important");
      btn.style.setProperty("height","46px","important");
      btn.style.setProperty("padding","3px 1px","important");
      btn.style.setProperty("border-radius","12px","important");
      btn.style.setProperty("flex-direction","column","important");
      btn.style.setProperty("align-items","center","important");
      btn.style.setProperty("justify-content","center","important");
      btn.style.setProperty("gap","2px","important");
      btn.style.setProperty("font-size","10px","important");
      btn.style.setProperty("line-height","1.05","important");
      btn.style.setProperty("white-space","normal","important");
      btn.style.setProperty("text-align","center","important");
      btn.querySelectorAll(".iconify").forEach(ic=>{
        ic.style.setProperty("font-size","15px","important");
        ic.style.setProperty("min-width","15px","important");
      });
    }else{
      ["display","width","min-width","height","padding","border-radius","flex-direction","align-items","justify-content","gap","font-size","line-height","white-space","text-align"].forEach(k=>btn.style.removeProperty(k));
      btn.querySelectorAll(".iconify").forEach(ic=>{
        ic.style.removeProperty("font-size");
        ic.style.removeProperty("min-width");
      });
    }
  });

  if(isMobile){
    document.documentElement.style.setProperty("--hvq-topbar-height","0px");
    document.documentElement.style.setProperty("--hvq-mobile-bottom-nav-height","72px");
    topbar.style.setProperty("height","72px","important");
    topbar.style.setProperty("min-height","72px","important");
    topbar.style.setProperty("max-height","72px","important");
    topbar.style.setProperty("display","flex","important");
    topbar.style.setProperty("flex-direction","row","important");
    topbar.style.setProperty("align-items","center","important");
    topbar.style.setProperty("justify-content","center","important");
    topbar.style.setProperty("gap","0","important");
    topbar.style.setProperty("padding","6px 8px","important");
    topbar.style.setProperty("overflow","hidden","important");
    topbar.style.setProperty("top","auto","important");
    topbar.style.setProperty("bottom","0","important");
    topbar.style.setProperty("left","0","important");
    topbar.style.setProperty("right","0","important");
    topbar.style.setProperty("border-top","1px solid rgba(148,163,184,.18)","important");
    topbar.style.setProperty("border-bottom","0","important");

    if(brand){
      brand.style.setProperty("display","none","important");
      brand.style.setProperty("visibility","hidden","important");
      brand.style.setProperty("opacity","0","important");
      brand.style.setProperty("width","0","important");
      brand.style.setProperty("height","0","important");
      brand.style.setProperty("min-width","0","important");
      brand.style.setProperty("margin","0","important");
      brand.querySelectorAll("img").forEach(img=>{
        img.style.setProperty("width","0","important");
        img.style.setProperty("height","0","important");
      });
    }

    topNav.style.setProperty("display","grid","important");
    topNav.style.setProperty("grid-template-columns","repeat(4,minmax(0,1fr))","important");
    topNav.style.setProperty("align-items","center","important");
    topNav.style.setProperty("justify-items","stretch","important");
    topNav.style.setProperty("gap","4px","important");
    topNav.style.setProperty("flex","1 1 100%","important");
    topNav.style.setProperty("min-width","0","important");
    topNav.style.setProperty("width","100%","important");
    topNav.style.setProperty("overflow","hidden","important");

    if(rightHost){
      rightHost.style.setProperty("display","none","important");
      rightHost.style.setProperty("visibility","hidden","important");
      rightHost.style.setProperty("opacity","0","important");
      rightHost.style.setProperty("width","0","important");
      rightHost.style.setProperty("min-width","0","important");
      rightHost.style.setProperty("height","0","important");
      rightHost.style.setProperty("min-height","0","important");
      rightHost.style.setProperty("margin","0","important");
      rightHost.style.setProperty("padding","0","important");
      rightHost.style.setProperty("overflow","hidden","important");
      rightHost.querySelectorAll("*").forEach(el=>{
        el.style.setProperty("display","none","important");
        el.style.setProperty("visibility","hidden","important");
        el.style.setProperty("opacity","0","important");
        el.style.setProperty("pointer-events","none","important");
      });
    }

    ["#hvqQuickBackgroundButton","#searchButton","#notificationButton","#profileButton","#profileMenu"].forEach(sel=>{
      document.querySelectorAll(sel).forEach(el=>{
        if(sel==="#profileMenu" || el.closest(".hvq-fixed-topbar")){
          el.style.setProperty("display","none","important");
          el.style.setProperty("visibility","hidden","important");
          el.style.setProperty("opacity","0","important");
          el.style.setProperty("pointer-events","none","important");
        }
      });
    });
    document.querySelectorAll("#mainSidebar,#toolSidebar,.sidebar,aside").forEach(el=>el.style.setProperty("display","none","important"));
  }else{
    document.documentElement.style.removeProperty("--hvq-topbar-height");
    document.documentElement.style.removeProperty("--hvq-mobile-bottom-nav-height");
    topbar.style.removeProperty("bottom");
    topbar.style.setProperty("top","0","important");
    topbar.style.removeProperty("justify-content");
    topbar.style.removeProperty("border-top");
    topbar.style.removeProperty("border-bottom");
    if(brand){
      ["display","visibility","opacity","width","height","min-width","margin"].forEach(k=>brand.style.removeProperty(k));
      brand.querySelectorAll("img").forEach(img=>["width","height"].forEach(k=>img.style.removeProperty(k)));
    }
    if(rightHost){
      ["display","visibility","opacity","width","min-width","height","min-height","margin","padding","overflow"].forEach(k=>rightHost.style.removeProperty(k));
      rightHost.querySelectorAll("*").forEach(el=>["display","visibility","opacity","pointer-events"].forEach(k=>el.style.removeProperty(k)));
    }
  }
}

function closeQuickBackgroundPanel(){document.querySelector("#hvqQuickBackgroundPanel")?.remove()}
function openQuickBackgroundPanel(){
  const old=document.querySelector("#hvqQuickBackgroundPanel");
  if(old){old.remove();return}
  closeModal?.();
  const preview=backgroundPreviewUrl();
  const panel=document.createElement("div");
  panel.id="hvqQuickBackgroundPanel";
  panel.innerHTML=`<div class="quick-bg-menu">
    <div class="quick-bg-title"><span>${icon("image")} Đổi hình nền</span><button class="quick-bg-close" data-action="close-quick-background">×</button></div>
    <div class="quick-bg-preview" style="--quick-bg-preview:${preview?`url('${escapeAttr(preview)}')`:"linear-gradient(135deg,#0f172a,#111827)"}"></div>
    <div class="quick-bg-actions">
      <button class="button primary" data-action="pick-background">${icon("upload")} Chọn ảnh</button>
      <button class="button" data-action="reset-background">${icon("sparkles")} Chấm bi</button>
      <button class="button danger" data-action="clear-background">Tắt nền</button>
      <button class="button" data-route="settings">${icon("sliders-horizontal")} Chi tiết</button>
    </div>
  </div>`;
  document.body.appendChild(panel);
}
function openQuickBackgroundModal(){openQuickBackgroundPanel()}
function ensureBrandLogoStyle(){
  if(document.querySelector("#hvqBrandLogoStyle"))return;
  const style=document.createElement("style");
  style.id="hvqBrandLogoStyle";
  style.textContent=`
    #hvqBrandLogoLink{display:inline-flex!important;align-items:center;justify-content:center;flex:0 0 auto;width:44px;height:44px;margin-right:12px;border-radius:14px;text-decoration:none}
    #hvqBrandLogoLink img{display:block;width:52px;height:52px;object-fit:contain;border-radius:12px}
    .hvq-old-logo-hidden{display:none!important}
    .hvq-brand-replaced{object-fit:contain!important;border-radius:12px}
  `;
  document.head.appendChild(style);
}
function applyCustomLogo(){
  ensureBrandLogoStyle();
  const logoUrl='assets/hq-logo-nw.png';
  const topNav=document.querySelector('#topNav');
  const topbar=document.querySelector('.hvq-fixed-topbar')||findTopbarElement();
  const host=(topNav?.parentElement)||topbar;
  let brand=document.querySelector('#hvqBrandLogoLink');

  if(!brand && host){
    brand=document.createElement('a');
    brand.id='hvqBrandLogoLink';
    brand.href='#';
    brand.dataset.route='home';
    brand.setAttribute('aria-label','HanVietQuiz');
    brand.innerHTML=`<img src="${logoUrl}" alt="HanVietQuiz logo">`;
    host.insertBefore(brand, host.firstChild);
  }else if(brand){
    const img=brand.querySelector('img')||document.createElement('img');
    img.src=logoUrl;
    img.alt='HanVietQuiz logo';
    if(!img.parentElement)brand.appendChild(img);
  }

  // Chỉ ẩn logo cũ màu xanh/tím nếu nó nằm NGAY trước #topNav.
  // Không ẩn các cụm nút bên phải như Đổi hình nền / tìm kiếm / thông báo / đăng nhập.
  if(host && topNav && host.contains(topNav)){
    [...host.children].forEach(child=>{
      if(child===brand || child===topNav || child.id==='hvqQuickBackgroundButton' || child.id==='profileButton' || child.id==='searchButton' || child.id==='notificationButton')return;
      const beforeTopNav = !!(child.compareDocumentPosition(topNav) & Node.DOCUMENT_POSITION_FOLLOWING);
      const containsLogoImg = !!child.querySelector?.('img,svg') || child.matches?.('img,svg');
      const hasInteractive = !!child.querySelector?.('button,[data-action],[data-route],input,select,a:not([href="#"])');
      const looksLikeOldLogo = beforeTopNav && containsLogoImg && !hasInteractive;
      if(looksLikeOldLogo){
        child.classList.add('hvq-old-logo-hidden');
        child.style.setProperty('display','none','important');
      }
    });
  }

  let favicon=document.querySelector('link[rel="icon"]')||document.querySelector('link[rel="shortcut icon"]');
  if(!favicon){
    favicon=document.createElement('link');
    favicon.rel='icon';
    document.head.appendChild(favicon);
  }
  favicon.href=logoUrl;
}

function renderGoogleButton(){if(!isGoogleConfigured())return;const target=document.querySelector("#googleSignInButton");if(!target||!window.google?.accounts?.id)return;target.innerHTML="";google.accounts.id.initialize({client_id:googleClientId,callback:handleGoogleCredential,auto_select:false});google.accounts.id.renderButton(target,{theme:"filled_black",size:"large",type:"standard",shape:"pill",text:"signin_with",logo_alignment:"left",locale:"vi",width:260})}
window.initGoogleAuth=()=>renderGoogleButton();

function renderNav(){
  document.querySelector("#topNav").innerHTML=topRoutes.map(item=>`
    <button class="nav-button ${(state.route===item.route||(["createDeck","deckDetail"].includes(state.route)&&item.route==="decks"))?"active":""}" data-route="${item.route}">
      ${icon(item.icon)}<span>${item.label}</span>
    </button>
  `).join("");
  document.querySelector("#mainSidebar").innerHTML=mainRoutes.map(k=>`<button class="sidebar-button ${(state.route===k||(["createDeck","deckDetail"].includes(state.route)&&k==="decks"))?"active":""}" data-route="${k}">${icon(routes[k][1])}<span>${routes[k][0]}</span>${k==="courses"?'<span class="badge">3</span>':""}</button>`).join("");
  document.querySelector("#toolSidebar").innerHTML=toolRoutes.map(k=>`<button class="sidebar-button ${state.route===k?"active":""}" data-route="${k}">${icon(routes[k][1])}<span>${routes[k][0]}</span></button>`).join("");
}
const hvqRouteHistoryKey="hvq-route-back-stack";
let hvqLastNavSnapshot=null;
let hvqRestoringBack=false;
function navSnapshot(){return {route:state.route,activeCreatedFolder:state.activeCreatedFolder||"",activeCreatedDeck:Number.isInteger(state.activeCreatedDeck)?state.activeCreatedDeck:null,detailMode:state.detailMode||"flashcard"}}
function navSnapshotKey(snapshot){return JSON.stringify(snapshot||{})}
function readRouteBackStack(){try{const stack=JSON.parse(sessionStorage.getItem(hvqRouteHistoryKey)||"[]");return Array.isArray(stack)?stack:[]}catch{return[]}}
function writeRouteBackStack(stack){try{sessionStorage.setItem(hvqRouteHistoryKey,JSON.stringify(stack.slice(-80)))}catch{}}
function rememberNavigation(){
  const current=navSnapshot();
  if(!hvqLastNavSnapshot){hvqLastNavSnapshot=current;return}
  if(navSnapshotKey(current)===navSnapshotKey(hvqLastNavSnapshot))return;
  if(!hvqRestoringBack){
    const stack=readRouteBackStack();
    if(!stack.length||navSnapshotKey(stack[stack.length-1])!==navSnapshotKey(hvqLastNavSnapshot)){stack.push(hvqLastNavSnapshot);writeRouteBackStack(stack)}
  }
  hvqLastNavSnapshot=current;
  hvqRestoringBack=false;
}
function restoreNavSnapshot(snapshot){
  if(!snapshot||!routes[snapshot.route])return false;
  hvqRestoringBack=true;
  state.route=snapshot.route;
  state.activeCreatedFolder=snapshot.activeCreatedFolder||"";
  state.activeCreatedDeck=Number.isInteger(snapshot.activeCreatedDeck)?snapshot.activeCreatedDeck:null;
  if(snapshot.detailMode)state.detailMode=snapshot.detailMode;
  if(state.route!=="deckDetail"&&state.route!=="learnSession")state.detailFlipped=false;
  save();render();return true;
}
function goBackPage(){
  // Ưu tiên xử lý thủ công cho màn hình học để không bị nhảy về Trang chủ.
  // Khi đang học, phím Backspace / Alt+← / Browser Back phải trở về đúng màn hình bộ thẻ.
  if(state.route==="learnSession"&&Number.isInteger(state.activeCreatedDeck)&&state.createdDecks?.[state.activeCreatedDeck]){
    state.route="deckDetail";
    state.detailMode="flashcard";
    hvqRestoringBack=true;
    save();
    render();
    return;
  }
  // Khi đang ở màn hình chi tiết bộ thẻ, trở về danh sách Đã tạo / đúng thư mục đang mở.
  if(state.route==="deckDetail"){
    state.route="decks";
    state.detailFlipped=false;
    hvqRestoringBack=true;
    save();
    render();
    return;
  }
  // Khi đang mở 1 thư mục trong trang Đã tạo, phím Back phải trở về danh sách thư mục.
  // Đồng thời xóa lịch sử cũ để tránh lỗi: thư mục -> danh sách thư mục -> quay ngược lại thư mục.
  if(state.route==="decks"&&state.activeCreatedFolder){
    state.activeCreatedFolder="";
    writeRouteBackStack([]);
    hvqRestoringBack=true;
    save();
    render();
    return;
  }
  // Khi đã ở danh sách thư mục gốc, phím Back mới quay về Trang chủ, không mở lại thư mục vừa thoát.
  if(state.route==="decks"&&!state.activeCreatedFolder){
    writeRouteBackStack([]);
    if(state.route!=="home"){routeTo("home");return}
    showToast("Không còn trang trước","arrow-left");
    return;
  }
  const stack=readRouteBackStack();
  const previous=stack.pop();
  writeRouteBackStack(stack);
  if(previous&&restoreNavSnapshot(previous))return;
  if(state.route!=="home"){routeTo("home");return}
  showToast("Không còn trang trước","arrow-left");
}
function isTextEditingTarget(el=document.activeElement){return !!el&&(["INPUT","TEXTAREA","SELECT"].includes(el.tagName)||el.isContentEditable)}
function hvqStudyRouteCandidates(){return ["learnSession","deckDetail","decks","inputData","quizExcel","practice"]}
function rememberLastOpenedTabFromRoute(route=state.route){
  if(hvqStudyRouteCandidates().includes(route))state.lastOpenedTab=route;
}
function openLastStudyTab(){
  const valid=hvqStudyRouteCandidates();
  let target=valid.includes(state.lastOpenedTab)?state.lastOpenedTab:"decks";
  if((target==="deckDetail"||target==="learnSession")&&(!Number.isInteger(state.activeCreatedDeck)||!state.createdDecks?.[state.activeCreatedDeck]))target="decks";
  if(target==="learnSession"&&(!Array.isArray(state.learnOrder)||!state.learnOrder.length))target="deckDetail";
  if(target==="deckDetail"&&(!Number.isInteger(state.activeCreatedDeck)||!state.createdDecks?.[state.activeCreatedDeck]))target="decks";
  state.route=target;
  state.flashIndex=0;
  save();
  render();
}
function routeTo(route){if(!routes[route])route="home";if(route!=="home")rememberLastOpenedTabFromRoute(route);state.route=route;save();render()}

function deckCards(limit=99){return `<div class="deck-grid">${decks.slice(0,limit).map(d=>{const pct=Math.round(d.learned/d.total*100);return `<article class="card card-hover deck-card" data-deck="${d.id}"><div class="flex justify-between"><span class="text-xl">${d.icon}</span><span class="pill">${d.newCount} mới</span></div><h3>${d.name}</h3><p>${d.term} · ${d.learned}/${d.total}</p><div class="mt-3">${progress(pct)}</div><div class="flex justify-between items-center mt-2"><small class="muted">${pct}%</small><button class="button small" data-study="${d.id}">Học</button></div></article>`}).join("")}</div>`}
function courseRows(){return courses.map(c=>{const pct=Math.round(c.done/c.lessons*100);return `<article class="card card-hover course-row" data-course="${c.id}"><span class="item-icon">${c.icon}</span><div class="row-main"><h3>${c.name}</h3><p>${c.level} · ${c.done}/${c.lessons} bài</p><div class="mt-2">${progress(pct)}</div></div><strong class="text-indigo-400">${pct}%</strong></article>`}).join("")}

function homeActivityStats(){
  const created=Array.isArray(state.createdDecks)?state.createdDecks:[];
  let totalCards=0,mastered=0,studied=0,studyCount=0,lastStudiedAt="";
  created.forEach((deck,index)=>{
    const cards=Array.isArray(deck.cards)?deck.cards:[];
    totalCards+=cards.length;
    const stats=getDeckStudyStats(index);
    studyCount+=Number(stats.studyCount)||0;
    if(stats.lastStudiedAt&&String(stats.lastStudiedAt)>String(lastStudiedAt))lastStudiedAt=stats.lastStudiedAt;
    cards.forEach((_,cardIndex)=>{
      const status=state.detailProgress?.[`${index}:${cardIndex}`];
      if(status){studied++}
      if(status==="mastered")mastered++;
    });
  });
  const percent=totalCards?Math.round(mastered/totalCards*100):0;
  return {deckCount:created.length,totalCards,studied,mastered,studyCount,lastStudiedAt,percent};
}

// ===== HOME LEARNING DECKS - OpenQuiz style =====
function ensureHomeLearningStyle(){
  if(document.querySelector("#hvqHomeLearningStyle"))return;
  const style=document.createElement("style");
  style.id="hvqHomeLearningStyle";
  style.textContent=`
    .hvq-home-learning-wrap{display:flex;flex-direction:column;gap:18px}
    .hvq-home-learning-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}
    .hvq-home-learning-actions .button{
      min-height:58px;border-radius:16px;font-size:18px;font-weight:900;justify-content:center;gap:12px
    }
    .hvq-home-learning-actions .button.primary{background:#020617;color:#fff;border-color:#020617}
    .hvq-home-segment{display:grid;grid-template-columns:1fr 1fr;gap:0;padding:5px;border-radius:18px;background:rgba(226,232,240,.86)}
    .hvq-home-segment button{border:0;border-radius:14px;background:transparent;min-height:44px;font-weight:900;color:#64748b;cursor:pointer}
    .hvq-home-segment button.active{background:#fff;color:#111827;box-shadow:0 1px 6px rgba(15,23,42,.08)}
    .hvq-home-section-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:4px}
    .hvq-home-section-head h2{margin:0;font-size:24px;font-weight:950;color:#f8fafc;letter-spacing:-.02em}
    .hvq-home-section-head button{border:0;background:transparent;color:#cbd5e1;font-size:17px;font-weight:800;cursor:pointer;white-space:nowrap}
    .hvq-home-deck-scroll{display:flex;gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;padding:4px 2px 12px;margin:0 -2px;-webkit-overflow-scrolling:touch}
    .hvq-home-deck-scroll::-webkit-scrollbar{display:none}
    .hvq-home-learning-card{
      flex:0 0 min(360px,82vw);scroll-snap-align:start;background:#fff;color:#111827;border:1px solid rgba(226,232,240,.9);
      border-radius:22px;padding:22px 20px;box-shadow:0 12px 30px rgba(15,23,42,.13);cursor:pointer;min-height:218px
    }
    .hvq-home-learning-card:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(15,23,42,.18)}
    .hvq-home-deck-title{font-size:22px;line-height:1.18;font-weight:950;letter-spacing:-.02em;color:#111827;margin:0 0 28px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .hvq-home-deck-lang{font-size:15.5px;color:#6b7280;font-weight:700;margin-bottom:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .hvq-home-progress-row{display:flex;align-items:center;gap:12px;margin-bottom:13px}
    .hvq-home-progress-track{flex:1;height:8px;border-radius:999px;background:#e5e7eb;overflow:hidden}
    .hvq-home-progress-fill{height:100%;border-radius:999px;background:#000;min-width:0}
    .hvq-home-progress-text{font-size:18px;font-weight:950;color:#111827;white-space:nowrap}
    .hvq-home-study-time{font-size:15.5px;color:#6b7280;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:7px}
    .hvq-home-deck-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .hvq-home-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:#f3f4f6;color:#6b7280;padding:8px 13px;font-size:14.5px;font-weight:800;max-width:56%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .hvq-home-empty-card{flex:0 0 min(360px,82vw)}
    .hvq-home-route-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:2px}
    .hvq-home-route-head h2{margin:0;font-size:23px;font-weight:950;color:#f8fafc;letter-spacing:-.02em}
    .hvq-home-route-head button{border:0;background:transparent;color:#cbd5e1;font-size:17px;font-weight:800;cursor:pointer}
    body.hvq-custom-bg .hvq-home-section-head h2,body.hvq-custom-bg .hvq-home-route-head h2{color:#f8fafc}
    body:not(.hvq-custom-bg) .hvq-home-section-head h2,body:not(.hvq-custom-bg) .hvq-home-route-head h2{color:#f8fafc}
    @media(max-width:640px){
      .grid-dashboard{display:block!important}
      .grid-dashboard>.stack{margin-bottom:20px}
      .hvq-home-learning-wrap{gap:16px}
      .hvq-home-learning-actions{gap:12px}
      .hvq-home-learning-actions .button{min-height:54px;border-radius:15px;font-size:16px;padding:0 12px}
      .hvq-home-section-head h2,.hvq-home-route-head h2{font-size:22px}
      .hvq-home-section-head button,.hvq-home-route-head button{font-size:16px}
      .hvq-home-learning-card{flex-basis:82vw;min-height:210px;padding:20px 18px;border-radius:20px}
      .hvq-home-deck-title{font-size:21px;margin-bottom:26px}
      .hvq-home-deck-scroll{gap:14px;padding-bottom:10px}
    }
  `;
  document.head.appendChild(style);
}
function homeDeckDoneCount(index,total){
  let studied=0,mastered=0;
  for(let i=0;i<total;i++){
    const status=state.detailProgress?.[`${index}:${i}`];
    if(status)studied++;
    if(status==="mastered")mastered++;
  }
  // Ưu tiên số thẻ đã thuộc. Nếu bộ chưa có trạng thái mastered nhưng đã học, dùng số thẻ đã học để thanh tiến trình không bị 0.
  return mastered||studied;
}
function homeLearningDeckItems(){
  const created=Array.isArray(state.createdDecks)?state.createdDecks:[];
  const items=created.map((deck,index)=>{
    const total=Array.isArray(deck.cards)?deck.cards.length:0;
    const stats=getDeckStudyStats(index);
    const done=homeDeckDoneCount(index,total);
    const lastStudiedAt=stats.lastStudiedAt||deck.lastStudiedAt||"";
    const sortDate=lastStudiedAt||deck.updatedAt||deck.createdAt||"";
    return {deck,index,total,done,lastStudiedAt,sortDate,studyCount:Number(stats.studyCount)||0};
  }).filter(x=>x.total>0);
  const learning=items.filter(x=>x.lastStudiedAt||x.done>0);
  return (learning.length?learning:items)
    .sort((a,b)=>String(b.sortDate||"").localeCompare(String(a.sortDate||""))||String(a.deck.title||"").localeCompare(String(b.deck.title||""),"vi",{numeric:true}))
    .slice(0,10);
}
function homeLearningDeckLanguage(deck){
  const cards=Array.isArray(deck?.cards)?deck.cards:[];
  const sample=cards.find(c=>String(c?.definition||"").trim())?.definition||"";
  if(/[가-힣]/.test(sample))return "🇰🇷 Định nghĩa: 한국어";
  return "🇻🇳 Định nghĩa: Tiếng Việt";
}
function homeLearningDeckCards(){
  const user=currentUser();
  const items=homeLearningDeckItems();
  if(!items.length){
    return `<div class="hvq-home-deck-scroll"><article class="hvq-home-learning-card hvq-home-empty-card" data-route="decks">
      <h3 class="hvq-home-deck-title">Chưa có bộ từ đang học</h3>
      <div class="hvq-home-deck-lang">Hãy tạo hoặc nhập một bộ thẻ để nó hiện ở đây.</div>
      <div class="hvq-home-progress-row"><div class="hvq-home-progress-track"><div class="hvq-home-progress-fill" style="width:0%"></div></div><span class="hvq-home-progress-text">0/0</span></div>
      <div class="hvq-home-study-time">${icon("clock")} Học lần cuối: Chưa học</div>
      <div class="hvq-home-deck-bottom"><span class="hvq-home-pill">0 từ</span><span class="hvq-home-pill">${icon("user-round")} ${escapeHtml(user.name||"T- Creation")}</span></div>
    </article></div>`;
  }
  return `<div class="hvq-home-deck-scroll">${items.map(({deck,index,total,done,lastStudiedAt})=>{
    const pct=total?Math.min(100,Math.round(done/total*100)):0;
    return `<article class="hvq-home-learning-card" data-created-deck="${index}">
      <h3 class="hvq-home-deck-title">${escapeHtml(deck.title||"Bộ từ chưa đặt tên")}</h3>
      <div class="hvq-home-deck-lang">${homeLearningDeckLanguage(deck)}</div>
      <div class="hvq-home-progress-row"><div class="hvq-home-progress-track"><div class="hvq-home-progress-fill" style="width:${pct}%"></div></div><span class="hvq-home-progress-text">${done}/${total}</span></div>
      <div class="hvq-home-study-time">${icon("clock")} Học lần cuối: ${formatLastStudied(lastStudiedAt)}</div>
      <div class="hvq-home-deck-bottom"><span class="hvq-home-pill">${total} từ</span><span class="hvq-home-pill">${icon("user-round")} ${escapeHtml(user.name||"T- Creation")}</span></div>
    </article>`;
  }).join("")}</div>`;
}
function homeLearningSection(){
  return `<section class="hvq-home-learning-wrap">
    <div class="hvq-home-learning-actions">
      <button class="button primary" data-action="new-deck">${icon("plus")} Tạo Bộ thẻ</button>
      <button class="button" data-route="courses">${icon("book-open")} Tạo lộ trình</button>
    </div>
    <div class="hvq-home-segment"><button class="active" type="button">Đang học</button><button type="button" data-route="courses">Lộ trình gợi ý</button></div>
    <div class="hvq-home-section-head"><h2>Bộ từ đang học</h2><button type="button" data-route="decks">Xem tất cả</button></div>
    ${homeLearningDeckCards()}
    <div class="hvq-home-route-head"><h2>Lộ trình đang học</h2><button type="button" data-route="courses">Xem tất cả</button></div>
  </section>`;
}

function homePage(){
  ensureHomeLearningStyle();
  const user=currentUser(),firstName=user.name.split(/\s+/).filter(Boolean).slice(-1)[0]||user.name;
  const loginAction=user.signedIn?"":button(`${icon("log-in")} Đăng nhập Google`,"sign-in-google");
  const real=homeActivityStats();
  return header(`Xin chào, ${escapeHtml(firstName)} 👋`,"",loginAction+button(`${icon("rotate-ccw")} Ôn tập nhanh`,"review")+button(`${icon("play")} Học ngay`,"study","primary"))+
  `<div class="grid-dashboard">
    <div class="stack">
      <section class="card section-card"><div class="section-title"><h2>${icon("activity")} Hoạt động học tập</h2></div><div class="stats-grid"><div class="stat"><strong class="text-indigo-400">${real.studied}</strong><small>Thẻ đã học</small></div><div class="stat"><strong class="text-emerald-400">${real.mastered}</strong><small>Đã thuộc</small></div></div><div class="mt-4"><div class="flex justify-between text-xs mb-2"><span>Tiến độ bộ thẻ tự tạo</span><span>${real.percent}%</span></div>${progress(real.percent)}</div><div class="mt-5 p-4 rounded-xl bg-amber-500/10"><strong>${icon("folder-check")} ${real.deckCount} bộ · ${real.totalCards} thẻ</strong><p class="muted text-xs mt-1">Lần học gần nhất: ${formatLastStudied(real.lastStudiedAt)} · Tổng lượt học: ${real.studyCount}</p></div></section>
      <section class="card section-card"><div class="section-title"><h2>${icon("star")} Cấp độ</h2><span class="pill">Lv.12</span></div><strong>Học giả Hán Việt</strong><p class="muted text-xs my-2">${state.xp.toLocaleString()} / 3.000 XP</p>${progress(state.xp/30)}</section>
    </div>
    <div class="stack">
      ${homeLearningSection()}
      <section><div class="section-title"><h2>${icon("graduation-cap")} Khóa đang học</h2><button class="button small" data-route="courses">Xem tất cả</button></div><div class="stack gap-3">${courseRows()}</div></section>
    </div>
    <div class="stack">
      <section class="card section-card"><div class="section-title"><h2>${icon("play-circle")} Tiếp tục học</h2></div>${decks.slice(0,3).map(d=>`<div class="list-row card-hover" data-study="${d.id}"><span class="item-icon">${d.icon}</span><div class="row-main"><strong>${d.name}</strong><small>Còn ${d.newCount} từ mới</small></div>${icon("chevron-right")}</div>`).join("")}</section>
      <section class="card section-card"><div class="section-title"><h2>${icon("sparkles")} Từ mới hôm nay</h2></div><div class="text-center"><div class="text-5xl font-bold text-indigo-400">勉強</div><p class="mt-3 font-semibold">Miện cường</p><p class="muted text-sm">Học tập, nỗ lực</p><button class="button small mt-4" data-speak="勉強">${icon("volume-2")} Nghe</button></div></section>
      <section class="card section-card"><div class="section-title"><h2>${icon("zap")} Công cụ nhanh</h2></div><div class="grid grid-cols-2 gap-2">${button("Flashcard","flashcard")}${button("Quiz nhanh","quiz")}${button("Tra từ","dictionary")}${button("Thống kê","stats")}</div></section>
    </div>
  </div>`;
}
function coursesPage(){return header("Khoá học","Theo dõi tiến độ và tiếp tục bài học của bạn.",button(`${icon("plus")} Tạo khóa học`,"new-course","primary"))+`<div class="tabs">${["Tất cả","Đang học","Đã hoàn thành"].map((x,i)=>`<button class="tab-button ${i===0?"active":""}" data-filter-course="${i}">${x}</button>`).join("")}</div><div id="courseResults" class="stack">${courseRows()}</div>`}
function createdFolderName(deck){
  const explicit=String(deck?.folderName||deck?.sourceFolder||"").trim();
  if(explicit)return explicit;
  const batch=String(deck?.importBatchId||"");
  if(batch.startsWith("input-"))return batch.slice(6).trim()||"Nhập liệu";
  return "Bộ thẻ riêng";
}
function createdDeckFolderGroups(created){
  const map=new Map();
  created.forEach((deck,index)=>{
    const name=createdFolderName(deck);
    if(!map.has(name))map.set(name,{name,items:[],totalCards:0,updatedAt:""});
    const group=map.get(name);
    group.items.push({deck,index});
    group.totalCards+=deck.cards?.length||0;
    const updated=String(deck.updatedAt||"");
    if(updated>group.updatedAt)group.updatedAt=updated;
  });
  return [...map.values()].sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||""))||a.name.localeCompare(b.name));
}
function deckStudyId(deck,index){
  return String(deck?.studyId||`${deck?.importBatchId||createdFolderName(deck)}::${deck?.title||index}`);
}
function getDeckStudyStats(index){
  const deck=state.createdDecks?.[index];
  const key=deckStudyId(deck,index);
  return state.deckStudyStats?.[key]||deck?.studyStats||{studyCount:0,lastStudiedAt:""};
}
function touchDeckStudyStats(index,{increment=false}={}){
  const deck=state.createdDecks?.[index];
  if(!deck)return;
  state.deckStudyStats={...(state.deckStudyStats||{})};
  const key=deckStudyId(deck,index),prev=getDeckStudyStats(index);
  state.deckStudyStats[key]={
    studyCount:Math.max(0,Number(prev.studyCount)||0)+(increment?1:0),
    lastStudiedAt:new Date().toISOString()
  };
}
function formatLastStudied(value){
  if(!value)return "Chưa học";
  const time=new Date(value).getTime();
  if(!Number.isFinite(time))return "Chưa học";
  const diff=Math.max(0,Date.now()-time),m=60000,h=60*m,d=24*h,mo=30*d;
  if(diff<2*m)return "vừa xong";
  if(diff<h)return `${Math.floor(diff/m)} phút trước`;
  if(diff<d)return `${Math.floor(diff/h)} giờ trước`;
  if(diff<mo)return `${Math.floor(diff/d)} ngày trước`;
  return `${Math.floor(diff/mo)} tháng trước`;
}
function createdDeckProgressInfo(index){
  const deck=state.createdDecks?.[index]||{},total=deck.cards?.length||0;
  let mastered=0;
  for(let i=0;i<total;i++)if(state.detailProgress?.[`${index}:${i}`]==="mastered")mastered++;
  const stats=getDeckStudyStats(index);
  return {total,mastered,percent:total?Math.round(mastered/total*100):0,studyCount:Number(stats.studyCount)||0,lastStudiedAt:stats.lastStudiedAt||""};
}
function createdDeckCard(d,i){
  const info=createdDeckProgressInfo(i),user=currentUser();
  return `<article class="card card-hover deck-card created-progress-card" data-created-deck="${i}">
    <div class="flex justify-between items-start"><span class="text-xl">📄</span><span class="pill">${info.total} từ</span></div>
    <h3>${escapeHtml(d.title)}</h3>
    <p class="muted text-xs">${escapeHtml(d.description||createdFolderName(d)||"Bộ thẻ riêng")}</p>
    <div class="created-progress-line mt-4"><div class="created-progress-bar">${progress(info.percent)}</div><strong>${info.mastered}/${info.total}</strong></div>
    <div class="created-study-meta">
      <span>${icon("clock")} Học lần cuối: ${formatLastStudied(info.lastStudiedAt)}</span>
      <span>${icon("repeat-2")} Đã học: ${info.studyCount} lần</span>
    </div>
    <div class="created-study-owner"><span>${icon("user-round")} ${escapeHtml(user.name||"T-Creation")}</span><span class="pill">${d.isPublic?"Công khai":"Riêng tư"}</span></div>
    <div class="flex gap-2 mt-4"><button class="button small primary" data-study-created="${i}">${icon("play")} Học ngay</button><button class="button small" data-edit-created="${i}">Chỉnh sửa</button><button class="button small danger" data-delete-created="${i}">Xóa</button></div>
  </article>`;
}
function searchText(value=""){return String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function createdDeckSearchText(deck){return searchText([deck.title,deck.description,deck.folderName,...(deck.cards||[]).flatMap(card=>[card.term,card.definition,card.example,card.synonyms])].join(" "))}
function createdFolderCard(group){return `<article class="card card-hover deck-card" data-open-created-folder="${escapeAttr(group.name)}"><div class="flex justify-between"><span class="text-xl">📁</span><span class="pill">${group.items.length} bộ</span></div><h3>${escapeHtml(group.name)}</h3><p>${group.totalCards} thẻ · Nhấn mở để xem các bộ từ</p><div class="flex gap-2 mt-4"><button class="button small primary" data-open-created-folder="${escapeAttr(group.name)}">${icon("folder-open")} Mở thư mục</button></div></article>`}
function sortCreatedFolders(groups,sort){return [...groups].sort((a,b)=>{if(sort==="name-desc")return b.name.localeCompare(a.name);if(sort==="cards-desc")return b.totalCards-a.totalCards;if(sort==="cards-asc")return a.totalCards-b.totalCards;if(sort==="count-desc")return b.items.length-a.items.length;if(sort==="count-asc")return a.items.length-b.items.length;return a.name.localeCompare(b.name)})}
function sortCreatedDeckItems(items,sort){return [...items].sort((a,b)=>{const ca=a.deck.cards?.length||0,cb=b.deck.cards?.length||0;if(sort==="name-desc")return String(b.deck.title||"").localeCompare(String(a.deck.title||""),"vi",{numeric:true});if(sort==="cards-desc")return cb-ca;if(sort==="cards-asc")return ca-cb;if(sort==="newest")return String(b.deck.updatedAt||"").localeCompare(String(a.deck.updatedAt||""));if(sort==="oldest")return String(a.deck.updatedAt||"").localeCompare(String(b.deck.updatedAt||""));return String(a.deck.title||"").localeCompare(String(b.deck.title||""),"vi",{numeric:true})})}
function filterCreatedDeckItems(items,query,sizeFilter){const q=searchText(query);return items.filter(({deck})=>{const count=deck.cards?.length||0;if(sizeFilter==="small"&&count>50)return false;if(sizeFilter==="medium"&&(count<51||count>100))return false;if(sizeFilter==="large"&&count<=100)return false;return !q||createdDeckSearchText(deck).includes(q)})}
function createdFolderToolbar(){return `<div class="flex gap-3 mb-5 flex-wrap"><input id="createdFolderSearch" class="input" placeholder="Tìm thư mục..."><select id="createdFolderSort" class="input max-w-[220px]"><option value="name-asc">Sắp xếp A → Z</option><option value="name-desc">Sắp xếp Z → A</option><option value="cards-desc">Nhiều thẻ nhất</option><option value="cards-asc">Ít thẻ nhất</option><option value="count-desc">Nhiều bộ nhất</option><option value="count-asc">Ít bộ nhất</option></select></div>`}
function createdDeckToolbar(count){return `<div class="flex gap-3 mb-5 flex-wrap"><input id="createdDeckSearch" class="input" placeholder="Tìm bộ thẻ trong thư mục này..."><select id="createdDeckSort" class="input max-w-[220px]"><option value="name-asc">Sắp xếp A → Z</option><option value="name-desc">Sắp xếp Z → A</option><option value="cards-desc">Nhiều thẻ nhất</option><option value="cards-asc">Ít thẻ nhất</option><option value="newest">Mới cập nhật</option><option value="oldest">Cũ nhất</option></select><select id="createdDeckSizeFilter" class="input max-w-[220px]"><option value="all">Tất cả số thẻ</option><option value="small">≤ 50 thẻ</option><option value="medium">51 - 100 thẻ</option><option value="large">> 100 thẻ</option></select><span id="createdDeckFilterCount" class="pill">${count} bộ</span></div>`}
function createdDeckGrid(items){return items.length?`<div class="deck-grid">${items.map(({deck,index})=>createdDeckCard(deck,index)).join("")}</div>`:`<p class="empty card">Không tìm thấy bộ thẻ phù hợp.</p>`}
function decksPage(){
  const created=state.createdDecks||[],groups=createdDeckFolderGroups(created),activeFolder=String(state.activeCreatedFolder||"");
  const actions=button(`${icon("plus")} Tạo bộ thẻ mới`,"new-deck","primary");
  if(activeFolder){
    const items=sortCreatedDeckItems(created.map((deck,index)=>({deck,index})).filter(x=>createdFolderName(x.deck)===activeFolder),"name-asc");
    return header("Đã tạo",`Thư mục ${escapeHtml(activeFolder)} · ${items.length} bộ`,actions)+`<section class="mb-7"><div class="section-title"><h2>${icon("folder-open")} ${escapeHtml(activeFolder)}</h2><button class="button small" data-action="back-to-folders">${icon("arrow-left")} Quay lại thư mục</button></div>${createdDeckToolbar(items.length)}<div id="createdDeckResults">${createdDeckGrid(items)}</div></section>`;
  }
  const sortedGroups=sortCreatedFolders(groups,"name-asc");
  return header("Đã tạo","Quản lý các thư mục và bộ thẻ của bạn.",actions)+`${groups.length?`<section class="mb-7"><div class="section-title"><h2>${icon("folder")} Thư mục của tôi</h2><span class="pill">${groups.length} thư mục · ${created.length} bộ</span></div>${createdFolderToolbar()}<div id="createdFolderResults"><div class="deck-grid">${sortedGroups.map(createdFolderCard).join("")}</div></div></section>`:""}<div class="flex gap-3 mb-5"><input id="deckSearch" class="input" placeholder="Tìm bộ từ mẫu..."><select id="deckSort" class="input max-w-[180px]"><option value="name">Theo tên</option><option value="progress">Theo tiến độ</option></select></div><div id="deckResults">${deckCards()}</div>`;
}
function inputDataPage(){
  const d=state.inputData,sheets=Object.keys(savedInputSheets);
  const selectedSheetUrl=savedInputSheets[d.savedSheet]||d.sheetUrl||"";
  return header("Nhập liệu","Kết nối nguồn dữ liệu và ánh xạ cột để tạo thẻ học.",button(`${icon("check")} Áp dụng`,"input-apply","primary"))+
  `<div class="input-data-page">
    <section class="card section-card input-config-card">
      <div class="input-section"><h2>1) Nguồn dữ liệu</h2>
        <label>Chọn nguồn</label>
        <div class="radio-stack">
          <label><input type="radio" name="inputSource" data-input-field="sourceType" value="sheet" ${d.sourceType==="sheet"?"checked":""}> Google Sheets link</label>
          <label><input type="radio" name="inputSource" data-input-field="sourceType" value="file" ${d.sourceType==="file"?"checked":""}> Upload file</label>
        </div>
        <div class="field mt-4"><label>Chọn Google Sheet đã lưu</label><select class="input" data-input-field="savedSheet">${sheets.map(name=>`<option value="${escapeAttr(name)}" ${d.savedSheet===name?"selected":""}>${escapeHtml(name)}</option>`).join("")}</select></div>
        <div class="input-selected">${icon("check-circle")} Đã chọn: <strong>${escapeHtml(d.sourceType==="file"?(d.lastFileName||"Chưa chọn file"):d.savedSheet)}</strong></div>
        <div class="field mt-4"><label>Google Sheets URL</label><textarea class="input input-link-box" data-input-field="sheetUrl">${escapeHtml(selectedSheetUrl)}</textarea></div>
        <button class="button small" data-action="input-pick-file">${icon("upload")} Chọn file CSV/TSV</button>
        <div class="share-note">Share Google Sheets: Anyone with the link → Viewer.</div>
      </div>
    </section>
    <section class="card section-card input-config-card">
      <div class="input-section"><h2>2) Chọn cột</h2><p class="muted text-sm">Ví dụ của bạn: C = ngữ pháp ban đầu, G = từ đồng nghĩa, F,I = giải thích / ví dụ.</p>
        ${inputColumnField("termCol","Cột tiếng Hàn / ngữ pháp ban đầu",d.termCol)}
        ${inputColumnField("meaningCol","Cột nghĩa tiếng Việt",d.meaningCol)}
        ${inputColumnField("exampleCol","Cột giải thích / ví dụ",d.exampleCol)}
        ${inputColumnField("synonymCol","Cột từ đồng nghĩa / đáp án thay thế",d.synonymCol)}
        <label class="setting-choice"><input type="checkbox" data-input-field="autoDetect" ${d.autoDetect?"checked":""}><span>Tự nhận diện ô gộp / điền dữ liệu xuống dòng dưới</span></label>
        <label class="setting-choice"><input type="checkbox" data-input-field="mergeRows" ${d.mergeRows?"checked":""}><span>Gộp các dòng có cùng ngữ pháp ban đầu thành 1 thẻ</span></label>
        <p class="setting-help">Cột giải thích / ví dụ có thể nhập 1 hoặc nhiều cột, ví dụ: E hoặc F,I.</p>
      </div>
      <div class="input-section mt-6"><h2>3) Chia thư mục</h2>
        <label>Số từ mỗi thư mục</label>
        <div class="stepper"><input class="input" type="number" min="1" data-input-field="folderSize" value="${escapeAttr(d.folderSize)}"><button data-input-step="folderSize" data-step="-10">−</button><button data-input-step="folderSize" data-step="10">+</button></div>
        <button class="button primary w-full mt-4" data-action="input-apply">Áp dụng</button>
      </div>
      ${inputDataResult(d)}
    </section>
  </div>`;
}
function inputColumnField(name,label,value){const placeholder=name==="exampleCol"?"VD: E hoặc F,I":"VD: A";return `<div class="field input-column-field"><label>${label}</label><input class="input" maxlength="20" data-input-field="${name}" value="${escapeAttr(value)}" placeholder="${placeholder}"></div>`}
function inputDataResult(d){if(!d.lastResult)return"";return `<div class="input-result"><strong>${escapeHtml(d.lastResult.title)}</strong><p>${escapeHtml(d.lastResult.message)}</p>${d.lastResult.cards?`<small>${d.lastResult.cards} thẻ · ${d.lastResult.folders} thư mục</small>`:""}</div>`}
function createDeckPage(){const d=state.deckDraft;return `<div class="creator-page">
  <div class="creator-toolbar"><h1>Tạo bộ thẻ mới</h1><div class="creator-actions">
    <button class="button" data-action="import-cards">${icon("upload")} Nhập</button>
    <button class="button" data-action="auto-fill">${icon("sparkles")} ${icon("image")}</button>
    <button class="public-toggle ${d.isPublic?"on":""}" data-action="toggle-public">${icon("globe")} Công khai <span class="switch"></span></button>
    <button class="button" data-action="cancel-create">Hủy</button>
    <button class="button primary" data-action="save-deck">Tạo</button>
  </div></div>
  <div class="creator-meta">
    <div class="editor-field"><label>Tiêu đề</label><input class="creator-input" data-draft-meta="title" value="${escapeAttr(d.title)}" placeholder="Thêm tiêu đề..."></div>
    <div class="editor-field"><label>Mô tả <small>(Tùy chọn)</small></label><textarea class="creator-input" data-draft-meta="description" placeholder="Thêm mô tả cho bộ thẻ của bạn...">${escapeHtml(d.description)}</textarea></div>
  </div>
  <div class="creator-subbar"><button class="${d.suggestions?"suggest-enabled":""}" data-action="toggle-suggestions">${icon("sparkles")} Gợi ý: ${d.suggestions?"Bật":"Tắt"}</button><button data-action="delete-draft">${icon("trash-2")} Xóa Bản Nháp</button></div>
  <div class="card-editor-list">${d.cards.map(cardEditor).join("")}</div>
  <div class="add-card-row"><button class="button" data-action="add-card">${icon("plus")} Thêm thẻ</button></div>
</div>`}
function cardEditor(card,index){return `<article class="card-editor" data-card-index="${index}"><span class="card-number">${index+1}</span><div class="card-editor-grid">
  <div class="editor-field"><label>THUẬT NGỮ</label><textarea class="creator-input large" data-card-field="term" placeholder="Nhập thuật ngữ">${escapeHtml(card.term)}</textarea></div>
  <div class="editor-field"><label>ĐỊNH NGHĨA</label><textarea class="creator-input large" data-card-field="definition" placeholder="Nhập định nghĩa">${escapeHtml(card.definition)}</textarea></div>
  <div class="editor-field"><label>Phát âm <small>(Tùy chọn)</small></label><input class="creator-input" data-card-field="pronunciation" value="${escapeAttr(card.pronunciation)}" placeholder="VD: /həˈloʊ/"></div>
  <div class="editor-field"><label>Loại từ <small>(Tùy chọn)</small></label><input class="creator-input" data-card-field="wordType" value="${escapeAttr(card.wordType)}" placeholder="VD: noun, verb..."></div>
  <div class="editor-field"><label>Ví dụ <small>(Tùy chọn)</small></label><textarea class="creator-input" data-card-field="example" placeholder="Nhập câu ví dụ">${escapeHtml(card.example)}</textarea></div>
  <div class="editor-field"><label>Từ đồng nghĩa <small>(Tùy chọn)</small></label><textarea class="creator-input" data-card-field="synonyms" placeholder="Nhập các từ đồng nghĩa, cách nhau bằng dấu chấm phẩy (;)">${escapeHtml(card.synonyms)}</textarea></div>
  </div><div class="card-side-actions">
    <button data-remove-card="${index}" title="Xóa thẻ">${icon("trash-2")}</button>
    <button class="image-picker ${card.image?"has-image":""}" data-image-card="${index}" style="${card.image?`background-image:url('${card.image}')`:""}">${icon("image")}<small>Ảnh</small></button>
    <button data-move-card="${index}" data-direction="-1" title="Di chuyển lên">${icon("chevron-up")}</button>
    <button data-move-card="${index}" data-direction="1" title="Di chuyển xuống">${icon("chevron-down")}</button>
  </div></article>`}
function deckDetailPage(){const deck=state.createdDecks[state.activeCreatedDeck];if(!deck){state.route="decks";return decksPage()}const cards=detailCards(deck);state.detailCardIndex=Math.min(Math.max(state.detailCardIndex||0,0),Math.max(cards.length-1,0));const current=cards[state.detailCardIndex];const modes=[["speaking","Speaking","message-square"],["conversation","Hội thoại","message-circle"],["grammar","Ngữ pháp","book-open"],["reading","Đọc hiểu","book-open-check"],["flashcard","Học","graduation-cap"],["test","Kiểm tra","file-check-2"],["dictation","Nghe Chép","grid-3x3"]];return `<div class="deck-detail">
  <button class="detail-back" data-action="back-to-decks">${icon("arrow-left")} Quay lại</button>
  <div class="detail-heading"><h1>${escapeHtml(deck.title)} ${deck.isPublic?icon("globe-2"):""}</h1><div class="detail-heading-actions"><button class="button small" data-action="schedule-review">${icon("calendar-days")} Lặp lại ngắt quãng</button><button class="icon-button" data-action="toggle-deck-bookmark">${icon("bookmark")}</button><button class="icon-button" data-action="share-deck">${icon("share-2")}</button><button class="icon-button" data-action="deck-menu">${icon("more-vertical")}</button></div></div>
  <div class="study-mode-grid">${modes.map(([key,label,ico])=>`<button class="study-mode ${state.detailMode===key?"active":""}" data-detail-mode="${key}">${icon(ico)} ${label}</button>`).join("")}</div>
  <div id="detailStudyPanel">${detailStudyPanel(deck,current,cards)}</div>
  ${detailToolbar(deck,cards)}
  ${detailCardGroups(deck,cards)}
</div>`}
function detailCardText(card){return searchText([card.term,card.definition,card.pronunciation,card.wordType,card.example,card.synonyms].join(" "))}
function detailMatchesFilter(card){const f=state.detailFilter||"all";if(f==="all")return true;if(f==="starred")return isDetailStarred(card.originalIndex);if(f==="unmastered")return detailStatus(card.originalIndex)!=="mastered";return detailStatus(card.originalIndex)===f}
function detailCards(deck){let cards=deck.cards.map((card,originalIndex)=>({...card,originalIndex}));const q=searchText(state.detailSearch||"");cards=cards.filter(card=>(!q||detailCardText(card).includes(q))&&detailMatchesFilter(card));if(state.detailSort==="alphabetical")cards.sort((a,b)=>(a.term||"").localeCompare(b.term||""));if(state.detailSort==="alphabetical-desc")cards.sort((a,b)=>(b.term||"").localeCompare(a.term||""));if(state.detailSort==="starred")cards.sort((a,b)=>Number(isDetailStarred(b.originalIndex))-Number(isDetailStarred(a.originalIndex)));if(state.detailSort==="status")cards.sort((a,b)=>detailStatus(a.originalIndex).localeCompare(detailStatus(b.originalIndex)));return cards}
function detailToolbar(deck,cards){return `<div class="deck-list-toolbar detail-filter-toolbar flex-wrap"><button class="button small" data-edit-created="${state.activeCreatedDeck}">${icon("square-pen")} Chỉnh sửa</button><input id="detailSearch" class="input" value="${escapeAttr(state.detailSearch||"")}" placeholder="Tìm thẻ trong bộ này..."><select id="detailFilter" class="input max-w-[220px]"><option value="all" ${(state.detailFilter||"all")==="all"?"selected":""}>Tất cả thẻ</option><option value="starred" ${state.detailFilter==="starred"?"selected":""}>Đã đánh dấu sao</option><option value="new" ${state.detailFilter==="new"?"selected":""}>Chưa học</option><option value="learning" ${state.detailFilter==="learning"?"selected":""}>Đang học</option><option value="mastered" ${state.detailFilter==="mastered"?"selected":""}>Đã thành thạo</option><option value="unmastered" ${state.detailFilter==="unmastered"?"selected":""}>Chưa thuộc</option></select><select id="detailSort" class="input max-w-[220px]"><option value="original" ${state.detailSort==="original"?"selected":""}>Thứ tự gốc</option><option value="alphabetical" ${state.detailSort==="alphabetical"?"selected":""}>A → Z</option><option value="alphabetical-desc" ${state.detailSort==="alphabetical-desc"?"selected":""}>Z → A</option><option value="starred" ${state.detailSort==="starred"?"selected":""}>Đánh dấu sao trước</option><option value="status" ${state.detailSort==="status"?"selected":""}>Theo tiến độ</option></select><span class="pill">${cards.length}/${deck.cards.length} thẻ</span><button class="button small" data-action="detail-clear-filter">${icon("rotate-ccw")} Xóa lọc</button></div>`}
function detailStudyPanel(deck,current,cards){if(state.detailMode!=="flashcard"){const labels={speaking:"Luyện nói",conversation:"Luyện hội thoại",grammar:"Luyện ngữ pháp",reading:"Luyện đọc hiểu",test:"Kiểm tra",dictation:"Nghe chép"};return `<section class="card section-card max-w-2xl mx-auto text-center"><h2>${labels[state.detailMode]}</h2><p class="muted my-4">Chế độ này sử dụng ${cards.length||deck.cards.length} thẻ phù hợp trong bộ “${escapeHtml(deck.title)}”.</p><button class="button primary" data-action="start-detail-mode">Bắt đầu</button></section>`}if(!current)return `<section class="card section-card max-w-2xl mx-auto text-center"><h2>Không có thẻ phù hợp</h2><p class="muted my-4">Hãy xóa từ khóa tìm kiếm hoặc đổi bộ lọc tiến độ.</p><button class="button" data-action="detail-clear-filter">${icon("rotate-ccw")} Xóa lọc</button></section>`;return `<div class="detail-flash-area"><div id="detailFlashcard" class="detail-flashcard ${state.detailFlipped?"flipped":""}"><div class="flash-tools"><button data-action="flash-settings">${icon("sliders-horizontal")}</button><button data-action="edit-current-card">${icon("pencil")} Viết</button></div><div class="front-content">${current.image?`<img src="${current.image}" class="mx-auto mb-5 max-h-28 rounded-xl">`:""}<div class="term">${escapeHtml(current.term||"—")}</div></div><div class="back-content"><h2>${escapeHtml(current.definition||"Chưa có định nghĩa")}</h2>${current.pronunciation?`<p class="text-indigo-300">${escapeHtml(current.pronunciation)}</p>`:""}${current.example?`<p class="muted">${escapeHtml(current.example)}</p>`:""}</div><div class="flash-bottom-tools"><button data-speak="${escapeAttr(current.term)}">${icon("mic")}</button><button data-speak="${escapeAttr(current.term)}">${icon("volume-2")}</button></div></div><div class="shortcut-hint">Phím tắt: ← → để chuyển thẻ · Space / Enter để lật thẻ</div><div class="flash-nav"><button class="button small" data-action="show-progress">${icon("layers")} Tiến độ</button><div class="flash-nav-center"><button class="button" data-detail-nav="-1">${icon("arrow-left")}</button><span>Thẻ ${state.detailCardIndex+1} / ${cards.length}</span><button class="button" data-detail-nav="1">${icon("arrow-right")}</button></div><button class="button flash-nav-right" data-action="shuffle-detail">${icon("shuffle")}</button></div><div class="detail-progress-menu"><button class="${detailStatus(current.originalIndex)==="new"?"active":""}" data-set-status="new">Chưa học</button><button class="${detailStatus(current.originalIndex)==="learning"?"active":""}" data-set-status="learning">Đang học</button><button class="${detailStatus(current.originalIndex)==="mastered"?"active":""}" data-set-status="mastered">Đã thành thạo</button></div><a href="#card-groups" class="detail-link">Xem hướng dẫn cách học</a></div>`}
function detailStatus(cardIndex){return state.detailProgress[`${state.activeCreatedDeck}:${cardIndex}`]||"new"}
function isDetailStarred(cardIndex){return !!state.detailStars[`${state.activeCreatedDeck}:${cardIndex}`]}
function starIcon(starred){return starred?"★":icon("star")}
function detailCardGroups(deck,cards=detailCards(deck)){const groups=[["starred","⭐ Được đánh dấu sao"],["new","Chưa học"],["learning","Đang học"],["mastered","Đã thành thạo"]];return `<div id="card-groups" class="card-groups">${groups.map(([type,label])=>{const rows=cards.filter(x=>type==="starred"?isDetailStarred(x.originalIndex):detailStatus(x.originalIndex)===type);return `<section><div class="card-group-header"><strong>${label}</strong><span class="muted">${rows.length} thẻ</span></div>${rows.length?rows.map(card=>{const index=card.originalIndex,starred=isDetailStarred(index);return `<div class="card-list-row ${type==="learning"?"learning":type==="mastered"?"mastered":""}" data-jump-card="${index}"><strong>${escapeHtml(card.term||"—")}</strong><i class="card-divider"></i><span class="definition-cell">${escapeHtml(card.definition||"Chưa có định nghĩa")}</span><span class="row-actions"><button class="${starred?"starred":""}" data-detail-star="${index}">${starIcon(starred)}</button><button data-speak="${escapeAttr(card.term)}">${icon("volume-2")}</button></span></div>`}).join(""):'<div class="empty-group">Chưa có thẻ trong nhóm này.</div>'}</section>`}).join("")}</div>`}

function grammarQuickMeaning(value=""){
  const text=String(value||"").normalize("NFC").replace(/\s+/g," ").trim();
  const rules=[
    [/바람에|통에/,"chỉ nguyên nhân/tình huống xảy ra làm dẫn đến kết quả không tốt"],
    [/탓에/,"chỉ nguyên nhân xấu, thường nhấn mạnh lỗi hoặc nguyên nhân bất lợi"],
    [/느라고/,"vì mải làm hành động trước nên kết quả sau thường không tốt"],
    [/때문에|덕분에|로 인해|아서|어서|기에|길래/,"chỉ nguyên nhân hoặc lý do"],
    [/지만|하지만|는데도|더라도|아도|어도|고도/,"chỉ sự tương phản/nhượng bộ, nghĩa là dù/nhưng"],
    [/도록|게끔|지 않게|지 않도록/,"chỉ mục đích, mức độ hoặc để cho một việc xảy ra/không xảy ra"],
    [/자마자|는 대로|기가 무섭게/,"chỉ thời điểm ngay sau khi một hành động xảy ra"],
    [/척하다|체하다/,"giả vờ/làm ra vẻ"],
    [/듯이|처럼|같이/,"so sánh, giống như"],
    [/커녕|물론이고|말할 것도 없고/,"nhấn mạnh so sánh mức độ, không chỉ A mà còn B hoặc đến A cũng không"],
    [/수밖에 없다|아야만 하다|어야만 하다|지 않을 수 없다/,"bắt buộc/không còn cách nào khác"],
    [/것 같다|듯하다|나 보다|모양이다/,"phỏng đoán, có vẻ như"],
    [/만 하다|수 있다|수 있는/,"khả năng, mức độ đáng/làm được"],
    [/뿐이다|따름이다|에 불과하다|에 지나지/,"chỉ là/không hơn gì"],
    [/셈이다|거나 같다|거나 마찬가지|거나 다름없다/,"coi như/gần như là"],
    [/위해서|려고|고자|려면/,"mục đích hoặc điều kiện để làm việc gì"],
    [/다고 해서|다기에|다고 해도|는다고 해도|봐야|봐도/,"trích dẫn, giả định hoặc dù làm cũng không thay đổi nhiều"],
    [/기 마련이다|는 법이다|게 돼 있다/,"quy luật/tất yếu/thường là như vậy"],
    [/데다가|뿐만 아니라|것은 물론이고/,"bổ sung thêm ý, không những A mà còn B"],
    [/나 마나|지 않아도|것도 없이/,"dù có làm hay không thì kết quả vẫn rõ ràng"],
    [/다가|는 길에|다가 보니까/,"đang/trong quá trình làm thì xảy ra việc khác hoặc dần nhận ra"],
    [/반면에|데 반해/,"đối lập hai mặt/trái lại"],
    [/면서|고서도/,"đồng thời hoặc biết/làm rồi mà vẫn"],
    [/든지|더라도/,"bất kể/dù thế nào"],
    [/줄 몰랐다|다고 생각했다/,"nhận thức/suy nghĩ về một sự thật"],
    [/나머지/,"vì quá/mải đến mức dẫn đến kết quả"],
    [/채/,"giữ nguyên trạng thái rồi làm việc khác"],
    [/마다/,"mỗi khi/mỗi lần"],
    [/리 없다|것이다/,"phỏng đoán hoặc phủ định khả năng"],
    [/보이다/,"trông có vẻ"],
  ];
  const found=rules.find(([re])=>re.test(text));
  return found?found[1]:"cần đối chiếu với nghĩa và ví dụ của câu hỏi";
}
function grammarCategoryLabel(value=""){
  const text=String(value||"").normalize("NFC");
  if(/바람에|통에|탓에|느라고|때문에|덕분에|아서|어서|기에|길래|나머지/.test(text))return "nguyên nhân/kết quả";
  if(/지만|하지만|는데도|더라도|아도|어도|고도|반면에|데 반해/.test(text))return "tương phản/nhượng bộ";
  if(/도록|게끔|려고|위해서|고자|려면/.test(text))return "mục đích/điều kiện";
  if(/자마자|는 대로|기가 무섭게|때마다|마다/.test(text))return "thời điểm/tần suất";
  if(/것 같다|듯하다|나 보다|모양이다|리 없다|것이다|보이다/.test(text))return "phỏng đoán/nhận định";
  if(/척하다|체하다/.test(text))return "giả vờ/hành động như";
  if(/듯이|처럼|같이/.test(text))return "so sánh";
  return "ngữ pháp khác";
}
function aiCardLines(card){
  const raw=cleanInputText([card?.definition,card?.wordType,card?.pronunciation,card?.example].filter(Boolean).join("\n"));
  return raw.split(/\n+/).map(x=>x.trim()).filter(Boolean);
}
function shortText(value="",max=92){
  let text=cleanInputText(value).replace(/^[.·•\-\s]+/,"").replace(/\s+/g," ").trim();
  if(text.length<=max)return text;
  return text.slice(0,max).replace(/\s+\S*$/,"").trim()+"...";
}
function aiUsefulNote(card,optionText=""){
  const lines=aiCardLines(card);
  const meaningLine=lines.find(line=>/[A-Za-zÀ-ỹ]/.test(line)&&!/[가-힣]/.test(line)&&line.length>=4&&!/^ví dụ|^dịch/i.test(line));
  return shortText(meaningLine||grammarQuickMeaning(optionText||card?.term||card?.synonyms||""),90);
}
function aiExampleLines(card){
  const lines=aiCardLines(card);
  const ko=lines.find(line=>/[가-힣]/.test(line)&&line.length>=8)||"";
  const vi=lines.find(line=>/[À-ỹ]/.test(line)&&!/[가-힣]/.test(line)&&!/^(Dùng|Mẫu|Nghĩa|Vì|Do|Giả|Phủ|So sánh|như|vì|do|làm|chỉ|đúng|sai)/i.test(line))||"";
  return {ko:shortText(ko,96),vi:shortText(vi,90)};
}
function miniMeaning(value=""){
  const text=String(value||"").normalize("NFC").replace(/\s+/g," ").trim();
  const rules=[
    [/기로 했다|기로 하다|기로 했다$/,"quyết định sẽ làm/trở thành"],
    [/되어야 한다|돼야 한다|아야 한다|어야 한다|해야 한다|아야 하다|어야 하다|해야 하다/,"phải/cần phải"],
    [/되어 간다|돼 간다|아\/어 가다|아 가다|어 가다|어 간다|아 간다/,"đang dần trở nên/diễn ra theo thời gian"],
    [/되면 좋겠다|으면 좋겠다|면 좋겠다/,"mong/nếu... thì tốt"],
    [/게 되다|게 됐다|게 되었다/,"trở nên/được xảy ra"],
    [/아\/어지다|어지다|아지다/,"trở nên/thay đổi trạng thái"],
    [/아\/어 있다|어 있다|아 있다/,"đang ở trạng thái đã hoàn thành"],
    [/아\/어 놓다|어 놓다|아 놓다/,"làm sẵn/để sẵn"],
    [/아\/어 두다|어 두다|아 두다/,"làm trước để dành"],
    [/아\/어 버리다|어 버리다|아 버리다/,"làm mất/làm xong hẳn, thường tiếc nuối"],
    [/바람에|통에/,"vì/do... nên kết quả xấu"],
    [/탓에/,"vì lỗi/nguyên nhân xấu"],
    [/느라고/,"mải làm... nên"],
    [/하지만|지만|는데도/,"nhưng/mặc dù"],
    [/더라도/,"dù... thì"],
    [/아도|어도|고도/,"dù/cả khi"],
    [/도록|지 않게|지 않도록/,"để/đến mức"],
    [/자마자|는 대로|기가 무섭게/,"ngay khi"],
    [/척하다|체하다/,"giả vờ"],
    [/듯이|처럼|같이/,"giống như"],
    [/커녕/,"đừng nói đến"],
    [/물론이고|말할 것도 없고/,"không những... mà còn"],
    [/수밖에 없다|아야만 하다|어야만 하다|지 않을 수 없다/,"buộc phải/không còn cách khác"],
    [/것 같다|듯하다|나 보다|모양이다/,"có vẻ/hình như"],
    [/뿐이다|따름이다|에 불과하다|에 지나지/,"chỉ là"],
    [/셈이다|거나 같다|거나 마찬가지|거나 다름없다/,"định/tính sẽ; coi như/gần như"],
    [/위해서|려고|고자|려면/,"để/muốn thì"],
    [/다고 해서|다기에|다고 해도|는다고 해도|봐야|봐도/,"dù/giả sử/trích dẫn"],
    [/기 마련이다|는 법이다|게 돼 있다/,"thường/tất yếu"],
    [/데다가|뿐만 아니라|것은 물론이고/,"hơn nữa/không những"],
    [/나 마나|지 않아도|것도 없이/,"khỏi cần cũng biết"],
    [/다가 보니까/,"làm mãi rồi nhận ra"],
    [/다가|는 길에/,"đang/trên đường thì"],
    [/반면에|데 반해/,"ngược lại/trái với"],
    [/면서|고서도/,"vừa... vừa/dù biết vẫn"],
    [/든지/,"bất kể"],
    [/줄 몰랐다|다고 생각했다/,"tưởng/nghĩ là"],
    [/나머지/,"vì quá... nên"],
    [/채/,"trong trạng thái"],
    [/마다/,"mỗi khi"],
    [/리 없다/,"không thể nào"],
    [/보이다/,"trông có vẻ"],
    [/셈이다/,"định/tính sẽ; coi như"],
    [/뻔했다|뻔하다|뻔이다/,"suýt nữa/gần như đã"],
    [/뿐이다/,"chỉ là/chỉ có vậy"],
    [/아 있었다|어 있었다|여 있었다|져 있었다|혀 있었다|려 있었다|고 있었다|있었다/,"đã/đang ở trạng thái đó"],
    [/아 있다|어 있다|여 있다|져 있다|혀 있다|려 있다|고 있다/,"đang ở trạng thái đó"],
    [/아졌다|어졌다|여졌다|졌다/,"đã trở nên/thay đổi trạng thái"],
    [/아진다|어진다|여진다|진다/,"trở nên/thay đổi trạng thái"],
    [/게 됐다|게 되었다|게 된다|게 되다/,"trở nên/được xảy ra"],
    [/아 간다|어 간다|여 간다|져 간다|되어 간다|돼 간다/,"đang dần thay đổi/tiếp diễn"],
    [/아 오다|어 오다|여 오다|져 오다/,"đã dần làm/diễn ra từ trước đến nay"],
  ];
  const found=rules.find(([re])=>re.test(text));
  return found?found[1]:"cần hiểu theo ngữ cảnh của câu";
}

function excelQuestionHint(q){
  const question=String(q?.question||"");
  const answer=String(q?.answer||"");
  if(/문이|창문|문을|은행|가게|문.*\(\s*\)/.test(question)&&/있었다|닫혀 있었다|열려 있었다/.test(answer)){
    return "Câu nói lúc đến nơi thì cửa đã ở trạng thái đó.";
  }
  if(/배운 지|된 지|지난 지|거의|벌써|년|개월|시간/.test(question)){
    return "Câu nói thời gian đang dần trôi qua/tiến gần một mốc.";
  }
  if(/결심|약속|계획|정했다|하기로/.test(question)){
    return "Câu nói về quyết định hoặc kế hoạch.";
  }
  if(/반드시|꼭|필요|해야|의무/.test(question)){
    return "Câu có ý bắt buộc/cần thiết.";
  }
  if(/바라|좋겠다|희망|원하/.test(question)){
    return "Câu diễn tả mong muốn.";
  }
  return "Cần chọn mẫu hợp nghĩa nhất với chỗ trống trong câu.";
}
function excelWhyCorrect(q){
  const question=String(q?.question||"");
  const answer=String(q?.answer||"");
  if(/문이|창문|문.*\(\s*\)/.test(question)&&/닫혀 있었다|닫혀있었다|닫히어 있었다/.test(answer)){
    return "Cửa đã đóng sẵn khi người nói đến, nên dùng "+answer+" = đã ở trạng thái đóng.";
  }
  if(/문이|창문|문.*\(\s*\)/.test(question)&&/열려 있었다|열려있었다/.test(answer)){
    return "Cửa đã mở sẵn khi người nói đến, nên dùng "+answer+" = đã ở trạng thái mở.";
  }
  if(/배운 지|된 지|지난 지|거의|벌써|년|개월|시간/.test(question)&&/되어 간다|돼 간다|어 간다|아 간다/.test(answer)){
    return "Câu nói về thời gian đang dần trôi qua/tiến gần đến một mốc, nên dùng "+answer+".";
  }
  if(/결심|약속|계획|정했다|하기로/.test(question)&&/기로 했다|기로 하다/.test(answer)){
    return "Câu nói về quyết định/kế hoạch, nên dùng "+answer+" = quyết định sẽ làm.";
  }
  if(/반드시|꼭|필요|해야|의무/.test(question)&&/아야|어야|해야|되어야|돼야/.test(answer)){
    return "Câu có ý bắt buộc/cần thiết, nên dùng "+answer+" = phải/cần phải.";
  }
  if(/바라|좋겠다|희망|원하/.test(question)&&/면 좋겠다|으면 좋겠다/.test(answer)){
    return "Câu diễn tả mong muốn, nên dùng "+answer+" = nếu... thì tốt/mong là.";
  }
  return excelQuestionHint(q)+" Đáp án "+answer+" = "+miniMeaning(answer)+".";
}
function excelWhySelected(selected,correct,q=null){
  const s=String(selected||""),c=String(correct||"");
  if(!s)return "Bạn chưa chọn đáp án.";
  if(grammarBaseKey(s)===grammarBaseKey(c))return "Gần giống đáp án đúng, nhưng dạng trong câu yêu cầu phải khớp chính xác.";
  if(/셈이다/.test(s))return s+" = định/tính sẽ hoặc coi như, không hợp với câu đang tả trạng thái thực tế.";
  if(/뻔했다|뻔이다/.test(s))return s+" = suýt nữa/gần như đã, nhưng câu này không nói 'suýt đóng'.";
  if(/뿐이다/.test(s))return s+" = chỉ là/chỉ có vậy, sắc thái không tự nhiên bằng đáp án đúng.";
  if(grammarCategoryLabel(s)===grammarCategoryLabel(c))return "Cùng nhóm nghĩa gần gần, nhưng sắc thái/cách dùng không khớp nhất trong câu này.";
  return s+" = "+miniMeaning(s)+", nên không hợp với ý của câu này.";
}
function aiOptionLine(text,sourceCard=null){
  const note=sourceCard?aiUsefulNote(sourceCard,text):miniMeaning(text);
  return `<div class="ai-mini-line"><strong>${escapeHtml(text||"—")}</strong> = ${escapeHtml(shortText(note,70))}</div>`;
}
function aiBox(title,body){return `<div class="ai-short-box"><div class="ai-short-title">${title}</div>${body}</div>`}
function learnDisplayedAnswer(cardIndex,card,options){
  const correctOption=(options||[]).find(opt=>learnOptionIsCorrect(opt,cardIndex));
  return cleanInputText(correctOption?.text)||learnAnswer(card);
}
function learnAiExplanationHtml(deck,cardIndex,card,options,selectedIndex){
  const selected=Number.isInteger(selectedIndex)?options[selectedIndex]:null;
  const correctOptionIndex=(options||[]).findIndex(opt=>learnOptionIsCorrect(opt,cardIndex));
  const correctOption=correctOptionIndex>=0?options[correctOptionIndex]:null;
  const correctText=cleanInputText(correctOption?.text)||learnAnswer(card);
  const selectedText=selected?.text||"";
  const isCorrect=learnOptionIsCorrect(selected,cardIndex)||state.learnAnswered==="fill-correct";
  if(isCorrect)return "";
  const correctNo=correctOptionIndex>=0?correctOptionIndex+1:"";
  const selectedNo=Number.isInteger(selectedIndex)?selectedIndex+1:"";
  const correctMeaning=aiUsefulNote(card,correctText);
  const selectedSource=selected?.cardIndex>=0?deck.cards[selected.cardIndex]:null;
  const selectedMeaning=selectedSource?aiUsefulNote(selectedSource,selectedText):miniMeaning(selectedText);
  const correctEx=aiExampleLines(card);
  const otherOptions=(options||[]).filter((opt,i)=>i!==selectedIndex&&i!==correctOptionIndex);
  const summary=`${cleanInputText(card?.term||"Câu hỏi")} ≈ ${correctText} = ${miniMeaning(correctText)}.`;
  return `<div class="learn-extra-panel mt-4 ai-explain-panel ai-short-explain"><strong>AI giải thích</strong><div class="ai-explain-content">
    ${aiBox("Đáp án đúng là:",`<p><strong>${correctNo?correctNo+". ":""}${escapeHtml(correctText||"—")}</strong></p><p>Vì <strong>${escapeHtml(correctText||"—")}</strong> = ${escapeHtml(correctMeaning||miniMeaning(correctText))}.</p>`)}
    ${correctEx.ko?aiBox("Ví dụ:",`<p>${richExampleHtml(correctEx.ko,card)}</p>${correctEx.vi?`<p class="muted">${escapeHtml(correctEx.vi)}</p>`:""}`):""}
    ${aiBox("Còn đáp án bạn chọn:",`<p><strong>${selectedNo?selectedNo+". ":""}${escapeHtml(selectedText||"—")}</strong></p><p>${escapeHtml(shortText(selectedMeaning||miniMeaning(selectedText),88))}. ${selectedText&&grammarCategoryLabel(selectedText)===grammarCategoryLabel(correctText)?`Gần nghĩa, nhưng không khớp nhất với <strong>${escapeHtml(cleanInputText(card?.term||""))}</strong>.`:`Không cùng ý chính với câu này.`}</p>`)}
    ${otherOptions.length?aiBox("Các đáp án khác:",otherOptions.map(opt=>aiOptionLine(opt.text,opt.cardIndex>=0?deck.cards[opt.cardIndex]:null)).join("")):""}
    ${aiBox("Tóm lại:",`<p><strong>${escapeHtml(summary)}</strong></p><p>Chọn đáp án khớp với ví dụ và nghĩa chính, không chọn từ chỉ gần giống.</p>`)}
  </div></div>`;
}
function excelAiExplanationHtml(q,selectedIndex){
  const selectedText=q?.options?.[selectedIndex]||"";
  if(selectedIndex===q?.answerIndex)return "";
  const correctNo=Number.isInteger(q?.answerIndex)?q.answerIndex+1:"";
  const selectedNo=Number.isInteger(selectedIndex)?selectedIndex+1:"";
  const otherOptions=(q?.options||[]).map((text,i)=>({text,i})).filter(x=>x.i!==selectedIndex&&x.i!==q?.answerIndex);
  const correctText=q?.answer||"—";
  return `<div class="learn-extra-panel mt-4 ai-explain-panel ai-short-explain"><strong>AI giải thích</strong><div class="ai-explain-content">
    ${aiBox("Đáp án đúng là:",`<p><strong>${correctNo?correctNo+". ":""}${escapeHtml(correctText)}</strong></p><p>${escapeHtml(excelWhyCorrect(q))}</p>`)}
    ${aiBox("Còn đáp án bạn chọn:",`<p><strong>${selectedNo?selectedNo+". ":""}${escapeHtml(selectedText||"—")}</strong></p><p>${escapeHtml(excelWhySelected(selectedText,correctText,q))}</p>`)}
    ${otherOptions.length?aiBox("Các đáp án khác:",otherOptions.map(({text,i})=>`<div class="ai-mini-line"><strong>${i+1}. ${escapeHtml(text||"—")}</strong> = ${escapeHtml(miniMeaning(text))}</div>`).join("")):""}
    ${aiBox("Tóm lại:",`<p>Chọn đáp án khớp nhất với ý của câu, không chỉ chọn đáp án nhìn gần giống.</p>`)}
  </div></div>`;
}


function learnStatKey(cardIndex){return String(cardIndex)}
function ensureLearnSessionStats(){
  if(!state.learnSessionStats)state.learnSessionStats=blankLearnSessionStats();
  state.learnSessionStats.correctIds=Array.isArray(state.learnSessionStats.correctIds)?state.learnSessionStats.correctIds:[];
  state.learnSessionStats.wrongMap=state.learnSessionStats.wrongMap||{};
  state.learnSessionStats.wrongOrder=Array.isArray(state.learnSessionStats.wrongOrder)?state.learnSessionStats.wrongOrder:[];
  return state.learnSessionStats;
}
function recordLearnResult(cardIndex,correct){
  const stats=ensureLearnSessionStats(),key=learnStatKey(cardIndex),deck=state.createdDecks?.[state.activeCreatedDeck],card=deck?.cards?.[cardIndex]||{};
  if(correct){
    if(!stats.correctIds.includes(key))stats.correctIds.push(key);
    return;
  }
  if(!stats.wrongMap[key]){
    stats.wrongMap[key]={cardIndex,wrongCount:0,term:card.term||"",definition:card.definition||"",synonyms:card.synonyms||"",example:card.example||""};
  }
  stats.wrongMap[key].wrongCount=(Number(stats.wrongMap[key].wrongCount)||0)+1;
  stats.wrongMap[key].term=card.term||stats.wrongMap[key].term||"";
  stats.wrongMap[key].definition=card.definition||stats.wrongMap[key].definition||"";
  stats.wrongMap[key].synonyms=card.synonyms||stats.wrongMap[key].synonyms||"";
  if(!stats.wrongOrder.includes(key))stats.wrongOrder.push(key);
}
function learnWrongItems(){
  const stats=ensureLearnSessionStats(),map=stats.wrongMap||{};
  const keys=(stats.wrongOrder||[]).filter(key=>map[key]);
  Object.keys(map).forEach(key=>{if(!keys.includes(key))keys.push(key)});
  return keys.map(key=>({...map[key],key,cardIndex:Number(map[key].cardIndex)})).filter(item=>Number.isInteger(item.cardIndex));
}
function learnSummaryStarButton(cardIndex){
  const starred=isDetailStarred(cardIndex);
  return `<button class="learn-summary-star ${starred?"starred":""}" data-learn-summary-star="${cardIndex}" title="${starred?"Bỏ sao":"Gắn sao"}">${starred?"★":"☆"}</button>`;
}
function learnSessionSummaryHtml(deck){
  const wrongItems=learnWrongItems();
  const wrongCount=wrongItems.length;
  const correctCount=Math.max(0,Number(state.learnCorrect)||0);
  const unknownCount=Math.max(0,Number(state.learnUnknown)||0);
  const grouped={};
  wrongItems.forEach(item=>{const level=Math.max(1,Number(item.wrongCount)||1);if(!grouped[level])grouped[level]=[];grouped[level].push(item)});
  const levels=Object.keys(grouped).map(Number).sort((a,b)=>a-b);
  let html=`<div class="learn-summary-panel">
    <h2>Tổng kết phiên học</h2>
    <div class="learn-summary-grid">
      <div class="learn-summary-stat correct"><strong>${correctCount}</strong><span>Số từ đúng</span></div>
      <div class="learn-summary-stat wrong"><strong>${wrongCount}</strong><span>Số từ sai</span></div>
      <div class="learn-summary-stat unknown"><strong>${unknownCount}</strong><span>Tôi không biết</span></div>
    </div>`;
  if(!wrongItems.length){
    html+=`<div class="learn-summary-perfect">Tuyệt vời! Bạn không sai từ nào trong phiên này.</div>`;
  }else{
    levels.forEach(level=>{
      html+=`<div class="learn-wrong-group"><div class="learn-wrong-group-head"><strong>Sai ${level} lần</strong><button class="button small" data-star-wrong-level="${level}">Gắn sao nhóm này</button></div>`;
      grouped[level].forEach(item=>{
        const card=deck?.cards?.[item.cardIndex]||item;
        const meaning=card.definition||primarySynonym(card)||card.synonyms||"Chưa có nghĩa";
        html+=`<div class="learn-wrong-row"><div><strong>${escapeHtml(card.term||item.term||"—")}</strong><span>${escapeHtml(shortText(meaning,110))}</span></div>${learnSummaryStarButton(item.cardIndex)}</div>`;
      });
      html+=`</div>`;
    });
    html+=`<div class="learn-summary-actions"><button class="button" data-action="learn-wrong-again">Học lại từ sai</button><button class="button primary" data-action="star-all-wrong">Gắn sao tất cả từ sai</button></div>`;
  }
  html+=`</div>`;
  return html;
}
function starWrongCards(level=null){
  const wrongItems=learnWrongItems().filter(item=>level===null||(Number(item.wrongCount)||1)===Number(level));
  if(!wrongItems.length){showToast("Không có từ sai để gắn sao","circle-alert");return}
  wrongItems.forEach(item=>{state.detailStars[`${state.activeCreatedDeck}:${item.cardIndex}`]=true});
  save();render();showToast(level===null?"Đã gắn sao tất cả từ sai":`Đã gắn sao nhóm sai ${level} lần`);
}
function startWrongLearnSession(){
  const deck=state.createdDecks[state.activeCreatedDeck];
  const order=learnWrongItems().map(item=>item.cardIndex).filter(i=>deck?.cards?.[i]);
  if(!order.length){showToast("Không có từ sai để học lại","circle-alert");return}
  startLearnSession({order,mode:"wrong",forceRestart:true,preserveDeckProgress:true});
}

function learnSessionPage(){const deck=state.createdDecks[state.activeCreatedDeck];if(!deck){state.route="decks";return decksPage()}if(!state.learnOrder.length)return `<div class="learn-session"><div class="learn-topbar"><button class="learn-exit" data-action="exit-learn">${icon("arrow-left")} Thoát</button><button class="button small" data-action="learn-settings">${icon("settings")} Cài đặt</button></div><section class="card learn-finished"><h1>Không có thẻ phù hợp</h1><p class="muted">Hãy thay đổi bộ lọc trong Cài đặt học tập.</p></section></div>`;if(state.learnCompleted>=state.learnOrder.length)return `<div class="learn-session"><div class="learn-topbar"><button class="learn-exit" data-action="exit-learn">${icon("arrow-left")} Thoát</button></div><section class="card learn-finished"><strong>${state.learnCorrect}/${state.learnOrder.length}</strong><h1>Hoàn thành phiên học!</h1><p class="muted">Bạn đã trả lời đúng ${state.learnCorrect} câu và chọn “Tôi không biết” ${state.learnUnknown} câu.</p>${learnSessionSummaryHtml(deck)}<div class="flex justify-center gap-2 mt-6 flex-wrap"><button class="button" data-action="exit-learn">Về bộ thẻ</button><button class="button primary" data-action="restart-learn">Học lại toàn bộ</button></div></section></div>`;
  const cardIndex=state.learnOrder[state.learnIndex],card=deck.cards[cardIndex],options=state.learnOptions,showExample=!!state.learnSettings.showExample,exampleText=cleanInputText(card.example||card.pronunciation||card.wordType||"");
  return `<div class="learn-session"><div class="learn-topbar"><button class="learn-exit" data-action="exit-learn">${icon("arrow-left")} Thoát</button><button class="button small" data-action="learn-settings">${icon("settings")} Cài đặt</button></div>
  <div class="learn-progress">${state.learnOrder.map((_,i)=>`<i class="learn-progress-segment ${i<state.learnCompleted?"done":i===state.learnIndex?"current":""}"></i>`).join("")}<small class="text-indigo-300">+${Math.max(0,state.learnOrder.length-state.learnCompleted)}</small></div>
  <section class="learn-question-card"><div class="learn-question-head"><h1 class="learn-term">${escapeHtml(learnPrompt(card))}</h1><div class="learn-question-tools"><button class="example-toggle ${showExample?"on":""}" data-action="toggle-learn-example" title="Ẩn/hiện ví dụ / giải thích" aria-label="Ẩn/hiện ví dụ / giải thích"></button><button data-speak="${escapeAttr(card.term)}">${icon("volume-2")}</button><button class="${isDetailStarred(cardIndex)?"starred":""}" data-learn-star="${cardIndex}">${starIcon(isDetailStarred(cardIndex))}</button><button data-action="edit-learn-card">${icon("pencil")}</button></div></div>
    ${showExample?`<div class="learn-extra-panel"><strong>Ví dụ / giải thích</strong><span>${exampleText?richExampleHtml(exampleText,card):"Chưa có ví dụ / giải thích"}</span></div>`:""}
    ${state.learnSettings.fillBlank?`<form id="fillBlankForm" class="mt-8"><input id="fillBlankAnswer" class="input" autocomplete="off" placeholder="Nhập câu trả lời..."><button class="button primary mt-3" ${state.learnAnswered!==null?"disabled":""}>Kiểm tra</button></form>`:`<div class="learn-options">${options.map((option,i)=>{const selected=state.learnAnswered===i,correct=learnOptionIsCorrect(option,cardIndex);return `<button class="learn-option ${state.learnAnswered!==null?(correct?"correct":selected?"wrong":""):""}" data-learn-answer="${i}" ${state.learnAnswered!==null?"disabled":""}><span class="option-number">${i+1}</span><span>${escapeHtml(option.text||"Chưa có định nghĩa")}</span></button>`}).join("")}</div>`}
    ${state.learnAnswered===null?'<button class="dont-know" data-action="learn-unknown">5. Tôi không biết</button>':`<div class="learn-feedback">${state.learnAnswered==="unknown"?"Đáp án: "+escapeHtml(learnDisplayedAnswer(cardIndex,card,options)):state.learnAnswered==="fill-correct"?"Chính xác!":state.learnAnswered==="fill-wrong"?"Chưa đúng. Đáp án: "+escapeHtml(learnAnswer(card)):learnOptionIsCorrect(options[state.learnAnswered],cardIndex)?"Chính xác!":"Chưa đúng. Đáp án: "+escapeHtml(learnDisplayedAnswer(cardIndex,card,options))}<br>${Number.isInteger(state.learnAnswered)&&!learnOptionIsCorrect(options[state.learnAnswered],cardIndex)?learnAiExplanationHtml(deck,cardIndex,card,options,state.learnAnswered):""}<button class="button primary small mt-3" data-action="next-learn">Tiếp tục</button></div>`}
  </section><div class="learn-footer"><span>Đã hoàn thành: ${state.learnCompleted}/${state.learnOrder.length}</span><span>•</span><span>Câu hỏi: ${state.learnCompleted+1}</span></div></div>`}
function shuffled(array){const copy=[...array];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
function realAnswerParts(card){
  const termNorm=normalizeLearnText(card?.term);
  const bad=new Set([termNorm,normalizeLearnText("Chưa có nghĩa"),normalizeLearnText("Chưa có định nghĩa"),normalizeLearnText("—")]);
  const parts=[];
  const seen=new Set(),seenGrammar=new Set();
  for(const item of splitAnswerParts(card?.synonyms)){
    const norm=normalizeLearnText(item),grammarKey=grammarBaseKey(item);
    if(!norm||bad.has(norm)||seen.has(norm))continue;
    if(shouldHideAsSameQuestionAnswer(item,card?.term))continue;
    if(grammarKey&&seenGrammar.has(grammarKey))continue;
    parts.push(item);
    seen.add(norm);
    if(grammarKey)seenGrammar.add(grammarKey);
  }
  return parts;
}
function groupedAnswerParts(card){
  const termNorm=normalizeLearnText(card?.term);
  const bad=new Set([termNorm,normalizeLearnText("Chưa có nghĩa"),normalizeLearnText("Chưa có định nghĩa"),normalizeLearnText("—")]);
  const parts=[];
  const seen=new Set();
  const add=item=>{
    item=cleanInputText(item);
    const norm=normalizeLearnText(item);
    if(!item||!norm||bad.has(norm)||seen.has(norm))return;
    parts.push(item);
    seen.add(norm);
  };
  add(card?.sourceRoot);
  splitAnswerParts(card?.synonyms).forEach(add);
  return parts;
}
function isGroupedSynonymCard(card){
  return !!(card?.sourceGroupKey||card?.sourceRoot||String(card?.wordType||"").startsWith("Nhóm gốc:"));
}
function answerPartsForCard(card){
  if(isGroupedSynonymCard(card)){
    const grouped=groupedAnswerParts(card);
    if(grouped.length)return grouped;
  }
  return realAnswerParts(card);
}
function cardGroupKey(card,index=0){
  if(card?.sourceGroupKey)return String(card.sourceGroupKey);
  if(card?.sourceRoot)return normalizeLearnText(card.sourceRoot);
  const match=String(card?.wordType||"").match(/Nhóm gốc:\s*(.+)$/);
  if(match?.[1])return normalizeLearnText(match[1]);
  return `card-${index}`;
}
function learnOptionIsCorrect(option,cardIndex){
  return !!option&&(option.cardIndex===cardIndex||option.correctFor===cardIndex);
}
function hasRealDefinition(card){const text=cleanInputText(card?.definition);const norm=normalizeLearnText(text);return !!text&&!/^chưa có (nghĩa|định nghĩa)$/i.test(text)&&norm!==normalizeLearnText(card?.term)}
function primarySynonym(card){return answerPartsForCard(card)[0]||""}
function learnPrompt(card){return state.learnSettings.answerTerm?(hasRealDefinition(card)?card.definition:(primarySynonym(card)||"—")):(card.term||"—")}
function learnAnswer(card){if(state.learnSettings.answerTerm)return card.term||"—";if(hasRealDefinition(card))return card.definition;if(state.learnSettings.acceptSynonyms&&card.synonyms)return primarySynonym(card)||"—";return card.definition||"Chưa có nghĩa"}
function learnFillBlankAnswers(card){const answers=[];if(state.learnSettings.answerTerm){if(card.term)answers.push(card.term)}else{if(hasRealDefinition(card))answers.push(card.definition);if(state.learnSettings.acceptSynonyms&&card.synonyms)answers.push(...answerPartsForCard(card))}return answers.filter(Boolean)}
function buildLearnOptions(cardIndex){
  const deck=state.createdDecks[state.activeCreatedDeck];
  const currentCard=deck.cards[cardIndex]||{};
  const currentTermNorm=normalizeLearnText(currentCard.term);
  const currentGroupKey=cardGroupKey(currentCard,cardIndex);
  const correctCandidates=answerPartsForCard(currentCard).filter(x=>normalizeLearnText(x)!==currentTermNorm);
  const correctText=shuffled(correctCandidates)[0]||learnAnswer(currentCard)||"Chưa có nghĩa";
  const correct={cardIndex,correctFor:cardIndex,text:correctText,groupKey:currentGroupKey};
  const seen=new Set([normalizeLearnText(correct.text),currentTermNorm]);
  const seenGrammar=new Set([grammarBaseKey(correct.text),grammarBaseKey(currentCard.term)].filter(Boolean));
  const pool=deck.cards.map((card,index)=>{
    const parts=answerPartsForCard(card).filter(x=>normalizeLearnText(x)!==normalizeLearnText(card.term));
    return {cardIndex:index,text:shuffled(parts)[0]||learnAnswer(card),groupKey:cardGroupKey(card,index)};
  }).filter(x=>{
    const norm=normalizeLearnText(x.text);
    return cleanInputText(x.text)&&norm&&norm!==normalizeLearnText("Chưa có nghĩa")&&norm!==normalizeLearnText("—")&&norm!==currentTermNorm&&x.groupKey!==currentGroupKey;
  });
  const wrong=[];
  for(const item of shuffled(pool)){
    const norm=normalizeLearnText(item.text),grammarKey=grammarBaseKey(item.text);
    if(!norm||seen.has(norm)||shouldHideAsSameQuestionAnswer(item.text,currentCard.term))continue;
    if(grammarKey&&seenGrammar.has(grammarKey))continue;
    wrong.push(item);
    seen.add(norm);
    if(grammarKey)seenGrammar.add(grammarKey);
    if(wrong.length>=3)break;
  }
  const fallbacks=["Chưa xác định","Một khái niệm khác","Không thuộc nhóm này","Tất cả đều sai"];
  while(wrong.length<3)wrong.push({cardIndex:-wrong.length-1,text:fallbacks[wrong.length],groupKey:`fallback-${wrong.length}`});
  return shuffled([correct,...wrong]);
}
function practicePage(){
  const tabs=[["flashcard","Flashcard"],["quiz","Quiz nhanh"],["dictionary","Tra từ"]];
  return header("Luyện tập","Chọn phương pháp phù hợp với mục tiêu hôm nay.")+`<div class="tabs">${tabs.map(([k,n],i)=>`<button class="tab-button ${i===0?"active":""}" data-practice-tab="${k}">${n}</button>`).join("")}</div><div id="practicePanel">${flashcardPanel()}</div>`;
}
function currentFlashcards(){if(Number.isInteger(state.activeCreatedDeck)&&state.createdDecks[state.activeCreatedDeck])return state.createdDecks[state.activeCreatedDeck].cards.map(c=>({term:c.term||"—",reading:c.pronunciation||c.wordType||"",meaning:c.definition||"Chưa có định nghĩa",example:c.example||"",synonyms:c.synonyms||"",image:c.image||""}));return words}
function flashcardPanel(){const source=currentFlashcards();const index=(state.flashIndex||0)%source.length;const w=source[index];const title=Number.isInteger(state.activeCreatedDeck)&&state.createdDecks[state.activeCreatedDeck]?state.createdDecks[state.activeCreatedDeck].title:"Flashcard";return `<div class="quiz-shell"><div class="flex justify-between items-center mb-3"><strong>${escapeHtml(title)}</strong><span class="pill">${index+1}/${source.length}</span></div><div id="flashcard" class="card flashcard"><div>${w.image?`<img src="${w.image}" alt="" class="mx-auto mb-5 max-h-32 rounded-xl">`:""}<div class="term">${escapeHtml(w.term)}</div><p class="hint muted mt-4">Chạm để xem đáp án</p><div class="answer">${w.reading?`<p class="text-indigo-400">${escapeHtml(w.reading)}</p>`:""}<h2>${escapeHtml(w.meaning)}</h2>${w.example?`<p class="muted">${escapeHtml(w.example)}</p>`:""}${w.synonyms?`<p class="muted text-sm">Đồng nghĩa: ${escapeHtml(w.synonyms)}</p>`:""}</div></div></div><div class="flex justify-center gap-2 mt-4"><button class="button danger" data-rate="again">Chưa nhớ</button><button class="button" data-rate="hard">Khó</button><button class="button primary" data-rate="easy">Đã nhớ</button></div></div>`}
function quizPanel(){
  const q=quizQuestions[state.quizIndex%quizQuestions.length];
  return `<div class="quiz-shell card section-card"><div class="flex justify-between"><span class="pill">Câu ${state.quizIndex+1}/${quizQuestions.length}</span><strong>${state.quizScore} điểm</strong></div><h2 class="my-6">${q.q}</h2><div>${q.options.map((o,i)=>`<button class="quiz-option ${state.quizAnswered===i?(i===q.answer?"correct":"wrong"):""} ${state.quizAnswered!==null&&i===q.answer?"correct":""}" data-answer="${i}" ${state.quizAnswered!==null?"disabled":""}>${String.fromCharCode(65+i)}. ${o}</button>`).join("")}</div>${state.quizAnswered!==null?`<button class="button primary mt-5" data-action="next-question">Câu tiếp theo</button>`:""}</div>`}
function quizExcelPage(){
  const qz=state.excelQuiz,questions=excelActiveQuestions(),current=questions[qz.index%Math.max(questions.length,1)];
  const preview=(qz.questions||[]).slice(0,5);
  const pages=excelPages();
  const starredCount=(qz.starredIds||[]).length,masteredCount=(qz.correctIds||[]).length,unmasteredCount=Math.max(0,qz.questions.length-masteredCount);
  return header("Quiz từ Excel","Tải Google Sheet công khai, CSV/TSV hoặc dán bảng từ Excel để luyện quiz ngay.",button(`${icon("play")} Bắt đầu lại`,"excel-restart","primary"))+
  `<div class="excel-quiz-page">
    <section class="excel-source-panel">
      <div class="card section-card">
        <div class="section-title"><h2>${icon("link")} Nguồn câu hỏi</h2><span class="pill">${escapeHtml(qz.sourceName)}</span></div>
        <div class="field"><label>Link Google Sheet hoặc CSV công khai</label><div class="excel-url-row"><input class="input" data-excel-field="sourceUrl" value="${escapeAttr(qz.sourceUrl)}" placeholder="https://docs.google.com/spreadsheets/d/... hoặc https://.../file.csv"><button class="button primary" data-action="excel-load-url">${icon("download")} Tải</button></div></div>
        <div class="excel-source-actions">
          <button class="button" data-action="excel-pick-file">${icon("upload")} Nhập CSV/TSV</button>
          <button class="button" data-action="excel-load-sample">${icon("sparkles")} Dữ liệu mẫu</button>
          <button class="button danger" data-action="excel-clear">${icon("trash-2")} Xóa dữ liệu</button>
        </div>
        <div class="field mt-4"><label>Dán bảng từ Excel</label><textarea class="input excel-paste-box" data-excel-field="pasteData" placeholder="Trang	Câu hỏi	Đáp án	Đáp án sai 1	Đáp án sai 2	Đáp án sai 3">${escapeHtml(qz.pasteData||"")}</textarea></div>
        <button class="button primary mt-3" data-action="excel-parse-paste">${icon("table")} Dùng dữ liệu đã dán</button>
      </div>
      <div class="card section-card">
        <div class="section-title"><h2>${icon("sliders-horizontal")} Cài đặt học tập</h2></div>
        <div class="settings-section"><h3>Phạm vi học</h3>
          <div class="field excel-page-filter"><label>Trang</label><select class="input" data-excel-select="pageFilter"><option value="all">Tất cả trang</option>${pages.map(page=>`<option value="${escapeAttr(page)}" ${String(qz.pageFilter||"all")===String(page)?"selected":""}>Trang ${escapeHtml(page)}</option>`).join("")}</select></div>
          ${!pages.length&&qz.questions.length?`<button class="button small mt-2" data-action="excel-refresh-pages">${icon("refresh-cw")} Cập nhật trang</button><p class="setting-help">Dữ liệu này được nạp trước khi có bộ lọc trang. Hãy cập nhật để đọc lại cột trang.</p>`:""}
          <label class="setting-choice"><input type="checkbox" data-excel-setting="onlyStarred" ${qz.onlyStarred?"checked":""}><span>${icon("star")} Chỉ học câu đánh dấu sao (${starredCount} câu)<small>Gắn sao câu quan trọng để ôn riêng như bên bộ thẻ.</small></span></label>
          <label class="setting-choice"><input type="checkbox" data-excel-setting="onlyWrong" ${qz.onlyWrong?"checked":""}><span>${icon("circle-x")} Chỉ học câu sai (${qz.wrongIds.length} câu)<small>Dùng danh sách câu đã trả lời sai trong lượt này.</small></span></label>
          <label class="setting-choice"><input type="checkbox" data-excel-setting="onlyUnmastered" ${qz.onlyUnmastered?"checked":""}><span>${icon("graduation-cap")} Chỉ học câu chưa thuộc (${unmasteredCount} câu)<small>Ẩn những câu đã trả lời đúng ít nhất một lần.</small></span></label>
        </div>
        <div class="settings-section mt-4"><h3>Thứ tự học</h3>
          <label class="setting-choice"><input type="checkbox" data-excel-setting="shuffle" ${qz.shuffle?"checked":""}><span>${icon("shuffle")} Trộn câu hỏi<small>Xáo thứ tự câu và đáp án khi bắt đầu lại.</small></span></label>
          <label class="setting-choice"><input type="checkbox" data-excel-setting="autoAdvance" ${qz.autoAdvance?"checked":""}><span>${icon("skip-forward")} Tự chuyển câu khi trả lời đúng<small>Chọn đúng sẽ tự sang câu tiếp theo sau một nhịp ngắn.</small></span></label>
        </div>
        <div class="settings-section mt-4"><h3>Tiến độ</h3>
          <button class="button small" data-action="reset-excel-progress">${icon("rotate-ccw")} Reset tiến độ</button>
        </div>
        <div class="excel-stats">
          <div class="stat"><strong>${qz.questions.length}</strong><small>Câu đã nạp</small></div>
          <div class="stat"><strong>${qz.score}</strong><small>Điểm lượt này</small></div>
          <div class="stat"><strong>${starredCount}</strong><small>Câu gắn sao</small></div>
          <div class="stat"><strong>${qz.wrongIds.length}</strong><small>Câu cần ôn</small></div>
          <div class="stat"><strong>${masteredCount}</strong><small>Câu đã thuộc</small></div>
        </div>
      </div>
    </section>
    <section class="excel-study-panel">
      ${questions.length&&current?excelQuestionCard(current,questions):excelEmptyState(qz)}
      <div class="card section-card">
        <div class="section-title"><h2>${icon("table")} Xem trước dữ liệu</h2><span class="pill">${qz.questions.length} dòng</span></div>
        ${preview.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Trang</th><th>Câu hỏi</th><th>Đáp án</th><th>Nhiễu</th></tr></thead><tbody>${preview.map(q=>`<tr><td>${escapeHtml(q.page||"—")}</td><td>${escapeHtml(q.question)}</td><td>${escapeHtml(q.answer)}</td><td>${escapeHtml(q.wrongs.join(", ")||"Tự tạo")}</td></tr>`).join("")}</tbody></table></div>`:`<p class="empty">Tải hoặc dán dữ liệu để xem trước.</p>`}
      </div>
    </section>
  </div>`;
}
function excelEmptyState(qz){
  const hasData=(qz.questions||[]).length>0;
  return `<div class="card section-card excel-empty-state"><div class="login-icon">${icon(hasData?"filter":"file-spreadsheet")}</div><h2>${hasData?"Không có câu phù hợp":"Chưa có dữ liệu quiz"}</h2><p class="muted">${hasData?"Hãy tắt bớt bộ lọc hoặc gắn sao/trả lời thêm câu để tạo danh sách ôn.":"Dữ liệu cần tối thiểu hai cột: câu hỏi và đáp án. Các cột sau sẽ dùng làm đáp án nhiễu."}</p></div>`;
}
function excelQuestionCard(q,questions){
  const qz=state.excelQuiz,isAnswered=qz.answered!==null&&qz.answered!==undefined;
  const starred=excelIsStarred(q.id);
  return `<div class="card section-card excel-question-card">
    <div class="excel-question-head">
      <div class="excel-question-main">
        <div class="excel-question-meta"><span class="pill">Câu ${qz.index+1}/${questions.length}</span><strong>${qz.score} điểm</strong></div>
        <h2>${formatExcelQuestion(q)}</h2>
      </div>
      <button type="button" class="excel-star-button ${starred?"starred":""}" data-excel-star="${escapeAttr(q.id)}" title="${starred?"Bỏ dấu sao":"Gắn dấu sao"}">${starred?"★":icon("star")}</button>
    </div>
    <div class="excel-options">${q.options.map((option,i)=>`<button class="quiz-option ${isAnswered&&i===q.answerIndex?"correct":""} ${qz.answered===i&&i!==q.answerIndex?"wrong":""}" data-excel-answer="${i}" ${isAnswered?"disabled":""}>${i+1}. ${escapeHtml(option)}</button>`).join("")}</div>
    ${isAnswered?`<div class="learn-feedback">${qz.answered===q.answerIndex?"Chính xác!":"Đáp án đúng: "+escapeHtml(q.answer)}${qz.answered!==q.answerIndex?excelAiExplanationHtml(q,qz.answered):""}</div><button class="button primary mt-4" data-action="excel-next-question">${qz.index+1>=questions.length?"Hoàn thành":"Câu tiếp theo"}</button>`:""}
  </div>`;
}
function formatExcelQuestion(q){
  const question=String(q.question||""),range=detectUnderlineRange(question,q.options||[]);
  if(!range)return escapeHtml(question);
  return `${escapeHtml(question.slice(0,range.start))}<span class="question-underline">${escapeHtml(question.slice(range.start,range.end))}</span>${escapeHtml(question.slice(range.end))}`;
}
function detectUnderlineRange(question,options){
  if(!/[가-힣]/.test(question)||!options?.length)return null;
  const stems=options.map(koreanStem).filter(stem=>stem.length>=2);
  const common=longestCommonPrefix(stems);
  const target=(common.length>=2?common:stems.sort((a,b)=>b.length-a.length)[0]||"").slice(0,4);
  const grammarRange=detectGrammarUnderline(question,stems,target);
  if(grammarRange)return grammarRange;
  if(target.length<2)return null;
  const start=question.indexOf(target);
  if(start<0)return null;
  let end=question.length;
  const suffix=question.slice(start),stop=suffix.match(/(?:고|는데|지만|어서|아서|까 봐|봐|니까|면|며|서|도)\s|[,.!?。！？]\s/);
  if(stop?.index>0)end=start+stop.index+stop[0].trim().length;
  return end>start?{start,end}:null;
}
function koreanStem(value){return String(value||"").replace(/^[A-D]\.?\s*/i,"").match(/[가-힣]+/)?.[0]||""}
function detectGrammarUnderline(question,stems,target){
  const roots=[...new Set([target?.[0],...stems.map(stem=>stem[0])].filter(Boolean))];
  const grammarPatterns=[
    "기만 하면","기 마련이다","까 봐","만 하면","는 동안","는 탓에","때마다","고 나서","도록","려고","려면","면서","는데","다면","을수록","ㄹ수록"
  ];
  for(const root of roots){
    for(const pattern of grammarPatterns){
      const compact=pattern.replace(/\s+/g,"\\s+");
      const match=question.match(new RegExp(`${root}[가-힣]*${compact}`));
      if(match?.index!==undefined)return {start:match.index,end:match.index+match[0].length};
    }
  }
  return null;
}
function longestCommonPrefix(values){
  if(!values.length)return"";
  let prefix=values[0];
  for(const value of values.slice(1)){while(prefix&&!value.startsWith(prefix))prefix=prefix.slice(0,-1)}
  return prefix;
}
function dictionaryPanel(){return `<div class="card section-card max-w-3xl"><div class="flex gap-2"><input id="dictionaryInput" class="input" placeholder="Nhập chữ Hán, âm Hán Việt hoặc nghĩa..."><button class="button primary" data-action="lookup">Tra từ</button></div><div id="dictionaryResults" class="search-results"><p class="empty">Nhập từ khóa để bắt đầu tra cứu.</p></div></div>`}
function examPage(){return header("Luyện thi","Mô phỏng bài thi với giới hạn thời gian và kết quả chi tiết.",button("Bắt đầu đề mới","start-exam","primary"))+`<div class="grid md:grid-cols-3 gap-4">${[["TOPIK II · Từ vựng","50 câu","60 phút"],["Hán Việt tổng hợp","40 câu","45 phút"],["Thành ngữ nâng cao","30 câu","30 phút"]].map((e,i)=>`<article class="card section-card card-hover"><span class="pill">Đề ${i+1}</span><h2 class="mt-4">${e[0]}</h2><p class="muted text-sm my-3">${e[1]} · ${e[2]}</p>${progress([65,30,0][i])}<button class="button primary w-full mt-5" data-exam="${i}">${i===2?"Bắt đầu":"Làm tiếp"}</button></article>`).join("")}</div>`}
function communityPage(){return header("Cộng đồng","Chia sẻ thành tích, hỏi đáp và học cùng nhau.",button(`${icon("plus")} Đăng bài`,"new-post","primary"))+`<div class="grid lg:grid-cols-[1fr_320px] gap-5"><div id="feed" class="stack">${["Mẹo nhớ 20 từ Hán Việt theo bộ thủ","Mình vừa hoàn thành chuỗi học 30 ngày!","Ai đang ôn TOPIK II cùng mình?"].map((t,i)=>`<article class="card section-card"><div class="flex gap-3"><span class="avatar">${["TH","QB","LP"][i]}</span><div><strong>${["Thu Hà","Quốc Bảo","Lan Phương"][i]}</strong><p class="muted text-xs">Khoảng ${i+1} giờ trước</p></div></div><h2 class="text-base mt-4">${t}</h2><p class="muted text-sm">Cùng trao đổi kinh nghiệm học và ghi nhớ từ vựng hiệu quả nhé.</p><div class="flex gap-2 mt-4"><button class="button small" data-like="${i}">${icon("heart")} <span>${12+i*7}</span></button><button class="button small" data-comment="${i}">${icon("message-circle")} Bình luận</button></div></article>`).join("")}</div><aside class="card section-card h-fit"><h2 class="text-sm">Chủ đề nổi bật</h2>${["#TOPIKII","#HánViệtMỗiNgày","#ThànhNgữ","#HọcCùngNhau"].map(x=>`<button class="dropdown-item" data-topic="${x}">${x}</button>`).join("")}</aside></div>`}
function statsPage(){const vals=[32,48,41,75,62,91,state.today];return header("Thống kê","Xem xu hướng học tập và điểm cần cải thiện.",button("Xuất báo cáo","export-stats"))+`<div class="stats-grid md:grid-cols-4 mb-5">${[["Tổng câu","2.840"],["Độ chính xác","78%"],["Thời gian","18,4 giờ"],["XP",state.xp.toLocaleString()]].map(x=>`<div class="card stat"><strong>${x[1]}</strong><small>${x[0]}</small></div>`).join("")}</div><section class="card section-card"><h2 class="text-sm">Hoạt động 7 ngày</h2><div class="chart">${vals.map(v=>`<div class="bar" style="height:${Math.max(18,v/1.6)}%"><span>${v}</span></div>`).join("")}</div></section>`}
function calendarPage(){const days=Array.from({length:30},(_,i)=>i+1);return header("Lịch học","Lên kế hoạch và duy trì nhịp học đều đặn.",button(`${icon("plus")} Thêm lịch`,"add-schedule","primary"))+`<section class="card section-card"><div class="grid grid-cols-7 gap-2">${["T2","T3","T4","T5","T6","T7","CN"].map(x=>`<div class="text-center muted text-xs">${x}</div>`).join("")}${days.map(d=>`<button class="aspect-square rounded-xl border ${state.calendar.includes(d)?"border-indigo-500 bg-indigo-500/20":"border-white/5 bg-white/[.02]"}" data-calendar-day="${d}"><strong>${d}</strong>${state.calendar.includes(d)?'<small class="block text-[9px] text-indigo-300">Học</small>':""}</button>`).join("")}</div></section>`}
function leaderboardPage(){const me=currentUser(),myName=me.signedIn?me.name:"Bạn";const users=[["Trung Kiên",4820],["Thu Hà",2190],[myName,state.xp,true],["Quốc Bảo",1950],["Lan Phương",1820]];return header("Bảng xếp hạng","Thi đua tích cực cùng cộng đồng mỗi tuần.")+`<div class="card section-card max-w-3xl">${users.sort((a,b)=>b[1]-a[1]).map((u,i)=>`<div class="list-row ${u[2]?"bg-indigo-500/10 rounded-xl":""}"><strong class="w-8 text-center">${i<3?["🥇","🥈","🥉"][i]:i+1}</strong>${u[2]?userAvatar(me):`<span class="avatar">${initials(u[0])}</span>`}<div class="row-main"><strong>${escapeHtml(u[0])} ${u[2]?"(bạn)":""}</strong></div><strong>${u[1].toLocaleString()} XP</strong></div>`).join("")}</div>`}
function settingsPage(){
  const user=currentUser(),bg={...defaultBackground,...(state.background||{})},preview=backgroundPreviewUrl();
  const syncInfo=hvqCloudEnabled()?`Cloud sync: ${hvqCloudLastStatus==="synced"?"đã bật":"đang chờ"}`:"Cloud sync: chưa cấu hình";
  const settingsActions=user.signedIn?button(`${icon("cloud")} Đồng bộ ngay`,"sync-cloud-now","primary")+button(`${icon("log-out")} Đăng xuất`,"sign-out"):button(`${icon("log-in")} Đăng nhập Google`,"sign-in-google","primary");
  return header("Cài đặt",`Tùy chỉnh trải nghiệm học tập của bạn. ${syncInfo}`,settingsActions)+
  `<form id="settingsForm" class="card section-card max-w-3xl"><div class="profile-settings-head">${userAvatar(user)}<div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email||"Chưa đăng nhập Google")}</small></div></div><div class="form-grid"><div class="field"><label>Tên hiển thị</label><input name="name" class="input" value="${escapeAttr(user.name)}" ${user.signedIn?"readonly":""}></div><div class="field"><label>Mục tiêu mỗi ngày</label><input name="dailyGoal" type="number" min="5" max="500" class="input" value="${state.dailyGoal}"></div><div class="field"><label>Giao diện</label><select name="theme" class="input"><option value="dark" ${state.theme==="dark"?"selected":""}>Tối</option><option value="midnight" ${state.theme==="midnight"?"selected":""}>Midnight</option></select></div><div class="field"><label>Thông báo học tập</label><select name="notifications" class="input"><option value="true">Bật</option><option value="false" ${!state.notifications?"selected":""}>Tắt</option></select></div><div class="field full"><label>Giới thiệu</label><textarea class="input" rows="4">Đang chinh phục TOPIK II và từ Hán Việt.</textarea></div></div><div class="flex gap-2 mt-5"><button class="button primary" type="submit">Lưu cài đặt</button><button class="button danger" type="button" data-action="reset-data">Đặt lại dữ liệu</button></div></form>
  <section class="card section-card max-w-3xl mt-5">
    <div class="section-title"><h2>${icon("image")} Hình nền trang web</h2><span class="pill">OpenQuiz style</span></div>
    <div class="form-grid">
      <div class="field"><label>Kiểu hình nền</label><select class="input" data-background-field="mode"><option value="preset" ${bg.mode==="preset"?"selected":""}>Ảnh chấm bi như mẫu</option><option value="custom" ${bg.mode==="custom"?"selected":""}>Ảnh tự chọn</option><option value="none" ${bg.mode==="none"?"selected":""}>Tắt hình nền</option></select></div>
      <div class="field"><label>Độ rõ ảnh</label><div class="range-row"><input type="range" min="0.2" max="1" step="0.05" value="${escapeAttr(bg.opacity)}" data-background-field="opacity"><span class="pill">${Math.round((Number(bg.opacity)||1)*100)}%</span></div></div>
      <div class="field"><label>Lớp tối để dễ đọc</label><div class="range-row"><input type="range" min="0" max="0.55" step="0.01" value="${escapeAttr(bg.overlay)}" data-background-field="overlay"><span class="pill">${Math.round((Number(bg.overlay)||0)*100)}%</span></div></div>
      <div class="field"><label>Làm mờ ảnh</label><div class="range-row"><input type="range" min="0" max="8" step="1" value="${escapeAttr(bg.blur)}" data-background-field="blur"><span class="pill">${Number(bg.blur)||0}px</span></div></div>
      <div class="field full"><label>Xem trước</label><div class="background-preview-box" style="--preview-bg-image:${preview?`url('${escapeAttr(preview)}')`:"linear-gradient(135deg,#0f172a,#111827)"};--preview-bg-overlay:${escapeAttr(bg.overlay)}"></div></div>
    </div>
    <div class="bg-action-row mt-4"><button class="button primary" type="button" data-action="pick-background">${icon("upload")} Chọn ảnh nền</button><button class="button" type="button" data-action="reset-background">${icon("sparkles")} Dùng ảnh chấm bi mẫu</button><button class="button danger" type="button" data-action="clear-background">Tắt hình nền</button></div>
    <p class="setting-help mt-3">Khi đưa lên GitHub, nhớ upload cả thư mục <strong>assets</strong> cùng với <strong>app.js</strong>.</p>
  </section>`
}

function ensureLearnSummaryStyle(){
  if(document.querySelector("#hvqLearnSummaryStyle"))return;
  const style=document.createElement("style");
  style.id="hvqLearnSummaryStyle";
  style.textContent=`
    .learn-summary-panel{width:min(780px,100%);margin:24px auto 0;padding:20px;border-radius:22px;background:rgba(15,23,42,.42);border:1px solid rgba(148,163,184,.18);text-align:left}
    .learn-summary-panel h2{text-align:center;font-size:22px;margin:0 0 16px;color:#f8fafc}
    .learn-summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:20px}
    .learn-summary-stat{padding:16px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);text-align:center}
    .learn-summary-stat strong{display:block;font-size:34px;line-height:1;font-weight:900}
    .learn-summary-stat span{display:block;margin-top:8px;color:#cbd5e1;font-size:13px;font-weight:700}
    .learn-summary-stat.correct strong{color:#34d399}.learn-summary-stat.wrong strong{color:#fb7185}.learn-summary-stat.unknown strong{color:#fbbf24}
    .learn-summary-perfect{text-align:center;color:#34d399;font-weight:800;padding:16px;border-radius:16px;background:rgba(52,211,153,.1)}
    .learn-wrong-group{margin-top:16px}.learn-wrong-group-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.learn-wrong-group-head strong{font-size:18px;color:#f8fafc}
    .learn-wrong-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;margin-bottom:8px;border-radius:16px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08)}
    .learn-wrong-row div{min-width:0}.learn-wrong-row strong{display:block;color:#fff;font-size:17px}.learn-wrong-row span{display:block;color:#cbd5e1;font-size:13px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:560px}
    .learn-summary-star{border:0;background:transparent;color:#fbbf24;font-size:34px;line-height:1;cursor:pointer;min-width:44px;min-height:44px;border-radius:12px}.learn-summary-star:hover{background:rgba(251,191,36,.12)}.learn-summary-star.starred{color:#facc15}
    .learn-summary-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:20px}
    @media(max-width:640px){.learn-summary-grid{grid-template-columns:1fr}.learn-wrong-row span{max-width:240px}.learn-wrong-group-head{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);
}

const pageRenderers={home:homePage,courses:coursesPage,decks:decksPage,inputData:inputDataPage,createDeck:createDeckPage,deckDetail:deckDetailPage,learnSession:learnSessionPage,quizExcel:quizExcelPage,practice:practicePage,exam:examPage,community:communityPage,stats:statsPage,calendar:calendarPage,leaderboard:leaderboardPage,settings:settingsPage};
function render(){rememberNavigation();applyBackgroundStyle();ensureLearnSummaryStyle();rememberLastOpenedTabFromRoute();document.body.classList.toggle("learn-mode",state.route==="learnSession");renderNav();renderUserUi();app.innerHTML=(pageRenderers[state.route]||homePage)();ensureFixedTopbar();applyCustomLogo();setTimeout(()=>{ensureFixedTopbar();applyCustomLogo()},0);window.scrollTo({top:0});}

document.addEventListener("click",e=>{
  const route=e.target.closest("[data-route]")?.dataset.route;if(route){
    // V12: bấm tab Đã tạo trên thanh điều hướng phải mở trang danh sách thư mục gốc.
    // Trước đây activeCreatedFolder còn lưu thư mục cũ nên tab Đã tạo tự chui vào thư mục đang mở dở.
    if(route==="decks"){
      state.activeCreatedFolder="";
      state.activeCreatedDeck=null;
      state.detailFlipped=false;
      state.detailMode="flashcard";
    }
    routeTo(route);
    return
  }
  if(e.target.closest("[data-close-modal]")||e.target.id==="modal"){closeModal();return}
  const action=e.target.closest("[data-action]")?.dataset.action;
  if(action){
    if(action==="quick-background"){openQuickBackgroundPanel();return}
    if(action==="close-quick-background"){closeQuickBackgroundPanel();return}
    if(action==="sign-in-google"){openLoginModal();return}
    if(action==="sign-out"){signOut();return}if(action==="sync-cloud-now"){hvqCloudManualSync();return}
    if(action==="pick-background"){pickBackgroundImage();return}
    if(action==="reset-background"){resetBackground();return}
    if(action==="clear-background"){state.background={...defaultBackground,mode:"none",customUrl:""};save();applyBackgroundStyle();closeQuickBackgroundPanel();render();showToast("Đã tắt hình nền");return}
    if(action==="study"){closeModal();openLastStudyTab();return}
    if(["review","flashcard"].includes(action)){closeModal();state.activeCreatedDeck=null;state.flashIndex=0;state.route="practice";save();render();return}
    if(action==="quiz"){closeModal();state.route="practice";save();render();setTimeout(()=>selectPractice("quiz"),0);return}
    if(action==="dictionary"){closeModal();state.route="practice";save();render();setTimeout(()=>selectPractice("dictionary"),0);return}
    if(action==="stats"){routeTo("stats");return}
    if(action==="lookup"){lookup();return}
    if(action==="next-question"){state.quizIndex=(state.quizIndex+1)%quizQuestions.length;state.quizAnswered=null;save();document.querySelector("#practicePanel").innerHTML=quizPanel();return}
    if(action==="excel-load-url"){loadExcelUrl();return}
    if(action==="excel-pick-file"){pickExcelFile();return}
    if(action==="excel-load-sample"){loadExcelSample();return}
    if(action==="excel-clear"){state.excelQuiz={...defaultExcelQuiz};save();render();showToast("Đã xóa dữ liệu quiz");return}
    if(action==="excel-parse-paste"){loadExcelText(state.excelQuiz.pasteData,"Dữ liệu đã dán");return}
    if(action==="excel-restart"){restartExcelQuiz();return}
    if(action==="excel-next-question"){nextExcelQuestion();return}
    if(action==="toggle-excel-star"){toggleExcelStar();return}
    if(action==="reset-excel-progress"){resetExcelProgress();return}
    if(action==="excel-refresh-pages"){refreshExcelPages();return}
    if(action==="new-deck"){state.deckDraft={title:"",description:"",isPublic:false,suggestions:true,cards:[blankDraftCard()]};if(state.activeCreatedFolder)state.deckDraft.folderName=state.activeCreatedFolder;state.editingDeckIndex=null;state.route="createDeck";save();render();return}
    if(action==="add-card"){state.deckDraft.cards.push(blankDraftCard());save();render();return}
    if(action==="toggle-public"){state.deckDraft.isPublic=!state.deckDraft.isPublic;save();render();return}
    if(action==="toggle-suggestions"){state.deckDraft.suggestions=!state.deckDraft.suggestions;save();render();return}
    if(action==="cancel-create"){routeTo("decks");return}
    if(action==="delete-draft"){if(confirm("Xóa toàn bộ bản nháp hiện tại?")){state.deckDraft={title:"",description:"",isPublic:false,suggestions:true,cards:[blankDraftCard()]};state.editingDeckIndex=null;save();render();showToast("Đã xóa bản nháp")}return}
    if(action==="save-deck"){saveCreatedDeck();return}
    if(action==="import-cards"){openImportCards();return}
    if(action==="auto-fill"){autoFillDraft();return}
    if(action==="new-course"){simpleForm("Tạo khóa học","Tên khóa học");return}
    if(action==="new-post"){simpleForm("Đăng bài cộng đồng","Tiêu đề bài viết",true);return}
    if(action==="add-schedule"){simpleForm("Thêm lịch học","Nội dung nhắc học");return}
    if(action==="upgrade"){modal("Nâng cấp Pro","<p class='muted'>Đây là bản demo. Bạn có thể kết nối cổng thanh toán ở bước tiếp theo.</p>");return}
    if(action==="reset-data"){const accountKey=hvqCurrentAccountKey();localStorage.removeItem(hvqPersonalStateKey(accountKey));idbDelete(hvqPersonalDecksKey(accountKey));localStorage.removeItem("hvq-state");state=freshDefaultState();state.createdDecks=[];save();render();showToast("Đã đặt lại dữ liệu tài khoản hiện tại");return}
    if(action==="export-stats"){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="hanvietquiz-stats.json";a.click();URL.revokeObjectURL(a.href);showToast("Đã xuất báo cáo");return}
    if(action==="input-pick-file"){pickInputFile();return}
    if(action==="input-apply"){applyInputDataSettings();return}
    if(action==="start-exam"){startExam();return}
    if(action==="back-to-decks"){state.route="decks";save();render();return}
    if(action==="back-to-folders"){state.activeCreatedFolder="";state.route="decks";save();render();return}
    if(action==="shuffle-detail"){state.detailSort="original";const count=detailCards(state.createdDecks[state.activeCreatedDeck]).length;if(!count){showToast("Không có thẻ phù hợp để trộn","circle-alert");return}state.detailCardIndex=Math.floor(Math.random()*count);state.detailFlipped=false;save();render();showToast("Đã trộn thẻ");return}
    if(action==="detail-clear-filter"){state.detailSearch="";state.detailFilter="all";state.detailSort="original";state.detailCardIndex=0;state.detailFlipped=false;save();render();return}
    if(action==="edit-current-card"){state.deckDraft=JSON.parse(JSON.stringify(state.createdDecks[state.activeCreatedDeck]));state.editingDeckIndex=state.activeCreatedDeck;state.route="createDeck";save();render();return}
    if(action==="schedule-review"){showToast("Đã bật lặp lại ngắt quãng","calendar-check");return}
    if(action==="share-deck"){navigator.clipboard?.writeText(location.href);showToast("Đã sao chép liên kết bộ thẻ","link");return}
    if(action==="toggle-deck-bookmark"){showToast("Đã lưu bộ thẻ","bookmark-check");return}
    if(action==="deck-menu"){modal("Tùy chọn bộ thẻ",`<button class="dropdown-item" data-edit-created="${state.activeCreatedDeck}">Chỉnh sửa bộ thẻ</button><button class="dropdown-item" data-action="share-deck">Chia sẻ</button>`);return}
    if(action==="flash-settings"){showToast("Đã mở cài đặt thẻ","sliders-horizontal");return}
    if(action==="show-progress"){document.querySelector("#card-groups")?.scrollIntoView({behavior:"smooth"});return}
    if(action==="start-detail-mode"){showToast("Chế độ học đã sẵn sàng","play");return}
    if(action==="exit-learn"){state.route="deckDetail";state.detailMode="flashcard";save();render();return}
    if(action==="restart-learn"){startLearnSession({forceRestart:true});return}
    if(action==="learn-wrong-again"){startWrongLearnSession();return}
    if(action==="star-all-wrong"){starWrongCards();return}
    if(action==="learn-settings"){openLearnSettings();return}
    if(action==="toggle-learn-example"){state.learnSettings.showExample=!state.learnSettings.showExample;save();render();return}
    if(action==="edit-learn-card"){state.deckDraft=JSON.parse(JSON.stringify(state.createdDecks[state.activeCreatedDeck]));state.editingDeckIndex=state.activeCreatedDeck;state.route="createDeck";save();render();return}
    if(action==="learn-unknown"){const cardIndex=state.learnOrder[state.learnIndex];state.learnAnswered="unknown";state.learnUnknown++;recordLearnResult(cardIndex,false);save();render();return}
    if(action==="next-learn"){advanceLearnSession();return}
    if(action==="apply-learn-settings"){applyLearnSettings();return}
    if(action==="reset-learn-progress"){resetLearnProgress();return}
  }
  const study=e.target.closest("[data-study]")?.dataset.study;if(study){closeModal();state.activeCreatedDeck=null;state.route="practice";state.flashIndex=(Number(study)-1)%words.length;save();render();return}
  const deck=e.target.closest("[data-deck]")?.dataset.deck;if(deck&&!e.target.closest("[data-study]")){const d=decks.find(x=>x.id==deck);modal(d.name,`<p class="muted">${d.term}</p><div class="mt-4">${progress(Math.round(d.learned/d.total*100))}</div><div class="flex gap-2 mt-5"><button class="button primary" data-study="${d.id}">Học ngay</button><button class="button" data-favorite="${d.id}">${state.favorites.includes(d.id)?"Bỏ yêu thích":"Yêu thích"}</button></div>`);return}
  const openCreatedFolder=e.target.closest("[data-open-created-folder]")?.dataset.openCreatedFolder;if(openCreatedFolder!==undefined){state.activeCreatedFolder=openCreatedFolder;state.route="decks";save();render();return}
  const editCreated=e.target.closest("[data-edit-created]")?.dataset.editCreated;if(editCreated!==undefined){const i=Number(editCreated);state.deckDraft=JSON.parse(JSON.stringify(state.createdDecks[i]));state.editingDeckIndex=i;state.route="createDeck";save();render();return}
  const deleteCreated=e.target.closest("[data-delete-created]")?.dataset.deleteCreated;if(deleteCreated!==undefined){if(confirm("Xóa bộ thẻ này?")){const i=Number(deleteCreated);state.createdDecks.splice(i,1);if(state.activeCreatedDeck===i)state.activeCreatedDeck=null;else if(Number.isInteger(state.activeCreatedDeck)&&state.activeCreatedDeck>i)state.activeCreatedDeck--;save();render();showToast("Đã xóa bộ thẻ")}return}
  const studyCreated=e.target.closest("[data-study-created]")?.dataset.studyCreated;if(studyCreated!==undefined){openCreatedDeckDetail(Number(studyCreated));return}
  const createdDeck=e.target.closest("[data-created-deck]")?.dataset.createdDeck;if(createdDeck!==undefined&&!e.target.closest("button")){openCreatedDeckDetail(Number(createdDeck));return}
  const removeCard=e.target.closest("[data-remove-card]")?.dataset.removeCard;if(removeCard!==undefined){if(state.deckDraft.cards.length===1){state.deckDraft.cards[0]=blankDraftCard()}else state.deckDraft.cards.splice(Number(removeCard),1);save();render();return}
  const moveCard=e.target.closest("[data-move-card]");if(moveCard){const from=Number(moveCard.dataset.moveCard),to=from+Number(moveCard.dataset.direction);if(to>=0&&to<state.deckDraft.cards.length){[state.deckDraft.cards[from],state.deckDraft.cards[to]]=[state.deckDraft.cards[to],state.deckDraft.cards[from]];save();render()}return}
  const imageCard=e.target.closest("[data-image-card]")?.dataset.imageCard;if(imageCard!==undefined){pickCardImage(Number(imageCard));return}
  const course=e.target.closest("[data-course]")?.dataset.course;if(course){const c=courses.find(x=>x.id==course);modal(c.name,`<p class="muted">${c.level} · ${c.done}/${c.lessons} bài đã hoàn thành</p><div class="mt-4">${progress(Math.round(c.done/c.lessons*100))}</div><button class="button primary mt-5" data-action="study">Tiếp tục học</button>`);return}
  const fav=e.target.closest("[data-favorite]")?.dataset.favorite;if(fav){const id=Number(fav);state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();closeModal();showToast("Đã cập nhật yêu thích");return}
  const ptab=e.target.closest("[data-practice-tab]")?.dataset.practiceTab;if(ptab){selectPractice(ptab);return}
  const detailMode=e.target.closest("[data-detail-mode]")?.dataset.detailMode;if(detailMode){if(detailMode==="flashcard"){startLearnSession();return}state.detailMode=detailMode;state.detailFlipped=false;save();render();return}
  const detailNav=e.target.closest("[data-detail-nav]")?.dataset.detailNav;if(detailNav!==undefined){const count=detailCards(state.createdDecks[state.activeCreatedDeck]).length;if(!count)return;state.detailCardIndex=(state.detailCardIndex+Number(detailNav)+count)%count;state.detailFlipped=false;save();render();return}
  const setStatus=e.target.closest("[data-set-status]")?.dataset.setStatus;if(setStatus){const card=detailCards(state.createdDecks[state.activeCreatedDeck])[state.detailCardIndex];if(!card)return;state.detailProgress[`${state.activeCreatedDeck}:${card.originalIndex}`]=setStatus;touchDeckStudyStats(state.activeCreatedDeck,{increment:false});if(setStatus==="mastered"){state.xp+=10;state.today+=1}save();render();showToast(setStatus==="mastered"?"Đã thành thạo +10 XP":"Đã cập nhật tiến độ");return}
  const detailStar=e.target.closest("[data-detail-star]")?.dataset.detailStar;if(detailStar!==undefined){const key=`${state.activeCreatedDeck}:${detailStar}`;state.detailStars[key]=!state.detailStars[key];save();render();showToast(state.detailStars[key]?"Đã đánh dấu sao":"Đã bỏ dấu sao");return}
  const learnStar=e.target.closest("[data-learn-star]")?.dataset.learnStar;if(learnStar!==undefined){const key=`${state.activeCreatedDeck}:${learnStar}`;state.detailStars[key]=!state.detailStars[key];save();render();return}
  const learnSummaryStar=e.target.closest("[data-learn-summary-star]")?.dataset.learnSummaryStar;if(learnSummaryStar!==undefined){const key=`${state.activeCreatedDeck}:${learnSummaryStar}`;state.detailStars[key]=!state.detailStars[key];save();render();showToast(state.detailStars[key]?"Đã gắn sao":"Đã bỏ sao");return}
  const starWrongLevel=e.target.closest("[data-star-wrong-level]")?.dataset.starWrongLevel;if(starWrongLevel!==undefined){starWrongCards(Number(starWrongLevel));return}
  const excelStar=e.target.closest("[data-excel-star]")?.dataset.excelStar;if(excelStar!==undefined){toggleExcelStar(excelStar);return}
  const learnAnswer=e.target.closest("[data-learn-answer]")?.dataset.learnAnswer;if(learnAnswer!==undefined&&state.learnAnswered===null){state.learnAnswered=Number(learnAnswer);const cardIndex=state.learnOrder[state.learnIndex],correct=learnOptionIsCorrect(state.learnOptions[state.learnAnswered],cardIndex);recordLearnResult(cardIndex,correct);if(correct){state.learnCorrect++;state.xp+=10;state.today++}save();render();if(correct&&state.learnSettings.autoAdvance)setTimeout(()=>{if(state.route==="learnSession"&&state.learnAnswered!==null)advanceLearnSession()},700);return}
  const jumpCard=e.target.closest("[data-jump-card]")?.dataset.jumpCard;if(jumpCard!==undefined&&!e.target.closest("button")){const cards=detailCards(state.createdDecks[state.activeCreatedDeck]);state.detailCardIndex=Math.max(0,cards.findIndex(c=>c.originalIndex===Number(jumpCard)));state.detailFlipped=false;save();render();window.scrollTo({top:0,behavior:"smooth"});return}
  if(e.target.closest("#detailFlashcard")&&!e.target.closest("button")){state.detailFlipped=!state.detailFlipped;save();render();return}
  const courseFilter=e.target.closest("[data-filter-course]")?.dataset.filterCourse;if(courseFilter!==undefined){document.querySelectorAll("[data-filter-course]").forEach(x=>x.classList.toggle("active",x.dataset.filterCourse===courseFilter));document.querySelector("#courseResults").innerHTML=courseFilter==="2"?'<p class="empty card">Bạn chưa hoàn thành khóa học nào.</p>':courseRows();return}
  if(e.target.closest("#flashcard")){e.target.closest("#flashcard").classList.toggle("flipped");return}
  const rate=e.target.closest("[data-rate]")?.dataset.rate;if(rate){const source=currentFlashcards();state.flashIndex=((state.flashIndex||0)+1)%source.length;if(rate==="easy"){state.xp+=10;state.today+=1}save();document.querySelector("#practicePanel").innerHTML=flashcardPanel();showToast(rate==="easy"?"Đã ghi nhớ +10 XP":"Đã xếp lịch ôn lại");return}
  const answer=e.target.closest("[data-answer]")?.dataset.answer;if(answer!==undefined){const q=quizQuestions[state.quizIndex%quizQuestions.length];state.quizAnswered=Number(answer);if(Number(answer)===q.answer){state.quizScore+=10;state.xp+=10;showToast("Chính xác! +10 XP")}else showToast("Chưa đúng, xem đáp án nhé","circle-x");save();document.querySelector("#practicePanel").innerHTML=quizPanel();return}
  const excelAnswer=e.target.closest("[data-excel-answer]")?.dataset.excelAnswer;if(excelAnswer!==undefined){answerExcelQuestion(Number(excelAnswer));return}
  const inputStep=e.target.closest("[data-input-step]");if(inputStep){const key=inputStep.dataset.inputStep,step=Number(inputStep.dataset.step||0);state.inputData[key]=Math.max(1,Number(state.inputData[key]||0)+step);save();render();return}
  const calendar=e.target.closest("[data-calendar-day]")?.dataset.calendarDay;if(calendar){const d=Number(calendar);state.calendar=state.calendar.includes(d)?state.calendar.filter(x=>x!==d):[...state.calendar,d];save();render();return}
  const exam=e.target.closest("[data-exam]")?.dataset.exam;if(exam!==undefined){startExam(Number(exam));return}
  const like=e.target.closest("[data-like]");if(like){const span=like.querySelector("span:last-child");span.textContent=Number(span.textContent)+1;like.classList.add("text-pink-400");return}
  const comment=e.target.closest("[data-comment]");if(comment){simpleForm("Viết bình luận","Nội dung bình luận",true);return}
  const speak=e.target.closest("[data-speak]")?.dataset.speak;if(speak){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(speak));return}
});


document.addEventListener("click",e=>{
  const panel=document.querySelector("#hvqQuickBackgroundPanel");
  if(!panel)return;
  if(e.target.closest("#hvqQuickBackgroundPanel")||e.target.closest("#hvqQuickBackgroundButton"))return;
  panel.remove();
},true);
document.addEventListener("input",e=>{if(e.target.matches("[data-background-field]")){const key=e.target.dataset.backgroundField;state.background={...defaultBackground,...(state.background||{}),[key]:["opacity","overlay","blur"].includes(key)?Number(e.target.value):e.target.value};save();applyBackgroundStyle();render();return}if(e.target.id==="deckSearch")filterDecks();if(e.target.id==="createdDeckSearch")filterCreatedDecks();if(e.target.id==="createdFolderSearch")filterCreatedFolders();if(e.target.id==="detailSearch"){state.detailSearch=e.target.value;state.detailCardIndex=0;state.detailFlipped=false;save();render();return}if(e.target.id==="dictionaryInput"&&e.target.value.length>1)lookup();if(e.target.matches("[data-excel-field]")){state.excelQuiz[e.target.dataset.excelField]=e.target.value;save()}if(e.target.matches("[data-input-field]")&&!["checkbox","radio"].includes(e.target.type)){state.inputData[e.target.dataset.inputField]=e.target.type==="number"?Number(e.target.value):e.target.value;save()}if(e.target.matches("[data-draft-meta]")){state.deckDraft[e.target.dataset.draftMeta]=e.target.value;save()}if(e.target.matches("[data-card-field]")){const editor=e.target.closest("[data-card-index]");if(editor){state.deckDraft.cards[Number(editor.dataset.cardIndex)][e.target.dataset.cardField]=e.target.value;save()}}});
document.addEventListener("change",e=>{if(e.target.matches("[data-background-field]")){const key=e.target.dataset.backgroundField;state.background={...defaultBackground,...(state.background||{}),[key]:["opacity","overlay","blur"].includes(key)?Number(e.target.value):e.target.value};save();applyBackgroundStyle();render();return}if(e.target.id==="deckSort")filterDecks();if(e.target.id==="createdDeckSort"||e.target.id==="createdDeckSizeFilter")filterCreatedDecks();if(e.target.id==="createdFolderSort")filterCreatedFolders();if(e.target.id==="detailSort"){state.detailSort=e.target.value;state.detailCardIndex=0;state.detailFlipped=false;save();render()}if(e.target.id==="detailFilter"){state.detailFilter=e.target.value;state.detailCardIndex=0;state.detailFlipped=false;save();render()}if(e.target.matches("[data-excel-setting]")){state.excelQuiz[e.target.dataset.excelSetting]=e.target.checked;restartExcelQuiz()}if(e.target.matches("[data-excel-select]")){state.excelQuiz[e.target.dataset.excelSelect]=e.target.value;restartExcelQuiz()}if(e.target.matches("[data-input-field]")){const key=e.target.dataset.inputField;state.inputData[key]=e.target.type==="checkbox"?e.target.checked:e.target.value;if(key==="savedSheet"){state.inputData.sheetUrl=savedInputSheets[e.target.value]||state.inputData.sheetUrl;state.inputData={...state.inputData,...(savedInputColumns[e.target.value]||{})}}save();render()}});
document.addEventListener("submit",e=>{e.preventDefault();if(e.target.id==="settingsForm"){const fd=new FormData(e.target);if(!state.user?.signedIn)state.user={...state.user,name:fd.get("name")||"Khách"};state.dailyGoal=Number(fd.get("dailyGoal"));state.theme=fd.get("theme")||state.theme;state.notifications=fd.get("notifications")==="true";save();applyBackgroundStyle();render();showToast("Đã lưu cài đặt")}else if(e.target.id==="fillBlankForm"){checkFillBlank()}else{closeModal();showToast("Đã lưu thành công")}});
document.addEventListener("keydown",e=>{if(state.route!=="deckDetail"||state.detailMode!=="flashcard"||["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;const n=detailCards(state.createdDecks[state.activeCreatedDeck]).length;if(!n)return;if([" ","Enter"].includes(e.key)){e.preventDefault();state.detailFlipped=!state.detailFlipped}else if(e.key==="ArrowLeft"){state.detailCardIndex=(state.detailCardIndex-1+n)%n;state.detailFlipped=false}else if(e.key==="ArrowRight"){state.detailCardIndex=(state.detailCardIndex+1)%n;state.detailFlipped=false}else return;save();render()});
document.addEventListener("keydown",e=>{if(state.route!=="learnSession"||["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;if(state.learnAnswered===null&&!state.learnSettings.fillBlank&&["1","2","3","4"].includes(e.key)){const answer=Number(e.key)-1;if(state.learnOptions[answer]){state.learnAnswered=answer;const cardIndex=state.learnOrder[state.learnIndex],correct=learnOptionIsCorrect(state.learnOptions[answer],cardIndex);recordLearnResult(cardIndex,correct);if(correct){state.learnCorrect++;state.xp+=10;state.today++}save();render();if(correct&&state.learnSettings.autoAdvance)setTimeout(()=>{if(state.route==="learnSession"&&state.learnAnswered!==null)advanceLearnSession()},700)}}else if(state.learnAnswered===null&&e.key==="5"){const cardIndex=state.learnOrder[state.learnIndex];state.learnAnswered="unknown";state.learnUnknown++;recordLearnResult(cardIndex,false);save();render()}else if(state.learnAnswered!==null&&e.key==="Enter"){advanceLearnSession()}});
document.addEventListener("keydown",e=>{if(state.route!=="quizExcel"||["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;const questions=excelActiveQuestions();if(!questions.length)return;if(state.excelQuiz.answered===null&&["1","2","3","4"].includes(e.key)){e.preventDefault();answerExcelQuestion(Number(e.key)-1)}else if(state.excelQuiz.answered!==null&&e.key==="Enter"){e.preventDefault();nextExcelQuestion()}});
document.addEventListener("keydown",e=>{
  if(isTextEditingTarget())return;
  const isBackspace=e.key==="Backspace";
  const isAltBack=e.altKey&&e.key==="ArrowLeft";
  const isBrowserBack=e.key==="BrowserBack"||e.key==="GoBack";
  if(!isBackspace&&!isAltBack&&!isBrowserBack)return;
  e.preventDefault();
  goBackPage();
},true);

function selectPractice(name){document.querySelectorAll("[data-practice-tab]").forEach(x=>x.classList.toggle("active",x.dataset.practiceTab===name));document.querySelector("#practicePanel").innerHTML=name==="quiz"?quizPanel():name==="dictionary"?dictionaryPanel():flashcardPanel()}
function excelActiveQuestions(){
  const qz=state.excelQuiz;
  let base=qz.questions||[];
  if(qz.pageFilter&&qz.pageFilter!=="all")base=base.filter(q=>String(q.page||"")===String(qz.pageFilter));
  if(qz.onlyStarred)base=base.filter(q=>(qz.starredIds||[]).includes(q.id));
  if(qz.onlyWrong)base=base.filter(q=>(qz.wrongIds||[]).includes(q.id));
  if(qz.onlyUnmastered)base=base.filter(q=>!(qz.correctIds||[]).includes(q.id));
  return base;
}
function excelPages(){return [...new Set((state.excelQuiz.questions||[]).map(q=>q.page).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}))}
function parseDelimitedText(text){
  const raw=String(text||"").replace(/\r\n/g,"\n").replace(/\r/g,"\n").trim();if(!raw)return[];
  const firstLine=raw.split("\n",1)[0]||"",delimiter=firstLine.includes("\t")?"\t":firstLine.includes(";")&&!firstLine.includes(",")?";":",",rows=[];let row=[],cell="",quoted=false;
  for(let i=0;i<raw.length;i++){const ch=raw[i],next=raw[i+1];if(ch==='"'&&quoted&&next==='"'){cell+='"';i++}else if(ch==='"'){quoted=!quoted}else if(ch===delimiter&&!quoted){row.push(cell.trim());cell=""}else if(ch==="\n"&&!quoted){row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell=""}else cell+=ch}
  row.push(cell.trim());if(row.some(Boolean))rows.push(row);return rows;
}
function excelAnswerNumber(value){
  const text=String(value||"").trim(),circled="①②③④⑤";
  const circledAnswer=[...text].find(ch=>circled.includes(ch));
  if(circledAnswer)return circled.indexOf(circledAnswer);
  const numeric=text.match(/(?:^|[^\d])([1-5])(?:[^\d]|$)/);
  return numeric?Number(numeric[1])-1:-1;
}
function cleanupMarkedOption(value){
  return String(value||"")
    .replace(/^[\s:：\-–|,;]+/,"")
    .split(/\s+\|\s+(?=(?:정답|답|해설|설명|문법|핵심어|키워드|번역|해석|[A-Za-z가-힣 ]{1,14})[:：])/)[0]
    .replace(/\s+/g," ")
    .trim();
}
function splitMarkedOptions(text){
  const raw=String(text||"").replace(/\u00a0/g," ");
  const matches=[...raw.matchAll(/[①②③④⑤]|(?:^|[\s|,;])([1-5])[\).．、:：]/g)];
  if(matches.length<2)return[];
  return matches.map((match,i)=>{
    const start=match.index+match[0].length,end=i+1<matches.length?matches[i+1].index:raw.length;
    return cleanupMarkedOption(raw.slice(start,end));
  }).filter(Boolean);
}
function likelyPageValue(value){return /^[0-9]{1,3}$/.test(String(value||"").trim())}
function scoreQuestionCell(value){
  const text=String(value||"").trim();
  if(!text||likelyPageValue(text))return 0;
  let score=Math.min(text.length,80);
  if(/[가-힣]/.test(text))score+=35;
  if(/[.!?。！？]|[()（）]/.test(text))score+=12;
  return score;
}
function detectQuestionCol(rows){
  const limit=Math.min(rows.length,12),maxCols=Math.max(...rows.slice(0,limit).map(row=>row.length),0);
  let best={index:0,score:-1};
  for(let col=0;col<maxCols;col++){
    const score=rows.slice(0,limit).reduce((sum,row)=>sum+scoreQuestionCell(row[col]),0);
    if(score>best.score)best={index:col,score};
  }
  return best.index;
}
function detectAnswerCol(rows,qCol){
  const limit=Math.min(rows.length,12),maxCols=Math.max(...rows.slice(0,limit).map(row=>row.length),0);
  for(let col=qCol+1;col<maxCols;col++){
    if(rows.slice(0,limit).filter(row=>excelAnswerNumber(row[col])>=0).length>=Math.max(1,Math.ceil(limit*.4)))return col;
  }
  return qCol+1;
}
function detectPageCol(rows,qCol){
  const limit=Math.min(rows.length,12),maxCols=Math.max(...rows.slice(0,limit).map(row=>row.length),0);
  let best=-1;
  for(let col=0;col<Math.min(qCol,maxCols);col++){
    const numericCount=rows.slice(0,limit).filter(row=>likelyPageValue(row[col])).length;
    if(numericCount>=Math.max(1,Math.ceil(limit*.45)))best=col;
  }
  return best;
}
function excelQuestionFromRow(row,index,qCol,aCol,wrongCols,pageCol){
  const question=row[qCol]?.trim(),answerRaw=row[aCol]?.trim();
  if(!question||!answerRaw)return null;
  const page=pageCol>=0?String(row[pageCol]||"").trim():"";
  const otherCells=(wrongCols.length?wrongCols:row.map((_,i)=>i).filter(i=>i!==qCol&&i!==aCol&&i!==pageCol)).map(i=>row[i]?.trim()).filter(Boolean);
  const answerNumber=excelAnswerNumber(answerRaw),markedOptions=splitMarkedOptions(otherCells.join(" | "));
  if(answerNumber>=0&&markedOptions[answerNumber]){
    return {id:`excel-${index}-${question.slice(0,12)}`,page,question,answer:markedOptions[answerNumber],wrongs:markedOptions.filter((_,i)=>i!==answerNumber)};
  }
  return {id:`excel-${index}-${question.slice(0,12)}`,page,question,answer:answerRaw,wrongs:otherCells};
}
function buildExcelQuestions(rows){
  if(!rows.length)return[];const headers=rows[0].map(x=>normalizeLearnText(x));const headerLooksReal=headers.some(x=>["question","cau hoi","cauhoi","q","dap an","dapan","đap an","đapan","answer","a"].includes(x));
  const body=headerLooksReal?rows.slice(1):rows,findCol=names=>headers.findIndex(h=>names.includes(h));
  const qCol=headerLooksReal?Math.max(0,findCol(["question","cau hoi","cauhoi","q","prompt"])):detectQuestionCol(body),aCol=headerLooksReal?Math.max(1,findCol(["answer","dap an","dapan","đap an","đapan","a","correct"])):detectAnswerCol(body,qCol);
  const explicitPageCol=headerLooksReal?findCol(["page","trang","trang so","so trang","p"]):-1;
  const pageCol=explicitPageCol>=0?explicitPageCol:detectPageCol(body,qCol);
  const wrongCols=headerLooksReal?headers.map((h,i)=>({h,i})).filter(x=>x.i!==qCol&&x.i!==aCol&&/(wrong|sai|option|lua chon|nhi[eễ]u|choice)/.test(x.h)).map(x=>x.i):[];
  return body.map((row,index)=>excelQuestionFromRow(row,index,qCol,aCol,wrongCols,pageCol)).filter(Boolean);
}
function prepareExcelQuestions(questions){
  const answers=questions.map(q=>q.answer).filter(Boolean);
  return questions.map(q=>{
    const answerNorm=normalizeLearnText(q.answer),questionText=q.question;
    let options=[q.answer,...q.wrongs.filter(x=>normalizeLearnText(x)!==answerNorm&&!shouldHideAsSameQuestionAnswer(x,questionText))];
    if(options.length<4){
      options=[...options,...shuffled(answers.filter(x=>normalizeLearnText(x)!==answerNorm&&!options.includes(x)&&!shouldHideAsSameQuestionAnswer(x,questionText))).slice(0,4-options.length)];
    }
    const unique=[];
    const seen=new Set(),seenGrammar=new Set();
    for(const option of options){
      const norm=normalizeLearnText(option),grammarKey=grammarBaseKey(option);
      if(!norm||seen.has(norm))continue;
      if(option!==q.answer&&grammarKey&&seenGrammar.has(grammarKey))continue;
      unique.push(option);
      seen.add(norm);
      if(grammarKey)seenGrammar.add(grammarKey);
    }
    options=shuffled(unique).slice(0,4);
    if(!options.includes(q.answer))options=[q.answer,...options].slice(0,4);
    const answerIndex=Math.max(0,options.findIndex(x=>x===q.answer));
    return {...q,options,answerIndex};
  });
}
function loadExcelText(text,sourceName="Dữ liệu Excel"){const questions=prepareExcelQuestions(buildExcelQuestions(parseDelimitedText(text)));if(!questions.length){showToast("Không đọc được câu hỏi. Cần cột câu hỏi và đáp án.","circle-alert");return}state.excelQuiz={...state.excelQuiz,questions:state.excelQuiz.shuffle?shuffled(questions):questions,index:0,score:0,answered:null,pageFilter:"all",wrongIds:[],starredIds:[],correctIds:[],sourceName};save();render();showToast(`Đã nạp ${questions.length} câu hỏi`)}
function googleSheetInfo(url){const id=url.match(/\/spreadsheets\/d\/([^/]+)/)?.[1];if(!id)return null;return {id,gid:url.match(/[?&]gid=(\d+)/)?.[1]||"0"}}
function gvizRowsToDelimited(table){const headers=(table.cols||[]).map(col=>col.label||col.id||"");const rows=(table.rows||[]).map(row=>(row.c||[]).map(cell=>cell?.f??cell?.v??""));return [headers,...rows].map(row=>row.map(value=>String(value).replace(/\t/g," ").replace(/\n/g," ")).join("\t")).join("\n")}
function loadGoogleSheetJsonp(info){return new Promise((resolve,reject)=>{const callback=`__hvqSheet_${Date.now()}_${Math.random().toString(36).slice(2)}`,script=document.createElement("script");let settled=false;const cleanup=()=>{delete window[callback];script.remove()};window[callback]=response=>{settled=true;cleanup();if(response?.status==="error")reject(new Error(response.errors?.[0]?.detailed_message||"Google Sheet error"));else resolve(gvizRowsToDelimited(response.table||{}))};script.onerror=()=>{if(!settled){cleanup();reject(new Error("JSONP load failed"))}};const range=encodeURIComponent("A1:AZ10000");script.src=`https://docs.google.com/spreadsheets/d/${info.id}/gviz/tq?gid=${info.gid}&range=${range}&tqx=out:json;responseHandler:${callback}`;document.body.appendChild(script);setTimeout(()=>{if(!settled){cleanup();reject(new Error("Google Sheet timeout"))}},18000)})}
async function fetchGoogleSheetCsv(info){
  const urls=[
    `https://docs.google.com/spreadsheets/d/${info.id}/export?format=csv&gid=${info.gid}`,
    `https://docs.google.com/spreadsheets/d/${info.id}/pub?gid=${info.gid}&single=true&output=csv`
  ];
  for(const url of urls){
    try{
      const res=await fetch(url);
      if(res.ok){
        const text=await res.text();
        if(text.trim())return text;
      }
    }catch{}
  }
  return "";
}
async function loadGoogleSheetText(info){
  const [csv,jsonp]=await Promise.all([
    fetchGoogleSheetCsv(info).catch(()=>""),
    loadGoogleSheetJsonp(info).catch(()=>"")
  ]);
  const csvRows=parseDelimitedText(csv).length,jsonpRows=parseDelimitedText(jsonp).length;
  return jsonpRows>csvRows?jsonp:csv||jsonp;
}
async function loadExcelUrl(){const url=state.excelQuiz.sourceUrl.trim();if(!url){showToast("Hãy nhập link Google Sheet hoặc CSV","circle-alert");return}try{showToast("Đang tải dữ liệu...","download");const sheet=googleSheetInfo(url);if(sheet){loadExcelText(await loadGoogleSheetJsonp(sheet),"Google Sheet");return}const res=await fetch(url);if(!res.ok)throw new Error(`HTTP ${res.status}`);loadExcelText(await res.text(),"CSV URL")}catch(err){showToast("Không tải được dữ liệu. Hãy bật chia sẻ công khai hoặc thử tải CSV rồi nhập file.","circle-alert")}}
function pickExcelFile(){const input=document.createElement("input");input.type="file";input.accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain";input.onchange=()=>{const file=input.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>loadExcelText(reader.result,file.name);reader.readAsText(file,"utf-8")};input.click()}
function loadExcelSample(){const sample=`Trang\tCâu hỏi\tĐáp án\tSai 1\tSai 2\tSai 3
7\t經濟 có âm Hán Việt là gì?\tKinh tế\tVăn hóa\tXã hội\tTự nhiên
7\t社會 nghĩa là gì?\tXã hội\tHọc tập\tKinh tế\tVăn hóa
8\tChữ nào mang nghĩa văn hóa?\t文化\t自然\t學習\t經濟
8\t勉強 thường hiểu là gì?\tHọc tập, nỗ lực\tKinh tế\tXã hội\tTự nhiên`;state.excelQuiz.pasteData=sample;loadExcelText(sample,"Dữ liệu mẫu")}
function refreshExcelPages(){if(state.excelQuiz.pasteData?.trim()){loadExcelText(state.excelQuiz.pasteData,state.excelQuiz.sourceName||"Dữ liệu đã dán");return}if(state.excelQuiz.sourceUrl?.trim()){loadExcelUrl();return}showToast("Hãy tải lại Google Sheet hoặc dán dữ liệu để đọc trang","circle-alert")}
function restartExcelQuiz(renderPage=true){const qz=state.excelQuiz;state.excelQuiz={...qz,questions:qz.shuffle?shuffled(qz.questions):qz.questions,index:0,score:0,answered:null};save();if(renderPage)render()}
function answerExcelQuestion(answerIndex){const questions=excelActiveQuestions(),q=questions[state.excelQuiz.index%questions.length];if(!q||state.excelQuiz.answered!==null)return;state.excelQuiz.answered=answerIndex;const correct=answerIndex===q.answerIndex;if(correct){state.excelQuiz.score+=10;state.xp+=10;state.today++;state.excelQuiz.correctIds=[...new Set([...(state.excelQuiz.correctIds||[]),q.id])];state.excelQuiz.wrongIds=(state.excelQuiz.wrongIds||[]).filter(id=>id!==q.id);showToast("Chính xác! +10 XP")}else{state.excelQuiz.wrongIds=[...new Set([...(state.excelQuiz.wrongIds||[]),q.id])];state.excelQuiz.correctIds=(state.excelQuiz.correctIds||[]).filter(id=>id!==q.id);showToast("Chưa đúng, xem đáp án nhé","circle-x")}save();render();if(correct&&state.excelQuiz.autoAdvance)setTimeout(()=>{if(state.route==="quizExcel"&&state.excelQuiz.answered!==null)nextExcelQuestion()},700)}
function nextExcelQuestion(){const questions=excelActiveQuestions();if(!questions.length)return;if(state.excelQuiz.index+1>=questions.length){showToast(`Hoàn thành lượt quiz: ${state.excelQuiz.score} điểm`,"party-popper");restartExcelQuiz();return}state.excelQuiz.index++;state.excelQuiz.answered=null;save();render()}
function excelCurrentQuestion(){const questions=excelActiveQuestions();return questions[state.excelQuiz.index%Math.max(questions.length,1)]}
function excelIsStarred(id){return (state.excelQuiz.starredIds||[]).includes(id)}
function toggleExcelStar(questionId=excelCurrentQuestion()?.id){if(!questionId)return;const ids=state.excelQuiz.starredIds||[];state.excelQuiz.starredIds=ids.includes(questionId)?ids.filter(id=>id!==questionId):[...ids,questionId];save();render();showToast(state.excelQuiz.starredIds.includes(questionId)?"Đã gắn dấu sao":"Đã bỏ dấu sao")}
function resetExcelProgress(){if(!confirm("Reset câu sai, câu đã thuộc và điểm lượt này?"))return;state.excelQuiz={...state.excelQuiz,index:0,score:0,answered:null,wrongIds:[],correctIds:[]};save();render();showToast("Đã reset tiến độ Quiz Excel")}
function pickInputFile(){const input=document.createElement("input");input.type="file";input.accept=".csv,.tsv,.txt,.xlsx,.xls,text/csv,text/tab-separated-values,text/plain";input.onchange=()=>{const file=input.files?.[0];if(!file)return;state.inputData={...state.inputData,sourceType:"file",lastFileName:file.name,selected:true};save();render();showToast(`Đã chọn ${file.name}`,"upload")};input.click()}
function columnIndex(label){const text=String(label||"").trim().toUpperCase();if(!/^[A-Z]{1,3}$/.test(text))return-1;return [...text].reduce((sum,ch)=>sum*26+ch.charCodeAt(0)-64,0)-1}
function columnLabels(label){return String(label||"").trim().toUpperCase().split(/[,;+&\s]+/).map(x=>x.trim()).filter(Boolean)}
function columnIndexes(label){return columnLabels(label).map(columnIndex).filter(i=>i>=0)}
function normalizeColumnSpec(label){return columnLabels(label).join(",")}
function columnSpecValid(label,multiple=false){const labels=columnLabels(label);if(!labels.length)return true;if(!multiple&&labels.length>1)return false;return labels.every(x=>/^[A-Z]{1,3}$/.test(x))}
function cleanInputText(value){const text=String(value??"").replace(/\u00a0/g," ").trim();return text.toLowerCase()==="nan"?"":text}
function splitAnswerParts(text){const raw=cleanInputText(text);if(!raw)return[];return raw.split(/\r?\n+|\s+\/\s+|[;,]\s*/).map(x=>x.trim()).filter(Boolean)}
function columnValues(row,indexes,sep="\n"){const items=[],seen=new Set();indexes.forEach(i=>{const text=cleanInputText(row[i]);if(!text)return;const norm=normalizeLearnText(text);if(!seen.has(norm)){items.push(text);seen.add(norm)}});return items.join(sep)}
function uniqueJoin(oldText,newText,sep="\n"){const items=[],seen=new Set();for(const item of [...splitAnswerParts(oldText),...splitAnswerParts(newText)]){const norm=normalizeLearnText(item);if(item&&norm&&!seen.has(norm)){items.push(item);seen.add(norm)}}return items.join(sep)}
function applyFillDown(rows,indexes){const last={};return rows.map(row=>{const next=[...row];indexes.forEach(i=>{if(i<0)return;const value=cleanInputText(next[i]);if(value)last[i]=value;else if(last[i])next[i]=last[i]});return next})}
function makeInputCardsFromRows(rows){
  const d=state.inputData,termCol=columnIndex(d.termCol),meaningCol=columnIndex(d.meaningCol),exampleCols=columnIndexes(d.exampleCol),synonymCol=columnIndex(d.synonymCol);
  if(termCol<0)return[];
  const body=rows.length&&rows[0].some(cell=>/câu|trang|đáp|nghĩa|ngữ|term|meaning|answer|kr|vi/i.test(cell))?rows.slice(1):rows;
  const savedSheetName=String(d.savedSheet||"").trim();
  const isPage2124=savedSheetName==="trang 21-24"||String(d.sheetUrl||"").includes("gid=418545698");
  const fillCols=[termCol,meaningCol,synonymCol,...(isPage2124?[]:exampleCols)].filter(i=>i>=0);
  const workRows=d.autoDetect?applyFillDown(body,fillCols):body;
  const rawCards=[];
  workRows.forEach((row,idx)=>{
    const term=cleanInputText(row[termCol]),definition=meaningCol>=0?cleanInputText(row[meaningCol]):"",example=exampleCols.length?columnValues(row,exampleCols,"\n"):"",synonyms=synonymCol>=0?cleanInputText(row[synonymCol]):"";
    if(!term)return;
    rawCards.push({...blankDraftCard(),term,definition:definition||"",example,synonyms,pronunciation:"",wordType:"",sourceRow:idx+2});
  });
  if(!d.mergeRows)return rawCards;

  // Riêng sheet "trang 21-24": cột C là ngữ pháp gốc, cột G là các mẫu đồng nghĩa.
  // Tạo thẻ từ cả C và từng mục trong G để câu hỏi cũng có thể là cột G,
  // đồng thời đáp án đúng/nhiễu cũng lấy từ nhóm đồng nghĩa cột G.
  if(isPage2124&&synonymCol>=0){
    const groups=new Map();
    const addVariant=(group,text,card)=>{
      text=cleanInputText(text);
      if(!text)return;
      const key=normalizeLearnText(text);
      if(!key)return;
      if(!group.variants.has(key))group.variants.set(key,{text,example:"",definition:"",sourceRow:card?.sourceRow||0});
      const item=group.variants.get(key);
      if(card?.example)item.example=uniqueJoin(item.example,card.example);
      if(card?.definition&&!item.definition)item.definition=card.definition;
    };
    rawCards.forEach(card=>{
      const root=cleanInputText(card.term),rootKey=normalizeLearnText(root);
      if(!rootKey)return;
      if(!groups.has(rootKey))groups.set(rootKey,{root,definition:"",example:"",variants:new Map()});
      const group=groups.get(rootKey);
      if(hasRealDefinition(card)&&(!group.definition||!hasRealDefinition(group)))group.definition=card.definition;
      if(card.example)group.example=uniqueJoin(group.example,card.example);
      addVariant(group,root,card);
      splitAnswerParts(card.synonyms).forEach(item=>addVariant(group,item,card));
    });
    const expanded=[];
    groups.forEach(group=>{
      const variants=[...group.variants.values()].filter(x=>cleanInputText(x.text));
      const allTerms=variants.map(x=>x.text).join("\n");
      variants.forEach(item=>{
        expanded.push({
          ...blankDraftCard(),
          term:item.text,
          definition:item.definition||group.definition||"",
          example:item.example||group.example||"",
          synonyms:allTerms,
          pronunciation:"",
          wordType:group.root&&normalizeLearnText(group.root)!==normalizeLearnText(item.text)?`Nhóm gốc: ${group.root}`:"",
          sourceRow:item.sourceRow||0,
          sourceRoot:group.root,
          sourceGroupKey:normalizeLearnText(group.root)
        });
      });
    });
    return expanded;
  }

  const grouped=new Map(),keepFirstExampleOnly=isPage2124&&normalizeColumnSpec(d.exampleCol)==="E,F,I";
  rawCards.forEach(card=>{
    const key=normalizeLearnText(card.term);
    if(!key)return;
    if(!grouped.has(key))grouped.set(key,{...card,definition:"",example:"",synonyms:""});
    const existing=grouped.get(key);
    if(hasRealDefinition(card)&&(!existing.definition||!hasRealDefinition(existing)))existing.definition=card.definition;
    if(card.example){
      existing.example=keepFirstExampleOnly?(existing.example||card.example):uniqueJoin(existing.example,card.example);
    }
    if(card.synonyms)existing.synonyms=uniqueJoin(existing.synonyms,card.synonyms);
  });
  return [...grouped.values()];
}
function cardsFromInputData(rows=null,allowFallback=true){
  let sourceRows=rows||[];
  if(allowFallback&&!sourceRows.length&&state.excelQuiz.pasteData?.trim())sourceRows=parseDelimitedText(state.excelQuiz.pasteData);
  let cards=makeInputCardsFromRows(sourceRows);
  if(allowFallback&&!cards.length&&state.excelQuiz.questions?.length)cards=state.excelQuiz.questions.map(q=>({...blankDraftCard(),term:q.question,definition:q.answer,example:q.wrongs?.join("; ")||"",synonyms:"",pronunciation:q.page?`Trang ${q.page}`:""}));
  return cards;
}
function createDecksFromInputCards(cards,settings){
  const sourceName=String(settings.savedSheet||settings.lastFileName||"Nhập liệu").trim()||"Nhập liệu";
  let size=Math.max(1,Number(settings.folderSize)||50);
  // Riêng trang 21-24: sau khi nhân bản C + các mục G, giữ tất cả trong một bộ để số câu > số ngữ pháp gốc.
  if(sourceName==="trang 21-24"&&cards.some(card=>card.sourceGroupKey))size=cards.length;
  const batchId=`input-${sourceName}`;
  const decks=[];
  for(let start=0;start<cards.length;start+=size){
    const chunk=cards.slice(start,start+size),number=String(decks.length+1).padStart(2,"0");
    decks.push({
      title:`${sourceName} bộ ${number}`,
      description:`Từ ${start+1}-${Math.min(start+size,cards.length)} · ${sourceName}`,
      folderName:sourceName,
      isPublic:false,
      suggestions:true,
      cards:chunk,
      importBatchId:batchId,
      updatedAt:new Date().toISOString()
    });
  }
  state.createdDecks=(state.createdDecks||[]).filter(deck=>deck.importBatchId!==batchId);
  state.createdDecks.unshift(...decks);
  state.activeCreatedFolder="";
  return decks;
}
async function applyInputDataSettings(){const d=state.inputData,canonicalUrl=savedInputSheets[d.savedSheet]||d.sheetUrl;const validSingle=[d.termCol,d.meaningCol,d.synonymCol].filter(Boolean).every(x=>columnSpecValid(x,false)),validExample=columnSpecValid(d.exampleCol,true);if(!validSingle||!validExample){showToast("Cột phải có dạng A hoặc nhiều cột như F,I","circle-alert");return}const next={...d,sheetUrl:canonicalUrl,termCol:normalizeColumnSpec(d.termCol),meaningCol:normalizeColumnSpec(d.meaningCol),exampleCol:normalizeColumnSpec(d.exampleCol),synonymCol:normalizeColumnSpec(d.synonymCol),folderSize:Math.max(1,Number(d.folderSize)||50),selected:true,lastAppliedAt:new Date().toISOString()};state.inputData=next;let rows=[];try{if(next.sourceType==="sheet"&&next.sheetUrl?.trim()){showToast(`Đang tải ${next.savedSheet}...`,"download");const info=googleSheetInfo(next.sheetUrl);if(info)rows=parseDelimitedText(await loadGoogleSheetText(info))}}catch{showToast("Không tải được Google Sheet nhập liệu","circle-alert")}const cards=cardsFromInputData(rows,false);if(cards.length){const decks=createDecksFromInputCards(cards,next),rowCount=Math.max(0,rows.length-1);state.inputData.lastResult={title:"Đã tạo thư mục bộ thẻ",message:`Đã đọc ${rowCount} dòng và tạo ${cards.length} thẻ từ ${next.savedSheet}. Trong tab Đã tạo sẽ có thư mục “${next.savedSheet}”, bên trong là ${decks.length} bộ từ.`,cards:cards.length,folders:1};state.route="decks";save();render();showToast(`Đã tạo ${decks.length} bộ từ ${cards.length} thẻ`);return}state.inputData.lastResult={title:"Chưa tạo được bộ thẻ",message:`Không đọc được dữ liệu từ ${next.savedSheet||"nguồn nhập liệu"}. Hãy kiểm tra sheet đang chọn, quyền chia sẻ hoặc cột thuật ngữ.`};save();render();showToast("Chưa tạo được bộ thẻ","circle-alert")}
function startCreatedDeck(index){const deck=state.createdDecks[index];if(!deck?.cards?.length){showToast("Bộ thẻ chưa có nội dung","circle-alert");return}touchDeckStudyStats(index,{increment:true});closeModal();state.activeCreatedDeck=index;state.flashIndex=0;state.route="practice";save();render()}
function openCreatedDeckDetail(index){const deck=state.createdDecks[index];if(!deck?.cards?.length){showToast("Bộ thẻ chưa có nội dung","circle-alert");return}closeModal();state.activeCreatedDeck=index;state.detailCardIndex=0;state.detailFlipped=false;state.detailMode="flashcard";state.detailSearch="";state.detailFilter="all";state.route="deckDetail";save();render()}
function resetDeckSessionProgress(index=state.activeCreatedDeck){
  const prefix=`${index}:`;
  state.detailProgress={...(state.detailProgress||{})};
  Object.keys(state.detailProgress).filter(key=>key.startsWith(prefix)).forEach(key=>delete state.detailProgress[key]);
}
function learnSessionDeckIndex(){
  const stats=state.learnSessionStats||{};
  return Number.isInteger(stats.deckIndex)?stats.deckIndex:null;
}
function hasPausedLearnSession(index=state.activeCreatedDeck){
  const deck=state.createdDecks?.[index];
  if(!deck?.cards?.length)return false;
  if(!Array.isArray(state.learnOrder)||!state.learnOrder.length)return false;
  const sessionDeck=learnSessionDeckIndex();
  if(Number.isInteger(sessionDeck)&&sessionDeck!==index)return false;
  const completed=Math.max(0,Number(state.learnCompleted)||0);
  if(completed>=state.learnOrder.length)return false;
  const safeIndex=Math.min(Math.max(Number(state.learnIndex)||0,0),state.learnOrder.length-1);
  const cardIndex=state.learnOrder[safeIndex];
  if(!Number.isInteger(cardIndex)||!deck.cards[cardIndex])return false;
  return true;
}
function resumeLearnSession(index=state.activeCreatedDeck){
  if(!hasPausedLearnSession(index))return false;
  state.activeCreatedDeck=index;
  state.learnIndex=Math.min(Math.max(Number(state.learnIndex)||0,0),state.learnOrder.length-1);
  state.learnCompleted=Math.min(Math.max(Number(state.learnCompleted)||0,0),Math.max(0,state.learnOrder.length-1));
  const currentCardIndex=state.learnOrder[state.learnIndex];
  if(!Array.isArray(state.learnOptions)||!state.learnOptions.length)state.learnOptions=buildLearnOptions(currentCardIndex);
  state.learnSessionStats={...blankLearnSessionStats(),...(state.learnSessionStats||{}),deckIndex:index,resumedAt:new Date().toISOString()};
  state.learnSessionStats.wrongMap={...(state.learnSessionStats.wrongMap||{})};
  state.learnSessionStats.wrongOrder=Array.isArray(state.learnSessionStats.wrongOrder)?state.learnSessionStats.wrongOrder:[];
  state.learnSessionStats.correctIds=Array.isArray(state.learnSessionStats.correctIds)?state.learnSessionStats.correctIds:[];
  state.route="learnSession";
  save();
  render();
  showToast("Đã tiếp tục phiên học đang dở","play");
  return true;
}
function startLearnSession(options={}){
  const deck=state.createdDecks[state.activeCreatedDeck];
  if(!deck?.cards?.length){showToast("Bộ thẻ chưa có nội dung","circle-alert");return}
  const hasCustomOrder=Array.isArray(options.order);
  const forceRestart=!!options.forceRestart||hasCustomOrder;
  if(!forceRestart&&hasPausedLearnSession(state.activeCreatedDeck)){
    resumeLearnSession(state.activeCreatedDeck);
    return;
  }
  if(options.preserveDeckProgress!==true)resetDeckSessionProgress(state.activeCreatedDeck);
  let order=hasCustomOrder?options.order.filter(i=>deck.cards[i]):deck.cards.map((_,i)=>i);
  if(!hasCustomOrder){
    if(state.learnSettings.starredOnly)order=order.filter(i=>isDetailStarred(i));
    if(state.learnSettings.unmasteredOnly)order=order.filter(i=>detailStatus(i)!=="mastered");
    if(!state.learnSettings.inOrder)order=shuffled(order);
  }
  state.learnSessionStats=blankLearnSessionStats();
  state.learnSessionStats.mode=options.mode||"normal";
  state.learnSessionStats.deckIndex=state.activeCreatedDeck;
  state.learnSessionStats.startedAt=new Date().toISOString();
  state.learnOrder=order;
  state.learnIndex=0;
  state.learnCompleted=0;
  state.learnCorrect=0;
  state.learnUnknown=0;
  state.learnAnswered=null;
  state.learnOptions=order.length?buildLearnOptions(order[0]):[];
  state.route="learnSession";
  save();
  render();
}
function advanceLearnSession(){const cardIndex=state.learnOrder[state.learnIndex];const correct=state.learnAnswered==="fill-correct"||(Number.isInteger(state.learnAnswered)&&learnOptionIsCorrect(state.learnOptions[state.learnAnswered],cardIndex));state.detailProgress[`${state.activeCreatedDeck}:${cardIndex}`]=correct?"mastered":"learning";state.learnCompleted++;state.learnIndex++;state.learnAnswered=null;state.learnSettings.showExample=false;if(state.learnCompleted>=state.learnOrder.length)touchDeckStudyStats(state.activeCreatedDeck,{increment:true});if(state.learnIndex<state.learnOrder.length)state.learnOptions=buildLearnOptions(state.learnOrder[state.learnIndex]);save();render()}
function openLearnSettings(){const s=state.learnSettings,deck=state.createdDecks[state.activeCreatedDeck],starred=deck.cards.filter((_,i)=>isDetailStarred(i)).length,unmastered=deck.cards.filter((_,i)=>detailStatus(i)!=="mastered").length;modal("Cài đặt học tập",`<p class="muted text-xs mb-5">Tùy chỉnh cách bạn muốn học và kiểm tra</p><div class="learn-settings">
  <section class="settings-section"><h3>Chế độ trả lời</h3>
    ${settingCheck("answerDefinition","Trả lời bằng định nghĩa","hiển thị thuật ngữ",s.answerDefinition)}
    ${settingCheck("answerTerm","Trả lời bằng thuật ngữ","hiển thị định nghĩa",s.answerTerm)}
    <p class="setting-help">* Phải chọn ít nhất một chế độ trả lời</p>
  </section>
  <section class="settings-section"><h3>Lọc từ vựng</h3>
    ${settingCheck("starredOnly",`⭐ Chỉ học từ đánh dấu sao (${starred} từ)`,"",s.starredOnly)}
    ${settingCheck("unmasteredOnly",`🎓 Chỉ học từ chưa thuộc (${unmastered} từ)`,"",s.unmasteredOnly)}
  </section>
  <section class="settings-section"><h3>Thứ tự học</h3>${settingCheck("inOrder","Học theo thứ tự (không xáo trộn)","",s.inOrder)}</section>
  <section class="settings-section"><h3>Tùy chọn trả lời</h3>${settingCheck("acceptSynonyms","Chấp nhận từ đồng nghĩa làm đáp án","Khi bật, bạn có thể trả lời bằng bất kỳ từ đồng nghĩa nào",s.acceptSynonyms)}</section>
  <section class="settings-section"><h3>Ví dụ / giải thích</h3>${settingCheck("showExample","Hiện ví dụ / giải thích trong câu hỏi","Có thể bật/tắt nhanh bằng công tắc trên thẻ học",s.showExample)}</section>
  <section class="settings-section"><h3>Tùy chọn hành vi</h3>${settingCheck("autoAdvance","Tự động tiếp tục khi trả lời đúng","Khi bật, tự động chuyển sang câu tiếp theo khi trả lời đúng",s.autoAdvance)}</section>
  <section class="settings-section"><h3>Loại câu hỏi</h3>
    ${settingCheck("fillBlank","Điền từ (Fill in the blank)","",s.fillBlank)}
    ${settingCheck("multipleChoice","Trắc nghiệm 4 đáp án","",s.multipleChoice)}
    <p class="setting-help">* Phải chọn ít nhất một loại câu hỏi</p>
  </section>
  <div class="settings-footer"><button class="button" data-action="reset-learn-progress">${icon("rotate-ccw")} Reset tiến độ học</button><button class="button primary" data-action="apply-learn-settings">Áp dụng</button></div>
  </div>`);document.querySelector(".modal-card").classList.add("learn-settings-modal")}
function settingCheck(name,label,help,checked){return `<label class="setting-choice"><input type="checkbox" data-learn-setting="${name}" ${checked?"checked":""}><span>${label}${help?`<small>${help}</small>`:""}</span></label>`}
function applyLearnSettings(){const next={};document.querySelectorAll("[data-learn-setting]").forEach(input=>next[input.dataset.learnSetting]=input.checked);if(!next.answerDefinition&&!next.answerTerm){showToast("Hãy chọn ít nhất một chế độ trả lời","circle-alert");return}if(!next.fillBlank&&!next.multipleChoice){showToast("Hãy chọn ít nhất một loại câu hỏi","circle-alert");return}if(next.answerDefinition&&next.answerTerm)next.answerTerm=false;if(next.fillBlank&&next.multipleChoice)next.fillBlank=false;state.learnSettings={...state.learnSettings,...next};closeModal();startLearnSession({forceRestart:true});showToast("Đã áp dụng cài đặt")}
function resetLearnProgress(){if(!confirm("Reset toàn bộ tiến độ học của bộ thẻ này?"))return;const prefix=`${state.activeCreatedDeck}:`;Object.keys(state.detailProgress).filter(key=>key.startsWith(prefix)).forEach(key=>delete state.detailProgress[key]);save();showToast("Đã reset tiến độ học");closeModal();startLearnSession({forceRestart:true})}
function normalizeLearnText(value){return String(value||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[.,;:!?()[\]{}'"]/g,"").replace(/\s+/g," ")}
function grammarBaseKey(value){
  let text=String(value||"")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[–—−~]/g,"-")
    .replace(/\s+/g,"")
    .replace(/^[+\-]+/,"")
    .replace(/^(?:v\/a|a\/v|v|a|n)(?:[-+/])?/g,"")
    .replace(/(?:^|[+/])(?:v\/a|a\/v|v|a|n)(?:[-+]?)?/g,"")
    .replace(/[()]/g,"")
    .replace(/[+\-/]/g,"")
    .trim();
  text=text.replace(/^(?:으|은|는|ㄴ|을|ㄹ|아|어|았|었|고|지|이|에|로)+/g,"");
  return text;
}
function isSameGrammarAsQuestion(answerText,questionGrammar){
  const answerKey=grammarBaseKey(answerText),questionKey=grammarBaseKey(questionGrammar);
  if(!answerKey||!questionKey)return false;
  if(answerKey===questionKey)return true;
  if(answerKey.length>=4&&questionKey.length>=4&&(answerKey.endsWith(questionKey)||questionKey.endsWith(answerKey)))return true;
  return false;
}
function shouldHideAsSameQuestionAnswer(answerText,questionGrammar){
  const answer=cleanInputText(answerText),question=cleanInputText(questionGrammar);
  if(!answer||!question)return false;
  if(normalizeLearnText(answer)===normalizeLearnText(question))return true;
  return isSameGrammarAsQuestion(answer,question);
}
function checkFillBlank(){if(state.learnAnswered!==null)return;const deck=state.createdDecks[state.activeCreatedDeck],cardIndex=state.learnOrder[state.learnIndex],card=deck.cards[cardIndex],typed=normalizeLearnText(document.querySelector("#fillBlankAnswer")?.value),answers=learnFillBlankAnswers(card);const correct=answers.some(x=>normalizeLearnText(x)===typed);state.learnAnswered=correct?"fill-correct":"fill-wrong";recordLearnResult(cardIndex,correct);if(correct){state.learnCorrect++;state.xp+=10;state.today++}save();render();if(correct&&state.learnSettings.autoAdvance)setTimeout(()=>{if(state.route==="learnSession"&&state.learnAnswered==="fill-correct")advanceLearnSession()},700)}
function lookup(){const q=(document.querySelector("#dictionaryInput")?.value||"").trim().toLowerCase();const found=words.filter(w=>[w.term,w.reading,w.meaning].some(x=>x.toLowerCase().includes(q)));document.querySelector("#dictionaryResults").innerHTML=found.length?found.map(w=>`<div class="card list-row"><strong class="text-2xl text-indigo-400">${w.term}</strong><div class="row-main"><strong>${w.reading}</strong><small>${w.meaning}</small></div><button class="icon-button" data-speak="${w.term}">${icon("volume-2")}</button></div>`).join(""):'<p class="empty">Không tìm thấy từ phù hợp.</p>'}
function filterDecks(){const q=(document.querySelector("#deckSearch").value||"").toLowerCase();const sort=document.querySelector("#deckSort").value;const list=decks.filter(d=>(d.name+d.term).toLowerCase().includes(q)).sort((a,b)=>sort==="progress"?b.learned/b.total-a.learned/a.total:a.name.localeCompare(b.name));document.querySelector("#deckResults").innerHTML=`<div class="deck-grid">${list.map(d=>`<article class="card deck-card card-hover" data-deck="${d.id}"><span class="text-xl">${d.icon}</span><h3>${d.name}</h3><p>${d.term}</p><div class="mt-3">${progress(Math.round(d.learned/d.total*100))}</div></article>`).join("")}</div>`}
function filterCreatedDecks(){const activeFolder=String(state.activeCreatedFolder||"");const all=(state.createdDecks||[]).map((deck,index)=>({deck,index})).filter(x=>createdFolderName(x.deck)===activeFolder);const query=document.querySelector("#createdDeckSearch")?.value||"";const sort=document.querySelector("#createdDeckSort")?.value||"name-asc";const size=document.querySelector("#createdDeckSizeFilter")?.value||"all";const filtered=sortCreatedDeckItems(filterCreatedDeckItems(all,query,size),sort);const count=document.querySelector("#createdDeckFilterCount");if(count)count.textContent=`${filtered.length}/${all.length} bộ`;const target=document.querySelector("#createdDeckResults");if(target)target.innerHTML=createdDeckGrid(filtered)}
function filterCreatedFolders(){const query=searchText(document.querySelector("#createdFolderSearch")?.value||"");const sort=document.querySelector("#createdFolderSort")?.value||"name-asc";const groups=sortCreatedFolders(createdDeckFolderGroups(state.createdDecks||[]).filter(group=>!query||searchText(group.name).includes(query)),sort);const target=document.querySelector("#createdFolderResults");if(target)target.innerHTML=groups.length?`<div class="deck-grid">${groups.map(createdFolderCard).join("")}</div>`:`<p class="empty card">Không tìm thấy thư mục phù hợp.</p>`}

function simpleForm(title,label,long=false){modal(title,`<form><div class="field"><label>${label}</label>${long?'<textarea required class="input" rows="6"></textarea>':'<input required class="input">'}</div><button class="button primary mt-5">Lưu</button></form>`)}
function startExam(id=0){state.quizIndex=0;state.quizScore=0;state.quizAnswered=null;save();modal("Bắt đầu luyện thi",`<p class="muted mb-4">Đề ${id+1} đã sẵn sàng. Đồng hồ sẽ bắt đầu khi bạn nhấn nút bên dưới.</p><button class="button primary" data-action="quiz">Bắt đầu ngay</button>`)}
function saveCreatedDeck(){const title=state.deckDraft.title.trim();const validCards=state.deckDraft.cards.filter(c=>c.term.trim()||c.definition.trim());if(!title){showToast("Hãy nhập tiêu đề bộ thẻ","circle-alert");document.querySelector("[data-draft-meta=title]")?.focus();return}if(!validCards.length){showToast("Hãy nhập ít nhất một thẻ","circle-alert");return}const deck={...JSON.parse(JSON.stringify(state.deckDraft)),cards:validCards,updatedAt:new Date().toISOString()};if(Number.isInteger(state.editingDeckIndex))state.createdDecks[state.editingDeckIndex]=deck;else state.createdDecks.unshift(deck);state.editingDeckIndex=null;state.deckDraft={title:"",description:"",isPublic:false,suggestions:true,cards:[blankDraftCard()]};state.route="decks";save();render();showToast("Đã tạo bộ thẻ thành công")}
function openImportCards(){modal("Nhập",`<p class="muted text-xs mb-5">Chép và dán dữ liệu từ Word, Excel, Google Docs, v.v.</p>
  <textarea id="bulkImportText" class="bulk-import-box" placeholder="Từ 1	Định nghĩa 1	Phát âm (nếu có)	Loại từ (nếu có)	Ví dụ (nếu có)	Từ đồng nghĩa (nếu có)&#10;Từ 2	Định nghĩa 2	Phát âm (nếu có)	Loại từ (nếu có)	Ví dụ (nếu có)	Từ đồng nghĩa (nếu có)"></textarea>
  <div class="import-options">
    <div class="radio-group"><strong>Giữa thuật ngữ và định nghĩa</strong>
      <label class="radio-line"><input type="radio" name="fieldDelimiter" value="tab" checked> Tab</label>
      <label class="radio-line"><input type="radio" name="fieldDelimiter" value="comma"> Phẩy</label>
      <label class="radio-line"><input type="radio" name="fieldDelimiter" value="custom"> Tùy chọn <input id="customFieldDelimiter" class="custom-delimiter" maxlength="5" placeholder="VD: |"></label>
    </div>
    <div class="radio-group"><strong>Giữa các thẻ</strong>
      <label class="radio-line"><input type="radio" name="cardDelimiter" value="newline" checked> Dòng mới</label>
      <label class="radio-line"><input type="radio" name="cardDelimiter" value="semicolon"> Chấm phẩy</label>
      <label class="radio-line"><input type="radio" name="cardDelimiter" value="custom"> Tùy chọn <input id="customCardDelimiter" class="custom-delimiter" maxlength="5" placeholder="VD: ||"></label>
    </div>
  </div>
  <div id="importPreview" class="import-preview"><h4>Xem trước</h4><p class="muted text-xs">Dán dữ liệu để xem cách các thẻ được tách.</p></div>
  <div class="import-footer"><button class="button" data-close-modal>Hủy nhập</button><button class="button primary" id="confirmImport" disabled>Nhập</button></div>`);
  const card=document.querySelector(".modal-card");card.classList.add("import-modal");
  const refresh=()=>refreshImportPreview();
  document.querySelector("#bulkImportText").addEventListener("input",refresh);
  document.querySelectorAll('input[name="fieldDelimiter"], input[name="cardDelimiter"]').forEach(x=>x.addEventListener("change",()=>{document.querySelector("#customFieldDelimiter").classList.toggle("show",selectedImportOption("fieldDelimiter")==="custom");document.querySelector("#customCardDelimiter").classList.toggle("show",selectedImportOption("cardDelimiter")==="custom");refresh()}));
  document.querySelector("#customFieldDelimiter").addEventListener("input",refresh);
  document.querySelector("#customCardDelimiter").addEventListener("input",refresh);
  document.querySelector("#confirmImport").onclick=confirmBulkImport;
}
function selectedImportOption(name){return document.querySelector(`input[name="${name}"]:checked`)?.value}
function importDelimiter(kind){const option=selectedImportOption(kind==="field"?"fieldDelimiter":"cardDelimiter");if(kind==="field"){if(option==="tab")return "\t";if(option==="comma")return ",";return document.querySelector("#customFieldDelimiter")?.value||""}if(option==="newline")return "\n";if(option==="semicolon")return ";";return document.querySelector("#customCardDelimiter")?.value||""}
function parseBulkImport(){const raw=document.querySelector("#bulkImportText")?.value.replace(/\r\n/g,"\n").trim()||"";const fieldDelimiter=importDelimiter("field"),cardDelimiter=importDelimiter("card");if(!raw||!fieldDelimiter||!cardDelimiter)return[];return raw.split(cardDelimiter).map(x=>x.trim()).filter(Boolean).map(row=>{const parts=row.split(fieldDelimiter).map(x=>x.trim());return {...blankDraftCard(),term:parts[0]||"",definition:parts[1]||"",pronunciation:parts[2]||"",wordType:parts[3]||"",example:parts[4]||"",synonyms:parts.slice(5).join(fieldDelimiter)||""}}).filter(card=>card.term||card.definition)}
function refreshImportPreview(){const cards=parseBulkImport();const preview=document.querySelector("#importPreview"),confirm=document.querySelector("#confirmImport");if(!preview||!confirm)return;confirm.disabled=!cards.length;preview.innerHTML=cards.length?`<h4>Xem trước ${cards.length} thẻ</h4>${cards.slice(0,4).map((card,i)=>`<div class="preview-row"><strong>${i+1}</strong><span title="${escapeAttr(card.term)}">${escapeHtml(card.term||"—")}</span><span title="${escapeAttr(card.definition)}">${escapeHtml(card.definition||"—")}</span></div>`).join("")}${cards.length>4?`<p class="muted text-xs mt-2">… và ${cards.length-4} thẻ khác</p>`:""}`:'<h4>Xem trước</h4><p class="muted text-xs">Dữ liệu chưa hợp lệ với dấu phân cách đang chọn.</p>'}
function confirmBulkImport(){const cards=parseBulkImport();if(!cards.length){showToast("Không có dữ liệu hợp lệ","circle-alert");return}state.deckDraft.cards=cards;save();document.querySelector(".modal-card")?.classList.remove("import-modal");closeModal();render();showToast(`Đã nhập ${cards.length} thẻ`)}
function autoFillDraft(){let changed=0;const suggestions={"經濟":"Kinh tế","社會":"Xã hội","文化":"Văn hóa","自然":"Tự nhiên","學習":"Học tập","勉強":"Học tập, nỗ lực"};state.deckDraft.cards.forEach(card=>{if(card.term&&!card.definition&&suggestions[card.term]){card.definition=suggestions[card.term];changed++}if(card.term&&!card.pronunciation){const word=words.find(w=>w.term===card.term);if(word){card.pronunciation=word.reading;changed++}}});if(!state.deckDraft.cards.some(c=>c.term)){state.deckDraft.cards=[{...blankDraftCard(),term:"經濟",definition:"Kinh tế",pronunciation:"Kinh tế",wordType:"Danh từ",example:"經濟發展 — Phát triển kinh tế",synonyms:"kinh tài"},{...blankDraftCard(),term:"社會",definition:"Xã hội",pronunciation:"Xã hội",wordType:"Danh từ",example:"現代社會 — Xã hội hiện đại",synonyms:"cộng đồng"}];changed=2}save();render();showToast(changed?`Đã gợi ý cho ${changed} mục`:"Chưa có mục phù hợp để gợi ý")}
function pickCardImage(index){const input=document.createElement("input");input.type="file";input.accept="image/*";input.onchange=()=>{const file=input.files[0];if(!file)return;if(file.size>1500000){showToast("Ảnh cần nhỏ hơn 1,5 MB","circle-alert");return}const reader=new FileReader();reader.onload=()=>{state.deckDraft.cards[index].image=reader.result;save();render();showToast("Đã thêm ảnh")};reader.readAsDataURL(file)};input.click()}

document.querySelector("#notificationButton").onclick=e=>{e.stopPropagation();document.querySelector("#notificationMenu").classList.toggle("show")};
document.querySelector("#profileButton").onclick=e=>{e.stopPropagation();document.querySelector("#profileMenu").classList.toggle("show")};
document.querySelector("#notificationMenu").innerHTML=`<strong class="block p-3">Thông báo</strong><button class="dropdown-item">🔥 Chuỗi ${state.streak} ngày — tiếp tục nhé!</button><button class="dropdown-item">TOPIK II vừa có bài học mới</button>`;
document.querySelector("#profileMenu").innerHTML=`<button class="dropdown-item" data-route="settings">Hồ sơ & cài đặt</button><button class="dropdown-item" data-action="upgrade">Nâng cấp Pro</button><button class="dropdown-item text-red-400">Đăng xuất</button>`;
document.querySelector("#searchButton").onclick=()=>modal("Tìm kiếm nhanh",`<input id="globalSearch" class="input" autofocus placeholder="Tìm khóa học, bộ từ, từ vựng..."><div class="search-results">${decks.slice(0,3).map(d=>`<button class="dropdown-item" data-deck="${d.id}">${d.icon} ${d.name}</button>`).join("")}</div>`);
document.addEventListener("click",e=>{if(!e.target.closest("#notificationButton")&&!e.target.closest("#notificationMenu"))document.querySelector("#notificationMenu")?.classList.remove("show");if(!e.target.closest("#profileButton")&&!e.target.closest("#profileMenu"))document.querySelector("#profileMenu")?.classList.remove("show");if(!e.target.closest("#hvqQuickBackgroundButton")&&!e.target.closest("#hvqQuickBackgroundPanel"))closeQuickBackgroundPanel()});

async function initApp(){await hvqMigrateLegacyPersonalDataToOwner();await hvqLoadCurrentAccountPersonalData();await hvqCloudPullAndApply("init");hvqCloudReady=true;save();render();setTimeout(applyCustomLogo,0)}
initApp();

(function injectAiShortExplainStyle(){
  if(typeof document==="undefined"||document.getElementById("hvq-ai-short-style"))return;
  const style=document.createElement("style");
  style.id="hvq-ai-short-style";
  style.textContent=`
    .ai-short-explain{padding:16px!important;text-align:left!important;max-width:100%!important}
    .ai-short-explain>strong{display:block;margin-bottom:12px;color:#7cc7ff;text-align:left!important}
    .ai-short-explain .ai-explain-content{display:flex;flex-direction:column;gap:12px;text-align:left!important;line-height:1.65}
    .ai-short-explain .ai-short-box{border:1px solid rgba(125,180,255,.25);background:rgba(7,18,38,.42);border-radius:14px;padding:12px 14px;text-align:left!important}
    .ai-short-explain .ai-short-title{font-weight:800;margin-bottom:8px;color:#fff}
    .ai-short-explain p{margin:5px 0!important;text-align:left!important}
    .ai-short-explain .ai-mini-line{margin:5px 0;text-align:left!important}
    .ai-short-explain .muted{opacity:.82}
  `;
  document.head.appendChild(style);
})();


(function injectCreatedDeckProgressStyle(){
  if(typeof document==="undefined"||document.getElementById("hvq-created-progress-style"))return;
  const style=document.createElement("style");
  style.id="hvq-created-progress-style";
  style.textContent=`
    .created-progress-card h3{font-size:18px;margin-top:14px;margin-bottom:8px}
    .created-progress-line{display:flex;align-items:center;gap:12px}
    .created-progress-line .created-progress-bar{flex:1;min-width:0}
    .created-progress-line .progress{height:10px;background:rgba(15,23,42,.72);border-radius:999px;overflow:hidden}
    .created-progress-line .progress i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#22c55e,#6366f1)}
    .created-progress-line strong{min-width:54px;text-align:right;color:#fff;font-weight:800}
    .created-study-meta{display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;color:#cbd5e1;font-size:12px}
    .created-study-meta span,.created-study-owner span{display:inline-flex;align-items:center;gap:6px}
    .created-study-owner{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;color:#cbd5e1;font-size:12px}
    .created-progress-card .pill{background:rgba(99,102,241,.14);color:#bfdbfe}
  `;
  document.head.appendChild(style);
})();


// V11: khi đổi kích thước màn hình, tự áp lại bottom nav mobile.
if(!window.__hvqMobileBottomNavV11Resize){
  window.__hvqMobileBottomNavV11Resize=true;
  window.addEventListener("resize",()=>applyMobileTopbarCompactMode(),{passive:true});
}


// HVQ_MOBILE_NO_ZOOM_FIX_V1 - khóa layout mobile đúng 1 màn hình, không bị zoom/pan ngang trên iPhone
(function injectMobileNoZoomFix(){
  if(typeof document==="undefined")return;
  const applyViewport=()=>{
    let meta=document.querySelector('meta[name="viewport"]');
    if(!meta){
      meta=document.createElement('meta');
      meta.name='viewport';
      document.head.prepend(meta);
    }
    meta.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  };
  const applyRootLock=()=>{
    document.documentElement.style.setProperty('width','100%','important');
    document.documentElement.style.setProperty('max-width','100vw','important');
    document.documentElement.style.setProperty('overflow-x','hidden','important');
    document.body?.style.setProperty('width','100%','important');
    document.body?.style.setProperty('max-width','100vw','important');
    document.body?.style.setProperty('overflow-x','hidden','important');
  };
  applyViewport();
  applyRootLock();
  if(!document.getElementById('hvq-mobile-no-zoom-style')){
    const style=document.createElement('style');
    style.id='hvq-mobile-no-zoom-style';
    style.textContent=`
      html,body{max-width:100vw!important;overflow-x:hidden!important}
      .page-header p:empty{display:none!important}
      *,*::before,*::after{box-sizing:border-box}
      @media(max-width:640px){
        html,body{
          width:100%!important;
          min-width:0!important;
          max-width:100vw!important;
          overflow-x:hidden!important;
          overscroll-behavior-x:none!important;
          touch-action:pan-y!important;
        }
        body{margin:0!important}
        .app-shell,.content,#app,main,.main,.main-content,.workspace,.page{
          width:100%!important;
          min-width:0!important;
          max-width:100vw!important;
          margin-left:0!important;
          margin-right:0!important;
          overflow-x:hidden!important;
        }
        .content,#app,main,.main-content,.workspace,.page{
          padding-left:12px!important;
          padding-right:12px!important;
        }
        .page-header,.card,.section-card,.quiz-shell,.excel-shell,.excel-card,.excel-quiz-card,
        .deck-grid,.created-deck-grid,.folder-grid,.card-groups,.table-wrap,
        .learn-session,.learn-topbar,.learn-question-card,.learn-options,.learn-feedback,
        .ai-short-explain,.ai-short-explain .ai-explain-content,.ai-short-explain .ai-short-box{
          width:100%!important;
          min-width:0!important;
          max-width:100%!important;
          overflow-wrap:anywhere!important;
        }
        .learn-session{
          display:block!important;
          padding:calc(env(safe-area-inset-top,0px) + 16px) 0 calc(88px + env(safe-area-inset-bottom,0px))!important;
          margin:0!important;
          overflow-x:hidden!important;
        }
        .learn-topbar{
          display:flex!important;
          align-items:center!important;
          justify-content:space-between!important;
          gap:8px!important;
          padding:6px 0 12px!important;
          position:sticky!important;
          top:calc(env(safe-area-inset-top,0px) + 8px)!important;
          z-index:40!important;
          margin:0!important;
        }
        .learn-question-card{
          display:block!important;
          max-width:calc(100vw - 24px)!important;
          margin:0 auto 16px!important;
          padding:16px!important;
          border-radius:18px!important;
        }
        .learn-question-head{
          display:flex!important;
          align-items:flex-start!important;
          justify-content:space-between!important;
          gap:10px!important;
          width:100%!important;
          min-width:0!important;
        }
        .learn-term{
          flex:1 1 auto!important;
          min-width:0!important;
          max-width:100%!important;
          font-size:22px!important;
          line-height:1.25!important;
          word-break:break-word!important;
          overflow-wrap:anywhere!important;
          white-space:normal!important;
        }
        .learn-question-tools{
          flex:0 0 auto!important;
          display:flex!important;
          align-items:center!important;
          justify-content:flex-end!important;
          gap:5px!important;
          min-width:auto!important;
        }
        .learn-question-tools button{
          width:34px!important;
          height:34px!important;
          min-width:34px!important;
          max-width:34px!important;
          padding:0!important;
        }
        .learn-options{
          display:flex!important;
          flex-direction:column!important;
          gap:10px!important;
          margin-top:18px!important;
        }
        .learn-option,.quiz-option,.excel-options .quiz-option{
          width:100%!important;
          max-width:100%!important;
          min-width:0!important;
          white-space:normal!important;
          text-align:left!important;
          overflow-wrap:anywhere!important;
          word-break:break-word!important;
          padding:13px 14px!important;
        }
        .learn-feedback{
          margin-top:14px!important;
          padding:14px!important;
          overflow-x:hidden!important;
        }
        .ai-short-explain{padding:14px!important;overflow-x:hidden!important}
        .ai-short-explain .ai-short-box{padding:12px!important;overflow-x:hidden!important}
        img,svg,canvas,video,iframe{max-width:100%!important;height:auto}
        table{max-width:100%!important}
        .table-wrap{overflow-x:auto!important}
        .hvq-fixed-topbar{
          width:100vw!important;
          max-width:100vw!important;
          left:0!important;
          right:0!important;
          overflow:hidden!important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  window.addEventListener('resize',applyRootLock,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(()=>{applyViewport();applyRootLock();window.scrollTo(0,window.scrollY);},250),{passive:true});
})();
