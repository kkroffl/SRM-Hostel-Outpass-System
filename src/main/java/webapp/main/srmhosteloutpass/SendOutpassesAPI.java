package webapp.main.srmhosteloutpass;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/studentOutpasses")
public class SendOutpassesAPI extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        res.setContentType("application/json");
        req.setCharacterEncoding("UTF-8");

        String regNo = req.getParameter("registeredNumber");

        if (regNo == null || !regNo.startsWith("RA")) {
            res.sendError(HttpServletResponse.SC_BAD_REQUEST,
                    "Invalid registeredNumber");
            return;
        }

        try (Connection conn = DBConnector.getConnection()) {

            PreparedStatement ps = conn.prepareStatement("""
                SELECT 
                    r.requestId,
                    s.name,
                    r.reason,
                    r.applied_date,
                    r.applied_time,
                    r.expected_leaving_date,
                    r.expected_leaving_time,
                    r.expected_return_date,
                    r.actual_return_date,
                    r.actual_return_time,
                    r.type_of_outpass,
                    r.status
                FROM outpass_requests r
                JOIN students s ON r.studentId = s.id
                WHERE s.registeredNumber = ?
            """);

            ps.setString(1, regNo);
            ResultSet rs = ps.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {

                if (!first) json.append(",");
                first = false;

                String requestId = rs.getString("requestId");
                String typeOfOutpass = rs.getString("type_of_outpass");

                // If medical, send URL instead of forwarding
                String proofUrl = typeOfOutpass.equalsIgnoreCase("Medical")
                        ? req.getContextPath() + "/proofImage?requestId=" + requestId
                        : null;

                json.append("""
                    {
                      "id": "%s",
                      "name": "%s",
                      "reason": "%s",
                      "applied_date": "%s",
                      "applied_time": "%s",
                      "expected_leaving_date": "%s",
                      "expected_leaving_time": "%s",
                      "expected_return_date": "%s",
                      "actual_return_date": "%s",
                      "actual_return_time": "%s",
                      "type_of_outpass": "%s",
                      "status": "%s",
                      "proof_url": %s
                    }
                    """.formatted(
                        requestId,
                        rs.getString("name"),
                        rs.getString("reason"),
                        rs.getString("applied_date"),
                        rs.getString("applied_time"),
                        rs.getString("expected_leaving_date"),
                        rs.getString("expected_leaving_time"),
                        rs.getString("expected_return_date"),
                        rs.getString("actual_return_date"),
                        rs.getString("actual_return_time"),
                        typeOfOutpass,
                        rs.getString("status"),
                        proofUrl == null ? "null" : "\"" + proofUrl + "\""
                ));
            }

            json.append("]");
            res.getWriter().write(json.toString());

        } catch (Exception e) {
            res.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Server error");
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED,
                "GET not allowed");
    }
}
