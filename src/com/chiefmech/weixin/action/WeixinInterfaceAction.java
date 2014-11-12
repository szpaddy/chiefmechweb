package com.chiefmech.weixin.action;

import com.chiefmech.weixin.AccessTokenManager;
import com.chiefmech.weixin.vo.AccessToken;
import com.opensymphony.xwork2.ActionSupport;

public class WeixinInterfaceAction extends ActionSupport {

	private static final long serialVersionUID = -4273289913797179961L;

	private AccessToken accessToken;

	public String execute() throws Exception {
		accessToken = AccessTokenManager.getInstance().getAccessToken();

		return SUCCESS;
	}

	public AccessToken getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(AccessToken accessToken) {
		this.accessToken = accessToken;
	}

}
