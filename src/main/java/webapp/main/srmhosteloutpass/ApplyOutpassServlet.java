package webapp.main.srmhosteloutpass;

import java.io.*;
import java.sql.*;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet("/applyOutpass")
public class ApplyOutpassServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        res.setContentType("text/plain");

        String roll = req.getParameter("rId");   // <-- correct
        // <-- this is rId (example: "SRM123")
        String reason = req.getParameter("reason");
        String fromDate = req.getParameter("fromDate");
        String toDate = req.getParameter("toDate");

        if (roll == null || roll.isEmpty()) {
            res.getWriter().print("missing_rId");
            return;
        }

        try (Connection conn = DBConnector.getConnection()) {

            // First fetch the student.id (numeric)
            PreparedStatement findId = conn.prepareStatement(
                    "SELECT id FROM students WHERE rId = ?"
            );
            findId.setString(1, roll);
            ResultSet rs = findId.executeQuery();

            if (!rs.next()) {
                res.getWriter().print("student_not_found");
                return;
            }

            int studentId = rs.getInt("id");

            // Insert outpass with studentId
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO outpass_requests (requestId, reason, from_date, to_date) VALUES (?, ?, ?, ?)"
            );

            ps.setInt(1, studentId);
            ps.setString(2, reason);
            ps.setString(3, fromDate);
            ps.setString(4, toDate);

            int rows = ps.executeUpdate();
            if (rows > 0) {
                res.getWriter().print("success");
            } else {
                res.getWriter().print("fail");
            }

        } catch (Exception e) {
            e.printStackTrace();
            res.getWriter().print("error");
        }
    }


}
