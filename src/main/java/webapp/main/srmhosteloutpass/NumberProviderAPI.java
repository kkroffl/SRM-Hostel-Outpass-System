package webapp.main.srmhosteloutpass;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/studentDetails")
public class NumberProviderAPI extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("text/plain");
        res.setCharacterEncoding("UTF-8");
        var writer = res.getWriter();
        String registeredNumber=req.getParameter("registeredNumber");
        if(registeredNumber == null || !(registeredNumber.startsWith("RA"))){
            res.sendError(HttpServletResponse.SC_NO_CONTENT,"[ERROR] | [ATTRIBUTE] \"registeredNumber\" is Invalid");
            return;
        }
        try (Connection c = DBConnector.getConnection()) {
            PreparedStatement pst = c.prepareStatement("SELECT studentMobileNumber,parentMobileNumber FROM students where registeredNumber=?");
            pst.setString(1, registeredNumber);
            ResultSet rst = pst.executeQuery();
            if (rst.next()) {
                writer.write(
                        "[SUCCESS] |" +
                                rst.getString("studentMobileNumber") +
                                " | " +
                                rst.getString("parentMobileNumber")
                );
            } else {
                writer.write("[ERROR] | [FAILED_SEARCH_FOR_STUDENT] from NumberProviderAPI");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            writer.write("[ERROR] | [DATABASE_CONNECTIVITY_ERROR] from NumberProviderAPI");
        }
    }
}
