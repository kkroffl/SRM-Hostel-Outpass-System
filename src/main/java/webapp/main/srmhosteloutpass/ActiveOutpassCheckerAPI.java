package webapp.main.srmhosteloutpass;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import webapp.main.srmhosteloutpass.utilities.DBConnector;
import webapp.main.srmhosteloutpass.utilities.StatusCodesEnum;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/hasActiveOutpass")
public class ActiveOutpassCheckerAPI extends HttpServlet {
    protected void doGet(HttpServletRequest request,HttpServletResponse response) throws IOException,ServletException{
        doPost(request,response);
    }
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");
        String registeredNumber =request.getParameter("registeredNumber");
        if(registeredNumber == null || !(registeredNumber.startsWith("RA"))){
            response.sendError(HttpServletResponse.SC_NO_CONTENT,"[ERROR] | [ATTRIBUTE] \"registeredNumber\" is Invalid");
            return;
        }
        var writer=response.getWriter();
        try (Connection connection= DBConnector.getConnection()){
            PreparedStatement statement=connection.prepareStatement("SELECT requestId FROM outpass_requests WHERE studentId = (SELECT id FROM students where registeredNumber = ?) AND status IN (?,?)");
            statement.setString(1, registeredNumber);
            statement.setString(2,StatusCodesEnum.APPROVED_AND_OPEN.code);
            statement.setString(3,StatusCodesEnum.PENDING.code);
            ResultSet resultSet= statement.executeQuery();
            if(!resultSet.next()){
                writer.print("[SUCCESS] | [NO_ACTIVE_OUTPASS] for registeredNumber="+ registeredNumber);
                return;
            }
            StringBuilder builder=new StringBuilder("[FALSE]");
            do{
                builder.append(String.format(" [%s]",resultSet.getString(1)));
            }while (resultSet.next());
            writer.print(builder);
        }catch (SQLException _){
            String err="[ERROR] | [SQL_ERROR] from ActiveOutpassCheckerAPI";
            writer.print(err);
        }
    }
}
