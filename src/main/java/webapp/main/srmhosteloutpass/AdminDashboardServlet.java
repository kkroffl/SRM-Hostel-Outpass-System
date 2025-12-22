package webapp.main.srmhosteloutpass;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.*;
@WebServlet( "/admin_dashboard")
public class AdminDashboardServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("application/json");
        JSONArray arr = new JSONArray();
        try (Connection conn = DBConnector.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                    "SELECT " +
                            "o.name, o.studentId, o.rId, o.reason, o.from_date, o.to_date, o.status, " +
                            "s.studentMobileNumber, s.parentMobileNumber " +
                            "FROM outpass_requests o " +
                            "JOIN students s ON o.studentId = s.id " +
                            "WHERE o.status = 'Pending' " +
                            "ORDER BY o.rId DESC"
            );
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                JSONObject o = new JSONObject();
                o.put("name", rs.getString("name"));
                o.put("studentId", rs.getInt("studentId"));
                o.put("rId", rs.getInt("rId"));
                o.put("reason", rs.getString("reason"));
                o.put("fromDate", rs.getDate("from_date").toString());
                o.put("toDate", rs.getDate("to_date").toString());
                o.put("status", rs.getString("status"));
                o.put("studentMobileNumber", rs.getString("studentMobileNumber"));
                o.put("parentMobileNumber", rs.getString("parentMobileNumber"));
                arr.put(o);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        res.getWriter().print(arr);
    }

}

