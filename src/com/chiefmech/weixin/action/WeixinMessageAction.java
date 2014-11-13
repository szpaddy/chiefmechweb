package com.chiefmech.weixin.action;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Date;

import javax.servlet.ServletInputStream;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import com.chiefmech.common.action.ajax.AjaxActionSupport;
import com.chiefmech.utils.ConfigUtil;
import com.chiefmech.weixin.AccessTokenManager;

public class WeixinMessageAction extends AjaxActionSupport {
	private static final long serialVersionUID = -4273289913797179961L;
	private static Logger logger = Logger.getLogger(AccessTokenManager.class
			.getName());

	private String signature = null;
	private String echostr = null;
	private String timestamp = null;
	private String nonce = null;
	private String token = ConfigUtil.getInstance().getWeixinAppBindToken();

	@Override
	protected void handleAjaxRequest() {
		if (null == echostr || echostr.isEmpty()) {
			responseMsg();
		} else {
			String echoMsg = "checkSignature failed";
			if (this.checkSignature()) {
				echoMsg = this.echostr;
			}
			transmitPlainText(echoMsg);
		}
	}
	
	//http://blog.csdn.net/wangqianjiao/article/details/8469780
	private void responseMsg() {
		String postStr = getHttpRawPostData();
		logger.info("HttpRawPostData:" + postStr);
		if (null != postStr && !postStr.isEmpty()) {
			Document document = null;
			try {
				document = DocumentHelper.parseText(postStr);
			} catch (Exception e) {
				logger.error("failed to parse HttpRawPostData");
			}
			if (null == document) {
				transmitPlainText("");
				return;
			}

			Element root = document.getRootElement();
			String fromUsername = root.elementText("FromUserName");
			String toUsername = root.elementText("ToUserName");
			String keyword = root.elementTextTrim("Content");
			String time = new Date().getTime() + "";
			String textTpl = "<xml>"
					+ "<ToUserName><![CDATA[%1$s]]></ToUserName>"
					+ "<FromUserName><![CDATA[%2$s]]></FromUserName>"
					+ "<CreateTime>%3$s</CreateTime>"
					+ "<MsgType><![CDATA[%4$s]]></MsgType>"
					+ "<Content><![CDATA[%5$s]]></Content>"
					+ "<FuncFlag>0</FuncFlag>" + "</xml>";

			if (null != keyword && !keyword.equals("")) {
				String msgType = "text";
				String contentStr = "Welcome to wechat world!";
				String resultStr = textTpl.format(textTpl, fromUsername,
						toUsername, time, msgType, contentStr);
				transmitPlainText(resultStr);
			} else {
				transmitPlainText("Input something...");
			}

		} else {
			transmitPlainText("");
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
	private boolean checkSignature() {
		boolean isSignatureValid = false;
		if (token != null && timestamp != null && nonce != null
				&& signature != null) {
			logger.debug(String.format(
					"token=%s timestamp=%s nonce=%s signature=%s", token,
					timestamp, nonce, signature));

			String[] strAry = { token, timestamp, nonce };
			Arrays.sort(strAry);

			StringBuffer bf = new StringBuffer();
			for (int i = 0; i < strAry.length; i++) {
				bf.append(strAry[i]);
			}
			byte[] rowbytes = bf.toString().getBytes();

			try {
				MessageDigest md = MessageDigest.getInstance("SHA-1");
				byte[] sh1bytes = md.digest(rowbytes);

				StringBuffer formatBuf = new StringBuffer(sh1bytes.length * 2);
				for (int i = 0; i < sh1bytes.length; i++) {
					if (((int) sh1bytes[i] & 0xff) < 0x10) {
						formatBuf.append("0");
					}
					formatBuf.append(Long
							.toString((int) sh1bytes[i] & 0xff, 16));
				}

				if (formatBuf.toString().toUpperCase()
						.equalsIgnoreCase(signature)) {
					isSignatureValid = true;
				}
			} catch (Exception e) {
				logger.error("exception when checkSignature", e);
			}
		}
		return isSignatureValid;
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

	// 从输入流读取post参数
	public String getHttpRawPostData() {
		StringBuilder buffer = new StringBuilder();
		BufferedReader reader = null;
		try {
			ServletInputStream in = ServletActionContext.getRequest()
					.getInputStream();
			reader = new BufferedReader(new InputStreamReader(in));
			String line = null;
			while ((line = reader.readLine()) != null) {
				buffer.append(line);
			}
		} catch (Exception e) {
			logger.fatal(
					"Exception when read http raw post data, fix it first", e);
		} finally {
			if (null != reader) {
				try {
					reader.close();
				} catch (IOException e) {
				}
			}
		}
		return buffer.toString();
	}
}
