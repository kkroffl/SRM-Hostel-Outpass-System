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

@WebServlet("/login")
public class LoginVerifyAPI extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        String email = req.getParameter("email").trim();
        String password = req.getParameter("password").trim();

        res.setContentType("text/plain");
        PrintWriter out = res.getWriter();

        try (Connection conn = DBConnector.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                    "SELECT * FROM students WHERE email=? AND password=?"
            );
            ps.setString(1, email);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String registeredNumber = rs.getString("registeredNumber");
                String name = rs.getString("name");

                HttpSession session = req.getSession();
                session.setAttribute("studentId", registeredNumber);
                session.setAttribute("studentName", name);
                out.print("success|" + name + "|" + registeredNumber);
            } else {
                out.print("invalid");
            }
        } catch (Exception e) {
            e.printStackTrace();
            out.print("error");
        }
    }
}
