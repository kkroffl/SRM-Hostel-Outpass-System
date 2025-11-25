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

        // Get rId from request (frontend passes it in the fetch body)
        String rId = req.getParameter("rId");
        String reason = req.getParameter("reason");
        String fromDate = req.getParameter("fromDate");
        String toDate = req.getParameter("toDate");

        // If rId missing, reject
        if (rId == null || rId.isEmpty()) {
            res.getWriter().print("missing_rId");
            return;
        }

        try (Connection conn = DBConnector.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO outpass_requests (rId, reason, from_date, to_date, status) VALUES (?, ?, ?, ?, 'Pending')"
            );
            ps.setString(1, rId);
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
