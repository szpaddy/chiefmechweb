package com.chiefmech.weixin.action;

import com.chiefmech.utils.ConfigUtil;
import com.chiefmech.weixin.msg.BaseMsg;
import com.chiefmech.weixin.msg.req.BaseEvent;
import com.chiefmech.weixin.msg.req.ImageReqMsg;
import com.chiefmech.weixin.msg.req.LinkReqMsg;
import com.chiefmech.weixin.msg.req.LocationEvent;
import com.chiefmech.weixin.msg.req.LocationReqMsg;
import com.chiefmech.weixin.msg.req.MenuEvent;
import com.chiefmech.weixin.msg.req.QrCodeEvent;
import com.chiefmech.weixin.msg.req.TextReqMsg;
import com.chiefmech.weixin.msg.req.VideoReqMsg;
import com.chiefmech.weixin.msg.req.VoiceReqMsg;

@SuppressWarnings("serial")
public class SimpleWeixinActionSupport extends WeixinActionSupport {

	/**
	 * 回应用户发送的文本消息
	 * 
	 * @param content
	 *            用户发送的消息
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onTextMsgReceived(String content) {
		return null;
	}

	/**
	 * 回应用户发送的图片消息
	 * 
	 * @param mediaId
	 *            图片消息媒体id
	 * @param picUrl
	 *            图片链接
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onImageReceived(String mediaId, String picUrl) {
		return null;
	}

	/**
	 * 回应用户发送的语音消息
	 * 
	 * @param mediaId
	 *            语音消息媒体id
	 * @param format
	 *            语音格式
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onVoiceReceived(String mediaId, String format) {
		return null;
	}

	/**
	 * 回应用户发送的视频消息
	 * 
	 * @param mediaId
	 *            视频消息媒体id
	 * @param thumbMediaId
	 *            视频消息缩略图的媒体id
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onVideoReceived(String mediaId, String thumbMediaId) {
		return null;
	}

	/**
	 * 回应用户发送的地理位置消息
	 * 
	 * @param locationX
	 *            纬度
	 * @param locationY
	 *            经度
	 * @param scale
	 *            地图缩放大小
	 * @param label
	 *            地理位置信息
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onLocationReceived(double locationX, double locationY,
			int scale, String label) {
		return null;
	}

	/**
	 * 上报地理位置事件
	 * 
	 * @param latitude
	 *            纬度
	 * @param longitude
	 *            经度
	 * @param precision
	 *            地理位置精度
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onLocationReport(double latitude, double longitude,
			double precision) {
		return null;
	}

	/**
	 * 回应用户发送的链接消息
	 * 
	 * @param title
	 *            消息标题
	 * @param description
	 *            消息描述
	 * @param url
	 *            消息链接
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onLinkReceived(String title, String description,
			String url) {
		return null;
	}

	/**
	 * 回应菜单点击事件
	 * 
	 * @param eventKey
	 *            事件KEY值，与自定义菜单接口中KEY值对应
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onMenuClick(String eventKey) {
		return null;
	}

	/**
	 * 回应菜单显示网页事件
	 * 
	 * @param eventKey
	 *            事件KEY值，与自定义菜单接口中KEY值对应
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onMenuView(String eventKey) {
		return null;
	}

	/**
	 * 回应扫描带参数二维码事件
	 * 
	 * @param eventKey
	 *            事件KEY值
	 * @param ticket
	 *            二维码的ticket，可用来换取二维码图片
	 * @return 回应用户的消息
	 */
	protected BaseMsg onQrCodeEvent(String eventKey, String ticket) {
		return null;
	}

	/**
	 * 订阅事件
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onSubscribe() {
		return null;
	}

	/**
	 * 取消订阅事件
	 * 
	 * @return 回应用户的消息
	 */
	protected BaseMsg onUnsubscribe() {
		return null;
	}

	@Override
	protected final BaseMsg handleTextMsg(TextReqMsg msg) {
		return onTextMsgReceived(msg.getContent());
	}

	@Override
	protected final BaseMsg handleImageMsg(ImageReqMsg msg) {
		return onImageReceived(msg.getMediaId(), msg.getPicUrl());
	}

	@Override
	protected final BaseMsg handleVoiceMsg(VoiceReqMsg msg) {
		return onVoiceReceived(msg.getMediaId(), msg.getFormat());
	}

	@Override
	protected final BaseMsg handleVideoMsg(VideoReqMsg msg) {
		return onVideoReceived(msg.getMediaId(), msg.getThumbMediaId());
	}

	@Override
	protected final BaseMsg handleLocationMsg(LocationReqMsg msg) {
		return onLocationReceived(msg.getLocationX(), msg.getLocationY(),
				msg.getScale(), msg.getLabel());
	}

	@Override
	protected BaseMsg handleMenuClickEvent(MenuEvent event) {
		return onMenuClick(event.getEventKey());
	}

	@Override
	protected final BaseMsg handleLinkMsg(LinkReqMsg msg) {
		return onLinkReceived(msg.getTitle(), msg.getDescription(),
				msg.getUrl());
	}

	@Override
	protected final BaseMsg handleQrCodeEvent(QrCodeEvent event) {
		return onQrCodeEvent(event.getEventKey(), event.getTicket());
	}

	@Override
	protected final BaseMsg handleLocationEvent(LocationEvent event) {
		return onLocationReport(event.getLatitude(), event.getLongitude(),
				event.getPrecision());
	}

	@Override
	protected final BaseMsg handleMenuViewEvent(MenuEvent event) {
		return onMenuView(event.getEventKey());
	}

	@Override
	protected final BaseMsg handleSubscribe(BaseEvent event) {
		return onSubscribe();
	}

	@Override
	protected final BaseMsg handleUnsubscribe(BaseEvent event) {
		return onUnsubscribe();
	}

	@Override
	protected String getToken() {
		return ConfigUtil.getInstance().getWeixinAppBindToken();
	}
}
