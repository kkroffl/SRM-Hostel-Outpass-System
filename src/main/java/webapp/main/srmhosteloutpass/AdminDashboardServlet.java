package webapp.main.srmhosteloutpass;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.*;

@WebServlet("/adminDashboardData")
public class AdminDashboardServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        res.setContentType("application/json");
        JSONArray arr = new JSONArray();

        try (Connection conn = DBConnector.getConnection()) {
            // fetch all requests (you can filter or paginate)
            PreparedStatement ps = conn.prepareStatement(
                    "SELECT requestId, rId, reason, from_date, to_date, status FROM outpass_requests ORDER BY requestId DESC"
            );
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                JSONObject o = new JSONObject();
                o.put("requestId", rs.getInt("requestId"));
                o.put("rId", rs.getString("rId"));
                o.put("reason", rs.getString("reason"));
                o.put("fromDate", rs.getString("from_date"));
                o.put("toDate", rs.getString("to_date"));
                o.put("status", rs.getString("status"));
                arr.put(o);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        res.getWriter().print(arr.toString());
    }
}
