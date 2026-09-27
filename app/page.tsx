"use client";
import {useEffect,useMemo,useState} from "react";
import {AlertTriangle,Building2,CalendarDays,Check,CheckCircle2,ChevronRight,ClipboardCheck,Download,Gauge,History,Home,MapPin,Menu,Search,ShieldCheck,X} from "lucide-react";
type Status="完了"|"未実施"|"異常あり";
type Eq={id:number;name:string;code:string;place:string;kind:string;time:string;status:Status};
type CheckItem={label:string;how:string;help:string};
const seed:Eq[]=[
 {id:1,name:"給水ポンプ No.1",code:"P-101",place:"地下1階 ポンプ室",kind:"給排水",time:"09:10",status:"完了"},
 {id:2,name:"火災報知設備 受信機",code:"F-201",place:"1階 管理室",kind:"消防",time:"09:40",status:"異常あり"},
 {id:3,name:"エレベーター 1号機",code:"E-001",place:"共用部",kind:"昇降機",time:"10:20",status:"未実施"},
 {id:4,name:"非常用照明 3階東",code:"L-303",place:"3階 共用廊下",kind:"電気",time:"11:00",status:"未実施"},
 {id:5,name:"受水槽",code:"W-002",place:"屋外設備ヤード",kind:"給排水",time:"13:30",status:"未実施"}];
const inspectionSets:Record<number,CheckItem[]>={
 1:[
  {label:"本体・配管に漏水や著しい腐食がない",how:"ポンプ停止中に目視で確認",help:"床の水たまり、継手からの滴下、錆汁や塗装の膨れを確認します。漏水部には触れず、広がる場合は元弁を操作せず管理責任者へ連絡してください。"},
  {label:"運転中に異音・異常振動・異臭がない",how:"安全な距離を保って運転音を確認",help:"金属が擦れる音、大きなうなり、普段より強い振動、焦げ臭さは異常の目安です。回転部やモーターには手を触れないでください。"},
  {label:"圧力計が通常範囲内を示している",how:"指針を正面から読み取る",help:"このデモでは通常範囲を0.25～0.45MPaとします。指針が激しく振れる、ゼロのまま、範囲外の場合は数値をメモして報告します。"},
  {label:"制御盤に警報表示・異常表示がない",how:"表示灯と画面を目視で確認",help:"赤色の警報灯、エラー番号、ブザーを確認します。初心者は盤を開けたり、警報を勝手にリセットしたりしないでください。"}],
 2:[
  {label:"主電源・交流電源の表示が正常である",how:"受信機の表示灯を目視で確認",help:"電源表示が消灯している場合、設備が監視できていない可能性があります。ブレーカーや内部配線には触れず、すぐに責任者へ報告してください。"},
  {label:"火災・断線・障害の表示が出ていない",how:"地区表示・液晶画面を確認",help:"火災灯、地区灯、断線・障害表示を確認します。実火災の可能性がある表示は点検を中断し、館内手順に従って現場確認と通報判断を行います。"},
  {label:"音響・ブザーが明瞭に聞こえる",how:"許可された試験操作で確認",help:"事前に居住者・関係者への周知と連動設備の停止確認が必要です。音が小さい、途切れる、鳴らない場合は異常です。無断で試験しないでください。"},
  {label:"受信機前の操作スペースが確保されている",how:"周囲の物品・操作表示を確認",help:"受信機の前に荷物が置かれていないか、操作方法や警戒区域図が読めるかを確認します。緊急操作を妨げる物は管理者へ移動を依頼します。"}],
 3:[
  {label:"かご・乗場扉が円滑に開閉する",how:"各階で開閉状態を目視確認",help:"扉が引っ掛かる、閉まり切らない、異音がする、段差が大きい場合は使用を止めて保守会社へ連絡します。扉へ手や工具を差し込まないでください。"},
  {label:"走行時に異音・強い振動・衝撃がない",how:"通常運転で乗車して確認",help:"急な揺れ、擦過音、停止時の大きな衝撃は異常の目安です。異常を感じたら繰り返し運転せず、最寄階で降りて使用停止を表示します。"},
  {label:"階床表示・操作ボタン・照明が正常である",how:"表示と各ボタンの反応を確認",help:"行先階ボタン、開閉ボタン、階床表示、かご内照明を確認します。反応が遅い場合も記録してください。非常停止など通常使用しない操作は行いません。"},
  {label:"非常通話装置が使用できる状態である",how:"表示・破損・応答手順を確認",help:"管理会社の決めた試験手順と相手先への事前連絡がある場合のみ通話試験を行います。機械室・昇降路・ピットには有資格者以外立ち入りません。"}],
 4:[
  {label:"器具・カバーに破損や変形がない",how:"床面から目視で確認",help:"カバーの割れ、脱落、焦げ跡、著しい汚れを確認します。高所の器具へ無理に手を伸ばさず、脚立作業は二人作業など現場ルールに従います。"},
  {label:"充電モニター・表示灯が正常である",how:"器具の表示灯を目視確認",help:"表示灯の状態は機種により異なるため、本体表示や取扱説明書と照合します。消灯だけで断定せず、器具番号と状態を記録してください。"},
  {label:"点検スイッチで非常点灯する",how:"周囲へ声掛け後、短時間作動確認",help:"スイッチ操作で非常灯へ切り替わり、十分な明るさで点灯するか確認します。点灯しない、ちらつく、極端に暗い場合は異常です。"},
  {label:"照明を遮る物や避難上の障害がない",how:"照射範囲と共用廊下を確認",help:"掲示物、収納物、植木などが光を遮っていないか確認します。避難経路上の放置物も写真と場所を記録し、管理者へ報告してください。"}],
 5:[
  {label:"槽本体に漏水・亀裂・著しい劣化がない",how:"外周と架台を目視で確認",help:"水滴、濡れ跡、亀裂、膨らみ、錆を確認します。槽の上へ乗らず、漏水が多い場合は周辺への立入を制限して専門業者へ連絡します。"},
  {label:"マンホール蓋が密閉・施錠されている",how:"蓋・パッキン・鍵を目視確認",help:"蓋の浮き、鍵の紛失、パッキンの外れは異物混入につながります。衛生確保のため、許可なく蓋を開けたり槽内へ立ち入ったりしないでください。"},
  {label:"通気管・オーバーフロー管の防虫網が健全",how:"網の破れ・外れを目視確認",help:"防虫網の破れ、外れ、目詰まりや管端の損傷を確認します。害虫や小動物の侵入跡があれば写真を撮り、飲用を含む対応を責任者へ相談します。"},
  {label:"周囲が清潔で汚染源や滞水がない",how:"槽周辺と排水状態を確認",help:"ごみ、薬品、油、排水不良、水たまりがないか確認します。水に濁り・色・異臭が疑われる場合は使用判断をせず、直ちに管理者へ報告してください。"}]
};

export default function Page(){
 const [tab,setTab]=useState("home"),[data,setData]=useState(seed),[pick,setPick]=useState<Eq|null>(null),[ans,setAns]=useState<Record<number,string>>({}),[memo,setMemo]=useState(""),[toast,setToast]=useState(""),[drawer,setDrawer]=useState(false),[q,setQ]=useState(""),[ready,setReady]=useState(false),[last,setLast]=useState<{name:string;status:Status}|null>(null),[help,setHelp]=useState<number|null>(null);
 const done=data.filter(x=>x.status!=="未実施").length,issues=data.filter(x=>x.status==="異常あり").length;
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),2500);return()=>clearTimeout(t)}},[toast]);
 useEffect(()=>{try{const saved=localStorage.getItem("junten-demo-equipment");if(saved)setData(JSON.parse(saved))}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("junten-demo-equipment",JSON.stringify(data))},[data,ready]);
 useEffect(()=>{const mc=(document as unknown as {modelContext?:{registerTool:(tool:unknown,opts?:unknown)=>void}}).modelContext;if(!mc?.registerTool)return;const life=new AbortController();try{mc.registerTool({name:"open_equipment_inspection",title:"設備点検を開く",description:"設備コードを指定して、画面上で該当設備の点検入力を開始します。",inputSchema:{type:"object",properties:{equipmentCode:{type:"string"}},required:["equipmentCode"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:unknown)=>{const code=(input as {equipmentCode?:string}).equipmentCode;const x=data.find(v=>v.code===code);if(!x)throw new Error("設備コードが見つかりません");open(x);return{equipmentCode:x.code,status:"inspection_opened"}}},{signal:life.signal})}catch{}return()=>life.abort()},[data]);
 const open=(x:Eq)=>{setPick(x);setHelp(null);setAns(x.id===2?{0:"正常",1:"異常",2:"正常",3:"正常"}:{});setMemo(x.id===2?"警報音の音量が小さいため、専門業者による確認が必要。":"")};
 const finish=()=>{if(!pick||Object.keys(ans).length<(inspectionSets[pick.id]?.length||0)){setToast("すべての項目を入力してください");return}const status:Status=Object.values(ans).includes("異常")?"異常あり":"完了";const updated=data.map(x=>x.id===pick.id?{...x,status}:x);setData(updated);localStorage.setItem("junten-demo-equipment",JSON.stringify(updated));setLast({name:pick.name,status});setPick(null);setTab("home");setToast(pick.name+"の点検結果を集計へ反映しました")};
 const shown=useMemo(()=>data.filter(x=>(x.name+x.place+x.code).includes(q)),[data,q]);
 const nav=[["home","ダッシュボード",Home],["list","点検一覧",ClipboardCheck],["issues","異常・対応管理",AlertTriangle],["report","点検履歴・報告書",History]] as const;
 const Nav=()=> <nav>{nav.map(([id,label,I])=><button key={id} className={tab===id?"active":""} onClick={()=>{setTab(id);setDrawer(false)}}><I size={19}/>{label}{id==="issues"&&<b>1</b>}</button>)}</nav>;
 return <div className="shell">
  <aside className="side"><Logo/><Nav/><div className="site"><small>点検対象</small><strong>グリーンコート西新宿</strong><span><MapPin size={13}/>東京都新宿区</span></div><div className="person"><i>佐</i><span><b>佐藤 健一</b><small>設備管理担当</small></span></div></aside>
  <main><header className="top"><button className="hamb" onClick={()=>setDrawer(true)}><Menu/></button><div><small>2026年9月14日（月）</small><b>グリーンコート西新宿</b></div><button><CalendarDays size={18}/>点検予定</button><i>佐</i></header>
   {drawer&&<div className="drawer"><button onClick={()=>setDrawer(false)}><X/></button><Logo/><Nav/></div>}
   <div className="content">
   {tab==="home"&&<><Title eyebrow="おはようございます、佐藤さん" title="本日の設備点検"><button className="primary" onClick={()=>open(data.find(x=>x.status==="未実施")||data[0])}><ClipboardCheck/>次の点検を開始</button></Title>
    {last&&<section className="result-banner"><CheckCircle2/><span><b>集計結果を更新しました</b><small>{last.name}：{last.status}として登録し、完了件数・実施率・異常件数へ反映済みです。</small></span><button onClick={()=>setLast(null)} aria-label="閉じる"><X/></button></section>}
    <section className="metrics"><Metric c="blue" icon={<ClipboardCheck/>} label="本日の点検" n={data.length+"件"} sub="予定どおり"/><Metric c="green" icon={<CheckCircle2/>} label="実施済み" n={done+"件"} sub={Math.round(done/data.length*100)+"% 完了"}/><Metric c="orange" icon={<AlertTriangle/>} label="異常検知" n={issues+"件"} sub={issues?"確認が必要です":"異常なし"}/><Metric c="violet" icon={<ShieldCheck/>} label="本日の実施率" n={Math.round(done/data.length*100)+"%"} sub={(data.length-done)+"件 未実施"}/></section>
    <section className="progress"><div className="ring" style={{"--p":Math.round(done/data.length*360)+"deg"} as React.CSSProperties}><span><b>{Math.round(done/data.length*100)}%</b><small>完了</small></span></div><div><small>TODAY'S PROGRESS</small><h2>残り {data.length-done}件の点検があります</h2><p>予定時刻に沿って進んでいます。次回は10:20、エレベーター1号機です。</p><i><b style={{width:done/data.length*100+"%"}}/></i></div></section>
    <section className="panel"><div className="panelhead"><span><h2>本日の点検スケジュール</h2><p>設備を選択して点検を開始できます</p></span><button onClick={()=>setTab("list")}>すべて表示 <ChevronRight/></button></div><Table rows={data} open={open}/></section></>}
   {tab==="list"&&<section className="panel padded"><Title eyebrow="2026年9月14日" title="点検一覧"><label className="search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="設備名・場所で検索"/></label></Title><div className="chips"><button>すべて {data.length}</button><button>未実施 {data.filter(x=>x.status==="未実施").length}</button><button>異常あり {issues}</button></div><Table rows={shown} open={open}/></section>}
   {tab==="issues"&&<><Title eyebrow="是正状況を追跡" title="異常・対応管理"/><section className="issue"><div><em>対応待ち</em><small>2026/09/14 09:42 登録</small></div><article><span className="eqicon orange"><AlertTriangle/></span><div><h2>火災報知設備 受信機</h2><p><MapPin/>1階 管理室 ・ F-201</p><blockquote>警報音の音量が小さいため、専門業者による確認が必要。</blockquote></div></article><footer><span><small>重要度</small><b className="orangeText">中</b></span><span><small>対応期限</small><b>2026/09/16</b></span><span><small>担当</small><b>未割当</b></span><button onClick={()=>setToast("担当者へ対応依頼を送信しました")}>対応を依頼する</button></footer></section></>}
   {tab==="report"&&<><Title eyebrow="記録の確認・出力" title="点検結果報告書"><button className="primary" onClick={()=>window.print()}><Download/>PDF保存・印刷</button></Title><section className="report" id="inspection-report"><div className="reportTitle"><small>管理番号：GCN-20260914-01</small><h2>マンション設備点検結果報告書</h2><p>日常・定期点検　簡易様式</p></div><table className="basicTable"><tbody><tr><th>建物名称</th><td>グリーンコート西新宿</td><th>点検日</th><td>2026年9月14日</td></tr><tr><th>所在地</th><td>東京都新宿区西新宿0-0-0</td><th>天候</th><td>晴れ</td></tr><tr><th>管理会社</th><td>サンプルマンション管理株式会社</td><th>点検者</th><td>佐藤 健一</td></tr></tbody></table><div className="reportstats"><span><small>対象設備</small><b>{data.length}</b></span><span><small>実施済み</small><b>{done}</b></span><span><small>異常件数</small><b className="orangeText">{issues}</b></span><span><small>実施率</small><b>{Math.round(done/data.length*100)}%</b></span></div><h3>設備別 点検結果</h3><table className="resultTable"><thead><tr><th>No.</th><th>設備名称／設備番号</th><th>設置場所</th><th>点検時刻</th><th>判定</th></tr></thead><tbody>{data.map((x,i)=><tr key={x.id}><td>{i+1}</td><td><b>{x.name}</b><small>{x.code}・{x.kind}</small></td><td>{x.place}</td><td>{x.status==="未実施"?"—":x.time}</td><td><strong className={x.status==="完了"?"judgeOk":x.status==="異常あり"?"judgeNg":"judgeWait"}>{x.status}</strong></td></tr>)}</tbody></table><section className="finding"><h3>指摘事項・対応方針</h3>{issues?<table><tbody><tr><th>対象設備</th><td>火災報知設備 受信機（F-201）</td></tr><tr><th>指摘内容</th><td>警報音の音量が小さいため、専門業者による確認が必要。</td></tr><tr><th>重要度・期限</th><td>重要度：中　／　対応期限：2026年9月16日</td></tr><tr><th>対応状況</th><td>対応依頼準備中</td></tr></tbody></table>:<p>今回の点検で指摘事項はありません。</p>}</section><section className="overall"><h3>総合所見</h3><p>{issues?"点検対象設備のうち1件に要確認事項を認めた。その他の実施設備は正常であり、未実施設備は予定に従い点検を継続する。":"実施済み設備に異常は認められなかった。未実施設備は予定に従い点検を継続する。"}</p></section><div className="signatures"><span><small>点検担当者</small><b>佐藤 健一</b></span><span><small>管理責任者確認</small><b>山田 太郎</b></span><span><small>確認日</small><b>2026年9月14日</b></span></div><p className="reportNote">※本書はデモ用の簡易報告書であり、法定報告書としては使用できません。</p></section></>}
   </div>
  </main>
  {pick&&<div className="overlay"><section className="modal"><header><div><small>{pick.kind}設備・点検票</small><h2>{pick.name}</h2><p><MapPin/>{pick.place} ・ {pick.code}</p></div><button onClick={()=>setPick(null)} aria-label="点検画面を閉じる"><X/></button></header><div className="beginner-note"><ShieldCheck/><span><b>初心者向けガイド</b><small>各項目の「？」にカーソルを合わせるか、タップすると確認方法と注意点を表示します。</small></span></div><div className="count"><span>点検項目</span><b>{Object.keys(ans).length} / {inspectionSets[pick.id].length}</b></div><div className="checks">{inspectionSets[pick.id].map((x,i)=><article key={x.label}><div><i>{i+1}</i><span><span className="checkTitle"><b>{x.label}</b><span className="helpWrap"><button type="button" className="helpBtn" aria-label={x.label+"のヘルプ"} aria-expanded={help===i} onClick={()=>setHelp(help===i?null:i)}>?</button><span className={help===i?"helpPop show":"helpPop"} role="tooltip"><b>確認のポイント</b>{x.help}<em>不明な場合は「正常」にせず、作業を止めて管理責任者へ確認してください。</em></span></span></span><small>{x.how}</small></span></div><div><button className={ans[i]==="正常"?"ok":""} onClick={()=>setAns({...ans,[i]:"正常"})}><Check/>正常</button><button className={ans[i]==="異常"?"ng":""} onClick={()=>setAns({...ans,[i]:"異常"})}><AlertTriangle/>異常</button></div></article>)}</div><label className="memo"><b>所見・メモ <small>任意</small></b><textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="気づいた点を入力"/></label><footer><button onClick={()=>setPick(null)}>キャンセル</button><button className="primary" onClick={finish}><CheckCircle2/>点検を完了する</button></footer></section></div>}
  {toast&&<div className="toast"><CheckCircle2/>{toast}</div>}
 </div>
}
function Logo(){return <div className="logo"><i><Building2/></i><span><b>巡点 <em>JUNTEN</em></b><small>設備点検管理</small></span></div>}
function Title({eyebrow,title,children}:{eyebrow:string;title:string;children?:React.ReactNode}){return <section className="title"><span><p>{eyebrow}</p><h1>{title}</h1></span>{children}</section>}
function Metric({c,icon,label,n,sub}:{c:string;icon:React.ReactNode;label:string;n:string;sub:string}){return <article><i className={c}>{icon}</i><span><small>{label}</small><b>{n}</b><em>{sub}</em></span></article>}
function Table({rows,open}:{rows:Eq[];open:(x:Eq)=>void}){return <div className="table">{rows.map(x=><article key={x.id}><span className={"eqicon "+(x.status==="異常あり"?"orange":"")}><Gauge/></span><div><b>{x.name}</b><em>{x.code}</em><p><MapPin/>{x.place} ・ {x.kind}</p></div><time>{x.time}</time><strong className={x.status==="完了"?"done":x.status==="異常あり"?"bad":"wait"}>{x.status==="完了"&&<Check/>}{x.status}</strong><button onClick={()=>open(x)}>{x.status==="未実施"?"点検する":"確認する"}<ChevronRight/></button></article>)}</div>}
