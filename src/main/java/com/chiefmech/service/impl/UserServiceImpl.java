package com.chiefmech.service.impl;

import java.util.List;

import com.chiefmech.service.UserService;
import com.chiefmech.service.dao.UserDao;
import com.chiefmech.vo.User;

public class UserServiceImpl implements UserService {
	private UserDao userDao;

	public UserDao getUserDao() {
		return userDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	@Override
	public int countAll() {
		return this.userDao.countAll();
	}

	@Override
	public User queryUser(int id) {
		return this.userDao.queryUser(id);
	}

	@Override
	public List<User> selectAll() {
		return this.userDao.selectAll();
	}

	@Override
	public List<User> selectPersonsByName(String name) {
		return this.userDao.selectPersonsByName(name);
	}

	@Override
	public void insert(User user) {
		this.userDao.insert(user);
	}

	@Override
	public void delete(User user) {
		this.userDao.delete(user);
	}

	@Override
	public void update(User user) {
		this.userDao.update(user);
	}
}