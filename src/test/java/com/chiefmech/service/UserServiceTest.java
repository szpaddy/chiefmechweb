package com.chiefmech.service;

import junit.framework.TestCase;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.chiefmech.service.UserService;

public class UserServiceTest extends TestCase {

	public void testUserService() {
		ApplicationContext context = new ClassPathXmlApplicationContext(
				"applicationContext.xml");
		UserService userService = (UserService) context.getBean("userService");
		assertEquals(userService.countAll(), 5);
	}
}
