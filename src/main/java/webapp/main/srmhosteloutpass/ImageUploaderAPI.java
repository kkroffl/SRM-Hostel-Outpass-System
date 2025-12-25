package webapp.main.srmhosteloutpass;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebServlet("/medical_outpass")
@MultipartConfig(
        maxFileSize = 4 * 1024 * 1024
)
public class ImageUploaderAPI extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        doPost(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        Integer requestID = (Integer) req.getAttribute("requestID");
        Part imagePart = req.getPart("proof_img");
        var errorWriter = res.getWriter();
        if (!imagePart.getContentType().startsWith("image/")) {
            System.out.println("error|Invalid_File_Type");
            errorWriter.write("error|Invalid_File_Type");
        }
        if (imagePart.getSize() > 4 * 1024 * 1024) {
            System.out.println("error|File_Too_Large");
            errorWriter.write("error|File_Too_Large");
        }
        InputStream imageStream = imagePart.getInputStream();
        try (Connection c = DBConnector.getConnection()) {

            PreparedStatement updateImage = c.prepareStatement(
                    "UPDATE outpass_requests SET proof_img = ? WHERE requestId = ?"
            );
            updateImage.setBlob(1, imageStream, imagePart.getSize());
            updateImage.setInt(2, requestID);
            if (updateImage.executeUpdate() > 0) {
                errorWriter.write("success|Image_Uploaded");
            }
        } catch (SQLException _) {
            errorWriter.write("sql_error|could_not_establish_connection");
        }
    }
}