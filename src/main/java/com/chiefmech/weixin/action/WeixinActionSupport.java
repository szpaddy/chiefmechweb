package com.chiefmech.weixin.action;

import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.chiefmech.common.action.ajax.AjaxActionSupport;
import com.chiefmech.weixin.msg.BaseMsg;
import com.chiefmech.weixin.msg.req.BaseEvent;
import com.chiefmech.weixin.msg.req.BaseReq;
import com.chiefmech.weixin.msg.req.BaseReqMsg;
import com.chiefmech.weixin.msg.req.EventType;
import com.chiefmech.weixin.msg.req.ImageReqMsg;
import com.chiefmech.weixin.msg.req.LinkReqMsg;
import com.chiefmech.weixin.msg.req.LocationEvent;
import com.chiefmech.weixin.msg.req.LocationReqMsg;
import com.chiefmech.weixin.msg.req.MenuEvent;
import com.chiefmech.weixin.msg.req.QrCodeEvent;
import com.chiefmech.weixin.msg.req.ReqType;
import com.chiefmech.weixin.msg.req.TextReqMsg;
import com.chiefmech.weixin.msg.req.VideoReqMsg;
import com.chiefmech.weixin.msg.req.VoiceReqMsg;
import com.chiefmech.weixin.util.MessageUtil;
import com.chiefmech.weixin.util.SignUtil;

@SuppressWarnings("serial")
public abstract class WeixinActionSupport extends AjaxActionSupport {
	protected String signature = null;
	protected String echostr = null;
	protected String timestamp = null;
	protected String nonce = null;

	@Override
	public void handleAjaxRequest() {
		// 回复空串是微信的规定，代表不回复
		String responseStr = "";
		if (SignUtil.checkSignature(getToken(), signature, timestamp, nonce)) {
			if (StringUtils.isNotEmpty(this.echostr)) {
				// 绑定URL时确认请求来自微信服务器
				responseStr = this.echostr;
			} else {
				// 处理post请求
				responseStr = processPostRequest();
			}
		} else {
			responseStr = "the request signature is invalid";
		}

		this.transmitPlainText(responseStr);
	}

	private String processPostRequest() {
		Map<String, String> reqMap = MessageUtil.parseHttpRawPostData();
		String fromUserName = reqMap.get("FromUserName");
		String toUserName = reqMap.get("ToUserName");
		String msgType = reqMap.get("MsgType");

		BaseMsg msg = null;// 要发送的消息

		// 事件推送
		if (msgType.equals(ReqType.EVENT)) {
			// 事件类型
			String eventType = reqMap.get("Event");

			// 二维码事件
			String ticket = reqMap.get("Ticket");
			if (ticket != null) {
				String eventKey = reqMap.get("EventKey");
				QrCodeEvent event = new QrCodeEvent(eventKey, ticket);
				buildBasicEvent(reqMap, event);
				msg = handleQrCodeEvent(event);
			}
			// 订阅
			if (eventType.equals(EventType.SUBSCRIBE)) {
				BaseEvent event = new BaseEvent();
				buildBasicEvent(reqMap, event);
				msg = handleSubscribe(event);
			}
			// 取消订阅
			else if (eventType.equals(EventType.UNSUBSCRIBE)) {
				BaseEvent event = new BaseEvent();
				buildBasicEvent(reqMap, event);
				msg = handleUnsubscribe(event);
			}
			// 点击菜单拉取消息时的事件推送
			else if (eventType.equals(EventType.CLICK)) {
				String eventKey = reqMap.get("EventKey");
				MenuEvent event = new MenuEvent(eventKey);
				buildBasicEvent(reqMap, event);
				msg = handleMenuClickEvent(event);
			}
			// 点击菜单跳转链接时的事件推送
			else if (eventType.equals(EventType.VIEW)) {
				String eventKey = reqMap.get("EventKey");
				MenuEvent event = new MenuEvent(eventKey);
				buildBasicEvent(reqMap, event);
				msg = handleMenuViewEvent(event);
			}
			// 上报地理位置事件
			else if (eventType.equals(EventType.LOCATION)) {
				double latitude = Double.parseDouble(reqMap.get("Latitude"));
				double longitude = Double.parseDouble(reqMap.get("Longitude"));
				double precision = Double.parseDouble(reqMap.get("Precision"));
				LocationEvent event = new LocationEvent(latitude, longitude,
						precision);
				buildBasicEvent(reqMap, event);
				msg = handleLocationEvent(event);
			}

		} else {// 接受普通消息

			// 文本消息
			if (msgType.equals(ReqType.TEXT)) {
				String content = reqMap.get("Content");
				TextReqMsg textReqMsg = new TextReqMsg(content);
				buildBasicReqMsg(reqMap, textReqMsg);
				msg = handleTextMsg(textReqMsg);
			}
			// 图片消息
			else if (msgType.equals(ReqType.IMAGE)) {
				String picUrl = reqMap.get("PicUrl");
				String mediaId = reqMap.get("MediaId");
				ImageReqMsg imageReqMsg = new ImageReqMsg(picUrl, mediaId);
				buildBasicReqMsg(reqMap, imageReqMsg);
				msg = handleImageMsg(imageReqMsg);
			}
			// 音频消息
			else if (msgType.equals(ReqType.VOICE)) {
				String format = reqMap.get("Format");
				String mediaId = reqMap.get("MediaId");
				String recognition = reqMap.get("Recognition");
				VoiceReqMsg voiceReqMsg = new VoiceReqMsg(mediaId, format,
						recognition);
				buildBasicReqMsg(reqMap, voiceReqMsg);
				msg = handleVoiceMsg(voiceReqMsg);
			}
			// 视频消息
			else if (msgType.equals(ReqType.VIDEO)) {
				String thumbMediaId = reqMap.get("ThumbMediaId");
				String mediaId = reqMap.get("MediaId");
				VideoReqMsg videoReqMsg = new VideoReqMsg(mediaId, thumbMediaId);
				buildBasicReqMsg(reqMap, videoReqMsg);
				msg = handleVideoMsg(videoReqMsg);
			}
			// 地理位置消息
			else if (msgType.equals(ReqType.LOCATION)) {
				double locationX = Double.parseDouble(reqMap.get("Location_X"));
				double locationY = Double.parseDouble(reqMap.get("Location_Y"));
				int scale = Integer.parseInt(reqMap.get("Scale"));
				String label = reqMap.get("Label");
				LocationReqMsg locationReqMsg = new LocationReqMsg(locationX,
						locationY, scale, label);
				buildBasicReqMsg(reqMap, locationReqMsg);
				msg = handleLocationMsg(locationReqMsg);
			}
			// 链接消息
			else if (msgType.equals(ReqType.LINK)) {
				String title = reqMap.get("Title");
				String description = reqMap.get("Description");
				String url = reqMap.get("Url");
				LinkReqMsg linkReqMsg = new LinkReqMsg(title, description, url);
				buildBasicReqMsg(reqMap, linkReqMsg);
				msg = handleLinkMsg(linkReqMsg);
			}

		}

		if (msg == null) {
			// 回复空串是微信的规定，代表不回复
			return "";
		} else {
			msg.setFromUserName(toUserName);
			msg.setToUserName(fromUserName);
			return msg.toXml();
		}
	}

	/**
	 * 为事件普通消息对象添加基本参数<br>
	 * 参数包括：MsgId、MsgType、FromUserName、ToUserName和CreateTime
	 */
	private void buildBasicReqMsg(Map<String, String> reqMap, BaseReqMsg reqMsg) {
		addBasicReqParams(reqMap, reqMsg);
		reqMsg.setMsgId(reqMap.get("MsgId"));
	}

	/**
	 * 为事件推送对象添加基本参数<br>
	 * 参数包括：Event、MsgType、FromUserName、ToUserName和CreateTime
	 */
	private void buildBasicEvent(Map<String, String> reqMap, BaseEvent event) {
		addBasicReqParams(reqMap, event);
		event.setEvent(reqMap.get("Event"));
	}

	/**
	 * 为请求对象添加基本参数，包括MsgType、FromUserName、ToUserName和CreateTime<br>
	 * 请求对象包括普通消息和事件推送
	 */
	private void addBasicReqParams(Map<String, String> reqMap, BaseReq req) {
		req.setMsgType(reqMap.get("MsgType"));
		req.setFromUserName(reqMap.get("FromUserName"));
		req.setToUserName(reqMap.get("ToUserName"));
		req.setCreateTime(Long.parseLong(reqMap.get("CreateTime")));
	}

	/**
	 * 处理文本消息
	 */
	protected abstract BaseMsg handleTextMsg(TextReqMsg msg);

	/**
	 * 处理图片消息
	 */
	protected abstract BaseMsg handleImageMsg(ImageReqMsg msg);

	/**
	 * 处理语音消息
	 */
	protected abstract BaseMsg handleVoiceMsg(VoiceReqMsg msg);

	/**
	 * 处理视频消息
	 */
	protected abstract BaseMsg handleVideoMsg(VideoReqMsg msg);

	/**
	 * 处理地理位置消息
	 */
	protected abstract BaseMsg handleLocationMsg(LocationReqMsg msg);

	/**
	 * 处理链接消息
	 */
	protected abstract BaseMsg handleLinkMsg(LinkReqMsg msg);

	/**
	 * 处理扫描带参数二维码事件
	 */
	protected abstract BaseMsg handleQrCodeEvent(QrCodeEvent event);

	/**
	 * 处理上报地理位置事件
	 */
	protected abstract BaseMsg handleLocationEvent(LocationEvent event);

	/**
	 * 处理点击菜单拉取消息时的事件推送
	 */
	protected abstract BaseMsg handleMenuClickEvent(MenuEvent event);

	/**
	 * 处理点击菜单跳转链接时的事件推送
	 */
	protected abstract BaseMsg handleMenuViewEvent(MenuEvent event);

	/**
	 * 处理订阅事件<br>
	 * 默认不回复
	 */
	protected abstract BaseMsg handleSubscribe(BaseEvent event);

	/**
	 * 处理取消订阅事件<br>
	 * 默认不回复
	 */
	protected abstract BaseMsg handleUnsubscribe(BaseEvent event);

	protected abstract String getToken();

	public String getEchostr() {
		return echostr;
	}

	public void setEchostr(String echostr) {
		this.echostr = echostr;
	}

	public String getSignature() {
		return signature;
	}

	public void setSignature(String signature) {
		this.signature = signature;
	}

	public String getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public String getNonce() {
		return nonce;
	}

	public void setNonce(String nonce) {
		this.nonce = nonce;
	}
}
