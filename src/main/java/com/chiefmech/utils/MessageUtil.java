package com.chiefmech.utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.events.XMLEvent;

import org.apache.struts2.ServletActionContext;

public class MessageUtil {

	/**
	 * 解析微信发来的post请求（XML）
	 */
	public static Map<String, String> parseHttpRawPostData() {
		// 将解析结果存储在HashMap中
		Map<String, String> map = new HashMap<String, String>();

		// 从request中取得输入流
		InputStream inputStream = null;
		try {
			inputStream = ServletActionContext.getRequest().getInputStream();
			XMLInputFactory factory = XMLInputFactory.newInstance();
			XMLEventReader reader = factory.createXMLEventReader(inputStream);
			while (reader.hasNext()) {
				XMLEvent event = reader.nextEvent();
				if (event.isStartElement()) {
					String tagName = event.asStartElement().getName()
							.toString();
					if (!tagName.equals("xml")) {
						String text = reader.getElementText();
						map.put(tagName, text);
					}
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		} catch (XMLStreamException e) {
			e.printStackTrace();
		} finally {
			// 释放资源
			try {
				if (inputStream != null) {
					inputStream.close();
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return map;
	}

}
