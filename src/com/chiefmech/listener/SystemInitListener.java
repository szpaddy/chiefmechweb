package com.chiefmech.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.log4j.Logger;
import org.quartz.JobExecutionException;

import com.chiefmech.utils.ConfigUtil;
import com.chiefmech.weixin.quartz.AccessTokenUpdateJob;

public class SystemInitListener implements ServletContextListener {
	private static Logger logger = Logger.getLogger(SystemInitListener.class
			.getName());

	@Override
	public void contextDestroyed(ServletContextEvent arg0) {

	}

	@Override
	public void contextInitialized(ServletContextEvent arg0) {
		logger.info("SystemInitListener is invoked");
		// do not check the quartz version
		System.setProperty("org.terracotta.quartz.skipUpdateCheck", "true");

		// init the access_token
		try {
			new AccessTokenUpdateJob().execute(null);
		} catch (JobExecutionException e) {
			logger.error(
					"exception when init access_token in SystemInitListener", e);
		}
	}

}
