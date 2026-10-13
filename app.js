const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const defaultState={
 profile:{age:null,height:null,weight:null,sex:'',calories:2000,protein:100,fat:65,steps:8000},
 weights:[],
 dailySteps:[],weekPlan:[],
 foods:[],customFoods:[],barcodeFoods:[],personalFoods:[],favoriteFoods:[],shopping:[],lifts:[],trainingSessions:[],completed:{},
 workouts:[
 {name:'День 1 · Грудь + руки',day:'Пн',items:[['Жим гантелей лёжа','Грудь',3,'8–12'],['Жим гантелей на наклонной скамье','Грудь',3,'8–12'],['Сведение рук в кроссовере','Грудь',2,'12–15'],['Сгибание рук с гантелями','Бицепс',3,'8–12'],['Сгибание на скамье Скотта или на блоке','Бицепс',2,'10–15'],['Разгибание рук на блоке с канатом','Трицепс',3,'10–15'],['Разгибание рук над головой на блоке','Трицепс',2,'10–15']]},
 {name:'День 2 · Спина + плечи',day:'Ср',items:[['Тяга верхнего блока','Спина',3,'8–12'],['Тяга с упором грудью','Спина',3,'8–12'],['Пуловер на верхнем блоке','Спина',2,'12–15'],['Жим гантелей сидя','Плечи',3,'8–12'],['Подъёмы гантелей в стороны','Плечи',3,'12–20'],['Обратная бабочка','Задняя дельта',3,'12–15'],['Face pull','Задняя дельта',2,'12–20']]},
 {name:'День 3 · Ноги + пресс',day:'Пт',items:[['Сгибание ног сидя','Задняя поверхность бедра',3,'10–15'],['Румынская тяга с гантелями','Ягодицы/бицепс бедра',3,'8–12'],['Ягодичный мост / хип-траст','Ягодицы',3,'8–12'],['Подъёмы на носки сидя','Икры',3,'12–20'],['Скручивания на блоке','Пресс',3,'10–15'],['Планка','Пресс',2,'30–60 сек']]}],
 recipes:[
 {name:'Курица с рисом и брокколи',kcal:620,p:52,f:14,c:72,min:25,ingredients:['Куриная грудка 180 г','Рис сухой 75 г','Брокколи 150 г','Оливковое масло 5 г'],steps:'Приготовь рис. Курицу приправь солью, паприкой и чесноком, готовь в аэрогриле до полной готовности. Брокколи приготовь на пару или на сковороде.'},
 {name:'Паста с говяжьим фаршем',kcal:650,p:43,f:19,c:75,min:25,ingredients:['Паста сухая 85 г','Халяльный фарш 150 г','Пассата 180 г','Лук 50 г'],steps:'Отвари пасту. Обжарь фарш с луком до готовности, добавь пассату и специи, туши 8–10 минут.'},
 {name:'Скир с овсянкой и ягодами',kcal:420,p:32,f:8,c:57,min:5,ingredients:['Скир 200 г','Овсянка 50 г','Банан 100 г','Ягоды 80 г'],steps:'Смешай скир с овсянкой, добавь нарезанный банан и ягоды. Можно подготовить вечером.'},
 {name:'Лосось с картофелем',kcal:610,p:40,f:22,c:57,min:25,ingredients:['Лосось 160 г','Картофель 250 г','Брокколи 150 г','Лимон и специи'],steps:'Нарежь картофель и готовь в аэрогриле до мягкости. Лосось приправь лимоном и специями, готовь до полной готовности. Добавь брокколи.'},
 {name:'Творог со ягодами и тостом',kcal:390,p:34,f:8,c:43,min:5,ingredients:['Творог 200 г','Ягоды 100 г','Хлеб цельнозерновой 50 г','Мёд 5 г по желанию'],steps:'Подавай творог с ягодами, хлеб подсуши. Мёд добавляй по желанию и учитывай в калориях.'},
 {name:'Говядина с рисом',kcal:590,p:42,f:17,c:67,min:25,ingredients:['Постная говядина 160 г','Рис сухой 75 г','Перец 100 г','Соевый соус 10 мл'],steps:'Приготовь рис. Нарежь говядину тонкими полосками и быстро обжарь до готовности, добавь перец и соус.'}
 ]
};
// BetterYou 2.0: cloud accounts have completely separate local caches.
const GUEST_KEY='betteryou-state';
const CONFIG_KEY='betteryou-supabase-config-v2';
const userKey=id=>`betteryou-user-${id}`;
const pendingKey=id=>`betteryou-pending-${id}`;
const versionKey=id=>`betteryou-version-${id}`;
const dataFields=['profile','weights','dailySteps','weekPlan','foods','customFoods','barcodeFoods','personalFoods','favoriteFoods','shopping','lifts','trainingSessions','completed','workouts','recipes'];
function cleanData(d){
 const result=structuredClone(defaultState);
 if(!d||typeof d!=='object'||Array.isArray(d))return result;
 for(const k of dataFields){
  if(!(k in d))continue;
  const v=d[k];
  if(k==='profile'&&v&&typeof v==='object'&&!Array.isArray(v))result.profile={...result.profile,...v};
  else if(k==='completed'&&v&&typeof v==='object'&&!Array.isArray(v))result.completed=v;
  else if(Array.isArray(v))result[k]=v;
 }
 return result;
}
function readStorage(key){try{let x=localStorage.getItem(key);return x?cleanData(JSON.parse(x)):cleanData(null)}catch{return cleanData(null)}}
function publicData(){return Object.fromEntries(dataFields.map(k=>[k,structuredClone(state[k])]))}
let state=readStorage(GUEST_KEY),activeWorkout=0,sb=null,session=null,installPrompt=null;
let activeUserId=null,cloudRevision=0,cloudConflict=false,cloudBusy=false,cloudTimer=null,authEpoch=0;
let cloudMessage='Гостевой режим: данные только на этом устройстве.';
function localPending(){return !!(activeUserId&&localStorage.getItem(pendingKey(activeUserId))==='1')}
function scheduleUpload(){if(cloudTimer)clearTimeout(cloudTimer);if(session&&!cloudConflict)cloudTimer=setTimeout(uploadPending,1100)}
function save(){
 if(activeUserId){localStorage.setItem(userKey(activeUserId),JSON.stringify(publicData()));localStorage.setItem(pendingKey(activeUserId),'1');cloudMessage='Изменения сохранены на устройстве, ожидается синхронизация.';scheduleUpload();}
 else localStorage.setItem(GUEST_KEY,JSON.stringify(publicData()));
 renderAll();
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function go(tab){document.querySelectorAll('.tabscreen').forEach(x=>x.classList.toggle('active',x.id===tab));document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));window.scrollTo({top:0,behavior:'smooth'});if(tab==='training')renderTraining()}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>go(b.dataset.tab));
// Steps 2.1: preserve legacy step entries stored alongside weight measurements.
function stepsFor(date){
 const entry=state.dailySteps.find(x=>x.date===date);
 if(entry)return Math.max(0,Number(entry.steps)||0);
 return Math.max(0,Number(state.weights.find(w=>w.date===date)?.steps)||0);
}
function recordedStepDates(){return [...new Set([...state.weights.filter(x=>x.steps!=null).map(x=>x.date),...state.dailySteps.map(x=>x.date)])].filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort().reverse()}
function dayOffset(offset){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function renderSteps(){
 $('stepDate').value ||= today();
 const chosen=$('stepDate').value||today();
 const current=stepsFor(chosen),target=Math.max(1,Number(state.profile.steps)||8000);
 $('stepsSelected').textContent=current.toLocaleString('ru-RU');
 $('stepsTarget').textContent=target.toLocaleString('ru-RU');
 $('stepsProgress').style.width=Math.min(100,Math.round(current/target*100))+'%';
 $('stepsRemaining').textContent=current>=target?'Цель на этот день выполнена!':`До цели осталось ${(target-current).toLocaleString('ru-RU')} шагов`;
 $('stepsTodayLabel').textContent=chosen===today()?'Сегодня':'Выбранная дата: '+chosen;
 const last7=Array.from({length:7},(_,i)=>{const date=dayOffset(i-6);return {date,steps:stepsFor(date)}});
 const avg=Math.round(last7.reduce((sum,x)=>sum+x.steps,0)/7);
 $('stepsAverage').textContent=avg.toLocaleString('ru-RU')+' шагов/день';
 $('stepsChart').innerHTML=last7.map(({date,steps})=>`<div class="step-col"><div class="step-count">${steps?Math.round(steps/100)/10+'к':'—'}</div><div class="step-track"><div class="step-fill" style="height:${Math.min(100,steps/target*100)}%"></div></div><div class="step-date">${date.slice(8)}</div></div>`).join('');
 const dates=recordedStepDates().slice(0,30);
 $('stepsHistory').innerHTML=dates.length?dates.map(date=>`<div class="listitem row between"><span>${esc(date)}</span><b>${stepsFor(date).toLocaleString('ru-RU')} шагов</b></div>`).join(''):'<p class="muted">Пока нет записей. Добавь шаги за сегодня.</p>';
}
$('stepsForm').onsubmit=e=>{
 e.preventDefault();const date=$('stepDate').value,steps=Number($('stepCount').value);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isInteger(steps)||steps<0||steps>100000){alert('Укажи дату и количество шагов от 0 до 100 000.');return}
 state.dailySteps=state.dailySteps.filter(x=>x.date!==date);
 state.dailySteps.push({date,steps});
 save();$('stepCount').value='';
};
$('stepDate').onchange=()=>renderSteps();
$('stepsClear').onclick=()=>{
 const date=$('stepDate').value;
 if(!confirm('Сбросить шаги за '+date+'? Записи веса не изменятся.'))return;
 state.dailySteps=state.dailySteps.filter(x=>x.date!==date);
 state.dailySteps.push({date,steps:0});save();
};
function foodsForDate(date){return state.foods.filter(f=>f.date===date)}
function todayFoods(){return foodsForDate(today())}
function foodTotalsForDate(date){return foodsForDate(date).reduce((a,f)=>({kcal:a.kcal+(Number(f.kcal)||0),p:a.p+(Number(f.p)||0),f:a.f+(Number(f.f)||0),c:a.c+(Number(f.c)||0)}),{kcal:0,p:0,f:0,c:0})}
function totals(){return foodTotalsForDate(today())}
function renderHome(){
 $('todayLabel').textContent=new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'});
 const t=totals(), p=state.profile;
 const metrics=[['Калории',Math.round(t.kcal),p.calories,'ккал'],['Белки',Math.round(t.p),p.protein,'г'],['Жиры',Math.round(t.f),p.fat,'г'],['Углеводы',Math.round(t.c),Math.round((p.calories-p.protein*4-p.fat*9)/4),'г']];
 $('macroStats').innerHTML=metrics.map(([n,v,g,u])=>`<div class="stat"><div class="sub">${n}</div><div class="metric">${v}<small> / ${g} ${u}</small></div><div class="bar"><i style="width:${Math.min(100,g?v/g*100:0)}%"></i></div></div>`).join('');
 const latest=[...state.weights].sort((a,b)=>a.date.localeCompare(b.date));drawChart(latest);
 if(latest.length>1){let d=latest[latest.length-1].weight-latest[0].weight;$('weightDelta').textContent=(d>0?'+':'')+d.toFixed(1)+' кг';}else $('weightDelta').textContent='Добавь записи';
 const todaySteps=stepsFor(today());
 const checks=[['Питание',todayFoods().length>0],['Тренировка',!!state.completed[today()]],['Шаги',todaySteps>=state.profile.steps]];
 $('todayChecklist').innerHTML=checks.map(([n,v])=>`<div class="listitem row between"><span>${n}</span><span class="${v?'good':'muted'}">${v?'✓ отмечено':'не отмечено'}</span></div>`).join('');
 $('homeStepSummary').textContent=todaySteps.toLocaleString('ru-RU')+' / '+(Number(p.steps)||8000).toLocaleString('ru-RU')+' шагов';
 $('homeStepProgress').style.width=Math.min(100,todaySteps/Math.max(1,Number(p.steps)||8000)*100)+'%';
 $('dayBar').style.width=(checks.filter(x=>x[1]).length/checks.length*100)+'%';$('dayProgress').textContent=`${checks.filter(x=>x[1]).length} из ${checks.length} привычек отмечено`;
 const rate=latest.length>=8?(latest.slice(-7).reduce((a,x)=>a+x.weight,0)/Math.min(7,latest.length)-latest.slice(-14,-7).reduce((a,x)=>a+x.weight,0)/Math.max(1,Math.min(7,latest.slice(-14,-7).length))):null;
 let msg='Веди вес регулярно и оценивай среднее за 7 дней. Пока не меняй калории из-за одного взвешивания.';
 if(latest.length<7)msg='Собери хотя бы 7 утренних взвешиваний. Пока держи ориентир около '+p.calories+' ккал и '+p.protein+' г белка.';
 else if(t.kcal>p.calories+250)msg='Сегодня калории выше ориентира. Не компенсируй голоданием — просто вернись к обычному плану на следующем приёме пищи.';
 else if(t.kcal<p.calories-500)msg='Проверь, не недоедаешь ли ты сегодня. Стабильное питание помогает сохранить мышцы и восстановление.';
 $('recommendation').innerHTML=`<p>${esc(msg)}</p><p class="small muted">Коррекция калорий — только после 2–3 недель устойчивых данных о среднем весе, талии и соблюдении плана. Это ориентир, не медицинская рекомендация.</p>`;
}
function drawChart(data){let el=$('weightChart');if(!data.length){el.textContent='Добавь вес, чтобы увидеть график';return}let pts=data.slice(-14), vals=pts.map(x=>x.weight),min=Math.min(...vals)-.5,max=Math.max(...vals)+.5,range=max-min||1;let coords=vals.map((v,i)=>`${10+i*(280/Math.max(1,vals.length-1))},${150-(v-min)/range*120}`).join(' ');el.innerHTML=`<svg viewBox="0 0 300 170" role="img" aria-label="График веса"><line x1="8" y1="150" x2="292" y2="150" stroke="#284057"/><polyline points="${coords}" fill="none" stroke="#35d6a0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${vals.map((v,i)=>`<circle cx="${10+i*(280/Math.max(1,vals.length-1))}" cy="${150-(v-min)/range*120}" r="3.5" fill="#35d6a0"/>`).join('')}<text x="8" y="13" fill="#91a6bc" font-size="10">${max.toFixed(1)} кг</text><text x="8" y="166" fill="#91a6bc" font-size="10">${esc(pts[0].date.slice(5))}</text><text x="255" y="166" fill="#91a6bc" font-size="10">${esc(pts[pts.length-1].date.slice(5))}</text></svg>`}
function renderWeights(){ $('wDate').value ||= today();$('wWeight').value=state.profile.weight??'';$('wSteps').value=stepsFor(today())||'';
 const arr=[...state.weights].sort((a,b)=>b.date.localeCompare(a.date));$('weightHistory').innerHTML=arr.length?arr.map((x,i)=>`<div class="listitem row between"><div><b>${esc(x.date)}</b><div class="sub">${x.waist?`Талия ${x.waist} см · `:''}${x.steps?x.steps+' шагов':''}</div></div><div class="row"><b>${x.weight} кг</b><button class="danger" data-delweight="${i}">×</button></div></div>`).join(''):'<p class="muted">Записей пока нет.</p>';
 $('weightHistory').querySelectorAll('[data-delweight]').forEach(b=>b.onclick=()=>{let x=arr[+b.dataset.delweight];state.weights=state.weights.filter(w=>w!==x);save()});
}
// BetterYou 2.8 — training studio: per-user profile, home/gym generator, exercise guides, sets, sessions, timer and trends.
// Educational training templates; not a diagnosis, medical treatment or a substitute for an individual coach.
const TRAINING_LIBRARY=[
// ID | visible name | muscle | place | equipment | cues | typical mistake | movement caution tags
 ['chest_machine','Жим в грудном тренажёре','Грудь','gym','machine','Настрой сиденье так, чтобы рукояти были у середины груди|Стабилизируй лопатки и выжимай без рывка|Медленно возвращай вес','Не поднимай плечи к ушам','shoulder'],
 ['db_bench','Жим гантелей лёжа','Грудь','gym','dumbbell','Упрись стопами в пол и собери лопатки|Держи запястья над предплечьями|Опускай вес плавно до комфортной глубины','Не отскакивай от нижней точки','shoulder'],
 ['db_incline','Жим гантелей на наклонной','Грудь','gym','dumbbell','Настрой небольшой наклон скамьи|Опускай локти подконтрольно|Выжимай гантели без столкновения','Не выгибай чрезмерно поясницу','shoulder'],
 ['cable_fly','Сведение рук в кроссовере','Грудь','gym','cable','Выставь умеренный вес|Сохраняй лёгкий сгиб локтя|Своди руки перед грудью, не бросая вес','Не тяни корпусом','shoulder'],
 ['lat_pulldown','Тяга верхнего блока','Спина','gym','cable','Возьми рукоять удобным хватом|Опускай к верхней части груди|Подконтрольно выпрямляй руки','Не тяни за шею','shoulder'],
 ['cable_row','Горизонтальная тяга блока','Спина','gym','cable','Сядь устойчиво и выпрями спину|Тяни локти назад к поясу|Возвращай рукоять без рывка','Не раскачивай корпус','back'],
 ['supported_row','Тяга с упором грудью','Спина','gym','machine','Прижми грудь к опоре|Тяни локти назад вдоль тела|Опускай вес медленно','Не отрывай грудь от опоры','shoulder'],
 ['assisted_pullup','Подтягивания с поддержкой','Спина','gym','machine','Настрой поддержку под свой уровень|Начинай со стабильных плеч|Поднимайся без рывка и плавно опускайся','Не размахивай ногами','shoulder'],
 ['seated_press','Жим гантелей сидя','Плечи','gym','dumbbell','Сядь устойчиво, сохрани нейтральную спину|Выжимай вверх по комфортной траектории|Опускай плавно','Не переразгибай поясницу','shoulder'],
 ['lateral_raise','Подъём гантелей в стороны','Плечи','gym','dumbbell','Подбери небольшой вес|Поднимай руки без раскачивания|Контролируй опускание','Не используй инерцию','shoulder'],
 ['face_pull','Тяга к лицу с канатом','Плечи','gym','cable','Поставь блок примерно на уровне лица|Тяни канат к вискам, разводя концы|Не запрокидывай корпус','Не дёргай слишком тяжёлый вес','shoulder'],
 ['leg_press','Жим ногами в тренажёре','Ноги','gym','machine','Сохраняй таз и поясницу на спинке|Опускай платформу в комфортной амплитуде|Не выпрямляй колени резко','Не отрывай таз','knee'],
 ['goblet_squat','Присед с гантелью у груди','Ноги','gym','dumbbell','Держи гантель близко к груди|Опускайся в комфортную глубину|Поднимайся контролируемо','Не проваливай колени внутрь','knee'],
 ['db_rdl','Румынская тяга с гантелями','Задняя цепь','both','dumbbell','Отведи таз назад, немного согни колени|Веди гантели близко к ногам|Поднимайся, напрягая ягодицы','Не округляй спину','back'],
 ['leg_curl','Сгибание ног в тренажёре','Ноги','gym','machine','Подстрой ось тренажёра под колено|Сгибай ноги плавно|Не бросай вес в исходное положение','Не дёргай нагрузку','knee'],
 ['leg_extension','Разгибание ног сидя','Ноги','gym','machine','Настрой сиденье под длину бедра|Выпрямляй колени без рывков|Опускай груз подконтрольно','Не работай через боль в колене','knee'],
 ['hip_thrust','Ягодичный мост в тренажёре','Ягодицы','gym','machine','Настрой опору и ремень|Подними таз усилием ягодиц|Сохраняй рёбра над тазом','Не переразгибай поясницу','back'],
 ['standing_calf','Подъёмы на носки','Икры','both','body','Встань устойчиво и держись за опору|Поднимай пятки плавно|Опускай с контролем','Не пружинь корпусом',''],
 ['cable_crunch','Скручивания на блоке','Пресс','gym','cable','Зафиксируй таз|Скругляй корпус за счёт мышц живота|Возвращайся медленно','Не тяните верёвку только руками','back'],
 ['db_curl','Сгибание рук с гантелями','Руки','both','dumbbell','Держи локти близко к туловищу|Поднимай гантели без рывка|Медленно опускай','Не раскачивай спину',''],
 ['cable_triceps','Разгибание рук на блоке','Руки','gym','cable','Локти у боков|Выпрямляй предплечья вниз|Возвращай вес плавно','Не двигай плечами',''],
 ['plank','Планка','Пресс','both','body','Положи предплечья под плечи|Выровняй корпус и мягко напряги пресс|Дыши спокойно','Не проваливай поясницу','back'],
 ['dead_bug','Жук на спине (dead bug)','Пресс','both','body','Ляг на спину, подними руки и ноги|Поочерёдно выпрямляй противоположные конечности|Не отрывай поясницу рывком','Не задерживай дыхание',''],
 ['bird_dog','Птица-собака (bird dog)','Пресс','both','body','Встань на четвереньки|Вытяни противоположные руку и ногу|Сохраняй таз ровным','Не переразгибай шею',''],
 ['incline_pushup','Отжимания от высокой опоры','Грудь','home','body','Найди устойчивую неподвижную опору|Держи тело одной линией|Опускай грудь к опоре и отжимайся','Не используй скользкую опору','shoulder'],
 ['floor_pushup','Отжимания от пола','Грудь','home','body','Ладони примерно под плечами|Опускай тело без прогиба в пояснице|Поднимайся ровно','Не разводи локти слишком широко','shoulder'],
 ['wall_pushup','Отжимания от стены','Грудь','home','body','Поставь ладони на стену чуть шире плеч|Согни руки и приблизься к стене|Оттолкнись обратно','Не прогибай спину','shoulder'],
 ['db_floor_press','Жим гантелей лёжа на полу','Грудь','home','dumbbell','Ляг на коврик, согни колени|Медленно опускай локти к полу|Выжимай гантели вверх','Не бей локтями о пол','shoulder'],
 ['band_press','Жим резинки от груди','Грудь','home','band','Закрепи резинку безопасно за спиной|Выжимай руки вперёд|Возвращай медленно','Не используй ненадёжное крепление','shoulder'],
 ['band_row','Тяга резинки к поясу','Спина','home','band','Зафиксируй резинку на устойчивой опоре|Тяни локти к поясу|Плавно отпускай натяжение','Не крепи ленту к ненадёжным предметам','back'],
 ['db_row','Тяга гантели одной рукой','Спина','home','dumbbell','Упрись ладонью на устойчивую опору|Веди локоть к тазу|Опускай гантель медленно','Не скручивай корпус','back'],
 ['prone_w','Сведение лопаток лёжа','Спина','home','body','Ляг лицом вниз на коврик|Согни руки буквой W|Своди лопатки плавно без прогиба','Не запрокидывай шею','back'],
 ['band_pullapart','Разведение резинки перед грудью','Спина','home','band','Держи резинку на уровне груди|Разводи руки, сохраняя спокойные плечи|Возвращай с контролем','Не отклоняй корпус назад','shoulder'],
 ['db_shoulder','Жим гантелей стоя','Плечи','home','dumbbell','Поставь стопы устойчиво|Выжимай гантели над головой по комфортной дуге|Сохраняй рёбра над тазом','Не запрокидывайся назад','shoulder'],
 ['band_lateral','Подъём рук с резинкой','Плечи','home','band','Наступи на середину резинки устойчиво|Разводи руки с небольшим сгибом|Опускай медленно','Не рывком','shoulder'],
 ['wall_slide','Скольжения рук по стене','Плечи','home','body','Обопрись спиной на стену|Медленно поднимай руки вверх|Сохраняй комфортную амплитуду','Не продавливай болезненное движение','shoulder'],
 ['sit_to_stand','Вставание со стула','Ноги','home','body','Сядь на устойчивый стул|Наклони корпус слегка вперёд и встань|Сядь медленно','Не падай на сиденье','knee'],
 ['chair_squat','Приседание до стула','Ноги','home','body','Встань перед устойчивым стулом|Отведи таз назад к сиденью|Вернись наверх без рывка','Не опускайся через боль','knee'],
 ['step_up','Подъём на низкую ступень','Ноги','home','body','Найди невысокую устойчивую ступень|Встань на неё, удерживая равновесие|Сойди медленно','Не используй шаткую ступень','knee'],
 ['split_squat','Выпад на месте с опорой','Ноги','home','body','Возьмись за устойчивую опору|Согни ноги в комфортной амплитуде|Поднимись плавно','Не делай глубокие выпады при боли','knee'],
 ['glute_bridge','Ягодичный мост на полу','Ягодицы','home','body','Ляг, поставь стопы под колени|Подними таз, напрягая ягодицы|Опусти медленно','Не переразгибай поясницу','back'],
 ['single_glute','Ягодичный мост с паузой','Ягодицы','home','body','Ляг на спину, согни колени|Поднимай таз и задержись на 2 секунды|Медленно опусти','Не выгибай поясницу','back'],
 ['db_calf','Подъёмы на носки с гантелями','Икры','home','dumbbell','Устойчиво стой у опоры|Поднимись на носки|Опустись медленно','Не теряй равновесие',''],
 ['marching','Марш на месте','Кардио','home','body','Выпрямись, смотри вперёд|Шагай в комфортном ритме|Сохраняй ровное дыхание','Не ускоряйся до дискомфорта','knee']
].map(([id,name,muscle,place,gear,cues,mistake,avoid])=>({id,name,muscle,place,gear,cues:cues.split('|'),mistake,avoid:avoid?avoid.split(','):[]}));
const EX_BY_ID=Object.fromEntries(TRAINING_LIBRARY.map(x=>[x.id,x]));
const TRAIN_TEMPLATES={
 gym:{
  fullA:[['chest_machine','db_bench'],['lat_pulldown','supported_row'],['leg_press','leg_curl'],['db_rdl','hip_thrust'],['dead_bug','plank'],['db_curl','cable_triceps']],
  fullB:[['db_incline','chest_machine'],['cable_row','supported_row'],['goblet_squat','leg_press'],['hip_thrust','leg_curl'],['cable_crunch','dead_bug'],['face_pull','lateral_raise']],
  fullC:[['seated_press','lateral_raise'],['supported_row','lat_pulldown'],['leg_curl','leg_press'],['leg_extension','goblet_squat'],['standing_calf'],['plank','dead_bug']],
  upperA:[['chest_machine','db_bench'],['lat_pulldown','supported_row'],['db_incline','cable_fly'],['cable_row','supported_row'],['lateral_raise','face_pull'],['cable_triceps','db_curl'],['db_curl','cable_triceps']],
  lowerA:[['leg_press','goblet_squat'],['db_rdl','hip_thrust'],['leg_curl'],['standing_calf'],['cable_crunch','dead_bug'],['leg_extension']],
  upperB:[['seated_press','lateral_raise'],['supported_row','cable_row'],['cable_fly','chest_machine'],['assisted_pullup','lat_pulldown'],['db_curl','cable_triceps'],['face_pull','lateral_raise']],
  lowerB:[['goblet_squat','leg_press'],['hip_thrust','db_rdl'],['leg_extension','leg_curl'],['standing_calf'],['dead_bug','plank'],['leg_curl']],
 },
 home:{
  fullA:[['incline_pushup','floor_pushup','wall_pushup','band_press'],['band_row','db_row','prone_w'],['chair_squat','sit_to_stand'],['glute_bridge','single_glute'],['dead_bug','plank'],['band_lateral','wall_slide']],
  fullB:[['db_floor_press','incline_pushup','wall_pushup'],['db_row','band_row','prone_w'],['db_rdl','glute_bridge'],['step_up','sit_to_stand'],['plank','dead_bug'],['db_curl','wall_slide']],
  fullC:[['floor_pushup','incline_pushup','wall_pushup'],['band_pullapart','db_row','prone_w'],['sit_to_stand','chair_squat'],['single_glute','glute_bridge'],['standing_calf'],['bird_dog','dead_bug']],
  upperA:[['incline_pushup','wall_pushup','db_floor_press'],['band_row','db_row','prone_w'],['db_floor_press','band_press','floor_pushup'],['band_pullapart','prone_w'],['wall_slide','db_shoulder'],['db_curl','bird_dog']],
  lowerA:[['chair_squat','sit_to_stand'],['db_rdl','glute_bridge'],['glute_bridge','single_glute'],['standing_calf','db_calf'],['dead_bug','bird_dog'],['step_up','marching']],
  upperB:[['db_shoulder','band_lateral','wall_slide'],['db_row','band_row','prone_w'],['floor_pushup','incline_pushup','wall_pushup'],['band_pullapart','prone_w'],['db_curl','bird_dog'],['plank','dead_bug']],
  lowerB:[['step_up','chair_squat','sit_to_stand'],['single_glute','glute_bridge'],['db_rdl','glute_bridge'],['standing_calf'],['bird_dog','dead_bug'],['marching','step_up']],
 }
};
const TRAIN_DAY_SETS={2:['fullA','fullB'],3:['fullA','fullB','fullC'],4:['upperA','lowerA','upperB','lowerB'],5:['upperA','lowerA','fullC','upperB','lowerB']};
const TRAIN_DAY_NAMES={fullA:'Всё тело A',fullB:'Всё тело B',fullC:'Всё тело C',upperA:'Верх тела A',upperB:'Верх тела B',lowerA:'Низ тела A',lowerB:'Низ тела B'};
const TRAIN_DEFAULT={place:'gym',goal:'muscle',experience:'beginner',days:3,duration:45,equipment:'none',exclude:[],updatedAt:''};
function trainingProfile(){const p=state.profile.trainingV28||{};return {...TRAIN_DEFAULT,...p,exclude:Array.isArray(p.exclude)?p.exclude:[]}}
function canUseExercise(ex,profile){if(!ex)return false;if(ex.place!=='both'&&ex.place!==profile.place)return false;
 if(profile.place==='home'&&ex.gear!=='body'){
  if(ex.gear==='band'&&!['bands','both'].includes(profile.equipment))return false;
  if(ex.gear==='dumbbell'&&!['dumbbells','both'].includes(profile.equipment))return false;
  if(!['band','dumbbell'].includes(ex.gear))return false;
 }
 return !ex.avoid.some(tag=>profile.exclude.includes(tag));}
function chooseExercise(candidates,p,seen){for(const id of candidates){const ex=EX_BY_ID[id];if(canUseExercise(ex,p)&&!seen.has(id))return ex;}
 const first=EX_BY_ID[candidates[0]];return TRAINING_LIBRARY.find(ex=>ex.muscle===first?.muscle&&canUseExercise(ex,p)&&!seen.has(ex.id))||null;}
function trainingSetsFor(p,ex){if(p.goal==='general'||p.goal==='fatloss')return p.experience==='beginner'?2:3;return p.experience==='beginner'?2:p.experience==='advanced'?4:3;}
function trainingRangeFor(p,ex){if(p.goal==='strength')return ex.gear==='body'?'8–12':'5–8';if(p.goal==='muscle')return ex.muscle==='Пресс'?'20–40 сек / 8–15':'8–12';return ex.muscle==='Пресс'?'20–40 сек / 8–15':'10–15';}
function trainingRestFor(p,ex){return p.goal==='strength'?150:p.goal==='muscle'?120:75;}
function trainingProgram(p=trainingProfile()){
 const dayKeys=TRAIN_DAY_SETS[Number(p.days)]||TRAIN_DAY_SETS[3];
 return dayKeys.map((key,index)=>{
  const seen=new Set(),limit=Number(p.duration)<=30?4:Number(p.duration)>=70?7:Number(p.duration)>=55?6:5;
  const slots=(TRAIN_TEMPLATES[p.place]||TRAIN_TEMPLATES.gym)[key]||[];
  const items=[];
  for(const opts of slots){if(items.length>=limit)break;const e=chooseExercise(opts,p,seen);if(!e)continue;seen.add(e.id);items.push({id:e.id,sets:trainingSetsFor(p,e),reps:trainingRangeFor(p,e),rest:trainingRestFor(p,e)});}
  return {key,index,name:TRAIN_DAY_NAMES[key],items};
 });
}
let trainingDayIndex=0,trainingTimerUntil=0,trainingTimerLeft=0,trainingTimerHandle=null;
function trainingSessionDraft(){const d=state.profile.trainingDraft;return d&&typeof d==='object'&&d.id?d:null}
function trainingCurrentDay(){const days=trainingProgram();trainingDayIndex=Math.min(trainingDayIndex,days.length-1);return days[Math.max(0,trainingDayIndex)];}
function trainVideoSearch(ex){return 'https://www.youtube.com/results?search_query='+encodeURIComponent(ex.name+' правильная техника выполнения фитнес упражнение');}
function trainingRoutineNote(p){return p.goal==='muscle'?'Рост мышц: старайся оставлять 1–3 повтора в запасе, увеличивай нагрузку постепенно.':p.goal==='strength'?'Сила: осваивай технику, отдыхай дольше между тяжёлыми подходами.':p.goal==='fatloss'?'Снижение веса: силовые помогают сохранять мышцы; основное изменение веса зависит от питания и активности.':'Общая форма: ориентируйся на комфортную нагрузку и регулярность.';}
function renderTrainingSetup(){const p=trainingProfile();
 for(const [id,key] of [['tPlace','place'],['tGoal','goal'],['tExperience','experience'],['tDays','days'],['tDuration','duration'],['tEquipment','equipment']])$(id).value=String(p[key]);
 for(const tag of ['knee','back','shoulder'])$('tAvoid_'+tag).checked=p.exclude.includes(tag);
 $('tEquipmentRow').hidden=p.place!=='home';
 const weeks=state.trainingSessions.filter(x=>{const d=String(x.date||'');return d>=dayOffset(-6)&&d<=today()});
 const recent=state.lifts.filter(x=>String(x.date||'')>=dayOffset(-6));
 const load=recent.reduce((s,x)=>s+(Number(x.weight)||0)*(Number(x.reps)||0),0);
 $('trainingDashboard').innerHTML=`<div class="stats"><div class="stat"><div class="sub">Занятий за 7 дней</div><div class="metric">${weeks.length}<small> / ${p.days}</small></div></div><div class="stat"><div class="sub">Подходов за 7 дней</div><div class="metric">${recent.length}</div></div><div class="stat"><div class="sub">Общий тоннаж</div><div class="metric">${Math.round(load).toLocaleString('ru-RU')} <small>кг</small></div></div><div class="stat"><div class="sub">Программа</div><div class="metric">${p.place==='gym'?'Зал':'Дом'}<small> · ${p.days} дн.</small></div></div></div>`;
 $('trainingPlanSummary').textContent=`${p.days} тренировок в неделю · примерно ${p.duration} мин · ${p.experience==='beginner'?'новичок':p.experience==='intermediate'?'средний уровень':'опытный'}. ${trainingRoutineNote(p)}`;
}
function renderTraining(){renderTrainingSetup();const days=trainingProgram();const current=trainingCurrentDay();const draft=trainingSessionDraft();
 $('workoutPicker').innerHTML=days.map((d,i)=>`<button type="button" class="${trainingDayIndex===i?'':'secondary'}" data-tday="${i}">${i+1}. ${esc(d.name)} <span class="small">· ${d.items.length} упр.</span></button>`).join('');
 $('workoutPicker').querySelectorAll('[data-tday]').forEach(b=>b.onclick=()=>{trainingDayIndex=Number(b.dataset.tday);renderTraining()});
 $('trainingStart').disabled=!!draft;
 $('trainingFinish').disabled=!draft;
 $('trainingCancel').hidden=!draft;
 $('trainingLiveStatus').textContent=draft?`Идёт тренировка «${esc(draft.name)}» · начата ${new Date(draft.startedAt).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}`:'Нажми «Начать тренировку» для отдельного занятия, либо записывай подходы без запуска.';
 const oldCount=state.lifts.filter(l=>l.sessionId===draft?.id).length;
 $('trainingSetCount').textContent=draft?`Записано подходов в этом занятии: ${oldCount}`:'';
 const d=current;const changes=state.profile.trainingSwaps||{};
 $('workoutDetails').innerHTML=`<h2>${esc(d.name)}</h2><p class="small muted">Разминка 5–10 минут и 1–2 лёгких разминочных подхода перед основными движениями. Отдыхай между тренировками тех же мышц. При боли останови движение.</p>`+
 d.items.map((it,i)=>{const base=EX_BY_ID[it.id],choiceId=changes[d.key+':'+it.id]||it.id;
  const selected=canUseExercise(EX_BY_ID[choiceId],trainingProfile())?EX_BY_ID[choiceId]:base;
  const alts=TRAINING_LIBRARY.filter(x=>x.muscle===base.muscle&&x.id!==base.id&&canUseExercise(x,trainingProfile())).slice(0,10);
  const logged=state.lifts.filter(l=>l.sessionId===draft?.id&&draft&&l.exerciseId===selected.id).length;
  return `<article class="train-exercise"><div class="row between" style="align-items:start"><div><span class="pill">${esc(selected.muscle)}</span><h3 style="margin:8px 0 4px">${i+1}. ${esc(selected.name)}</h3><p class="sub">${it.sets} подхода × ${esc(it.reps)} · отдых ${it.rest} сек${draft?' · выполнено '+logged:''}</p></div><button type="button" class="secondary train-small" data-guide="${esc(selected.id)}">▶ Техника</button></div><p class="small muted">${esc(selected.cues[0])}</p><details><summary class="small">Заменить упражнение</summary><select class="train-swap" data-original="${esc(it.id)}" data-day="${esc(d.key)}"><option value="${esc(it.id)}" ${selected.id===it.id?'selected':''}>${esc(base.name)}</option>${alts.map(a=>`<option value="${esc(a.id)}" ${selected.id===a.id?'selected':''}>${esc(a.name)}</option>`).join('')}</select></details><form class="train-set-form" data-exercise="${esc(selected.id)}" data-name="${esc(selected.name)}"><label>Вес, кг (0 = без отягощения)<input name="weight" type="number" min="0" max="1000" step="0.5" value="0" required></label><label>Повторы / секунды<input name="reps" type="number" min="1" max="300" step="1" placeholder="10" required></label><label>Повторов в запасе<select name="rir"><option value="3">3+</option><option value="2" selected>2</option><option value="1">1</option><option value="0">0</option></select></label><button type="submit" class="secondary">+ Записать подход</button></form></article>`;}).join('');
 document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>openTrainingGuide(b.dataset.guide));
 document.querySelectorAll('.train-swap').forEach(el=>el.onchange=()=>{state.profile.trainingSwaps={...(state.profile.trainingSwaps||{}),[el.dataset.day+':'+el.dataset.original]:el.value};save()});
 document.querySelectorAll('.train-set-form').forEach(form=>form.onsubmit=e=>{
  e.preventDefault();const input=new FormData(form);const weight=Number(input.get('weight')),reps=Number(input.get('reps')),rir=Number(input.get('rir'));
  if(!Number.isFinite(weight)||weight<0||weight>1000||!Number.isInteger(reps)||reps<1||reps>300)return alert('Проверь вес и повторы.');
  const ex=EX_BY_ID[form.dataset.exercise],live=trainingSessionDraft();
  state.lifts.unshift({id:uid(),date:today(),timestamp:new Date().toISOString(),workout:live?.name||d.name,sessionId:live?.id||null,exercise:ex.name,exerciseId:ex.id,weight,reps,rir,set:state.lifts.filter(l=>l.date===today()&&l.exerciseId===ex.id&&l.sessionId===(live?.id||null)).length+1});
  save();startTrainingRest(trainingRestFor(trainingProfile(),ex));
 });
 const entries=state.lifts.slice().sort((a,b)=>String(b.timestamp||b.date).localeCompare(String(a.timestamp||a.date))).slice(0,25);
 $('liftHistory').innerHTML=entries.length?entries.map(l=>`<div class="listitem row between"><div><b>${esc(l.exercise)}</b><div class="sub">${esc(l.date)} · ${esc(l.workout||'Тренировка')} · подход ${esc(l.set||1)}</div></div><div class="row"><b>${Number(l.weight)||0} кг × ${Number(l.reps)||0}</b><button type="button" class="danger train-small" data-remove-set="${esc(l.id||'')}" ${l.id?'':'hidden'} aria-label="Удалить подход">×</button></div></div>`).join(''):'<p class="muted">Запиши первый подход, чтобы начать журнал.</p>';
 document.querySelectorAll('[data-remove-set]').forEach(b=>b.onclick=()=>{if(!confirm('Удалить подход?'))return;state.lifts=state.lifts.filter(x=>x.id!==b.dataset.removeSet);save()});
 $('trainingSessionHistory').innerHTML=state.trainingSessions.length?state.trainingSessions.slice().sort((a,b)=>String(b.finishedAt||b.date).localeCompare(String(a.finishedAt||a.date))).slice(0,16).map(x=>`<div class="listitem row between"><div><b>${esc(x.name)}</b><div class="sub">${esc(x.date)} · ${Number(x.sets)||0} подходов · ${Number(x.duration)||0} мин</div></div><button class="danger train-small" type="button" data-delete-session="${esc(x.id)}">×</button></div>`).join(''):'<p class="muted">Завершённые тренировки появятся здесь.</p>';
 document.querySelectorAll('[data-delete-session]').forEach(b=>b.onclick=()=>{if(!confirm('Удалить отметку о завершении? Записанные подходы останутся.'))return;state.trainingSessions=state.trainingSessions.filter(x=>x.id!==b.dataset.deleteSession);save()});
 renderTrainingProgress();renderTrainingLibrary();renderTrainingTimer();
}
function startTrainingRest(seconds){trainingTimerLeft=seconds;trainingTimerUntil=Date.now()+seconds*1000;renderTrainingTimer();}
function renderTrainingTimer(){if(!$('trainingTimer'))return;
 let seconds=trainingTimerUntil?Math.max(0,Math.ceil((trainingTimerUntil-Date.now())/1000)):trainingTimerLeft;
 if(trainingTimerUntil&&!seconds){trainingTimerUntil=0;trainingTimerLeft=0;}
 $('trainingTimer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 $('trainingTimerState').textContent=seconds?'Таймер отдыха':'Готов к следующему подходу';
}
for(const secs of [60,90,120,180])$('trainingRest'+secs).onclick=()=>startTrainingRest(secs);
$('trainingTimerPause').onclick=()=>{if(trainingTimerUntil){trainingTimerLeft=Math.max(0,Math.ceil((trainingTimerUntil-Date.now())/1000));trainingTimerUntil=0}else if(trainingTimerLeft){trainingTimerUntil=Date.now()+trainingTimerLeft*1000}renderTrainingTimer()};
$('trainingTimerReset').onclick=()=>{trainingTimerUntil=0;trainingTimerLeft=0;renderTrainingTimer()};
trainingTimerHandle=setInterval(renderTrainingTimer,1000);
$('trainingStart').onclick=()=>{if(trainingSessionDraft())return alert('Заверши или отмени текущую тренировку.');const d=trainingCurrentDay();state.profile.trainingDraft={id:uid(),date:today(),startedAt:new Date().toISOString(),key:d.key,name:d.name};save()};
$('trainingFinish').onclick=()=>{const d=trainingSessionDraft();if(!d)return;const sets=state.lifts.filter(x=>x.sessionId===d.id);if(!sets.length&&!confirm('Подходы не записаны. Всё равно завершить тренировку?'))return;
 const duration=Math.max(1,Math.round((Date.now()-new Date(d.startedAt).getTime())/60000));
 state.trainingSessions.unshift({id:d.id,date:today(),name:d.name,sets:sets.length,duration,finishedAt:new Date().toISOString()});delete state.profile.trainingDraft;save()};
$('trainingCancel').onclick=()=>{if(!confirm('Отменить текущее занятие? Уже записанные подходы останутся в журнале.'))return;delete state.profile.trainingDraft;save()};
$('trainingSetupForm').onsubmit=e=>{
 e.preventDefault();const old=trainingProfile(),p={place:$('tPlace').value,goal:$('tGoal').value,experience:$('tExperience').value,days:Number($('tDays').value),duration:Number($('tDuration').value),equipment:$('tEquipment').value,exclude:['knee','back','shoulder'].filter(tag=>$('tAvoid_'+tag).checked),updatedAt:new Date().toISOString()};
 if(!['gym','home'].includes(p.place)||!['muscle','strength','general','fatloss'].includes(p.goal)||![2,3,4,5].includes(p.days)||![30,45,60,75].includes(p.duration))return alert('Проверь поля анкеты.');
 if(trainingSessionDraft()&&!confirm('Сейчас идёт тренировка. Сохранить изменения программы? Текущие подходы сохранятся.'))return;
 state.profile.trainingV28=p;state.profile.trainingPlace=p.place;state.profile.trainingGoal=p.goal==='general'?'general':'muscle';
 if(old.place!==p.place||old.equipment!==p.equipment)state.profile.trainingSwaps={};
 trainingDayIndex=0;save();$('trainingPlanSaved').textContent='Персональная программа сохранена в твоём профиле.';
};
$('tPlace').onchange=()=>{$('tEquipmentRow').hidden=$('tPlace').value!=='home'};
function renderTrainingProgress(){
 const safe=state.lifts.filter(x=>x.exercise&&Number.isFinite(Number(x.reps))&&Number(x.reps)>0);
 const groups=new Map();for(const row of safe){const k=row.exerciseId||row.exercise;const arr=groups.get(k)||[];arr.push(row);groups.set(k,arr)}
 const output=[...groups.entries()].map(([key,arr])=>{const list=arr.filter(x=>Number(x.weight)>0&&Number(x.reps)<=15);const best=list.sort((a,b)=>Number(b.weight)*(1+Number(b.reps)/30)-Number(a.weight)*(1+Number(a.reps)/30))[0];const max=best?Math.round(Number(best.weight)*(1+Number(best.reps)/30)*10)/10:0;return {name:EX_BY_ID[key]?.name||arr[0].exercise,count:arr.length,max};}).sort((a,b)=>b.count-a.count).slice(0,12);
 $('trainingProgress').innerHTML=output.length?output.map(x=>`<div class="listitem row between"><div><b>${esc(x.name)}</b><div class="sub">${x.count} записанных подходов</div></div><span class="pill">${x.max?`≈ ${x.max} кг 1ПМ`:'Без оценки 1ПМ'}</span></div>`).join(''):'<p class="muted">Прогресс появится после первых записанных подходов.</p>';
}
function renderTrainingLibrary(){const raw=$('trainingLibrarySearch').value.trim().toLocaleLowerCase('ru-RU'),muscle=$('trainingLibraryMuscle').value;
 const p=trainingProfile();const filtered=TRAINING_LIBRARY.filter(ex=>(!raw||(ex.name+' '+ex.muscle).toLocaleLowerCase('ru-RU').includes(raw))&&(!muscle||ex.muscle===muscle)&&(ex.place==='both'||ex.place===p.place)&&canUseExercise(ex,p));
 $('trainingLibraryCount').textContent=filtered.length+' упражнений';
 $('trainingLibrary').innerHTML=filtered.map(ex=>`<button type="button" class="train-library-item" data-guide="${esc(ex.id)}"><span><b>${esc(ex.name)}</b><span class="sub">${esc(ex.muscle)} · ${esc(ex.gear==='body'?'Без оборудования':ex.gear==='dumbbell'?'Гантели':ex.gear==='band'?'Резинка':ex.gear==='machine'?'Тренажёр':'Блок')}</span></span><span>▶</span></button>`).join('')||'<p class="muted">Ничего не найдено. Измени фильтры или настройки оборудования.</p>';
 $('trainingLibrary').querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>openTrainingGuide(b.dataset.guide));
}
$('trainingLibrarySearch').oninput=renderTrainingLibrary;
$('trainingLibraryMuscle').onchange=renderTrainingLibrary;
function openTrainingGuide(id){const ex=EX_BY_ID[id];if(!ex)return;const overlay=$('trainingGuideOverlay');
 $('trainingGuideContent').innerHTML=`<span class="tag">${esc(ex.muscle)}</span><h2 style="margin-top:12px">${esc(ex.name)}</h2><h3>Техника по шагам</h3><ol>${ex.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ol><p class="notice"><b>Частая ошибка:</b> ${esc(ex.mistake)}</p><p class="small muted">Если появляется боль, головокружение или выраженный дискомфорт — прекрати упражнение. При ограничениях здоровья согласуй нагрузку со специалистом.</p><a class="train-video-link" href="${esc(trainVideoSearch(ex))}" target="_blank" rel="noopener noreferrer">▶ Найти видео упражнения на YouTube ↗</a><p class="small muted" style="margin-top:12px">Ссылка открывает результаты поиска, а не заранее проверенный ролик. Не все видео подходят новичкам.</p>`;
 overlay.hidden=false;document.body.classList.add('train-overlay-open');$('trainingGuideClose').focus();
}
function closeTrainingGuide(){$('trainingGuideOverlay').hidden=true;document.body.classList.remove('train-overlay-open')}
$('trainingGuideClose').onclick=closeTrainingGuide;
$('trainingGuideOverlay').onclick=e=>{if(e.target===$('trainingGuideOverlay'))closeTrainingGuide()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('trainingGuideOverlay').hidden)closeTrainingGuide()});

// BetterYou 2.4 — local starter reference catalog. Values are approximate per 100 g (or 100 ml for drinks).
// Do not substitute these estimates for verified product labels.
const FOOD_REFERENCE = [
 ["Куриная грудка, приготовленная", 165, 31, 3.6, 0, "Белковые продукты"],
 ["Куриная грудка, сырая", 120, 22.5, 2.6, 0, "Белковые продукты"],
 ["Индейка, филе приготовленное", 135, 29, 1.6, 0, "Белковые продукты"],
 ["Говядина постная, приготовленная", 217, 29, 10, 0, "Белковые продукты"],
 ["Говяжий фарш 10% жирности, сырой", 176, 20, 10, 0, "Белковые продукты"],
 ["Лосось, приготовленный", 206, 22, 12.4, 0, "Белковые продукты"],
 ["Треска, приготовленная", 105, 23, 0.9, 0, "Белковые продукты"],
 ["Тунец в собственном соку, без жидкости", 116, 26, 1, 0, "Белковые продукты"],
 ["Креветки, приготовленные", 99, 24, 0.3, 0.2, "Белковые продукты"],
 ["Яйцо куриное, целое", 143, 12.6, 9.5, 0.7, "Белковые продукты"],
 ["Белок яичный", 52, 10.9, 0.2, 0.7, "Белковые продукты"],
 ["Тофу, твёрдый", 144, 17, 8.7, 3, "Белковые продукты"],
 ["Чечевица, варёная", 116, 9, 0.4, 20, "Бобовые"],
 ["Нут, варёный", 164, 8.9, 2.6, 27.4, "Бобовые"],
 ["Фасоль красная, варёная", 127, 8.7, 0.5, 22.8, "Бобовые"],
 ["Рис белый, сухой", 365, 7.1, 0.7, 80, "Крупы и хлеб"],
 ["Рис белый, варёный", 130, 2.7, 0.3, 28.2, "Крупы и хлеб"],
 ["Рис бурый, варёный", 123, 2.7, 1, 25.6, "Крупы и хлеб"],
 ["Гречка, сухая", 343, 13.3, 3.4, 71.5, "Крупы и хлеб"],
 ["Гречка, варёная", 92, 3.4, 0.6, 19.9, "Крупы и хлеб"],
 ["Овсяные хлопья, сухие", 389, 16.9, 6.9, 66.3, "Крупы и хлеб"],
 ["Макароны, сухие", 371, 13, 1.5, 74.7, "Крупы и хлеб"],
 ["Макароны, варёные", 158, 5.8, 0.9, 30.9, "Крупы и хлеб"],
 ["Киноа, варёная", 120, 4.4, 1.9, 21.3, "Крупы и хлеб"],
 ["Кускус, варёный", 112, 3.8, 0.2, 23.2, "Крупы и хлеб"],
 ["Хлеб цельнозерновой", 247, 13, 4.2, 41.3, "Крупы и хлеб"],
 ["Хлеб белый", 266, 8.9, 3.3, 49.4, "Крупы и хлеб"],
 ["Лаваш", 275, 9.1, 1.2, 55.7, "Крупы и хлеб"],
 ["Картофель отварной", 87, 1.9, 0.1, 20.1, "Крупы и хлеб"],
 ["Батат запечённый", 90, 2, 0.2, 20.7, "Крупы и хлеб"],
 ["Молоко 2,5%", 52, 3, 2.5, 4.7, "Молочные продукты"],
 ["Кефир 2,5%", 53, 3, 2.5, 4, "Молочные продукты"],
 ["Йогурт натуральный 2%", 63, 5.3, 1.6, 7, "Молочные продукты"],
 ["Скир натуральный", 63, 11, 0.2, 4, "Молочные продукты"],
 ["Творог 5%", 121, 17.2, 5, 1.8, "Молочные продукты"],
 ["Творог обезжиренный", 82, 18, 0.6, 3.3, "Молочные продукты"],
 ["Сыр твёрдый", 356, 25, 27, 2.2, "Молочные продукты"],
 ["Моцарелла", 254, 18, 20, 2.8, "Молочные продукты"],
 ["Греческий йогурт 0%", 59, 10.3, 0.4, 3.6, "Молочные продукты"],
 ["Банан", 89, 1.1, 0.3, 22.8, "Фрукты и ягоды"],
 ["Яблоко", 52, 0.3, 0.2, 13.8, "Фрукты и ягоды"],
 ["Груша", 57, 0.4, 0.1, 15.2, "Фрукты и ягоды"],
 ["Апельсин", 47, 0.9, 0.1, 11.8, "Фрукты и ягоды"],
 ["Мандарин", 53, 0.8, 0.3, 13.3, "Фрукты и ягоды"],
 ["Виноград", 69, 0.7, 0.2, 18.1, "Фрукты и ягоды"],
 ["Клубника", 32, 0.7, 0.3, 7.7, "Фрукты и ягоды"],
 ["Черника", 57, 0.7, 0.3, 14.5, "Фрукты и ягоды"],
 ["Малина", 52, 1.2, 0.7, 11.9, "Фрукты и ягоды"],
 ["Арбуз", 30, 0.6, 0.2, 7.6, "Фрукты и ягоды"],
 ["Киви", 61, 1.1, 0.5, 14.7, "Фрукты и ягоды"],
 ["Авокадо", 160, 2, 14.7, 8.5, "Фрукты и ягоды"],
 ["Огурец", 15, 0.7, 0.1, 3.6, "Овощи"],
 ["Помидор", 18, 0.9, 0.2, 3.9, "Овощи"],
 ["Морковь", 41, 0.9, 0.2, 9.6, "Овощи"],
 ["Брокколи", 34, 2.8, 0.4, 6.6, "Овощи"],
 ["Цветная капуста", 25, 1.9, 0.3, 5, "Овощи"],
 ["Кабачок", 17, 1.2, 0.3, 3.1, "Овощи"],
 ["Перец сладкий", 31, 1, 0.3, 6, "Овощи"],
 ["Лук репчатый", 40, 1.1, 0.1, 9.3, "Овощи"],
 ["Шпинат", 23, 2.9, 0.4, 3.6, "Овощи"],
 ["Салат листовой", 15, 1.4, 0.2, 2.9, "Овощи"],
 ["Свёкла варёная", 44, 1.7, 0.2, 10, "Овощи"],
 ["Грибы шампиньоны", 22, 3.1, 0.3, 3.3, "Овощи"],
 ["Кукуруза, консервированная", 86, 3.3, 1.4, 16, "Овощи"],
 ["Масло оливковое", 884, 0, 100, 0, "Масла и добавки"],
 ["Масло подсолнечное", 884, 0, 100, 0, "Масла и добавки"],
 ["Масло сливочное", 717, 0.9, 81, 0.1, "Масла и добавки"],
 ["Мёд", 304, 0.3, 0, 82.4, "Масла и добавки"],
 ["Сахар", 387, 0, 0, 100, "Масла и добавки"],
 ["Арахисовая паста", 588, 25, 50, 20, "Масла и добавки"],
 ["Миндаль", 579, 21.2, 49.9, 21.6, "Масла и добавки"],
 ["Грецкие орехи", 654, 15.2, 65.2, 13.7, "Масла и добавки"],
 ["Семена чиа", 486, 16.5, 30.7, 42.1, "Масла и добавки"],
 ["Тёмный шоколад 70%", 598, 7.8, 42.6, 45.9, "Масла и добавки"],
 ["Сок апельсиновый", 45, 0.7, 0.2, 10.4, "Напитки"],
 ["Кофе чёрный без сахара", 1, 0.1, 0, 0, "Напитки"],
 ["Чай без сахара", 1, 0, 0, 0, "Напитки"],
 ["Газировка сладкая", 42, 0, 0, 10.6, "Напитки"],
 ["Вода", 0, 0, 0, 0, "Напитки"]
];
const foodCatalog = FOOD_REFERENCE.map(([name,kcal,p,f,c,category],i)=>({id:'db'+i,name,kcal,p,f,c,category,unit:'g',base:100}));
function allFoods(){
 const own=(state.personalFoods||[]).filter(f=>f&&f.id&&typeof f.name==='string').map(f=>({...f,unit:'g',base:100,category:'Мои продукты'}));
 const ownCodes=new Set(own.map(f=>f.barcode).filter(Boolean));
 return [ ...own, ...foodCatalog,
  ...(state.barcodeFoods||[]).filter(f=>!ownCodes.has(f.barcode)).map(f=>({...f,id:'bc'+f.barcode,unit:'g',base:100,category:'Штрихкоды'})),
  ...state.recipes.map((r,i)=>({...r,id:'r'+i,unit:'portion',base:1,category:'Рецепты'})),
  ...state.customFoods.map((r,i)=>({...r,id:'c'+i,unit:'portion',base:1,category:'Мои блюда'})) ];
}
function selectedFoodDate(){return $('foodDate').value||today()}
function foodEntry(item,amount,date,meal){
 const factor=amount/item.base;
 const scaled=v=>Math.round((Number(v)||0)*factor*10)/10;
 return {id:uid(),date,name:item.name,meal,kcal:scaled(item.kcal),p:scaled(item.p),f:scaled(item.f),c:scaled(item.c),quantity:amount,quantityUnit:item.unit,sourceId:item.id};
}
function updateFoodSelection(){
 const chosen=allFoods().find(f=>f.id===$('foodSelect').value);
 const byGram=chosen?.unit==='g';
 $('foodServings').step=byGram?'1':'0.25';$('foodServings').min=byGram?'1':'0.25';$('foodServings').max=byGram?'3000':'10';
 $('foodAmountLabel').textContent=byGram?'Количество, г':'Количество порций';
 $('foodAmountHint').textContent=byGram?'Показатели рассчитаны за выбранную массу (граммы).':'Показатели рассчитаны на указанное число порций.';
 const input=$('foodServings');
 if(input.dataset.unit!==(byGram?'g':'portion')){input.value=byGram?'100':'1';input.dataset.unit=byGram?'g':'portion'}
 $('foodFavorite').disabled=!chosen;
 $('foodFavorite').textContent=chosen&&state.favoriteFoods.includes(chosen.id)?'★ В избранном':'☆ В избранное';
 const amount=Number(input.value)||0;
 $('foodPreview').textContent=chosen&&amount>0?`${Math.round(chosen.kcal*amount/chosen.base)} ккал · Б ${Math.round(chosen.p*amount/chosen.base)} / Ж ${Math.round(chosen.f*amount/chosen.base)} / У ${Math.round(chosen.c*amount/chosen.base)} г`:'Выбери продукт и количество';
}
function renderFoodOptions(){
 const prev=$('foodSelect').value;
 const query=$('foodSearch').value.trim().toLocaleLowerCase('ru-RU');
 const favOnly=$('foodFavoritesOnly').checked;
 const favorites=new Set(state.favoriteFoods);
 let list=allFoods().filter(f=>(!favOnly||favorites.has(f.id))&&(!query||f.name.toLocaleLowerCase('ru-RU').includes(query)));
 list.sort((a,b)=>(Number(favorites.has(b.id))-Number(favorites.has(a.id)))||a.name.localeCompare(b.name,'ru'));
 const select=$('foodSelect');
 select.innerHTML=list.length?list.map(f=>`<option value="${esc(f.id)}">${favorites.has(f.id)?'★ ':''}${esc(f.name)} · ${f.kcal} ккал/${f.unit==='g'?'100 г':'порция'}</option>`).join(''):'<option value="">Ничего не найдено</option>';
 if(list.some(f=>f.id===prev))select.value=prev;
 $('foodSearchCount').textContent=`Найдено: ${list.length} · справочная база: ${foodCatalog.length} продуктов`;
 updateFoodSelection();
}
function renderFood(){
 $('foodDate').value ||= today();
 renderFoodOptions();
 const date=selectedFoodDate(),t=foodTotalsForDate(date),p=state.profile;
 $('foodDiaryTitle').textContent=date===today()?'Дневник за сегодня':'Дневник за '+date;
 $('foodTotals').innerHTML=`<div class="stats"><div class="stat"><div class="sub">Ккал</div><div class="metric">${Math.round(t.kcal)}</div></div><div class="stat"><div class="sub">Белки</div><div class="metric">${Math.round(t.p)} г</div></div><div class="stat"><div class="sub">Жиры</div><div class="metric">${Math.round(t.f)} г</div></div><div class="stat"><div class="sub">Углеводы</div><div class="metric">${Math.round(t.c)} г</div></div></div><div class="bar"><i style="width:${Math.min(100,p.calories?t.kcal/p.calories*100:0)}%"></i></div><p class="sub">${Math.max(0,(Number(p.calories)||0)-Math.round(t.kcal))} ккал до ориентира · цель ${p.calories} ккал</p>`;
 const entries=foodsForDate(date);
 $('foodDiary').innerHTML=entries.length?entries.map(f=>`<div class="listitem row between"><div><b>${esc(f.name)}</b><div class="sub">${esc(f.meal)}${f.quantity!=null?' · '+esc(f.quantity)+' '+(f.quantityUnit==='g'?'г':'порц.'):''} · Б ${Math.round(f.p)} / Ж ${Math.round(f.f)} / У ${Math.round(f.c)} г</div></div><div class="row"><b>${Math.round(f.kcal)} ккал</b><button type="button" class="danger" data-food="${esc(f.id)}" aria-label="Удалить запись">×</button></div></div>`).join(''):'<p class="muted">Пока ничего не добавлено на выбранную дату.</p>';
 $('foodDiary').querySelectorAll('[data-food]').forEach(b=>b.onclick=()=>{if(!confirm('Удалить эту запись из дневника?'))return;state.foods=state.foods.filter(f=>f.id!==b.dataset.food);save()});
 $('recipes').innerHTML=state.recipes.map((r,i)=>`<article class="recipe"><div class="foodimg">${['🍗','🍝','🥣','🐟','🫐','🥩'][i%6]}</div><h3>${esc(r.name)}</h3><p>${r.kcal} ккал · Б ${r.p} г · ${r.min} мин</p><details><summary>Ингредиенты и рецепт</summary><p><b>Ингредиенты</b><br>${r.ingredients.map(esc).join('<br>')}</p><p>${esc(r.steps)}</p></details><button class="secondary" style="width:100%;margin-top:10px" data-addrecipe="${i}">Добавить порцию</button></article>`).join('');
 $('recipes').querySelectorAll('[data-addrecipe]').forEach(b=>b.onclick=()=>{const r=state.recipes[+b.dataset.addrecipe];state.foods.push(foodEntry({...r,id:'r'+b.dataset.addrecipe,base:1,unit:'portion'},1,date,'Перекус'));save()});
 renderPersonalFoods();
}
$('foodSearch').addEventListener('input',renderFoodOptions);
$('foodFavoritesOnly').addEventListener('change',renderFoodOptions);
$('foodSelect').addEventListener('change',updateFoodSelection);
$('foodServings').addEventListener('input',updateFoodSelection);
$('foodDate').addEventListener('change',renderFood);
$('foodFavorite').onclick=()=>{
 const id=$('foodSelect').value;if(!id)return;
 const ids=new Set(state.favoriteFoods);
 if(ids.has(id))ids.delete(id);else ids.add(id);
 state.favoriteFoods=Array.from(ids);save();
};
// BetterYou 2.5: barcode scanning is optional; manual barcode entry is always available.
// Remote records are reviewed before becoming an editable per-100g product.
let barcodeScanner=null,barcodeScannerStarted=false,barcodeScannerStarting=false,barcodeScanHandled=false,barcodeStopAfterStart=false,barcodeScannedCode='';
let barcodePendingCode='',barcodeRequestNumber=0,barcodePhotoReading=false;
const BARCODE_API='https://world.openfoodfacts.org/api/v2/product/';
function validBarcode(code){return /^\d{8,14}$/.test(String(code||'').trim())}
function barcodeStatus(message,bad=false){
 const el=$('barcodeStatus');el.textContent=message;el.style.color=bad?'#ffb5ba':'var(--muted)';
}
function barcodeValue(value,max){
 if(value==null||value===''||!Number.isFinite(Number(value)))return '';
 const n=Number(value);return n>=0&&n<=max?String(Math.round(n*10)/10):'';
}
function barcodeProductFromOff(payload,code){
 if(!payload||Number(payload.status)!==1||!payload.product)return null;
 const p=payload.product,n=p.nutriments||{};
 const name=String(p.product_name||p.product_name_en||p.product_name_ru||p.brands||'').trim().slice(0,120);
 const kcal=n['energy-kcal_100g']??(Number.isFinite(Number(n['energy-kj_100g']))?Number(n['energy-kj_100g'])/4.184:null);
 return {barcode:code,name,kcal:barcodeValue(kcal,1000),p:barcodeValue(n.proteins_100g,100),f:barcodeValue(n.fat_100g,100),c:barcodeValue(n.carbohydrates_100g,100),quantityUnit:(p.product_quantity_unit==='ml'?'ml':'g'),brands:String(p.brands||'').slice(0,80)};
}
function showBarcodeReview(product,source='Open Food Facts'){
 $('barcodeReviewForm').hidden=false;
 $('barcodeProductName').value=product.name||'';
 $('barcodeKcal').value=product.kcal??'';
 $('barcodeProtein').value=product.p??'';
 $('barcodeFat').value=product.f??'';
 $('barcodeCarbs').value=product.c??'';
 $('barcodeProductInfo').textContent=`Код ${product.barcode} · источник: ${source}. Значения на 100 г; для жидкостей проверь единицы на упаковке.`;
 barcodePendingCode=product.barcode;
 const missing=['barcodeProductName','barcodeKcal','barcodeProtein','barcodeFat','barcodeCarbs'].filter(id=>!String($(id).value).trim());
 barcodeStatus(missing.length?'Продукт найден, но некоторые данные отсутствуют. Введи значения с этикетки.':'Продукт найден! Проверь данные с упаковкой и сохрани.');
}
function chooseSavedBarcode(code){
 const item=(state.personalFoods||[]).find(f=>f.barcode===code)||(state.barcodeFoods||[]).find(f=>f.barcode===code);
 if(!item)return false;
 $('foodFavoritesOnly').checked=false;
 $('foodSearch').value=item.name;
 renderFoodOptions();$('foodSelect').value=item.id||'bc'+code;
 $('foodServings').value='100';$('foodServings').dataset.unit='g';updateFoodSelection();
 return true;
}
async function lookupBarcode(raw){
 const code=String(raw||'').trim(),requestNumber=++barcodeRequestNumber;
 $('barcodeReviewForm').hidden=true;
 if(!validBarcode(code)){barcodeStatus('Введи штрихкод из 8–14 цифр.',true);return}
 $('barcodeInput').value=code;
 if(chooseSavedBarcode(code)){barcodeStatus('Этот продукт уже сохранён. Он выбран в дневнике.');return}
 barcodeStatus('Ищем продукт в Open Food Facts…');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{
  const url=BARCODE_API+encodeURIComponent(code)+'.json?fields=code,product_name,product_name_en,product_name_ru,brands,product_quantity_unit,nutriments';
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'},cache:'no-store'});
  if(requestNumber!==barcodeRequestNumber)return;
  if(!response.ok)throw new Error('network '+response.status);
  const payload=await response.json();
  if(requestNumber!==barcodeRequestNumber)return;
  const product=barcodeProductFromOff(payload,code);
  if(!product){showBarcodeReview({barcode:code,name:'',kcal:'',p:'',f:'',c:''},'ручной ввод — в базе не найден');barcodeStatus('В базе продукт не найден. Введи данные с упаковки вручную.');return}
  showBarcodeReview(product);
 }catch(err){
  if(requestNumber!==barcodeRequestNumber)return;
  showBarcodeReview({barcode:code,name:'',kcal:'',p:'',f:'',c:''},'ручной ввод');
  barcodeStatus('Не удалось получить данные (интернет, сервис или ограничение API). Можно ввести их с упаковки вручную.',true);
 }finally{clearTimeout(timer)}
}
$('barcodeNameFallback').onclick=()=>{
 // Fresh produce often has no consumer barcode; our offline food database already has fruit and vegetables.
 void stopBarcodeCamera();
 go('food');
 const search=$('foodSearch');
 search.focus();search.scrollIntoView({behavior:'smooth',block:'center'});
 barcodeStatus('Ищи продукт по названию в поле ниже (например, «виноград»), затем укажи граммы. Для весовых товаров штрихкод не нужен.');
};
$('barcodeLookupForm').onsubmit=e=>{e.preventDefault();lookupBarcode($('barcodeInput').value)};
$('barcodeReviewForm').onsubmit=e=>{
 e.preventDefault();
 if(!validBarcode(barcodePendingCode)){barcodeStatus('Неверный штрихкод.',true);return}
 const name=$('barcodeProductName').value.trim();
 const ids=['barcodeKcal','barcodeProtein','barcodeFat','barcodeCarbs'];
 const vals=ids.map(id=>Number($(id).value));
 if(!name||ids.some(id=>String($(id).value).trim()==='')||vals.some((n,i)=>!Number.isFinite(n)||n<0||n>(i===0?1000:100))){barcodeStatus('Проверь название и все четыре значения на 100 г.',true);return}
 const [kcal,p,f,c]=vals;
 const item={barcode:barcodePendingCode,name:name.slice(0,120),kcal,p,f,c};
 state.barcodeFoods=Array.isArray(state.barcodeFoods)?state.barcodeFoods:[];
 const ix=state.barcodeFoods.findIndex(f=>f.barcode===barcodePendingCode);
 if(ix>=0)state.barcodeFoods[ix]=item;
 else if(state.barcodeFoods.length>=300){barcodeStatus('Лимит 300 сохранённых штрихкодов. Используй поиск по существующим продуктам.',true);return}
 else state.barcodeFoods.push(item);
 save();chooseSavedBarcode(barcodePendingCode);
 $('barcodeReviewForm').hidden=true;
 barcodeStatus('Продукт сохранён и выбран. Укажи граммы и нажми «Добавить в дневник».');
};
function loadBarcodeLibrary(){
 if(window.Html5Qrcode)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
  script.onload=()=>window.Html5Qrcode?resolve():reject(new Error('Library unavailable'));
  script.onerror=()=>reject(new Error('Network error'));
  document.head.appendChild(script);
 });
}
async function stopBarcodeCamera(){
 barcodeScanHandled=true;
 if(barcodeScannerStarting&&!barcodeScannerStarted){barcodeStopAfterStart=true;$('scanBarcodeStop').hidden=true;return}
 const scanner=barcodeScanner; barcodeScanner=null;
 $('scanBarcodeStop').hidden=true;$('scanBarcodeStart').disabled=false;
 // Hide after stop, so the library can release the camera first.
 if(scanner){try{if(barcodeScannerStarted)await scanner.stop()}catch{}
  try{scanner.clear()}catch{}
 }
 barcodeScannerStarted=false;barcodeScannerStarting=false;
 $('barcodeScannerPanel').hidden=true;
}
$('scanBarcodeStart').onclick=async()=>{
 if(barcodeScannerStarting||barcodeScannerStarted)return;
 barcodeScannerStarting=true;barcodeScanHandled=false;barcodeStopAfterStart=false;barcodeScannedCode='';
 $('scanBarcodeStart').disabled=true;
 $('scanBarcodeStop').hidden=false;
 $('barcodeScannerPanel').hidden=false;
 barcodeStatus('Запускаем камеру… При запросе Safari разреши доступ.');
 try{
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('Camera API unavailable');
  await loadBarcodeLibrary();
  if(barcodeScanHandled)return;
  const F=window.Html5QrcodeSupportedFormats||{};
  const formats=[F.EAN_13,F.EAN_8,F.UPC_A,F.UPC_E,F.CODE_128].filter(x=>x!==undefined);
  const scanner=new window.Html5Qrcode('barcodeScannerView',formats.length?{formatsToSupport:formats,useBarCodeDetectorIfSupported:true}:{useBarCodeDetectorIfSupported:true});
  barcodeScanner=scanner;
  await scanner.start({facingMode:'environment'},{fps:12,qrbox:(w,h)=>({width:Math.min(360,Math.max(120,Math.floor(w*.94))),height:Math.min(165,Math.max(80,Math.floor(h*.48)))})},code=>{
   if(barcodeScanHandled||!validBarcode(code))return;
   barcodeScanHandled=true;barcodeScannedCode=code;
   if(barcodeScannerStarted)void stopBarcodeCamera().then(()=>lookupBarcode(code));
  },()=>{});
  barcodeScannerStarted=true;barcodeScannerStarting=false;
  if(barcodeScanHandled||barcodeStopAfterStart){
   const scanned=barcodeScannedCode;await stopBarcodeCamera();
   if(scanned)await lookupBarcode(scanned);
  }else barcodeStatus('Наведи камеру на штрихкод упаковки.');
 }catch(err){
  barcodeScannerStarting=false;await stopBarcodeCamera();
  barcodeStatus('Камеру запустить не удалось. Введи штрихкод вручную — поиск работает и без камеры.',true);
 }finally{barcodeScannerStarting=false;$('scanBarcodeStart').disabled=false}
};
// Still photos allow the user to tap-focus on a barcode when live camera decoding is difficult.
$('scanBarcodePhoto').onclick=()=>{$('scanBarcodeFile').click()};
$('scanBarcodeFile').onchange=async()=>{
 const input=$('scanBarcodeFile'),file=input.files&&input.files[0];
 if(!file||barcodePhotoReading)return;
 barcodePhotoReading=true;$('scanBarcodePhoto').disabled=true;
 let scanner=null;
 try{
  await stopBarcodeCamera();
  barcodeStatus('Распознаём штрихкод на фотографии…');
  await loadBarcodeLibrary();
  scanner=new window.Html5Qrcode('barcodePhotoView');
  // scanFile scans the supplied image, does not send it to Open Food Facts.
  const raw=await scanner.scanFile(file,false);
  const code=String(raw||'').trim();
  if(!validBarcode(code))throw new Error('invalid code');
  $('barcodeInput').value=code;
  barcodeStatus('Штрихкод распознан с фото. Ищем продукт…');
  await lookupBarcode(code);
 }catch(e){barcodeStatus('На фото не удалось распознать штрихкод. Сфотографируй полоски чётко при хорошем свете или введи цифры вручную.',true)}
 finally{
  if(scanner)try{scanner.clear()}catch{}
  input.value='';barcodePhotoReading=false;$('scanBarcodePhoto').disabled=false;
 }
};
$('scanBarcodeStop').onclick=()=>{void stopBarcodeCamera().then(()=>barcodeStatus('Камера остановлена. Можешь ввести код вручную.'))};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&barcodeScanner)void stopBarcodeCamera()});

// BetterYou 2.6: per-user private food catalogue, stored in existing cloud user_data snapshot.
// Journal entries preserve their nutrition snapshot if a source food changes or is deleted.
let editingPersonalFoodId=null;
function foodNumber(value,limit){
 const n=Number(value);return Number.isFinite(n)&&n>=0&&n<=limit?n:null;
}
function renderPersonalFoods(){
 const list=$('personalFoodList');if(!list)return;
 const items=[...(state.personalFoods||[]).map(f=>({...f,origin:'personal'})),...(state.barcodeFoods||[]).map(f=>({...f,id:'bc'+f.barcode,origin:'barcode'}))];
 list.innerHTML=items.length?items.map(f=>`<div class="listitem personal-food-row"><div><b>${esc(f.name)}</b><div class="sub">${Math.round(f.kcal)} ккал · Б ${f.p} / Ж ${f.f} / У ${f.c} на 100 г${f.barcode?' · код '+esc(f.barcode):''}</div></div><div class="row"><button type="button" class="secondary" data-edit-food="${esc(f.id)}">Изменить</button><button type="button" class="danger" data-delete-food="${esc(f.id)}">Удалить</button></div></div>`).join(''):'<p class="muted">Здесь появятся продукты, которые ты добавишь самостоятельно или сохранишь после сканирования.</p>';
 list.querySelectorAll('[data-edit-food]').forEach(b=>b.onclick=()=>openPersonalFoodEditor(b.dataset.editFood));
 list.querySelectorAll('[data-delete-food]').forEach(b=>b.onclick=()=>deletePersonalFood(b.dataset.deleteFood));
}
function findManagedFood(id){
 if(id.startsWith('bc'))return (state.barcodeFoods||[]).find(f=>'bc'+f.barcode===id)||null;
 return (state.personalFoods||[]).find(f=>f.id===id)||null;
}
function openPersonalFoodEditor(id=null){
 const item=id?findManagedFood(id):null;
 if(id&&!item)return;
 editingPersonalFoodId=id;
 $('personalFoodTitle').textContent=id?'Изменить продукт':'Новый продукт';
 $('personalName').value=item?.name||'';
 $('personalBarcode').value=item?.barcode||'';
 for(const [el,key] of [['personalKcal','kcal'],['personalProtein','p'],['personalFat','f'],['personalCarbs','c']])$(el).value=item?.[key]??'';
 $('personalFoodEditor').hidden=false;
 $('personalFoodEditor').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function resetPersonalFoodEditor(){
 editingPersonalFoodId=null;$('personalFoodEditor').hidden=true;$('personalFoodForm').reset();
}
$('addPersonalFood').onclick=()=>openPersonalFoodEditor();
$('cancelPersonalFood').onclick=resetPersonalFoodEditor;
$('personalFoodForm').onsubmit=e=>{
 e.preventDefault();
 const name=$('personalName').value.trim(), barcode=$('personalBarcode').value.trim();
 const vals=[foodNumber($('personalKcal').value,1000),foodNumber($('personalProtein').value,100),foodNumber($('personalFat').value,100),foodNumber($('personalCarbs').value,100)];
 if(!name||name.length>120||vals.some(x=>x===null)||[...['personalKcal','personalProtein','personalFat','personalCarbs']].some(id=>String($(id).value).trim()==='')){alert('Проверь название и значения на 100 г.');return}
 if(barcode&&!validBarcode(barcode)){alert('Штрихкод должен содержать 8–14 цифр, либо оставь поле пустым.');return}
 const original=editingPersonalFoodId?findManagedFood(editingPersonalFoodId):null;
 if(editingPersonalFoodId&&!original){alert('Продукт больше не найден. Обнови страницу.');return}
 const id=original?.id||('pf'+uid());
 const existing=allFoods().some(f=>f.barcode&&f.barcode===barcode&&f.id!==id);
 if(barcode&&existing&&!confirm('Такой штрихкод уже есть в базе. Сохранить новый вариант с тем же кодом?'))return;
 const entry={id,name:name.slice(0,120),barcode,kcal:vals[0],p:vals[1],f:vals[2],c:vals[3]};
 if(original&&editingPersonalFoodId.startsWith('bc')){
  const index=state.barcodeFoods.findIndex(f=>'bc'+f.barcode===editingPersonalFoodId);
  if(index<0)return;
  // For legacy barcode foods, move the edited version into personalFoods, and update favorites.
  state.barcodeFoods.splice(index,1);
  state.favoriteFoods=state.favoriteFoods.map(x=>x===editingPersonalFoodId?id:x);
 }else if(original){state.personalFoods=state.personalFoods.filter(f=>f.id!==id)}
 if((state.personalFoods||[]).length>=500&&!original){alert('Достигнут лимит 500 личных продуктов.');return}
 state.personalFoods=[...(state.personalFoods||[]),entry];
 resetPersonalFoodEditor();save();
 $('foodFavoritesOnly').checked=false;$('foodSearch').value=entry.name;renderFoodOptions();$('foodSelect').value=entry.id;updateFoodSelection();
 $('personalFoodMessage').textContent='Продукт сохранён. Он доступен в поиске и синхронизируется с аккаунтом.';
};
function deletePersonalFood(id){
 const source=findManagedFood(id);if(!source)return;
 if(!confirm('Удалить «'+source.name+'» из личного справочника? Уже записанные приёмы пищи останутся в дневнике.'))return;
 if(id.startsWith('bc'))state.barcodeFoods=state.barcodeFoods.filter(f=>'bc'+f.barcode!==id);
 else state.personalFoods=state.personalFoods.filter(f=>f.id!==id);
 state.favoriteFoods=state.favoriteFoods.filter(x=>x!==id);
 if(editingPersonalFoodId===id)resetPersonalFoodEditor();
 save();$('personalFoodMessage').textContent='Продукт удалён из справочника. Записи дневника сохранены.';
}

function renderShopping(){$('shoppingList').innerHTML=state.shopping.length?state.shopping.map((x,i)=>`<label class="checkrow"><input type="checkbox" data-shop="${i}" ${x.done?'checked':''}><span style="${x.done?'text-decoration:line-through;opacity:.55':''}">${esc(x.name)}</span><span style="margin-left:auto"></span><button type="button" class="danger" data-shopdel="${i}">×</button></label>`).join(''):'<p class="muted">Список пуст. Добавь продукты или сгенерируй список из рецептов.</p>';
 $('shoppingList').querySelectorAll('[data-shop]').forEach(b=>b.onchange=()=>{state.shopping[+b.dataset.shop].done=b.checked;save()});$('shoppingList').querySelectorAll('[data-shopdel]').forEach(b=>b.onclick=()=>{state.shopping.splice(+b.dataset.shopdel,1);save()})}

// BetterYou 2.7 — editable weekly meal planner.
// The plan is separate from the diary: only explicit day actions add diary entries.
let weeklyAnchor=today();
const PLAN_MEALS=['Завтрак','Обед','Перекус','Ужин'];
function isoLocal(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function dateAtNoon(iso){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return null;const [y,m,d]=iso.split('-').map(Number);const v=new Date(y,m-1,d,12);return v.getFullYear()===y&&v.getMonth()===m-1&&v.getDate()===d?v:null}
function mondayOf(iso){const d=dateAtNoon(iso)||dateAtNoon(today());d.setDate(d.getDate()-((d.getDay()+6)%7));return isoLocal(d)}
function datesOfWeek(iso){const d=dateAtNoon(mondayOf(iso));return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return isoLocal(x)})}
function prettyPlanDate(iso){const d=dateAtNoon(iso);return d?d.toLocaleDateString('ru-RU',{weekday:'short',day:'numeric',month:'short'}):iso}
function validPlanItem(x){return x&&typeof x==='object'&&dateAtNoon(x.date)&&PLAN_MEALS.includes(x.meal)&&Number.isFinite(Number(x.quantity))&&Number(x.quantity)>0}
function planEntries(date){return (Array.isArray(state.weekPlan)?state.weekPlan:[]).filter(x=>validPlanItem(x)&&x.date===date)}
function planTotals(items){return items.reduce((t,x)=>{for(const k of ['kcal','p','f','c'])t[k]+=(Number(x[k])||0);return t},{kcal:0,p:0,f:0,c:0})}
function makePlanItem(food,amount,date,meal){
 const item=foodEntry(food,amount,date,meal);
 return {...item,unit:food.unit||'portion',ingredients:Array.isArray(food.ingredients)?structuredClone(food.ingredients):[]};
}
function mealPlanSuggestions(dates){
 // Recipe rotations are examples, not nutritionally balanced prescribed diets.
 const pattern=[[2,0,4,3],[4,1,2,5],[2,5,4,0],[4,0,2,1],[2,1,4,3],[4,5,2,0],[2,3,4,1]];
 const recipes=state.recipes||[];
 return dates.flatMap((date,i)=>{
  const ids=pattern[i].filter(x=>recipes[x]);if(!ids.length)return [];
  const base=ids.reduce((sum,x)=>sum+(Number(recipes[x].kcal)||0),0)||1;
  const calorieGoal=Number(state.profile.calories)||2000;
  const portion=Math.round(Math.max(0.75,Math.min(1.6,calorieGoal/base))*4)/4;
  return ids.map((id,k)=>makePlanItem({...recipes[id],id:'r'+id,unit:'portion',base:1},portion,date,PLAN_MEALS[k]));
 });
}
function planShoppingRows(items){
 const aggregated=new Map();
 for(const entry of items){
  if(!validPlanItem(entry))continue;
  const isRecipe=Array.isArray(entry.ingredients)&&entry.ingredients.length>0;
  const source=isRecipe?entry.ingredients:[`${entry.name||'Продукт'} ${Number(entry.quantity)||0} ${entry.unit==='g'?'г':'порц.'}`];
  for(const raw of source){
   const ingredient=String(raw||'').trim();if(!ingredient)continue;
   const matched=ingredient.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(г|мл|порц\.)\b(.*)$/i);
   let name=ingredient,unit='',qty=0;
   if(matched){name=(matched[1]+' '+(matched[4]||'')).trim().replace(/\s+/g,' ');unit=matched[3];qty=Number(matched[2].replace(',','.'))*(isRecipe?Number(entry.quantity):1)}
   else if(isRecipe)name=ingredient; // No parseable amount; still include once.
   const key=name.toLocaleLowerCase('ru-RU')+'|'+unit;
   const old=aggregated.get(key)||{name,unit,qty:0};old.qty+=qty;aggregated.set(key,old);
  }
 }
 return [...aggregated.values()].map(({name,unit,qty})=>{
  const rounded=unit==='г'||unit==='мл'?Math.max(1,Math.round(qty)):Math.round(qty*4)/4;
  return `${name}${unit?' — '+rounded+' '+unit:''}`;
 }).sort((a,b)=>a.localeCompare(b,'ru'));
}
function addPlanDayToDiary(date){
 const items=planEntries(date),existing=new Set(state.foods.filter(f=>f.date===date&&f.planId).map(f=>f.planId));
 const add=items.filter(x=>!existing.has(x.id));
 if(!add.length){alert(items.length?'Все позиции этого дня уже добавлены в дневник.':'На этот день нет запланированных блюд.');return}
 state.foods.push(...add.map(x=>({id:uid(),planId:x.id,date:x.date,meal:x.meal,name:x.name,kcal:x.kcal,p:x.p,f:x.f,c:x.c,quantity:x.quantity,quantityUnit:x.quantityUnit,sourceId:x.sourceId})));
 save();$('plannerMessage').textContent=`В дневник за ${date} добавлено ${add.length} позиций. Существующие записи не изменены.`;
}
function renderWeeklyPlanner(){
 const dates=datesOfWeek(weeklyAnchor),items=(Array.isArray(state.weekPlan)?state.weekPlan:[]).filter(validPlanItem),goal=Number(state.profile.calories)||2000;
 $('plannerRange').textContent=`${dates[0]} — ${dates[6]}`;
 $('plannerTarget').textContent=`Ориентир из профиля: ${Math.round(goal)} ккал в день`;
 $('plannerDay').innerHTML=dates.map(date=>`<option value="${date}">${esc(prettyPlanDate(date))}</option>`).join('');
 const chosen=$('plannerDay').dataset.selected;
 $('plannerDay').value=dates.includes(chosen)?chosen:(dates.includes(today())?today():dates[0]);
 $('plannerDay').dataset.selected=$('plannerDay').value;
 const sourcePrev=$('plannerFood').value;
 const options=allFoods();
 $('plannerFood').innerHTML=options.map(f=>`<option value="${esc(f.id)}">${esc(f.name)} (${Math.round(f.kcal)} ккал/${f.unit==='g'?'100 г':'порция'})</option>`).join('');
 if(options.some(f=>f.id===sourcePrev))$('plannerFood').value=sourcePrev;
 const slotDays=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
 $('plannerWeek').innerHTML=dates.map((date,i)=>{
  const dayItems=items.filter(x=>x.date===date);const t=planTotals(dayItems);
  const delta=Math.round(t.kcal-goal);
  const details=dayItems.length?PLAN_MEALS.flatMap(meal=>dayItems.filter(x=>x.meal===meal).map(x=>`<div class="planner-meal"><div><span class="pill">${esc(meal)}</span> <b>${esc(x.name||'Блюдо')}</b><div class="small muted">${Number(x.quantity)} ${x.unit==='g'?'г':'порц.'} · ${Math.round(Number(x.kcal)||0)} ккал</div></div><button type="button" class="danger" data-plan-remove="${esc(x.id)}" aria-label="Убрать блюдо">×</button></div>`)).join(''):'<p class="small muted">Пока нет блюд.</p>';
  return `<article class="planner-day"><div class="row between" style="flex-wrap:wrap"><div><b>${slotDays[i]} · ${date.slice(8,10)}.${date.slice(5,7)}</b><div class="small muted">${Math.round(t.kcal)} / ${Math.round(goal)} ккал · ${delta>=0?'+':''}${delta} ккал</div></div><button type="button" class="secondary" data-plan-day="${date}">В дневник</button></div><div class="bar" style="margin:8px 0 10px"><i style="width:${Math.min(100,Math.round(t.kcal/Math.max(goal,1)*100))}%"></i></div><div class="planner-day-meals">${details}</div><div class="small muted">Б ${Math.round(t.p)} / Ж ${Math.round(t.f)} / У ${Math.round(t.c)} г</div></article>`;
 }).join('');
 $('plannerWeek').querySelectorAll('[data-plan-remove]').forEach(b=>b.onclick=()=>{
  if(!confirm('Убрать блюдо из плана? Запись в дневнике не изменится.'))return;
  state.weekPlan=state.weekPlan.filter(x=>x.id!==b.dataset.planRemove);save();
 });
 $('plannerWeek').querySelectorAll('[data-plan-day]').forEach(b=>b.onclick=()=>addPlanDayToDiary(b.dataset.planDay));
 updatePlannerAmount();
}
function updatePlannerAmount(){
 const item=allFoods().find(f=>f.id===$('plannerFood').value);const g=item?.unit==='g';
 const inp=$('plannerQuantity'),unit=g?'g':'portion';
 if(inp.dataset.unit!==unit){inp.dataset.unit=unit;inp.value=g?'100':'1'}
 inp.min=g?'1':'0.25';inp.max=g?'3000':'10';inp.step=g?'1':'0.25';
 $('plannerQuantityLabel').textContent=g?'Количество, г':'Количество порций';
}
$('plannerPrev').onclick=()=>{const d=dateAtNoon(mondayOf(weeklyAnchor));d.setDate(d.getDate()-7);weeklyAnchor=isoLocal(d);renderWeeklyPlanner()};
$('plannerNext').onclick=()=>{const d=dateAtNoon(mondayOf(weeklyAnchor));d.setDate(d.getDate()+7);weeklyAnchor=isoLocal(d);renderWeeklyPlanner()};
$('plannerToday').onclick=()=>{weeklyAnchor=today();$('plannerDay').dataset.selected='';renderWeeklyPlanner()};
$('plannerFood').onchange=updatePlannerAmount;
$('plannerDay').onchange=()=>{$('plannerDay').dataset.selected=$('plannerDay').value};
$('plannerAdd').onsubmit=e=>{
 e.preventDefault();const f=allFoods().find(x=>x.id===$('plannerFood').value),amount=Number($('plannerQuantity').value),date=$('plannerDay').value,meal=$('plannerMeal').value;
 if(!f||!datesOfWeek(weeklyAnchor).includes(date)||!PLAN_MEALS.includes(meal)||!Number.isFinite(amount)||amount<=0||amount>(f.unit==='g'?3000:10)){alert('Проверь блюдо, дату и количество.');return}
 state.weekPlan.push(makePlanItem(f,amount,date,meal));save();$('plannerMessage').textContent='Блюдо добавлено в план. В дневнике питания пока ничего не изменилось.';
};
$('plannerGenerate').onclick=()=>{
 const weekDates=datesOfWeek(weeklyAnchor),existing=state.weekPlan.some(x=>weekDates.includes(x.date));
 if(existing&&!confirm('Заменить блюда ТОЛЬКО в выбранной неделе? Записи дневника сохранятся.'))return;
 state.weekPlan=state.weekPlan.filter(x=>!weekDates.includes(x.date));
 state.weekPlan.push(...mealPlanSuggestions(weekDates));save();
 $('plannerMessage').textContent='Создан пример меню на неделю. Проверь состав, аллергенные продукты и порции. Калории могут отличаться от ориентира.';
};
$('plannerToShopping').onclick=()=>{
 const entries=state.weekPlan.filter(x=>datesOfWeek(weeklyAnchor).includes(x.date));
 if(!entries.length){alert('Сначала добавь блюда в план.');return}
 const rows=planShoppingRows(entries),prev=new Set(state.shopping.map(x=>String(x.name||'').trim().toLocaleLowerCase('ru-RU')));
 const pending=rows.filter(x=>!prev.has(x.toLocaleLowerCase('ru-RU')));
 state.shopping.push(...pending.map(name=>({name,done:false})));save();
 $('plannerMessage').textContent=`Добавлено ${pending.length} новых позиций в «Покупки». Уже существующие не дублировали.`;
};

function renderSettings(){
 let p=state.profile;
 for(let [id,k] of [['sAge','age'],['sHeight','height'],['sWeight','weight'],['sSex','sex'],['sCalories','calories'],['sProtein','protein'],['sFat','fat'],['sSteps','steps']])$(id).value=p[k]??'';
 const config=getConfig();$('sbUrl').value=config.url||'';$('sbKey').value=config.key||'';
 const status=$('cloudStatus');
 if(!session){status.textContent=cloudMessage+' При переходе в аккаунт гостевые записи автоматически НЕ переносятся.';}
 else {status.textContent=`Аккаунт: ${session.user.email||'пользователь'} · ${cloudMessage}`;}
 $('cloudAccount').hidden=!session;
 $('cloudGuest').hidden=!!session;
 $('signOut').disabled=!session;
 $('syncNow').disabled=!session||cloudBusy;
 $('pullCloud').disabled=!session||cloudBusy;
 $('importGuest').disabled=!session||cloudBusy;
}
// BetterYou 2.2: personalised onboarding. No changes to existing users until they opt in.
// BetterYou 2.3: evidence-informed estimates for healthy adults (not a diagnosis).
// Mifflin–St Jeor RMR (1990); daily activity is EXCLUDING workouts by questionnaire design.
// Exercise estimate uses NET expenditure: (MET 3.5 - resting MET 1) × kg × 0.75 h × sessions/7.
const activityFactors={sedentary:1.20,light:1.35,moderate:1.50,high:1.65};
const trainingSessions={'0':0,'1':1.5,'3':3.5,'5':5.5};
let suggestedPlan=null;
function onboardingHasExistingRecords(d){return !!(d.weights.length||d.foods.length||d.dailySteps.length||d.lifts.length||d.shopping.length||d.profile.age||d.profile.height||d.profile.weight)}
function openOnboarding(){
 const p=state.profile;
 for(const [id,key] of [['obName','name'],['obAge','age'],['obHeight','height'],['obWeight','weight'],['obSex','sex'],['obActivity','activity'],['obTraining','trainingFrequency'],['obGoal','goal'],['obDiet','diet']]){
  const el=$(id);if(!el)continue;
  if(el.tagName==='SELECT')el.value=p[key]??(id==='obTraining'?'0':id==='obDiet'?'balanced':'');
  else el.value=p[key]??'';
 }
 suggestedPlan=null;$('applyOnboarding').classList.add('hide');
 $('onboardingResult').innerHTML='<p class="sub">Ответь на вопросы и нажми «Рассчитать мой КБЖУ».</p>';
 go('onboarding');
}
function calculatePlan(a){
 const age=Number(a.age),height=Number(a.height),weight=Number(a.weight);
 if(!Number.isFinite(age)||age<18||age>100||!Number.isFinite(height)||height<120||height>230||!Number.isFinite(weight)||weight<30||weight>300)throw Error('Проверь возраст, рост и вес. Автоматический расчёт только для взрослых 18+.');
 if(!Object.hasOwn(activityFactors,a.activity))throw Error('Выбери уровень активности.');
 if(!Object.hasOwn(trainingSessions,String(a.trainingFrequency)))throw Error('Выбери частоту тренировок.');
 if(!['male','female','unknown'].includes(a.sex))throw Error('Выбери физиологический параметр для формулы.');
 if(!['lose','maintain','gain','recomp'].includes(a.goal))throw Error('Выбери цель.');
 const bmi=weight/((height/100)**2);
 if(a.goal==='lose'&&bmi<18.5)throw Error('При ИМТ ниже 18,5 автоматический дефицит калорий не рассчитываем. Лучше обсудить цель со специалистом.');
 const constants={male:5,female:-161,unknown:-78}; // unknown = rough midpoint only, not a biological third equation
 const bmrExact=10*weight+6.25*height-5*age+constants[a.sex];
 const activityMultiplier=activityFactors[a.activity];
 const sessions=trainingSessions[String(a.trainingFrequency)];
 const workoutCalories=Math.round((3.5-1)*0.75*weight*sessions/7); // example resistance-training, 45 min/session
 const tdee=Math.round(bmrExact*activityMultiplier+workoutCalories);
 const goalFactor={lose:bmi<20?0.95:0.88,maintain:1,gain:1.07,recomp:1}[a.goal];
 let calories=Math.round(tdee*goalFactor/25)*25;
 const messages=[];
 if(a.sex==='unknown')messages.push('Без физиологического параметра использована условная середина двух вариантов формулы. Погрешность может быть существенной.');
 if(a.goal==='lose'){
  const threshold=a.sex==='female'?1200:1500; // simplified precaution, not a medical threshold
  if(calories<threshold){
   if(tdee<=threshold)throw Error('Расчётный расход слишком низок для автоматического назначения дефицита. Выбери поддержание или обсуди план со специалистом.');
   calories=threshold;
   messages.push('Дефицит ограничен консервативным порогом; это не гарантия безопасности для конкретного человека.');
  }
  if(bmi<20)messages.push('ИМТ ближе к нижней границе нормы: выбран только небольшой дефицит 5%; цель стоит проверить со специалистом.');
 }
 // At higher body weight, do not blindly prescribe protein based on full body mass.
 const bmi25Weight=25*(height/100)**2;
 const referenceWeight=bmi>30?bmi25Weight+0.25*(weight-bmi25Weight):weight;
 if(bmi>30)messages.push('Для расчёта белка использована скорректированная масса тела; это приближённый подход при высоком ИМТ.');
 const proteinPerKg=({lose:1.8,maintain:sessions>0?1.5:1.2,gain:1.8,recomp:1.8})[a.goal];
 const recommendedProtein=Math.round(referenceWeight*proteinPerKg);
 // Respect broad adult AMDR bands as much as possible: protein <=35% energy,
 // fat ~25-30% (never <20%), carbs >=45%; rest allocated to carbohydrates.
 const maxProtein=Math.floor(calories*0.35/4);
 let protein=Math.min(recommendedProtein,maxProtein);
 const minFat=Math.ceil(calories*0.20/9);
 const fatPreferred=Math.round(Math.max(calories*0.25/9,Math.min(referenceWeight*0.8,calories*0.30/9)));
 const fatBudget=Math.floor((calories*0.55-protein*4)/9);
 let fat=Math.max(minFat,Math.min(fatPreferred,fatBudget));
 if(fatBudget<minFat){protein=Math.min(protein,Math.floor((calories*0.55-minFat*9)/4));fat=minFat;}
 const carbs=Math.round((calories-protein*4-fat*9)/4);
 if(protein<recommendedProtein)messages.push('При данной калорийности расчётный белок ограничен, чтобы сохранить место для жиров и углеводов.');
 if(calories<1600)messages.push('На низкой калорийности труднее покрывать потребности в питательных веществах. План стоит проверить со специалистом.');
 const steps=({sedentary:6000,light:7500,moderate:9000,high:10000})[a.activity];
 return {calories,protein,fat,carbs,steps,tdee,bmr:Math.round(bmrExact),activityMultiplier,workoutCalories,referenceWeight:Math.round(referenceWeight),proteinPerKg,goalFactor,bmi:Math.round(bmi*10)/10,goal:a.goal,messages,formulaVersion:'2.3-mifflin'};
}
$('reopenOnboarding').onclick=openOnboarding;
$('cancelOnboarding').onclick=()=>go('settings');
$('onboardingForm').onsubmit=e=>{
 e.preventDefault();
 const answers={name:$('obName').value.trim(),age:$('obAge').value,height:$('obHeight').value,weight:$('obWeight').value,sex:$('obSex').value,activity:$('obActivity').value,trainingFrequency:$('obTraining').value,goal:$('obGoal').value,diet:$('obDiet').value};
 try{
  const plan=calculatePlan(answers);suggestedPlan={answers,plan};
  $('onboardingResult').innerHTML=`<p class="tag">Персональный ориентир · Mifflin–St Jeor</p><div class="metric" style="margin:15px 0">${plan.calories} <small>ккал / день</small></div><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><div class="sub">Белки</div><div class="metric">${plan.protein} <small>г</small></div></div><div class="stat"><div class="sub">Жиры</div><div class="metric">${plan.fat} <small>г</small></div></div><div class="stat"><div class="sub">Углеводы</div><div class="metric">${plan.carbs} <small>г</small></div></div><div class="stat"><div class="sub">Шаги</div><div class="metric">${plan.steps.toLocaleString('ru-RU')}</div></div></div><details style="margin-top:14px" open><summary><b>Как получены цифры</b></summary><p class="small muted">Основной обмен (BMR): <b>${plan.bmr} ккал</b> — по формуле Миффлина — Сан Жеора.</p><p class="small muted">Повседневная активность: × ${plan.activityMultiplier.toFixed(2)}; отдельная оценка тренировок: +${plan.workoutCalories} ккал/день. Поддержание (TDEE): <b>≈ ${plan.tdee} ккал</b>.</p><p class="small muted">Поправка под цель: ${Math.round((plan.goalFactor-1)*100)}%. Белок рассчитан из ${plan.referenceWeight} кг (${plan.proteinPerKg} г/кг), с учётом доли калорий; жиры ориентир 20–35% калорий, углеводы — остаток. БЖУ: 4/9/4 ккал на грамм.</p>${plan.messages.map(m=>`<p class="notice">${esc(m)}</p>`).join('')}</details><p class="small muted" style="margin-top:12px">Это первоначальная оценка для взрослых, а не медицинская норма. Тренировки считаются как примерные 45-минутные занятия средней интенсивности. По тенденции веса за 2–4 недели можно уточнить ориентир.</p>`;
  $('applyOnboarding').classList.remove('hide');
 }catch(err){suggestedPlan=null;$('applyOnboarding').classList.add('hide');$('onboardingResult').textContent=err.message}
};
$('onboardingForm').addEventListener('input',()=>{$('applyOnboarding').classList.add('hide');suggestedPlan=null});
$('applyOnboarding').onclick=()=>{
 if(!suggestedPlan)return;
 const {answers,plan}=suggestedPlan;
 state.profile={...state.profile,...answers,age:Number(answers.age),height:Number(answers.height),weight:Number(answers.weight),calories:plan.calories,protein:plan.protein,fat:plan.fat,steps:plan.steps,planMethod:plan.formulaVersion,planTdee:plan.tdee,onboardingCompleted:true,onboardingAt:new Date().toISOString()};
 save();suggestedPlan=null;go('home');alert('Персональный план сохранён! Его можно изменить в настройках.');
};

function renderAll(){renderHome();renderWeights();renderTraining();renderFood();renderShopping();renderSteps();renderWeeklyPlanner();renderSettings()}
$('weightForm').onsubmit=e=>{e.preventDefault();let entry={date:$('wDate').value,weight:+$('wWeight').value,waist:+$('wWaist').value||null,steps:+$('wSteps').value||null};state.weights=state.weights.filter(x=>x.date!==entry.date);state.weights.push(entry);state.profile.weight=entry.weight;if($('wSteps').value!==''){state.dailySteps=state.dailySteps.filter(x=>x.date!==entry.date);state.dailySteps.push({date:entry.date,steps:entry.steps||0})}save();e.target.reset();$('wDate').value=today();};
$('foodForm').onsubmit=e=>{
 e.preventDefault();const f=allFoods().find(x=>x.id===$('foodSelect').value);
 const amount=Number($('foodServings').value);if(!f||!Number.isFinite(amount)||amount<=0||amount>(f.unit==='g'?3000:10)){alert('Выбери продукт и корректное количество.');return}
 const date=selectedFoodDate();if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){alert('Проверь дату.');return}
 state.foods.push(foodEntry(f,amount,date,$('mealType').value));save();
};
$('customFoodForm').onsubmit=e=>{e.preventDefault();state.customFoods.push({name:$('customName').value,kcal:+$('customKcal').value,p:+$('customP').value,f:+$('customF').value,c:+$('customC').value,min:0,ingredients:[],steps:'Пользовательское блюдо'});save();e.target.reset()};
$('clearFood').onclick=()=>{const date=selectedFoodDate();if(confirm('Удалить ВСЕ записи питания за '+date+'?')){state.foods=state.foods.filter(f=>f.date!==date);save()}};
$('shoppingForm').onsubmit=e=>{e.preventDefault();state.shopping.push({name:$('shoppingInput').value.trim(),done:false});save();e.target.reset()};
$('generateList').onclick=()=>{let ingredients=[...new Set(state.recipes.slice(0,4).flatMap(r=>r.ingredients))];state.shopping.push(...ingredients.map(name=>({name,done:false})));save()};
$('settingsForm').onsubmit=e=>{e.preventDefault();let p=state.profile;for(let [id,k] of [['sAge','age'],['sHeight','height'],['sWeight','weight'],['sCalories','calories'],['sProtein','protein'],['sFat','fat'],['sSteps','steps']])p[k]=$(id).value===''?null:+$(id).value;p.sex=$('sSex').value;save();alert('Настройки сохранены')};
$('exportData').onclick=()=>{let a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(publicData(),null,2)],{type:'application/json'}));a.href=url;a.download='betteryou-backup.json';a.click();URL.revokeObjectURL(url)};
$('importData').onchange=async e=>{try{let d=JSON.parse(await e.target.files[0].text());if(!d.profile||!d.weights)throw Error();if(!confirm('Импорт заменит текущие данные этого профиля. Продолжить?'))return;state=cleanData(d);save();alert('Данные импортированы')}catch{alert('Не удалось импортировать файл JSON')}};
$('resetData').onclick=()=>{if(confirm('Точно удалить все локальные данные? Сначала сделай экспорт.')){state=cleanData(null);save()}};
function getConfig(){try{const c=JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}');return {url:c.url||'',key:c.key||''}}catch{return {url:'',key:''}}}
function validConfig(url,key){
 try{
  const u=new URL(url);
  if(u.protocol!=='https:'||!/(^|\.)supabase\.co$/.test(u.hostname)||key.length<16||key.startsWith('sb_secret_')||key==='service_role')return false;
  if(key.startsWith('eyJ')){
   const payload=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
   if(payload.role==='service_role')return false;
  }
  return true;
 }catch{return false}
}
function setMessage(message){cloudMessage=message;renderSettings()}
async function setupCloud(config){
 if(!window.supabase){setMessage('Не загрузилась библиотека Supabase. Проверь интернет.');return false}
 if(!validConfig(config.url,config.key)){alert('Введи корректные Project URL и publishable/anon key Supabase. Секретный service_role key сюда нельзя.');return false}
 const existing=getConfig();
 if(sb&&existing.url===config.url&&existing.key===config.key)return true;
 if(activeUserId){alert('Сначала выйди из аккаунта, прежде чем менять проект Supabase.');return false}
 localStorage.setItem(CONFIG_KEY,JSON.stringify(config));
 sb=window.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 sb.auth.onAuthStateChange((event,s)=>{
  // Avoid async Supabase calls inside the auth callback.
  setTimeout(()=>{if(event==='SIGNED_OUT'){leaveAccount()}else if(s?.user){activateAccount(s)}},0);
 });
 try{const {data,error}=await sb.auth.getSession();if(error)throw error;
  if(data.session?.user)await activateAccount(data.session);
  else setMessage('Supabase подключён. Войди или зарегистрируйся. Гостевые данные хранятся отдельно.');
 }catch(e){setMessage('Не удалось восстановить сессию: '+e.message)}
 return true;
}
function clearUploadTimer(){if(cloudTimer){clearTimeout(cloudTimer);cloudTimer=null}}
function leaveAccount(){
 ++authEpoch;clearUploadTimer();session=null;activeUserId=null;cloudRevision=0;cloudConflict=false;
 state=readStorage(GUEST_KEY);setMessage('Вы вышли. Сейчас открыт гостевой профиль на этом устройстве.');renderAll();
}
async function activateAccount(nextSession){
 if(!nextSession?.user)return;
 if(activeUserId===nextSession.user.id){session=nextSession;renderSettings();return}
 const epoch=++authEpoch;clearUploadTimer();
 session=nextSession;activeUserId=nextSession.user.id;cloudConflict=false;
 const id=activeUserId;cloudRevision=Number(localStorage.getItem(versionKey(id))||0);
 state=readStorage(userKey(id));cloudMessage='Вход выполнен. Проверяем облачные данные…';renderAll();
 const {data,error}=await sb.from('user_data').select('data,revision').eq('user_id',id).maybeSingle();
 if(epoch!==authEpoch||activeUserId!==id)return;
 if(error){setMessage('Ошибка загрузки данных: '+error.message+' Проверь схему SQL и политики RLS.');return}
 const remoteRev=data?.revision||0;
 if(localPending()){
  if(remoteRev!==cloudRevision){cloudConflict=true;setMessage('Конфликт версий: облако изменилось на другом устройстве. Локальные записи сохранены. Экспортируй JSON перед выбором «Загрузить из облака».');}
  else{setMessage('Есть изменения на этом устройстве. Отправляем их в облако…');scheduleUpload()}
 }else if(data){
  state=cleanData(data.data);cloudRevision=remoteRev;
  localStorage.setItem(versionKey(id),String(remoteRev));localStorage.setItem(userKey(id),JSON.stringify(publicData()));
  cloudMessage='Данные загружены из облака. Автосинхронизация включена.';renderAll();
 }else{cloudRevision=0;cloudMessage='Новый пустой профиль. Гостевые записи можно перенести отдельной кнопкой.';renderAll();if(!onboardingHasExistingRecords(state)&&!onboardingHasExistingRecords(readStorage(GUEST_KEY)))openOnboarding()}
}
async function uploadPending(){
 if(!sb||!session||!activeUserId||cloudConflict||cloudBusy||!localPending())return;
 clearUploadTimer();const id=activeUserId,epoch=authEpoch,rev=cloudRevision;
 const sentData=publicData(),snapshot=JSON.stringify(sentData);
 cloudBusy=true;renderSettings();
 let result,err=null;
 try{
  if(rev===0){
   const {data,error}=await sb.from('user_data').insert({user_id:id,data:sentData,revision:1}).select('revision').single();result=data;err=error;
  }else{
   const {data,error}=await sb.from('user_data').update({data:sentData,revision:rev+1,updated_at:new Date().toISOString()}).eq('user_id',id).eq('revision',rev).select('revision').maybeSingle();result=data;err=error;
  }
 }catch(e){err=e}
 cloudBusy=false;
 if(epoch!==authEpoch||id!==activeUserId)return;
 if(err||!result){
  const collision=!result&&!err||['23505','PGRST116'].includes(err?.code);
  if(collision){cloudConflict=true;setMessage('Изменения в облаке отличаются. Автоматическая отправка остановлена во избежание потери данных. Сначала экспортируй JSON, затем выбери «Загрузить из облака».')}
  else setMessage('Не удалось синхронизировать: '+(err?.message||'сеть недоступна')+'. Локальные изменения сохранены. Можно повторить вручную.');
  return;
 }
 cloudRevision=result.revision;localStorage.setItem(versionKey(id),String(cloudRevision));
 if(JSON.stringify(publicData())===snapshot){localStorage.removeItem(pendingKey(id));setMessage('Синхронизировано с облаком. ✓')}
 else{setMessage('Синхронизируем новые изменения…');scheduleUpload()}
}
async function pullCloud(){
 if(!sb||!session||cloudBusy)return;
 if(localPending()&&!confirm('Внимание: несинхронизированные локальные изменения будут заменены облачными. Сначала экспортируй JSON. Продолжить?'))return;
 const id=activeUserId,epoch=authEpoch,initialLocal=JSON.stringify(publicData());cloudBusy=true;renderSettings();
 try{
  const {data,error}=await sb.from('user_data').select('data,revision').eq('user_id',id).maybeSingle();
  if(error)throw error;if(epoch!==authEpoch||activeUserId!==id)return;
  if(JSON.stringify(publicData())!==initialLocal){setMessage('Во время загрузки появились новые локальные изменения. Загрузка отменена, данные сохранены.');return}
  if(!data){setMessage('В облаке ещё нет записей для этого аккаунта. Локальные данные не изменены.');return}
  // Keep a local recovery copy, even when the user opts to replace local data.
  localStorage.setItem(`betteryou-recovery-${id}`,JSON.stringify(publicData()));
  state=cleanData(data.data);cloudRevision=data.revision;cloudConflict=false;
  localStorage.setItem(versionKey(id),String(cloudRevision));
  localStorage.setItem(userKey(id),JSON.stringify(publicData()));
  localStorage.removeItem(pendingKey(id));cloudMessage='Загружено из облака. Предыдущая локальная копия сохранена на этом устройстве.';renderAll();
 }catch(e){setMessage('Ошибка загрузки: '+e.message)}
 finally{cloudBusy=false;renderSettings()}
}
$('saveCloudConfig').onclick=async()=>{const c={url:$('sbUrl').value.trim(),key:$('sbKey').value.trim()};await setupCloud(c)};
$('signUp').onclick=async()=>{
 if(!await ensureCloud())return;
 const email=$('sbEmail').value.trim(),password=$('sbPassword').value;
 if(password.length<8){alert('Придумай пароль минимум из 8 символов. Не отправляй его никому.');return}
 const {data,error}=await sb.auth.signUp({email,password});
 if(error){alert(error.message);return}
 $('sbPassword').value='';
 if(data.session)await activateAccount(data.session);
 alert(data.session?'Аккаунт создан, вход выполнен.':'Проверь почту и подтверди регистрацию, затем войди.');
};
$('signIn').onclick=async()=>{
 if(!await ensureCloud())return;
 const {data,error}=await sb.auth.signInWithPassword({email:$('sbEmail').value.trim(),password:$('sbPassword').value});
 $('sbPassword').value='';if(error){alert(error.message);return}
 await activateAccount(data.session);
};
async function ensureCloud(){if(sb)return true;return setupCloud({url:$('sbUrl').value.trim(),key:$('sbKey').value.trim()})}
$('signOut').onclick=async()=>{if(!sb)return;if(localPending()&&!confirm('Не все изменения отправлены в облако. Они останутся на устройстве, но не появятся на другом телефоне. Выйти?'))return;const {error}=await sb.auth.signOut();if(error)alert(error.message);else leaveAccount()};
$('syncNow').onclick=async()=>{if(!session){alert('Сначала войди в аккаунт');return}if(cloudConflict){alert('Конфликт версий. Сначала сохрани экспорт JSON и проверь данные перед выбором облачной версии.');return}if(!localPending()){setMessage('Все локальные изменения уже отправлены в облако.');return}await uploadPending()};
$('pullCloud').onclick=pullCloud;
$('importGuest').onclick=()=>{
 if(!session)return;
 if(cloudRevision>0){alert('В облаке уже есть данные. Чтобы не потерять их, сначала экспортируй обе версии в JSON. Автоматический перенос разрешён только в пустой аккаунт.');return}
 const guest=readStorage(GUEST_KEY);
 if(!confirm('Перенести гостевые записи с этого устройства в новый аккаунт? Текущие данные пустого профиля будут заменены. Гостевая копия останется на устройстве.'))return;
 state=guest;save();alert('Гостевые записи скопированы. Дождись сообщения об успешной синхронизации.');
};
// Restore the previous public (non-secret) connection settings.
const oldCloud=(()=>{try{return JSON.parse(localStorage.getItem(GUEST_KEY)||'{}').cloud||{}}catch{return {}}})();
const initialConfig=getConfig();
if(!initialConfig.url&&oldCloud.url&&oldCloud.key){localStorage.setItem(CONFIG_KEY,JSON.stringify({url:oldCloud.url,key:oldCloud.key}))}
const bootstrapConfig=getConfig();
if(bootstrapConfig.url&&bootstrapConfig.key)setupCloud(bootstrapConfig);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installBtn').hidden=false});$('installBtn').onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installBtn').hidden=true}};
$('wDate').value=today();renderAll();
