package com.chiefmech.weixin.quartz;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.chiefmech.utils.FetchURL;
import com.chiefmech.weixin.vo.AccessToken;

public class AccessTokenUpdateJob implements Job {
	private static Logger logger = Logger.getLogger(AccessTokenUpdateJob.class
			.getName());

	@Override
	public void execute(JobExecutionContext context)
			throws JobExecutionException {
		String appid = "wx994274db1ff62572";
		String secret = "cd2ee024ac6ddda00241e727ea80cdf9";
		String url = new StringBuffer()
				.append("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=")
				.append(appid).append("&secret=").append(secret).toString();
		FetchURL fetchURL = new FetchURL();
		String jsonStr = fetchURL.fetch(url).trim();
		logger.debug("access_token:" + jsonStr);
		if (jsonStr.length() > 0) {
			AccessToken access_token = new AccessToken();
			JSONObject jsonObject = JSONObject.fromObject(jsonStr);
			jsonObject.getString("");
		}
	}

}
