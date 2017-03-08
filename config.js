'use strict'

var path=require('path');
var wechat_file=path.join(__dirname,'./config/wechat.txt');
var wechat_ticket_file=path.join(__dirname,'./config/wechat_ticket.txt');
var util=require('./libs/util.js')

var config = {
	Wechat:{
		appID:"wx90041ac7c6644ccb",
		appSecret:"cc2672e805f6556693b11430814c3953",
		token:"csdefirstwxgzh",
		getAccessToken:function(){
			return util.readFileAsync(wechat_file);
		},
		saveAccessToken:function(data){
			data=JSON.stringify(data)
			return util.writeFileAsync(wechat_file,data);
		},
		getTicket:function(){
			return util.readFileAsync(wechat_ticket_file);
		},
		saveTicket:function(data){
			data=JSON.stringify(data)
			return util.writeFileAsync(wechat_ticket_file,data);
		}
	}
};
module.exports=config;