package com.chiefmech.weixin.action;

import org.apache.log4j.Logger;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Namespace;

import com.chiefmech.weixin.msg.BaseMsg;
import com.chiefmech.weixin.util.MessageFactory;

@SuppressWarnings("serial")
@Namespace("/weixin")
public class WeixinMessageAction extends SimpleWeixinActionSupport {
	private static Logger logger = Logger.getLogger(WeixinMessageAction.class
			.getName());

	@Override
	@Action("message")
	public void handleAjaxRequest() {
		super.handleAjaxRequest();
	}

	protected BaseMsg onTextMsgReceived(String content) {
		return MessageFactory.createTextMsg("onTextMsgReceived-->" + content);
	}

	protected BaseMsg onImageReceived(String mediaId, String picUrl) {
		return MessageFactory.createTextMsg("onImageReceived-->" + mediaId
				+ "-" + picUrl);
	}

	protected BaseMsg onVoiceReceived(String mediaId, String format) {
		return MessageFactory.createTextMsg("onVoiceReceived-->" + mediaId
				+ "-" + format);
	}

	protected BaseMsg onVideoReceived(String mediaId, String thumbMediaId) {
		return MessageFactory.createTextMsg("onVideoReceived-->" + mediaId
				+ "-" + thumbMediaId);
	}

	protected BaseMsg onLocationReceived(double locationX, double locationY,
			int scale, String label) {
		return MessageFactory.createTextMsg("onLocationReceived-->" + locationX
				+ "-" + locationY + "-" + scale + "-" + label);
	}

	protected BaseMsg onLocationReport(double latitude, double longitude,
			double precision) {
		return MessageFactory.createTextMsg("onLocationReport-->" + latitude
				+ "-" + longitude + "-" + precision);
	}

	protected BaseMsg onLinkReceived(String title, String description,
			String url) {
		return MessageFactory.createTextMsg("onLinkReceived-->" + title + "-"
				+ description + "-" + url);
	}

	protected BaseMsg onMenuClick(String eventKey) {
		return MessageFactory.createTextMsg("onMenuClick-->" + eventKey);
	}

	protected BaseMsg onMenuView(String eventKey) {
		return MessageFactory.createTextMsg("onMenuView-->" + eventKey);
	}

	protected BaseMsg onQrCodeEvent(String eventKey, String ticket) {
		return MessageFactory.createTextMsg("onQrCodeEvent-->" + eventKey + "-"
				+ ticket);
	}

	protected BaseMsg onSubscribe() {
		return MessageFactory.createTextMsg("onSubscribe-->");
	}

	protected BaseMsg onUnsubscribe() {
		return MessageFactory.createTextMsg("onUnsubscribe-->");
	}
}
