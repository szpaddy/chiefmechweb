package com.chiefmech.weixin.util;

import org.apache.log4j.Logger;

import com.chiefmech.weixin.vo.AccessToken;

public class AccessTokenUtil {
	private static Logger logger = Logger.getLogger(AccessTokenUtil.class
			.getName());

	private static AccessTokenUtil instance = new AccessTokenUtil();

	private AccessToken access_token;

	private AccessTokenUtil() {

	}

	public static AccessTokenUtil getInstance() {
		return instance;
	}

	public AccessToken getAccessToken() {
		return access_token;
	}

	public void updateAccessToken(AccessToken new_access_token) {
		logger.info("new_access_token:" + new_access_token);
		access_token = new_access_token;
	}

}
