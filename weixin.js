'use strict'

var config=require('./config.js');
var Wechat=require('./weixin/wechat.js');
var wechatApi=new Wechat(config.Wechat);
var menu=require('./menu.js');

wechatApi.deleteMenu().then(function(){
	return wechatApi.createMenu(menu)
})



exports.reply=function*(next){
	var message=this.weixin;
	if(message.MsgType==='event'){
		if(message.Event==="subscribe"){
			if(message.EventKey){
				console.log('欢迎扫码进入');
			}
			this.body="你订阅了这个号";
		}
		else if(message.Event==="unsubscribe"){
			console.log('wuqingquguan')
			this.body="";
		}
		else if(message.Event==="LOCATION"){
			this.body="您上报的地址是"+message.Latitude+"/"+message.Longitude+'-'+
			message.Precision
		}
		else if(message.Event==="CLICK"){
			this.body="您点击了"+message.EventKey;
		}
		else if(message.Event==="SCAN"){
			this.body='看到你扫了一下哦';
			console.log(message.EventKey+''+message.Ticket);
		}
		else if(message.Event==="VIEW"){
			this.body="您点击了菜单中的链接"+message.EventKey;
		}
		else if(message.Event==="scancode_waitmsg"){
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body="您点击了菜单中的链接"+message.EventKey;
		}
		else if(message.Event==="scancode_push"){
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body="您点击了菜单中的链接"+message.EventKey;
		}
		else if(message.Event==="pic_sysphoto"){
			console.log(message.SendPicsInfo)
			console.log(message.PicList)
			this.body="您点击了菜单中的链接"+message.EventKey;
		}
		else if(message.Event==="pic_photo_or_album"){
			console.log(message.SendPicsInfo)
			console.log(message.PicList)
			this.body="您点击了菜单中的链接"+message.EventKey;
		}
		else if(message.Event==="pic_weixin"){
			console.log(message.SendPicsInfo)
			console.log(message.PicList)
			this.body="您点击了菜单中的链接"+message.EventKey;
		}
		else if(message.Event==="location_select"){
			console.log(message.SendLocationInfo.Location_X)
			console.log(message.SendLocationInfo.Location_Y)
			console.log(message.SendLocationInfo.Scale)
			console.log(message.SendLocationInfo.Label)
			console.log(message.SendLocationInfo.Poiname)
			
			this.body="您点击了菜单中的链接"+message.EventKey;
		}

	}else if(message.MsgType==='text'){
		var content=message.Content;
		var reply='您说的'+content+'太复杂了';
		if(content==='1'){
			reply="你妈的屁"
		}else if(content==='2'){
			reply='滚!'
		}else if(content==='3'){
			reply=[{
				title:'陈胜自传',
				description:'太棒了！',
				picUrl:'http://mmbiz.qpic.cn/mmbiz_jpg/PIXBE3rq7mSbSVdW83YcMwVeVmiaRrkiaiaQbTWOGqxH3dJ7rtcOYmDQMdZM22XPkYPbsI6YV0TODciczKlt1ibZOibw/0',
				url:'http://www.baidu.com'
			}]
		}else if(content==='4'){
			reply=[{
				title:'陈胜自传',
				description:'太棒了！',
				picUrl:'http://mmbiz.qpic.cn/mmbiz_jpg/PIXBE3rq7mSbSVdW83YcMwVeVmiaRrkiaiaQbTWOGqxH3dJ7rtcOYmDQMdZM22XPkYPbsI6YV0TODciczKlt1ibZOibw/0',
				url:'http://www.baidu.com'
			},{
				title:'陈胜自传',
				description:'太棒了！',
				picUrl:'http://e.hiphotos.baidu.com/news/q%3D100/sign=5583f3e4ba19ebc4c6787299b227cf79/622762d0f703918f8c5ef14b583d269758eec4a0.jpg',
				url:'http://news.baidu.com/'
			}]
		}else if(content==='5'){
			var data = yield wechatApi.upLoadMaterial("image",__dirname+"/2.jpg");
			reply={
				type:'image',
				mediaId:data.media_id
			}
		}else if(content==="7"){
			var data = yield wechatApi.upLoadMaterial("image",__dirname+"/5.jpg",
				{type:'image'});
			reply={
				type:'image',
				mediaId:data.media_id,
				title:"no content",
				description:"no description"
			}
		}else if(content==="6"){
			var data = yield wechatApi.upLoadMaterial("video",__dirname+"/3.mp4");
			reply={
				type:'video',
				mediaId:data.media_id,
				title:"no content",
				description:"no description"
			}
		}else if(content==="8"){
			var tags=yield wechatApi.createTags("黄色");
			console.log('创建标签'+tags);
			var fetchtag=yield wechatApi.fetchTags();
			console.log("获取的标签有"+JSON.stringify(fetchtag));
			var batchtag=yield wechatApi.batchTags(['oD9ylwt2ucakyrKH92Qm3pe9Brvc'],100);
			console.log(batchtag);
			var usertaglist=yield wechatApi.fetchUserTagList('oD9ylwt2ucakyrKH92Qm3pe9Brvc')
			console.log('该用户列表有'+JSON.stringify(usertaglist))
		}else if(content==='9'){
			var user=yield wechatApi.getUsers();
			reply='关注用户总数为'+user.total;
		}else if(content==='10'){
			var info=yield wechatApi.getUserInfo('oD9ylwt2ucakyrKH92Qm3pe9Brvc')
			console.log('用户信息为'+JSON.stringify(info));
		}else if(content==='11'){
			var text={
				'content':'这bu是一个群发消息'
			};
			yield wechatApi.sendByTags('text',text,101);
			reply=''
		}
			this.body=reply;			
	}
	yield next
}