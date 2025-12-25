package webapp.main.srmhosteloutpass;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet(name="register",value = "/register")
public class RegisterUserAPI extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String name = req.getParameter("name");
        String registeredNumber = req.getParameter("registeredNumber");
        String email = req.getParameter("email");
        String password = req.getParameter("password");
        String sNo = req.getParameter("studentMobileNumber");
        String pNo = req.getParameter("parentMobileNumber");
        try (Connection conn = DBConnector.getConnection()) {
            PreparedStatement check = conn.prepareStatement("SELECT * FROM students WHERE email=?");
            check.setString(1, email);
            ResultSet rs = check.executeQuery();
            res.setContentType("text/plain");
            PrintWriter out = res.getWriter();
            if (rs.next()) {
                out.print("exists");
                return;
            }
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO students ( name,registeredNumber,email, password,studentMobileNumber,parentMobileNumber) VALUES (?, ?, ?, ?,?,?)"
            );
            ps.setString(1, name);
            ps.setString(2, registeredNumber);
            ps.setString(3, email);
            ps.setString(4, password);
            ps.setString(5, sNo);
            ps.setString(6, pNo);
            ps.executeUpdate();
            out.print("success");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
