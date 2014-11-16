package com.chiefmech.service;

import java.util.List;

import com.chiefmech.vo.User;

public interface UserService {

	public User queryUser(int id);

	public int countAll();

	public List<User> selectAll();

	public List<User> selectPersonsByName(String name);

	public void insert(User user);

	public void delete(User user);

	public void update(User user);
}
