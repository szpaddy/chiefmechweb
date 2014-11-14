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
import com.chiefmech.weixin.util.AccessTokenUtil;

public class WeixinMessageAction extends WeixinActionSupport {
	private static final long serialVersionUID = -4273289913797179961L;
	private static Logger logger = Logger.getLogger(AccessTokenUtil.class
			.getName());

	// http://blog.csdn.net/wangqianjiao/article/details/8469780
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
				String resultStr = String.format(textTpl, fromUsername,
						toUsername, time, msgType, contentStr);
				transmitPlainText(resultStr);
			} else {
				transmitPlainText("Input something...");
			}

		} else {
			transmitPlainText("");
		}
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

	@Override
	protected String getToken() {
		return ConfigUtil.getInstance().getWeixinAppBindToken();
	}
}
