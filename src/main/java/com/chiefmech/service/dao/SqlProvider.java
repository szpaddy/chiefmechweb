package com.chiefmech.service.dao;

public class SqlProvider {
	 // 动态的SQL语句，实际上应该使用iBATIS的动态SQL产生方法，这里仅仅是为了使用注解  
    public String selectAllSql() {  
        return "SELECT * FROM roster";  
    }  
}
