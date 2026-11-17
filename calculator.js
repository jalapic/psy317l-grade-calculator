const boundaries=[['A',186],['A−',180],['B+',174],['B',166],['B−',160],['C+',154],['C',146],['C−',140],['D+',134],['D',126],['D−',120],['F',0]];
const defaults=[15,14,14.5,12,13.5,13.67,15,11.6,14.5,14,13.5,13,14.25,14.1];
const fmt=n=>Number(n.toFixed(6)).toString();
function calculate(scores,redos,complete,bonus){
 let items=scores.map((value,i)=>({value,module:i+1,redo:null})),replaced=[];
 for(const [start,candidates] of [[0,[{value:redos[0],redo:1}]],[7,[{value:redos[1],redo:2},{value:redos[2],redo:3}]]]){
 const targets=items.slice(start,start+7).sort((a,b)=>a.value-b.value||a.module-b.module);
 let next=0; candidates.sort((a,b)=>a.value-b.value||a.redo-b.redo).forEach(candidate=>{const target=targets[next];if(candidate.value>target.value){next++;replaced.push({module:target.module,old:target.value,...candidate});Object.assign(items[target.module-1],candidate);}});
 }
 let dropped=null;const eligible=complete&&scores[13]>=10;
 if(eligible){dropped=items.reduce((a,b)=>b.value<a.value?b:a);items=items.filter(i=>i!==dropped);}
 const quiz=items.reduce((s,i)=>s+i.value,0),total=Number((quiz+bonus).toFixed(6));
 return {items,replaced,dropped,quiz,total,eligible,grade:eligible?boundaries.find(b=>total>=b[1])[0]:null};
}
if(typeof document!=='undefined'){
const $=id=>document.getElementById(id);
for(let i=1;i<=14;i++)$(i<=7?'first':'second').insertAdjacentHTML('beforeend',`<label>Module ${i}<input id="m${i}" type="number" min="0" max="15" step="any" value="${defaults[i-1]}"><span class="field-note">Out of 15</span></label>`);
function update(){
 const invalid=[...document.querySelectorAll('input[type=number]')].some(i=>i.value===''||!Number.isFinite(Number(i.value))||!i.checkValidity());
 $('error').textContent=invalid?'Enter a score from 0–15 for every quiz, and a nonnegative bonus.':'';
 if(invalid){['total','letter','quiztotal','btotal'].forEach(id=>$(id).textContent='—');$('next').textContent='Complete or correct the score boxes to calculate your grade.';['chips','dropnote','note1','note2','note3','scale'].forEach(id=>$(id).textContent='');return;}
 const scores=defaults.map((_,i)=>+$('m'+(i+1)).value),redos=[+$('r1').value,+$('r2').value,+$('r3').value],bonus=+$('bonus').value;
 const r=calculate(scores,redos,$('complete').checked,bonus);
 for(let n=1;n<=3;n++){const rep=r.replaced.find(x=>x.redo===n);$('note'+n).textContent=rep?`Replaces Module ${rep.module}: ${fmt(rep.old)} → ${fmt(rep.value)} points.`:n===1?'Not used. It must improve the lowest score in Modules 1–7.':'Not used. Redo 2 and Module 15 / Redo 3 compete to improve the two lowest scores in Modules 8–14.';}
 $('total').textContent=r.eligible?fmt(r.total):'—';$('letter').textContent=r.grade||'—';$('count').textContent=`${r.items.length} quiz scores`;$('quiztotal').textContent=fmt(r.quiz);$('btotal').textContent=fmt(bonus);
 $('dropnote').textContent=r.dropped?`Dropped: ${r.dropped.redo?'Redo '+r.dropped.redo+' (Module '+r.dropped.module+')':'Module '+r.dropped.module} · ${fmt(r.dropped.value)} points. The remaining 13 scores count toward your grade.`:'No score dropped. Complete all 14 required modules and earn at least 10/15 on Module 14 to qualify. Final grade will appear when these conditions are met.';
 $('chips').innerHTML=r.items.map(i=>`<span class="chip">${i.redo?'R'+i.redo+' → M':'M'}${i.module}: ${fmt(i.value)}</span>`).join('');
 const idx=boundaries.findIndex(x=>x[0]===r.grade);
 $('next').textContent=!r.eligible?'Final grade pending: complete all modules and earn at least 10/15 on Module 14.':idx===0?'You have reached the A threshold.':`${fmt(boundaries[idx-1][1]-r.total)} more points to reach ${boundaries[idx-1][0]}.`;
 $('scale').innerHTML=boundaries.map(([grade,min],i)=>`<tr class="${grade===r.grade?'current':''}"><td>${grade}</td><td>${i===11?'Below 120':fmt(min)+' to '+(i===0?'200 (or above with bonus)':'below '+fmt(boundaries[i-1][1]))}</td></tr>`).join('');
}
function reset(){defaults.forEach((v,i)=>$('m'+(i+1)).value=v);['r1','r2','r3','bonus'].forEach((id,i)=>$(id).value=[14.5,14.5,14,5][i]);$('complete').checked=true;update();}
document.addEventListener('input',update);$('reset').onclick=reset;reset();
}
if(typeof module!=='undefined')module.exports={calculate};
