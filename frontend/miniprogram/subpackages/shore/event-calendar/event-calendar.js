Page({
  data:{month:'八 月',solarTerms:'立 秋 · 处 暑',weeks:['日','一','二','三','四','五','六'],cells:[],currentEvent:null},
  onLoad(){this.buildCal(2026,8)},
  buildCal(y,m){
    const days=new Date(y,m,0).getDate(),first=new Date(y,m-1,1).getDay(),events={6:{title:'颂 钵 音 疗 沙 龙',time:'19:30—21:00',location:'共时海工作室',remaining:2,date:'8月6日 · 周四'},7:{title:'立秋 · 凉风至茶会',time:'19:30—21:00',location:'共时海工作室',remaining:2,date:'8月7日 · 周五'},12:{title:'芳香颂钵·沉浸之夜',time:'20:00—21:30',location:'共时海工作室',remaining:5,date:'8月12日·周二'},15:{title:'色彩与情绪·表达性绘画',time:'14:00—16:00',location:'共时海工作室',remaining:6,date:'8月15日·周日'},23:{title:'处暑·节气茶会',time:'15:00—16:30',location:'共时海工作室',remaining:8,date:'8月23日·周日'},28:{title:'满月冥想圈',time:'19:30—21:00',location:'共时海工作室',remaining:3,date:'8月28日·周五'}},
    solar={7:'立秋',23:'处暑'},today=new Date(),cells=[];
    for(let i=0;i<first;i++)cells.push({empty:true});
    for(let d=1;d<=days;d++){const isToday=today.getFullYear()===y&&today.getMonth()+1===m&&today.getDate()===d;
      cells.push({day:d,hasEvent:!!events[d],solar:solar[d]||'',empty:false,today:isToday,selected:false,event:events[d]||null})}
    while(cells.length%7!==0)cells.push({empty:true});
    this.setData({cells})
  },
  onDay(e){
    const idx = parseInt(e.currentTarget.dataset.idx)
    const cell = this.data.cells[idx]
    if(cell.empty)return;
    const cells = this.data.cells.map((c, i) => ({ ...c, selected: i === idx }));
    this.setData({cells,currentEvent:cell.event||{title:'暂无活动',date:'点击日期',time:'',location:'',remaining:0}})
  },
  onPrev(){wx.showToast({title:'上个月',icon:'none'})},
  onNext(){wx.showToast({title:'下个月',icon:'none'})},
  onSignup(){wx.navigateTo({url:'/subpackages/shore/event-detail/event-detail'})}
})
