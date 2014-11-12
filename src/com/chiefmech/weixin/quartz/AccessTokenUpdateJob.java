package com.chiefmech.weixin.quartz;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.chiefmech.utils.ConfigUtil;
import com.chiefmech.utils.FetchURL;
import com.chiefmech.weixin.AccessTokenManager;
import com.chiefmech.weixin.vo.AccessToken;

/**
 * access_token是公众号的全局唯一票据，公众号调用各接口时都需使用access_token。正常情况下access_token有效期为7200秒，
 * 重复获取将导致上次获取的access_token失效
 * 。由于获取access_token的api调用次数非常有限，建议开发者全局存储与更新access_token
 * ，频繁刷新access_token会导致api调用受限，影响自身业务。
 *
 */
public class AccessTokenUpdateJob implements Job {
	private static Logger logger = Logger.getLogger(AccessTokenUpdateJob.class
			.getName());

	public void execute(JobExecutionContext context)
			throws JobExecutionException {
		ConfigUtil configUtil = ConfigUtil.getInstance();
		String url_accesstoken_tpl = configUtil.getUrlAccessTokenTpl();
		String appid = configUtil.getWeixinAppID();
		String secret = configUtil.getWeixinSecret();
		if (url_accesstoken_tpl == null) {
			logger.fatal("failed to load confg file, please fix this issue first");
		}

		String url = String.format(url_accesstoken_tpl, appid, secret);
		FetchURL fetchURL = new FetchURL();
		//String jsonStr = fetchURL.fetch(url).trim();
		String jsonStr = "{\"access_token\":\"5lzhC48v16-6DRyU2KByhQq-y4nNcZ1BzLuh9jzRFGjqMFBe0xAYaOKe87hSKZaV1sX-Z6rHpZZ02mJli-K6eVTkE9qf_v_D31HDNBPfAuA\",\"expires_in\":7200}";
		logger.info(jsonStr);
		if (jsonStr.length() > 0) {
			JSONObject jsonObj = JSONObject.fromObject(jsonStr);
			AccessToken accessToken = new AccessToken(
					(String) jsonObj.getOrDefault("access_token", ""),
					(int) jsonObj.getOrDefault("expires_in", "-1"),
					(String) jsonObj.getOrDefault("errcode", ""),
					(String) jsonObj.getOrDefault("errmsg", ""));
			if (accessToken.isValid()) {
				AccessTokenManager.getInstance().updateAccessToken(accessToken);
			} else {
				logger.error("Failed to get valid access_token json string");
			}
		}
	}

	/**
	 * for purpose of quartz test, avoid to invoke access_token interface
	 * frequently
	 */
	public void execute2(JobExecutionContext context) {
		logger.info("AccessTokenUpdateJob：" + System.currentTimeMillis());
	}

}
