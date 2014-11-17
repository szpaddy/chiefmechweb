<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ taglib prefix="s" uri="/struts-tags"%>

<html>
<head>
<title>User Test page</title>
</head>
<body>
	<h3>userCount:</h3>
	<p>
		<s:property value="userCount" />
	</p>
	<h3>User Info</h3>
	<p>
		<s:property value="user.id" />
		<s:property value="user.name" />
		<s:property value="user.age" />
	</p>
	<h3>User List</h3>
	<ul>
		<s:iterator value="userLst">
			<li>name:<s:property value="name" />age:<s:property value="age" /></li>
		</s:iterator>
	</ul>

</body>
</html>