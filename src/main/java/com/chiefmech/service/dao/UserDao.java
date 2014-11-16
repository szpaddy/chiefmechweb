package com.chiefmech.service.dao;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.Update;

import com.chiefmech.vo.User;

public interface UserDao {
	@Select("select count(*) c from roster")
	public int countAll();

	@SelectProvider(type = SqlProvider.class, method = "selectAllSql")
	public List<User> selectAll();

	@Select("select * from roster where id = #{id}")
	@Results(value = { @Result(property = "id", column = "id"),
			@Result(property = "name", column = "name"),
			@Result(property = "age", column = "age") })
	public User queryUser(int id);

	@Select("select * from roster where name like #{name}")
	public List<User> selectPersonsByName(String name);

	@Insert({ "insert into roster(name,age)", "values(#{name},#{age})" })
	public void insert(User user);

	@Delete("delete from roster where id=#{id}")
	public void delete(User user);

	@Update({ "update roster set name=#{name},age=#{age}", "where id=#{id}" })
	public void update(User user);
}