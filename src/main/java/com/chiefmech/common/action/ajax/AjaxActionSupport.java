package com.chiefmech.common.action.ajax;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionSupport;

@SuppressWarnings("serial")
public abstract class AjaxActionSupport extends ActionSupport {
	private static Logger logger = Logger.getLogger(AjaxActionSupport.class
			.getName());

	public String execute() throws Exception {
		handleAjaxRequest();
		return null;
	}

	/**
	 * handle ajax request and output related response
	 */
	protected abstract void handleAjaxRequest();

	protected void transmitXML(String xmlStr) {
		transmitText(xmlStr, "application/xml");
	}

	protected void transmitPlainText(String plainText) {
		transmitText(plainText, "text/plain");
	}

	protected void transmitJson(String jsonStr) {
		transmitText(jsonStr, "application/json");
	}

	private void transmitText(String text, String contentType) {
		HttpServletResponse response = ServletActionContext.getResponse();
		response.setContentType(String.format("%s;charset=utf-8", contentType));
		response.setHeader("Cache-control", "no-cache");
		response.setHeader("pragma", "no-cache");

		PrintWriter out;
		try {
			out = response.getWriter();
			out.write(text);
			out.flush();
			out.close();
		} catch (IOException e) {
			logger.fatal(
					"IOException when output ajax data, check if first to make ajax works",
					e);
		}
	}
}