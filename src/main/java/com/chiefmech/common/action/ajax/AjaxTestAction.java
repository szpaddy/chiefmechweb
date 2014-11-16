package com.chiefmech.common.action.ajax;

import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Namespace;

@SuppressWarnings("serial")
@Namespace("/ajax")
public class AjaxTestAction extends AjaxActionSupport {
	private String username;

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	@Action("AjaxTest")
	public void handleAjaxRequest() {
		String id = "1";
		String age = "25";
		if ("zhangsan".equals(this.username)) {
			id = "2";
			age = "26";
		}

		String resTpl = new StringBuilder().append("<xml>")
				.append("<id><![CDATA[%s]]></id>")
				.append("<username><![CDATA[%s]]></username>")
				.append("<age><![CDATA[%s]]></age>").append("</xml>")
				.toString();

		transmitXML(String.format(resTpl, id, username, age));
	}

}