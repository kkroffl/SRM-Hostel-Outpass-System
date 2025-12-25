package webapp.main.srmhosteloutpass;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.*;
@WebServlet("/proofImage")
public class ImageProviderAPI extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        String id = req.getParameter("requestId");

        try (Connection c = DBConnector.getConnection()) {

            PreparedStatement ps = c.prepareStatement(
                    "SELECT proof_img FROM outpass_requests WHERE requestId=?"
            );
            ps.setString(1, id);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                resp.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            Blob blob = rs.getBlob("proof_img");
            if (blob == null) {
                resp.sendError(HttpServletResponse.SC_NO_CONTENT);
                return;
            }

            resp.setContentType("image/jpeg"); // or png
            resp.setContentLengthLong(blob.length());

            try (InputStream in = blob.getBinaryStream();
                 OutputStream out = resp.getOutputStream()) {

                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }
        }
        catch (Exception e) {
            e.printStackTrace(); // 👈 THIS will reveal the exact crash
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}