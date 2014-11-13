<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
    <script src="http://lib.sinaapp.com/js/jquery/1.7.2/jquery.min.js"></script>
    <script type="text/javascript">  
        $(document).ready(function()  
        {  
            $("#ajaxButton").bind("click",function()  
            {  
                $.post("AjaxTest.action",  
                {  
                    username:$("select[name=username]").val()  
                },function(returnedData,status)  
                {  
                            var idvalue = $(returnedData).find("id").text();  
                            var namevalue = $(returnedData).find("username").text();  
                            var agevalue = $(returnedData).find("age").text();  
                             var addressvalue = $(returnedData).find("address").text();  
                            var html = "<table border='1'><tr><th>id</th><th>name</th><th>age</th><th>address</th></tr><tr><td>"+idvalue+"</td><td>"+namevalue+"</td><td>"+agevalue+"</td><td>"+addressvalue+"</td></table>";  
                              
                            $("body table:eq(0)").remove();  
                            $("body").append(html);   
                });  
          
            });  
         });  
    </script>  
  </head>  
    
  <body>  
        <select name="username">  
            <option value="zhangsan">zhangsan</option>  
            <option value="lisi">lisi</option>  
        </select>  
        <input type="button" value="getINFo" id="ajaxButton">  
  </body>  
</html>