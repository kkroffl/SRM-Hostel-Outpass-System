package webapp.main.srmhosteloutpass;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/studentDetails")
public class    DataProviderServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("text/plain");
        res.setCharacterEncoding("UTF-8");
        var writer = res.getWriter();
        String registeredNumber = req.getParameter("registeredNumber");
        if (registeredNumber == null || registeredNumber.isEmpty()) {
            writer.write("error|Missing_Registered_Number");
            return;
        }
        try (Connection c = DBConnector.getConnection()) {
            PreparedStatement pst = c.prepareStatement("SELECT studentMobileNumber,parentMobileNumber FROM students where registeredNumber=?");
            pst.setString(1, registeredNumber);
            ResultSet rst = pst.executeQuery();
            if (rst.next()) {
                writer.write(
                        "success|" +
                                rst.getString("studentMobileNumber") +
                                "|" +
                                rst.getString("parentMobileNumber")
                );
            } else {
                writer.write("error|Failed_Searching_For_Student");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            writer.write("error|Database_Error");
        }
    }
}
