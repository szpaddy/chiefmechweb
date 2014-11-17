package com.chiefmech.action.user;

import java.util.List;

import org.apache.log4j.Logger;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.Actions;
import org.apache.struts2.convention.annotation.ExceptionMapping;
import org.apache.struts2.convention.annotation.ExceptionMappings;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.InterceptorRefs;
import org.apache.struts2.convention.annotation.Namespace;
import org.apache.struts2.convention.annotation.Result;
import org.apache.struts2.convention.annotation.Results;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import com.chiefmech.service.UserService;
import com.chiefmech.vo.User;
import com.opensymphony.xwork2.ActionSupport;

/**
 * <pre>
 * Namespace
 * 在Action中定义的@Namespace会应用在该Action中所有的相对url上
 * 
 * ParentPackage 
 * 用在Action上，用来改变特定的Action类struts配置中package的extends属性，默认是struts-default
 * 
 * InterceptorRef
 * 可以用在Action上，可以应用在方法上
 * a) 如果Action没有显式的指定拦截器的话，默认的拦截器会应用在这个Action上;
 * b) 在Action中定义的@InterceptorRef会应用在该Action中所有的引用上;
 * c) 同时在Action和方法中定义了拦截器，最终生效的是全局拦截器和方法拦截器的并集
 * 
 * Results
 * 可以用在Action上，可以应用在方法上，应用在Action上作为全局路径，应用在Method上那么只对当前的Method起作用
 * 
 * ResultPath 
 * 用在Action上，用来改变结果页面所在的目录
 * 
 * ExceptionMapping 
 * 可以配置在Action级别和Method级别，配置在Action级别对所有的Method都适用；配置在Method级别只对当前的Method使用
 * 
 * </pre>
 * 
 * @author Administrator
 * 
 */
@SuppressWarnings("serial")
@Namespace("/user")
@InterceptorRefs({ @InterceptorRef("defaultStack") })
@Results({ @Result(name = "failure", location = "fail.jsp") })
@ExceptionMappings({ @ExceptionMapping(exception = "java.lang.NullPointerException", result = "success", params = {
		"param1", "val1" }) })
public class UserAction extends ActionSupport implements
		ApplicationContextAware {
	private static Logger logger = Logger.getLogger(UserAction.class.getName());

	private UserService userService;

	private int userCount = 0;

	private List<User> userLst;

	private User user;

	/**
	 * 将指定url映射到指定方法
	 */
	@Action(value = "user", results = {
			@Result(name = "success", location = "/ajax/user.jsp"),
			@Result(name = "error", location = "/index.jsp") })
	public String execute() throws Exception {
		userCount = userService.countAll();
		userLst = userService.selectAll();
		user = userService.queryUser(8);
		return SUCCESS;
	}

	/**
	 * 请注意execute2的url是“urlxxx”，这是个相对路径是，也就是说访问这个方法时的正确路径是namespace+urlxxx。
	 * 而execute()通过访问/different/url就可以访问
	 * 
	 * @return
	 * @throws Exception
	 */
	@Action("urlxxx")
	public String execute_relativeURL() throws Exception {
		return SUCCESS;
	}

	/**
	 * 一个方法可以被映射到多个url上面，如下所示，方法注解中的两个url都可以访问这个方法
	 * 
	 * @return
	 */
	@Actions({ @Action("/different/url"), @Action("/another/url") })
	public String someMethod_multiURL() {
		return SUCCESS;
	}

	/**
	 * 本方法应用了全局的defaultStack和validation拦截器；而其它没配置的方法则没有validation拦截器。
	 * 
	 * @return
	 */
	@Action(value = "/different/url", interceptorRefs = { @InterceptorRef("validation") })
	public String someMethod_interceptorRef() {
		return SUCCESS;
	}

	/**
	 * 一个Action可设置多个跳转路径，@Result可以用在Action上，可以应用在方法上，应用在Action上作为全局路径，
	 * 应用在Method上那么只对当前的Method起作用
	 * 
	 * @return
	 */
	@Action(value = "/different/url", results = { @Result(name = "success", location = "http://struts.apache.org", type = "redirect") })
	public String someMethod_Result() {
		return SUCCESS;
	}

	@Action(value = "exception1", exceptionMappings = { @ExceptionMapping(exception = "java.lang.NullPointerException", result = "success", params = {
			"param1", "val1" }) })
	public String someMethod_ExceptionMapping() {
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