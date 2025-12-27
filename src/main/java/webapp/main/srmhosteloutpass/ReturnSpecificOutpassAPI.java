package webapp.main.srmhosteloutpass;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/specific/studentOutpassDetails")
public class ReturnSpecificOutpassAPI extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        String requestId=request.getParameter("requestId");
        response.setContentType("application/json");
        request.setCharacterEncoding("UTF-8");
        if(requestId==null||requestId.isEmpty()){
            response.sendError(HttpServletResponse.SC_NOT_FOUND,"[ERROR] | [NO_REQUEST_FOUND] from ReturnSpecificOutpassAPI");
            return;
        }
        try (Connection connection= DBConnector.getConnection()){
            PreparedStatement preparedStatement=connection.prepareStatement("SELECT * from outpass_requests where requestId=?");
            preparedStatement.setString(1,requestId);
            ResultSet resultSet= preparedStatement.executeQuery();
            if (resultSet.next()){
                StringBuilder json=new StringBuilder();
                String typeOfOutpass = resultSet.getString("type_of_outpass");
                // If medical, send URL instead of forwarding
                String proofUrl = typeOfOutpass.equalsIgnoreCase("Medical")
                        ? request.getContextPath() + "/proofImage?requestId=" + requestId
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
                      "proof_url": "%s"
                    }
                    """.formatted(
                        requestId,
                        resultSet.getString("name"),
                        resultSet.getString("reason"),
                        resultSet.getString("applied_date"),
                        resultSet.getString("applied_time"),
                        resultSet.getString("expected_leaving_date"),
                        resultSet.getString("expected_leaving_time"),
                        resultSet.getString("expected_return_date"),
                        resultSet.getString("actual_return_date"),
                        resultSet.getString("actual_return_time"),
                        typeOfOutpass,
                        resultSet.getString("status"),
                        proofUrl
                        ));
                response.getWriter().print(json);
                }
            }
        catch (SQLException e){
            response.sendError(HttpServletResponse.SC_NOT_FOUND,"[ERROR] | [SQL_ERROR] from ReturnSpecificOutpassesAPI");
        }
    }
}
