package com.chiefmech.weixin;

import org.apache.log4j.Logger;

import com.chiefmech.weixin.vo.AccessToken;

public class AccessTokenManager {
	private static Logger logger = Logger.getLogger(AccessTokenManager.class
			.getName());

	private static AccessTokenManager manager = new AccessTokenManager();

	private AccessToken access_token;

	private AccessTokenManager() {

	}

	public static AccessTokenManager getInstance() {
		return manager;
	}

	public AccessToken getAccessToken() {
		return access_token;
	}

	public void updateAccessToken(AccessToken new_access_token) {
		logger.info("new_access_token:" + new_access_token);
		access_token = new_access_token;
	}

}
