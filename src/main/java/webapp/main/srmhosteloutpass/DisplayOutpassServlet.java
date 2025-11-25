package webapp.main.srmhosteloutpass;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.IOException;
import java.sql.*;

@WebServlet("/displayOutpass")
public class DisplayOutpassServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        String rId = req.getParameter("rId"); // ✅ Read from request, not session
        JSONArray jsonArray = new JSONArray();

        res.setContentType("application/json");

        if (rId == null || rId.isEmpty()) {
            res.getWriter().print(jsonArray);
            return;
        }

        try (Connection conn = DBConnector.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                    "SELECT reason, from_date, to_date, status FROM outpass_requests WHERE rId=? ORDER BY requestId DESC"
            );
            ps.setString(1, rId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("reason", rs.getString("reason"));
                obj.put("fromDate", rs.getString("from_date"));
                obj.put("toDate", rs.getString("to_date"));
                obj.put("status", rs.getString("status"));
                jsonArray.put(obj);
            }

            res.getWriter().print(jsonArray);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
