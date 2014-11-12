package com.chiefmech.weixin.vo;

public class AccessToken {

	private String access_token;
	private int expires_in_sec;
	private String errcode;
	private String errmsg;

	public AccessToken(String access_token, int expires_in_sec) {
		this.access_token = access_token;
		this.expires_in_sec = expires_in_sec;
		this.errcode = "";
		this.errmsg = "";
	}

	public AccessToken(String errcode, String errmsg) {
		this.access_token = "";
		this.expires_in_sec = -1;
		this.errcode = errcode;
		this.errmsg = errmsg;
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
