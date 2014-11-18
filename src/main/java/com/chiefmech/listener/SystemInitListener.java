package com.chiefmech.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.log4j.Logger;

import com.chiefmech.quartz.AccessTokenUpdateJob;

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

		logger.info("try to initialize access_token");
		new AccessTokenUpdateJob().execute();
	}

}
