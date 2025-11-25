package webapp.main.srmhosteloutpass;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebServlet("/adminLogin")
public class AdminLoginServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res){
        res.setContentType("text/plain");
        String email=req.getParameter("email");
        String pass=req.getParameter("password");
        try(Connection connection=DBConnector.getConnection()){
            PreparedStatement preparedStatement=connection.prepareStatement("SELECT  * FROM admins WHERE email=? AND password=?");
            preparedStatement.setString(1,email);
            preparedStatement.setString(2,pass);
            var rs=preparedStatement.executeQuery();
            if(rs.next()){
                String name=rs.getString("name");
                res.getWriter().println("success|"+name);
            }else{
                res.getWriter().println("failed");
            }
        }catch (SQLException|IOException e) {
            e.printStackTrace();
        }

    }
}
