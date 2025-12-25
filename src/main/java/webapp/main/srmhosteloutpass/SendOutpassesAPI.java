package webapp.main.srmhosteloutpass;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Arrays;

@WebServlet("/studentOutpasses")
@MultipartConfig
public class SendOutpassesAPI extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("application/json");
        req.setCharacterEncoding("UTF-8");
        String regNo = req.getParameter("registeredNumber");
        if (regNo == null || regNo.trim().isEmpty()) {
            res.getWriter().print("[]");
            return;
        }
        try (Connection conn = DBConnector.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT requestId,reason,applied_date,applied_time, leaving_date,leaving_time, expected_return_date,expected_return_time,type_of_outpass,proof_img, status FROM outpass_requests WHERE studentId = (SELECT id FROM students WHERE registeredNumber = ?)");
            ps.setString(1, regNo);
            ResultSet rs = ps.executeQuery();
            if(!rs.next()){
                res.getWriter().print("[]");
                return;
            }
            StringBuilder json = new StringBuilder("[");
            boolean first = true;
            String typeOfOutpass,requestID;
            do{
                if (!first) json.append(",");
                first = false;
                json.append("""
            {
              "id": "%s",
              "name": "%s",
              "reason": "%s",
              "applied_date": "%s",
              "applied_time": "%s",
              "from_date": "%s",
              "from_time": "%s",
              "to_date": "%s",
              "to_time": "%s",
              "actual_return_date" : "%s",
              "actual_return_time": "%s",
              "type_of_outpass": "%s",
              "status": "%s"
            }
            """.formatted(
                        requestID=rs.getString("requestId"),
                        rs.getString("name"),
                        rs.getString("reason"),
                        rs.getString("applied_date"),
                        rs.getString("applied_time"),
                        rs.getString("leaving_date"),
                        rs.getString("leaving_time"),
                        rs.getString("expected_return_date"),
                        rs.getString("expected_return_time"),
                        rs.getString("actual_return_date"),
                        rs.getString("actual_return_time"),
                        typeOfOutpass=rs.getString("type_of_outpass"),
                        rs.getString("status")
                ));
            } while (rs.next());
            json.append("]");
            res.getWriter().write(json.toString());
            if(typeOfOutpass.equalsIgnoreCase("Medical")){
                RequestDispatcher requestDispatcher=req.getRequestDispatcher("proofImage");
                req.setAttribute("requestId",requestID);
                requestDispatcher.forward(req,res);
            }
        } catch (Exception e) {
            res.getWriter().print("[]");
        }
    }
}