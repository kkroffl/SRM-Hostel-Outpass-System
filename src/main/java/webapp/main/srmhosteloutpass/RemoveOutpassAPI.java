package webapp.main.srmhosteloutpass;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebServlet("/deleteOutpass")
public class RemoveOutpassAPI extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");
        String requestId=request.getParameter("requestId");
        if(requestId==null || requestId.isEmpty()){
            response.getWriter().print("[ERROR] | [INVALID_REQUEST_ID] from RemoveOutpassAPI");
            return;
        }
        try(Connection connection= DBConnector.getConnection()){
            PreparedStatement statement= connection.prepareStatement(
                    "DELETE FROM outpass_requests WHERE requestId=?"
            );
            statement.setString(1,requestId);
            int rows=statement.executeUpdate();
            if(rows>0){
                response.getWriter().print("[SUCCESS] | [ENTRY_DELETED_SUCCESSFULLY]");
                return;
            }
            response.getWriter().print("[ERROR] | [COULD_NOT_DELETE_ENTRY] from RemoveOutpassAPI");
        }catch (SQLException e){
            response.getWriter().print("[ERROR] | [SQL_ERROR] from RemoveOutpassAPI");
        }
    }
}
