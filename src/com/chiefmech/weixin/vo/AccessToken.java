package com.chiefmech.weixin.vo;

public class AccessToken {

	private String access_token;
	private int expires_in_sec;
	private String errcode;
	private String errmsg;

	public AccessToken(String access_token, int expires_in_sec, String errcode,
			String errmsg) {
		this.access_token = access_token;
		this.expires_in_sec = expires_in_sec;
		this.errcode = errcode;
		this.errmsg = errmsg;
	}

	/**
	 * 正常情况下，微信会返回下述JSON数据包给公众号：
	 * {"access_token":"ACCESS_TOKEN","expires_in":7200}
	 * 错误时微信会返回错误码等信息，JSON数据包示例如下（该示例为AppID无效错误）:
	 * {"errcode":40013,"errmsg":"invalid appid"}
	 * 
	 * @return true if correct json data is return
	 */
	public boolean isValid() {
		return (access_token.length() == 0 && expires_in_sec == -1
				&& errcode.length() > 0 && errmsg.length() > 0)
				|| (access_token.length() > 0 && expires_in_sec != -1
						&& errcode.length() == 0 && errmsg.length() == 0);
	}

	public String getAccess_token() {
		return access_token;
	}

	public void setAccess_token(String access_token) {
		this.access_token = access_token;
	}

	public int getExpires_in_sec() {
		return expires_in_sec;
	}

	public void setExpires_in_sec(int expires_in_sec) {
		this.expires_in_sec = expires_in_sec;
	}

	public String getErrcode() {
		return errcode;
	}

	public void setErrcode(String errcode) {
		this.errcode = errcode;
	}

	public String getErrmsg() {
		return errmsg;
	}

	public void setErrmsg(String errmsg) {
		this.errmsg = errmsg;
	}

	@Override
	public String toString() {
		return "AccessToken [access_token=" + access_token
				+ ", expires_in_sec=" + expires_in_sec + ", errcode=" + errcode
				+ ", errmsg=" + errmsg + "]";
	}

}
