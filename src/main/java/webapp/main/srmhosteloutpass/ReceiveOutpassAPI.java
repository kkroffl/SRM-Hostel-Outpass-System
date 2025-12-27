package webapp.main.srmhosteloutpass;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalTime;

@WebServlet("/applyOutpass")
@MultipartConfig
public class ReceiveOutpassAPI extends HttpServlet {
    static Time returnTimeOf(String t) {
        LocalTime time = LocalTime.parse(t);
        return Time.valueOf(time);
    }

    static Date returnDateOf(String d) {
        LocalDate date = LocalDate.parse(d);
        return Date.valueOf(date);
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("text/plain");
        String registeredNumber = req.getParameter("registeredNumber");
        String name = req.getParameter("name");
        String reason = req.getParameter("reason");
        String fromDate = req.getParameter("fromDate");
        String toDate = req.getParameter("toDate");
        String leavingTime = req.getParameter("leavingTime");
        String typeOfOutpass=req.getParameter("typeOfOutpass");
        if (registeredNumber == null || registeredNumber.isEmpty()) {
            res.getWriter().print("[ERROR] | [FIELD] \"registeredNumber\" is null\\empty from ReceiveOutpassAPI");
            return;
        }

        try (Connection conn = DBConnector.getConnection()) {

            PreparedStatement findId = conn.prepareStatement(
                    "SELECT id FROM students WHERE registeredNumber = ?"
            );
            findId.setString(1, registeredNumber);

            ResultSet rs = findId.executeQuery();
            if (!rs.next()) {
                res.getWriter().print("[ERROR] | [FAILED SEARCHING_ID] from ReceiveOutpassAPI");
                return;
            }
            int studentId = rs.getInt("id");
            PreparedStatement ps = conn.prepareStatement("INSERT INTO outpass_requests (studentId, reason, expected_leaving_date,expected_leaving_time,applied_date,applied_time, expected_return_date, name,type_of_outpass) " +
                            "VALUES (?, ?, ?, ?, ?, ?,?,?,?)"
                    ,Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, studentId);
            ps.setString(2, reason);
            ps.setDate(3, returnDateOf(fromDate));
            ps.setTime(4, returnTimeOf(leavingTime));
            ps.setDate(5, Date.valueOf(LocalDate.now()));
            ps.setTime(6, Time.valueOf(LocalTime.now()));
            ps.setDate(7, returnDateOf(toDate));
            ps.setString(8, name);
            ps.setString(9,typeOfOutpass);
            ps.executeUpdate();
            if (typeOfOutpass.equalsIgnoreCase("Medical")) {
                try (ResultSet rst = ps.getGeneratedKeys()) {
                    if (rst.next()) {
                        req.setAttribute("requestID", rst.getInt(1));
                        RequestDispatcher rd = req.getRequestDispatcher("/medicalOutpass");
                        rd.forward(req, res);
                    } else {
                        throw new SQLException("[FAILED_RECEIVING_GENERATED_KEYS]");
                    }
                } catch (SQLException e) {
                    res.getWriter().write("[ERROR] | " + e.getMessage() + "from ReceiveOutpassAPI");
                }
            }
            else{
                res.getWriter().print("[SUCCESS] | [SUCCESSFULLY_UPDATED_DATA]");
            }
        } catch (Exception e) {
            res.getWriter().print("[ERROR] | [SQL_ERROR] from ReceiveOutpassAPI");
        }
    }
}