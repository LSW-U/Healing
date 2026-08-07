Page({data:{keyword:'',results:[],hotTags:['冥想','助眠','4-7-8呼吸','颂钵','曼陀罗','立秋']},
onInput(e){this.setData({keyword:e.detail.value,results:e.detail.value?[{id:1,title:'海的呼吸',subtitle:'颂钵引导·8分钟',bg:'linear-gradient(135deg,#5B7B8A,#3F5E5A)',type:'content'},{id:2,title:'林一沐',subtitle:'颂钵疗愈师',bg:'linear-gradient(135deg,#C9B59A,#8a7558)',type:'healer'}]:[]})},
onCancel(){wx.navigateBack()},
onTap(e){wx.navigateTo({url:'/pages/content-detail/content-detail?id='+e.currentTarget.dataset.id})},
onTag(e){this.setData({keyword:e.currentTarget.dataset.tag});this.onInput({detail:{value:e.currentTarget.dataset.tag}})}
})
