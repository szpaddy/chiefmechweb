package com.chiefmech.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

import com.chiefmech.weixin.quartz.AccessTokenUpdateJob;

public class QuartzSchedulerListener implements ServletContextListener {

	@Override
	public void contextDestroyed(ServletContextEvent arg0) {

	}

	@Override
	public void contextInitialized(ServletContextEvent arg0) {
		JobDetail job = JobBuilder.newJob(AccessTokenUpdateJob.class)
				.withIdentity("Job_AccessTokenUpdate", "group_weixin").build();
		try {
			Trigger trigger = TriggerBuilder
					.newTrigger()
					.withIdentity("Trigger_AccessTokenUpdate", "group_weixin")
					.withSchedule(
							CronScheduleBuilder.cronSchedule("0/10 * * * * ?"))
					.build();

			Scheduler scheduler = new StdSchedulerFactory().getScheduler();
			scheduler.start();
			scheduler.scheduleJob(job, trigger);
		} catch (SchedulerException e) {
			e.printStackTrace();
		}
	}

}
