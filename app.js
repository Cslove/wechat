'use strict'

var Koa = require('koa');
var wechat = require('./weixin/g.js');
var config=require('./config.js')
var Wechat=require('./weixin/wechat.js')
var ejs=require('ejs');
var heredoc=require('heredoc');
var crypto=require('crypto');


var app = new Koa();


var tpl=heredoc(function(){/*
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8"/>
		<meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1">
		<title>猜电影</title>
	</head>
	<body>
		<h1>点击标题，开始录音</h1>
		// <input type="text" placehoder='输入电影名称' id="key" />
		<p id="title"></p>
		<div id="poster"></div>
		<p id="year"></p>
		<p id="director"></p>
		<script src="http://apps.bdimg.com/libs/jquery/2.1.1/jquery.min.js"></script>
		<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
		<script>
			wx.config({
			    debug: false, 
			    appId: 'wx90041ac7c6644ccb', 
			    timestamp: '<%= timestamp %>', 
			    nonceStr: '<%= noncestr %>', 
			    signature: '<%= signature %>',
			    jsApiList: [
					'startRecord',
					'stopRecord',
					'onVoiceRecordEnd',
					'translateVoice'
			    ] 
			});
			wx.ready(function(){
			    wx.checkJsApi({
				    jsApiList: ['onVoiceRecordEnd','translateVoice'], 
				    success: function(res) {
				       console.log(res)
				    }
				});
				var isRecording=false;
				$('h1').on('click',function(){
					if(!isRecording){
						isRecording=true
						wx.startRecord({
							cancel:function(){
								alert('那就不能搜电影了哦！')
							}
						});
						return
					}
					isRecording=false;
					wx.stopRecord({
					    success: function (res) {
					        var localId = res.localId;
					        wx.translateVoice({
							   localId: localId, 
							    isShowProgressTips: 1, 
							    success: function (res) {							    	
							        alert(res.translateResult);  
							    	var result=res.translateResult;
							    	var key=$('#key').val();
							    	$.ajax({
										type:'GET',
										url:'https://api.douban.com/v2/movie/search?q='+result,
										dataType:'jsonp',
										jsonp:"callback",
										success:function(data){
											var subject=data.subjects[0];
											$('#title').html(subject.title);
											$('#poster').html('<img src="'+subject.images.large +'"/>');
											$('#year').html(subject.year);
											$('#director').html(subject.directors[0].name)
										}
							    	})
							    }
							    
							});
					    }
					    
					});
				})
			});
		</script>
	</body>
	</html>
*/})
var createNonce=function(){
	return Math.random().toString(36).substr(2,15)
}
var createTimestamp=function(){
	return parseInt(new Date().getTime()/1000,10)+''
}
function _sign(noncestr,ticket,timestamp,url){
	var params=[
		'noncestr='+noncestr,
		'jsapi_ticket='+ticket,
		'timestamp='+timestamp,
		'url='+url
	];
	var str=params.sort().join('&');
	var shasum=crypto.createHash('sha1');
	shasum.update(str);
	return shasum.digest('hex')
}
function sign(ticket,url){
	var noncestr=createNonce();
	var timestamp=createTimestamp();
	var signature=_sign(noncestr,ticket,timestamp,url)
	console.log(url)
	return {
		noncestr:noncestr,
		timestamp:timestamp,
		signature:signature
	}
}

app.use(function* (next){
	if(this.url.indexOf('/movie')>-1){
		var wechatApi=new Wechat(config.Wechat);
		var data=yield wechatApi.fetchAccessToken();
		var access_token=data.access_token;
		var ticketData=yield wechatApi.fetchTicket(access_token);
		var ticket=ticketData.ticket;
		var url=this.href;
		var params=sign(ticket,url); 
		this.body=ejs.render(tpl,params)
		return next
	}
	yield next
})

app.use(wechat(config.Wechat));


app.listen(3000);
console.log('listening...');