package com.chiefmech.weixin.action;

import org.apache.log4j.Logger;

import com.chiefmech.common.action.ajax.AjaxActionSupport;
import com.chiefmech.weixin.AccessTokenManager;

public class WeixinMessageAction extends AjaxActionSupport {
	private static final long serialVersionUID = -4273289913797179961L;
	private static Logger logger = Logger.getLogger(AccessTokenManager.class
			.getName());

	private String signature = null;
	private String echostr = null;
	private String timestamp = null;
	private String nonce = null;
	private String HTTP_RAW_POST_DATA = null;

	@Override
	protected void handleAjaxRequest() {
		logger.info("echostr:" + echostr + "   HTTP_RAW_POST_DATA:"
				+ HTTP_RAW_POST_DATA);
		if (this.echostr != null) {
			bindVerify();
		} else {

		}
	}

	/**
	 * 网址接入验证
	 * 
	 * 公众平台用户提交信息后，微信服务器将发送GET请求到填写的URL上，并且带上四个参数： 参数 描述 signature 微信加密签名
	 * timestamp 时间戳 nonce 随机数 echostr 随机字符串。 开发者通过检验signature对请求进行校验（下面有校验方式）。
	 * 
	 * @return 若确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效，否则接入失败。
	 */
	private void bindVerify() {
		// TBD later
		transmitPlainText(this.echostr);
	}

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

	public String getHTTP_RAW_POST_DATA() {
		return HTTP_RAW_POST_DATA;
	}

	public void setHTTP_RAW_POST_DATA(String hTTP_RAW_POST_DATA) {
		HTTP_RAW_POST_DATA = hTTP_RAW_POST_DATA;
	}

}
