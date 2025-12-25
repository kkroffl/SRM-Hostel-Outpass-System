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
        String returnTime = req.getParameter("expectedReturnTime");
        boolean isMedical = Boolean.parseBoolean(req.getParameter("isMedical").strip());
        if (registeredNumber == null || registeredNumber.isEmpty()) {
            res.getWriter().print("missing_rId");
            return;
        }

        try (Connection conn = DBConnector.getConnection()) {

            // 1. Get student.id
            PreparedStatement findId = conn.prepareStatement(
                    "SELECT id FROM students WHERE registeredNumber = ?"
            );
            findId.setString(1, registeredNumber);

            ResultSet rs = findId.executeQuery();
            if (!rs.next()) {
                res.getWriter().print("student_not_found");
                System.out.println("student_not_found");
                return;
            }
            int studentId = rs.getInt("id");
            PreparedStatement ps = conn.prepareStatement("INSERT INTO outpass_requests (studentId, reason, leaving_date,leaving_time,applied_date,applied_time, expected_return_date, expected_return_time, name,type_of_outpass) " +
                            "VALUES (?, ?, ?, ?, ?, ?,?,?,?,?)"
                    ,Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, studentId);
            ps.setString(2, reason);
            ps.setDate(3, returnDateOf(fromDate));
            ps.setTime(4, returnTimeOf(leavingTime));
            ps.setDate(5, Date.valueOf(LocalDate.now()));
            ps.setTime(6, Time.valueOf(LocalTime.now()));
            ps.setDate(7, returnDateOf(toDate));
            ps.setTime(8, returnTimeOf(returnTime));
            ps.setString(9, name);
            String typeOfOutpass = isMedical ? "Medical" : "Other";
            ps.setString(10,typeOfOutpass);
            ps.executeUpdate();
            if (isMedical) {
                try (ResultSet rst = ps.getGeneratedKeys()) {
                    if (rst.next()) {
                        req.setAttribute("requestID", rst.getInt(1));
                        RequestDispatcher rd = req.getRequestDispatcher("/medical_outpass");
                        rd.forward(req, res);
                    } else {
                        System.out.println("Failed to retrieve requestID");
                        throw new SQLException("Failed to retrieve requestID");
                    }
                } catch (SQLException e) {
                    res.getWriter().write("error|" + e.getMessage());
                }
            }
        } catch (Exception e) {
            res.getWriter().print("error");
        }finally {
            res.getWriter().print("success");
        }
    }
}