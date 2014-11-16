package com.chiefmech.common.action.user;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import com.chiefmech.service.UserService;
import com.chiefmech.vo.User;
import com.opensymphony.xwork2.ActionSupport;

@SuppressWarnings("serial")
public class UserAction extends ActionSupport implements
		ApplicationContextAware {
	private static Logger logger = Logger.getLogger(UserAction.class.getName());

	private UserService userService;

	private int userCount = 0;

	private List<User> userLst;

	private User user;

	public String execute() throws Exception {
		userCount = userService.countAll();
		userLst = userService.selectAll();
		user = userService.queryUser(8);
		return SUCCESS;
	}

	@Override
	public void setApplicationContext(ApplicationContext context)
			throws BeansException {
		userService = (UserService) context.getBean("userService");
	}

	public int getUserCount() {
		return userCount;
	}

	public void setUserCount(int userCount) {
		this.userCount = userCount;
	}

	public List<User> getUserLst() {
		return userLst;
	}

	public void setUserLst(List<User> userLst) {
		this.userLst = userLst;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

}