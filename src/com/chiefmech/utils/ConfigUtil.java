package com.chiefmech.utils;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.quartz.utils.PropertiesParser;

public class ConfigUtil {
	private static Logger logger = Logger.getLogger(ConfigUtil.class.getName());

	private static String CONFIG_FILE = "config.properties";
	private static ConfigUtil instance = new ConfigUtil();
	private PropertiesParser cfg = null;

	private ConfigUtil() {
		initialize(CONFIG_FILE);
	}

	public static ConfigUtil getInstance() {
		return instance;
	}

	private void initialize(String filename) {
		if (cfg != null) {
			return;
		}

		Properties props = new Properties();
		String filepath = this.getClass().getClassLoader().getResource("")
				.getPath();
		logger.debug("filepath：" + filepath + " filename:" + filename);
		InputStream is = null;
		try {
			is = new FileInputStream(filepath + filename);
			props.load(is);
		} catch (IOException e) {
			logger.error("failed to load config file:" + filename, e);
		} finally {
			if (is != null) {
				try {
					is.close();
				} catch (IOException ignore) {
				}
			}
		}
		this.cfg = new PropertiesParser(props);
	}

	public String getWeixinAppID() {
		return this.cfg.getStringProperty("weixin_appid");
	}

	public String getWeixinSecret() {
		return this.cfg.getStringProperty("weixin_secret");
	}

	public String getUrlAccessTokenTpl() {
		return this.cfg.getStringProperty("url_accesstoken_tpl");
	}

	public String getWeixinAppBindToken() {
		return this.cfg.getStringProperty("weixin_bind_token");
	}
}
