package com.chiefmech.weixin.quartz;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.chiefmech.utils.FetchURL;

public class AccessTokenUpdateJob implements Job {

	@Override
	public void execute(JobExecutionContext context)
			throws JobExecutionException {
		String appid = "wx994274db1ff62572";
		String secret = "cd2ee024ac6ddda00241e727ea80cdf9";
		String url = new StringBuffer()
				.append("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=")
				.append(appid).append("&secret=").append(secret).toString();
		FetchURL fetchURL = new FetchURL();
		String json = fetchURL.fetch(url).trim();
		if (json.length() > 0) {

		}
	}

}
